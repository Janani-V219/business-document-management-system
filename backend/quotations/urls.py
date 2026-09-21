from django.urls import path
from .views import QuotationListCreateView, QuotationDetailView, DuplicateQuotationView
from invoices.views import ConvertQuotationToInvoiceView

urlpatterns = [
    path('quotations/', QuotationListCreateView.as_view(), name='quotation_list_create'),
    path('quotations/<int:pk>/', QuotationDetailView.as_view(), name='quotation_detail'),
    path('quotations/<int:pk>/duplicate/', DuplicateQuotationView.as_view(), name='quotation_duplicate'),
    path('quotations/<int:pk>/convert-to-invoice/', ConvertQuotationToInvoiceView.as_view(), name='quotation_convert_invoice'),
]
