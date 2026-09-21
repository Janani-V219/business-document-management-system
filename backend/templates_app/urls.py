from django.urls import path
from .views import DocumentTemplateListCreateView, DocumentTemplateDetailView

urlpatterns = [
    path('templates/', DocumentTemplateListCreateView.as_view(), name='template_list_create'),
    path('templates/<int:pk>/', DocumentTemplateDetailView.as_view(), name='template_detail'),
]
