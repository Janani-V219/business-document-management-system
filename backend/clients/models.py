from django.db import models

class Client(models.Model):
    client_name = models.CharField(max_length=255, help_text='Primary Contact Name')
    company_name = models.CharField(max_length=255, blank=True, default='')
    address = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    gst_number = models.CharField(max_length=50, blank=True, default='', help_text='GST / Tax Number')
    billing_address = models.TextField(blank=True, default='')
    shipping_address = models.TextField(blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        if self.company_name:
            return f"{self.client_name} ({self.company_name})"
        return self.client_name
