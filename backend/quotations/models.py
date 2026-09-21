from decimal import Decimal
from django.db import models
from django.conf import settings
from clients.models import Client
from products.models import ProductService
from templates_app.models import DocumentTemplate

class Quotation(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
        ('CONVERTED', 'Converted to Invoice'),
        ('CANCELLED', 'Cancelled'),
    )

    DISCOUNT_TYPE_CHOICES = (
        ('PERCENTAGE', 'Percentage (%)'),
        ('FIXED', 'Fixed Amount'),
    )

    quotation_number = models.CharField(max_length=100, unique=True, db_index=True, editable=False)
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='quotations')
    template = models.ForeignKey(DocumentTemplate, on_delete=models.SET_NULL, null=True, blank=True, related_name='quotations')
    quotation_date = models.DateField()
    valid_until = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='PERCENTAGE')
    discount_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    tax_enabled = models.BooleanField(default=True)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00, help_text='Tax / GST percentage')
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    grand_total = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    terms_conditions = models.TextField(blank=True, default='')
    notes = models.TextField(blank=True, default='')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_quotations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quotation_number} - {self.client.client_name} ({self.get_status_display()})"

    def calculate_totals(self):
        """
        Backend single source of truth for all calculations.
        """
        items = self.items.all()
        subtotal = Decimal('0.00')
        for item in items:
            item_amount = Decimal(str(item.quantity)) * Decimal(str(item.rate))
            item.amount = item_amount.quantize(Decimal('0.01'))
            item.save(update_fields=['amount'])
            subtotal += item.amount

        self.subtotal = subtotal.quantize(Decimal('0.01'))

        # Calculate discount
        discount_val = Decimal(str(self.discount_value))
        if self.discount_type == 'PERCENTAGE':
            discount_amount = (self.subtotal * discount_val / Decimal('100.00')).quantize(Decimal('0.01'))
        else:
            discount_amount = min(discount_val, self.subtotal).quantize(Decimal('0.01'))

        self.discount_amount = discount_amount
        taxable_amount = max(Decimal('0.00'), self.subtotal - self.discount_amount)

        # Calculate tax
        if self.tax_enabled:
            tax_rate_dec = Decimal(str(self.tax_rate))
            tax_amount = (taxable_amount * tax_rate_dec / Decimal('100.00')).quantize(Decimal('0.01'))
        else:
            tax_amount = Decimal('0.00')

        self.tax_amount = tax_amount
        self.grand_total = (taxable_amount + tax_amount).quantize(Decimal('0.01'))
        self.save(update_fields=['subtotal', 'discount_amount', 'tax_amount', 'grand_total'])


class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    product_service = models.ForeignKey(ProductService, on_delete=models.SET_NULL, null=True, blank=True)
    item_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    rate = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        self.amount = (Decimal(str(self.quantity)) * Decimal(str(self.rate))).quantize(Decimal('0.01'))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.item_name} x {self.quantity}"
