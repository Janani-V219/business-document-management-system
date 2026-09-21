from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from quotations.models import Quotation
from invoices.models import Invoice
from users.permissions import CanManageDocuments
from .services import render_document_html, generate_pdf_response

class QuotationPdfView(APIView):
    permission_classes = [CanManageDocuments]

    def get(self, request, pk):
        try:
            quotation = Quotation.objects.select_related('client', 'template').prefetch_related('items').get(pk=pk)
        except Quotation.DoesNotExist:
            return Response({'error': 'Quotation not found'}, status=status.HTTP_404_NOT_FOUND)
        return generate_pdf_response(quotation, 'QUOTATION')

class QuotationPreviewHtmlView(APIView):
    permission_classes = [CanManageDocuments]

    def get(self, request, pk):
        try:
            quotation = Quotation.objects.select_related('client', 'template').prefetch_related('items').get(pk=pk)
        except Quotation.DoesNotExist:
            return Response({'error': 'Quotation not found'}, status=status.HTTP_404_NOT_FOUND)
        html = render_document_html(quotation, 'QUOTATION')
        return HttpResponse(html, content_type='text/html')

class InvoicePdfView(APIView):
    permission_classes = [CanManageDocuments]

    def get(self, request, pk):
        try:
            invoice = Invoice.objects.select_related('client', 'template').prefetch_related('items').get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)
        return generate_pdf_response(invoice, 'INVOICE')

class InvoicePreviewHtmlView(APIView):
    permission_classes = [CanManageDocuments]

    def get(self, request, pk):
        try:
            invoice = Invoice.objects.select_related('client', 'template').prefetch_related('items').get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)
        html = render_document_html(invoice, 'INVOICE')
        return HttpResponse(html, content_type='text/html')
