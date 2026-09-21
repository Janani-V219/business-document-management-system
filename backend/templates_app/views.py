from rest_framework import generics
from .models import DocumentTemplate
from .serializers import DocumentTemplateSerializer
from users.permissions import IsAdminOrReadOnly

class DocumentTemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentTemplateSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = DocumentTemplate.objects.all()
        doc_type = self.request.query_params.get('document_type', '').strip().upper()
        if doc_type:
            queryset = queryset.filter(document_type=doc_type)
        return queryset

class DocumentTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DocumentTemplate.objects.all()
    serializer_class = DocumentTemplateSerializer
    permission_classes = [IsAdminOrReadOnly]
