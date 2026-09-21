from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.db import transaction

from .models import Quotation, QuotationItem
from .serializers import QuotationSerializer
from users.permissions import CanManageDocuments
from numbering.models import NumberingSettings

class QuotationListCreateView(generics.ListCreateAPIView):
    serializer_class = QuotationSerializer
    permission_classes = [CanManageDocuments]

    def get_queryset(self):
        queryset = Quotation.objects.select_related('client', 'template', 'created_by').prefetch_related('items').all()
        search = self.request.query_params.get('search', '').strip()
        status_filter = self.request.query_params.get('status', '').strip()
        client_id = self.request.query_params.get('client', '').strip()

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        if search:
            queryset = queryset.filter(
                Q(quotation_number__icontains=search) |
                Q(client__client_name__icontains=search) |
                Q(client__company_name__icontains=search)
            )
        return queryset

class QuotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quotation.objects.select_related('client', 'template', 'created_by').prefetch_related('items').all()
    serializer_class = QuotationSerializer
    permission_classes = [CanManageDocuments]

class DuplicateQuotationView(APIView):
    permission_classes = [CanManageDocuments]

    def post(self, request, pk):
        try:
            original = Quotation.objects.get(pk=pk)
        except Quotation.DoesNotExist:
            return Response({'error': 'Quotation not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            new_number = NumberingSettings.allocate_next_number('QUOTATION')
            new_quotation = Quotation.objects.create(
                quotation_number=new_number,
                client=original.client,
                template=original.template,
                quotation_date=original.quotation_date,
                valid_until=original.valid_until,
                status='DRAFT',
                discount_type=original.discount_type,
                discount_value=original.discount_value,
                tax_enabled=original.tax_enabled,
                tax_rate=original.tax_rate,
                terms_conditions=original.terms_conditions,
                notes=original.notes,
                created_by=request.user
            )

            for item in original.items.all():
                QuotationItem.objects.create(
                    quotation=new_quotation,
                    product_service=item.product_service,
                    item_name=item.item_name,
                    description=item.description,
                    quantity=item.quantity,
                    rate=item.rate
                )

            new_quotation.calculate_totals()

        serializer = QuotationSerializer(new_quotation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
