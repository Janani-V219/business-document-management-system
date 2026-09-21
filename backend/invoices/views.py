from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from .models import Invoice, InvoiceItem
from .serializers import InvoiceSerializer
from quotations.models import Quotation
from users.permissions import CanManageDocuments
from numbering.models import NumberingSettings
from company.models import CompanyProfile
from templates_app.models import DocumentTemplate

class InvoiceListCreateView(generics.ListCreateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [CanManageDocuments]

    def get_queryset(self):
        queryset = Invoice.objects.select_related('client', 'template', 'created_by', 'source_quotation').prefetch_related('items').all()
        search = self.request.query_params.get('search', '').strip()
        status_filter = self.request.query_params.get('status', '').strip()
        client_id = self.request.query_params.get('client', '').strip()

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        if search:
            queryset = queryset.filter(
                Q(invoice_number__icontains=search) |
                Q(client__client_name__icontains=search) |
                Q(client__company_name__icontains=search)
            )
        return queryset

class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.select_related('client', 'template', 'created_by', 'source_quotation').prefetch_related('items').all()
    serializer_class = InvoiceSerializer
    permission_classes = [CanManageDocuments]

class DuplicateInvoiceView(APIView):
    permission_classes = [CanManageDocuments]

    def post(self, request, pk):
        try:
            original = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            new_number = NumberingSettings.allocate_next_number('INVOICE')
            new_invoice = Invoice.objects.create(
                invoice_number=new_number,
                client=original.client,
                template=original.template,
                invoice_date=timezone.now().date(),
                due_date=timezone.now().date() + timedelta(days=15),
                status='DRAFT',
                discount_type=original.discount_type,
                discount_value=original.discount_value,
                tax_enabled=original.tax_enabled,
                tax_rate=original.tax_rate,
                terms_conditions=original.terms_conditions,
                payment_details=original.payment_details,
                notes=original.notes,
                created_by=request.user
            )

            for item in original.items.all():
                InvoiceItem.objects.create(
                    invoice=new_invoice,
                    product_service=item.product_service,
                    item_name=item.item_name,
                    description=item.description,
                    quantity=item.quantity,
                    rate=item.rate
                )

            new_invoice.calculate_totals()

        serializer = InvoiceSerializer(new_invoice, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ConvertQuotationToInvoiceView(APIView):
    permission_classes = [CanManageDocuments]

    def post(self, request, pk):
        try:
            quotation = Quotation.objects.get(pk=pk)
        except Quotation.DoesNotExist:
            return Response({'error': 'Quotation not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if already converted and prevent accidental duplicate conversion unless ?force=true
        force = request.query_params.get('force', 'false').lower() == 'true'
        if quotation.status == 'CONVERTED' and not force:
            existing_invoice = Invoice.objects.filter(source_quotation=quotation).first()
            msg = 'This quotation has already been converted to an invoice.'
            if existing_invoice:
                msg += f" (Invoice: {existing_invoice.invoice_number})"
            return Response(
                {
                    'error': msg,
                    'already_converted': True,
                    'invoice_id': existing_invoice.id if existing_invoice else None
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            # Find default invoice template
            default_template = DocumentTemplate.objects.filter(document_type='INVOICE', is_default=True).first()
            if not default_template:
                default_template = DocumentTemplate.objects.filter(document_type='INVOICE').first()

            # Fetch company payment details for auto-fill
            company = CompanyProfile.objects.first()
            payment_info = ''
            if company:
                payment_info = f"{company.bank_name}\n{company.account_details}\n{company.payment_information}".strip()

            new_invoice_number = NumberingSettings.allocate_next_number('INVOICE')
            today = timezone.now().date()

            invoice = Invoice.objects.create(
                invoice_number=new_invoice_number,
                source_quotation=quotation,
                client=quotation.client,
                template=default_template,
                invoice_date=today,
                due_date=today + timedelta(days=15),
                status='DRAFT',
                discount_type=quotation.discount_type,
                discount_value=quotation.discount_value,
                tax_enabled=quotation.tax_enabled,
                tax_rate=quotation.tax_rate,
                terms_conditions=quotation.terms_conditions,
                payment_details=payment_info,
                notes=f"Converted from Quotation {quotation.quotation_number}. {quotation.notes}".strip(),
                created_by=request.user
            )

            for item in quotation.items.all():
                InvoiceItem.objects.create(
                    invoice=invoice,
                    product_service=item.product_service,
                    item_name=item.item_name,
                    description=item.description,
                    quantity=item.quantity,
                    rate=item.rate
                )

            invoice.calculate_totals()

            # Mark quotation as CONVERTED
            quotation.status = 'CONVERTED'
            quotation.save(update_fields=['status'])

        serializer = InvoiceSerializer(invoice, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
