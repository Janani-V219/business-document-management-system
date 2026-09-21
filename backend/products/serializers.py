from rest_framework import serializers
from .models import ProductService

class ProductServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductService
        fields = '__all__'
