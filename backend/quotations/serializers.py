from rest_framework import serializers
from django.db import transaction
from clients.serializers import ClientSerializer
from templates_app.serializers import DocumentTemplateSerializer
from numbering.models import NumberingSettings
from .models import Quotation, QuotationItem

class QuotationItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = QuotationItem
        fields = ('id', 'product_service', 'item_name', 'description', 'quantity', 'rate', 'amount')
        read_only_fields = ('amount',)

class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True)
    client_details = ClientSerializer(source='client', read_only=True)
    template_details = DocumentTemplateSerializer(source='template', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Quotation
        fields = (
            'id', 'quotation_number', 'client', 'client_details', 'template', 'template_details',
            'quotation_date', 'valid_until', 'status',
            'subtotal', 'discount_type', 'discount_value', 'discount_amount',
            'tax_enabled', 'tax_rate', 'tax_amount', 'grand_total',
            'terms_conditions', 'notes', 'items', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'quotation_number', 'subtotal', 'discount_amount',
            'tax_amount', 'grand_total', 'created_by', 'created_at', 'updated_at'
        )

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user if 'request' in self.context else None

        with transaction.atomic():
            # Allocate atomic immutable sequence number
            quotation_number = NumberingSettings.allocate_next_number('QUOTATION')

            quotation = Quotation.objects.create(
                quotation_number=quotation_number,
                created_by=user,
                **validated_data
            )

            for item_data in items_data:
                item_data.pop('id', None)
                QuotationItem.objects.create(quotation=quotation, **item_data)

            # Source of truth calculation
            quotation.calculate_totals()
            return quotation

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # Ensure quotation_number is NEVER changed
        validated_data.pop('quotation_number', None)

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if items_data is not None:
                # Replace line items with updated list
                instance.items.all().delete()
                for item_data in items_data:
                    item_data.pop('id', None)
                    QuotationItem.objects.create(quotation=instance, **item_data)

            # Re-calculate totals
            instance.calculate_totals()
            return instance
