from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import CompanyProfile
from .serializers import CompanyProfileSerializer
from users.permissions import IsAdminOrReadOnly

class CompanyProfileView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        profile, _ = CompanyProfile.objects.get_or_create(id=1)
        return profile

    def get(self, request):
        profile = self.get_object()
        serializer = CompanyProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        profile = self.get_object()
        serializer = CompanyProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
