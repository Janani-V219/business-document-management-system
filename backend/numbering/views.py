from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import NumberingSettings
from .serializers import NumberingSettingsSerializer
from users.permissions import IsAdminUserRole

class NumberingSettingsListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        quotation_setting = NumberingSettings.get_or_create_default('QUOTATION')
        invoice_setting = NumberingSettings.get_or_create_default('INVOICE')
        serializer = NumberingSettingsSerializer([quotation_setting, invoice_setting], many=True)
        return Response(serializer.data)

class NumberingSettingsDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, doc_type):
        doc_type = doc_type.upper()
        if doc_type not in ['QUOTATION', 'INVOICE']:
            return Response({'error': 'Invalid document type'}, status=status.HTTP_400_BAD_REQUEST)
        setting = NumberingSettings.get_or_create_default(doc_type)
        serializer = NumberingSettingsSerializer(setting)
        return Response(serializer.data)

    def put(self, request, doc_type):
        doc_type = doc_type.upper()
        if doc_type not in ['QUOTATION', 'INVOICE']:
            return Response({'error': 'Invalid document type'}, status=status.HTTP_400_BAD_REQUEST)
        setting = NumberingSettings.get_or_create_default(doc_type)
        serializer = NumberingSettingsSerializer(setting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
