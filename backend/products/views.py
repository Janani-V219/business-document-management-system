from rest_framework import generics
from django.db.models import Q
from .models import ProductService
from .serializers import ProductServiceSerializer
from users.permissions import CanManageDocuments

class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductServiceSerializer
    permission_classes = [CanManageDocuments]

    def get_queryset(self):
        queryset = ProductService.objects.all()
        search = self.request.query_params.get('search', '').strip()
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        return queryset

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductService.objects.all()
    serializer_class = ProductServiceSerializer
    permission_classes = [CanManageDocuments]
