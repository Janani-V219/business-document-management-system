from django.db import models

class DocumentTemplate(models.Model):
    DOCUMENT_TYPES = (
        ('QUOTATION', 'Quotation'),
        ('INVOICE', 'Invoice'),
    )

    name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    html_content = models.TextField()
    css_content = models.TextField(blank=True, default='')
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_default', 'name']

    def save(self, *args, **kwargs):
        # If this template is set as default, unset other defaults for same document_type
        if self.is_default:
            DocumentTemplate.objects.filter(
                document_type=self.document_type,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_document_type_display()})"
