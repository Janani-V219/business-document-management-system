from django.urls import path
from .views import (
    QuotationPdfView,
    QuotationPreviewHtmlView,
    InvoicePdfView,
    InvoicePreviewHtmlView,
)

urlpatterns = [
    path('quotations/<int:pk>/pdf/', QuotationPdfView.as_view(), name='quotation_pdf'),
    path('quotations/<int:pk>/preview/', QuotationPreviewHtmlView.as_view(), name='quotation_preview'),
    path('invoices/<int:pk>/pdf/', InvoicePdfView.as_view(), name='invoice_pdf'),
    path('invoices/<int:pk>/preview/', InvoicePreviewHtmlView.as_view(), name='invoice_preview'),
]
