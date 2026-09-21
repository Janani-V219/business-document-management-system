from django.db import models

class CompanyProfile(models.Model):
    company_name = models.CharField(max_length=255, default='My Business Inc.')
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    address = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    website = models.CharField(max_length=255, blank=True, default='')
    gst_number = models.CharField(max_length=50, blank=True, default='', help_text='GSTIN / Tax ID')
    pan_number = models.CharField(max_length=50, blank=True, default='')
    bank_name = models.CharField(max_length=100, blank=True, default='')
    account_details = models.TextField(blank=True, default='', help_text='Account Name, Number, IFSC / SWIFT / IBAN')
    payment_information = models.TextField(blank=True, default='', help_text='UPI ID, PayPal, wire instructions')
    default_terms = models.TextField(
        blank=True,
        default="1. Payment is due within 15 days of invoice date.\n2. Please include invoice number on your payment.\n3. Goods/services once delivered cannot be returned without prior agreement."
    )
    signature = models.ImageField(upload_to='company_signatures/', blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name
