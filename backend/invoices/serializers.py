from rest_framework import serializers
from django.db import transaction
from clients.serializers import ClientSerializer
from templates_app.serializers import DocumentTemplateSerializer
from numbering.models import NumberingSettings
from .models import Invoice, InvoiceItem

class InvoiceItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = InvoiceItem
        fields = ('id', 'product_service', 'item_name', 'description', 'quantity', 'rate', 'amount')
        read_only_fields = ('amount',)

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    client_details = ClientSerializer(source='client', read_only=True)
    template_details = DocumentTemplateSerializer(source='template', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    source_quotation_number = serializers.CharField(source='source_quotation.quotation_number', read_only=True)

    class Meta:
        model = Invoice
        fields = (
            'id', 'invoice_number', 'source_quotation', 'source_quotation_number',
            'client', 'client_details', 'template', 'template_details',
            'invoice_date', 'due_date', 'status',
            'subtotal', 'discount_type', 'discount_value', 'discount_amount',
            'tax_enabled', 'tax_rate', 'tax_amount', 'grand_total',
            'terms_conditions', 'payment_details', 'notes', 'items',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'invoice_number', 'source_quotation_number', 'subtotal', 'discount_amount',
            'tax_amount', 'grand_total', 'created_by', 'created_at', 'updated_at'
        )

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user if 'request' in self.context else None

        with transaction.atomic():
            # Allocate atomic immutable sequence number for invoice
            invoice_number = NumberingSettings.allocate_next_number('INVOICE')

            invoice = Invoice.objects.create(
                invoice_number=invoice_number,
                created_by=user,
                **validated_data
            )

            for item_data in items_data:
                item_data.pop('id', None)
                InvoiceItem.objects.create(invoice=invoice, **item_data)

            invoice.calculate_totals()
            return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # invoice_number is immutable
        validated_data.pop('invoice_number', None)

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if items_data is not None:
                instance.items.all().delete()
                for item_data in items_data:
                    item_data.pop('id', None)
                    InvoiceItem.objects.create(invoice=instance, **item_data)

            instance.calculate_totals()
            return instance
