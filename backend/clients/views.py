from rest_framework import generics, filters
from django.db.models import Q
from .models import Client
from .serializers import ClientSerializer
from users.permissions import CanManageDocuments

class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [CanManageDocuments]

    def get_queryset(self):
        queryset = Client.objects.all()
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(client_name__icontains=search) |
                Q(company_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(gst_number__icontains=search)
            )
        return queryset

class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [CanManageDocuments]
