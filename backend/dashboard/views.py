from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q

from quotations.models import Quotation
from invoices.models import Invoice

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_quotations = Quotation.objects.count()
        total_invoices = Invoice.objects.count()

        pending_quotations = Quotation.objects.filter(status__in=['DRAFT', 'SENT']).count()
        accepted_quotations = Quotation.objects.filter(status='ACCEPTED').count()

        unpaid_invoices = Invoice.objects.filter(status__in=['DRAFT', 'ISSUED', 'UNPAID', 'PARTIALLY_PAID']).count()
        paid_invoices = Invoice.objects.filter(status='PAID').count()

        quotation_value = Quotation.objects.aggregate(total=Sum('grand_total'))['total'] or 0
        invoice_value = Invoice.objects.aggregate(total=Sum('grand_total'))['total'] or 0
        paid_value = Invoice.objects.filter(status='PAID').aggregate(total=Sum('grand_total'))['total'] or 0

        # Recent Documents (Quotations + Invoices)
        recent_quotations = list(Quotation.objects.select_related('client').order_by('-created_at')[:8])
        recent_invoices = list(Invoice.objects.select_related('client').order_by('-created_at')[:8])

        recent_docs = []
        for q in recent_quotations:
            recent_docs.append({
                'id': q.id,
                'type': 'Quotation',
                'number': q.quotation_number,
                'client': q.client.client_name,
                'client_company': q.client.company_name,
                'date': q.quotation_date,
                'amount': float(q.grand_total),
                'status': q.status,
                'created_at': q.created_at,
            })

        for inv in recent_invoices:
            recent_docs.append({
                'id': inv.id,
                'type': 'Invoice',
                'number': inv.invoice_number,
                'client': inv.client.client_name,
                'client_company': inv.client.company_name,
                'date': inv.invoice_date,
                'amount': float(inv.grand_total),
                'status': inv.status,
                'created_at': inv.created_at,
            })

        recent_docs.sort(key=lambda x: x['created_at'], reverse=True)
        recent_docs = recent_docs[:10]

        return Response({
            'cards': {
                'total_quotations': total_quotations,
                'total_invoices': total_invoices,
                'pending_quotations': pending_quotations,
                'accepted_quotations': accepted_quotations,
                'unpaid_invoices': unpaid_invoices,
                'paid_invoices': paid_invoices,
                'quotation_value': float(quotation_value),
                'invoice_value': float(invoice_value),
                'paid_value': float(paid_value),
            },
            'recent_documents': recent_docs
        })
