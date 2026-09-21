from django.urls import path
from .views import InvoiceListCreateView, InvoiceDetailView, DuplicateInvoiceView

urlpatterns = [
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice_list_create'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice_detail'),
    path('invoices/<int:pk>/duplicate/', DuplicateInvoiceView.as_view(), name='invoice_duplicate'),
]
