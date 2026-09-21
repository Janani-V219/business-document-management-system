from django.db import models, transaction
from django.utils import timezone

class NumberingSettings(models.Model):
    DOCUMENT_TYPES = (
        ('QUOTATION', 'Quotation'),
        ('INVOICE', 'Invoice'),
    )

    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, unique=True)
    prefix = models.CharField(max_length=20, default='QTN')
    starting_number = models.PositiveIntegerField(default=1)
    number_of_digits = models.PositiveIntegerField(default=4)
    format_pattern = models.CharField(
        max_length=100,
        default='{prefix}-{number}',
        help_text='Use {prefix}, {number}, and optional {year} placeholders (e.g. {prefix}-{number} or ASC/{prefix}/{year}/{number})'
    )
    current_sequence = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_document_type_display()} Numbering ({self.prefix})"

    @classmethod
    def get_or_create_default(cls, document_type):
        default_prefix = 'QTN' if document_type == 'QUOTATION' else 'INV'
        obj, _ = cls.objects.get_or_create(
            document_type=document_type,
            defaults={
                'prefix': default_prefix,
                'starting_number': 1,
                'number_of_digits': 4,
                'format_pattern': '{prefix}-{number}',
                'current_sequence': 0,
            }
        )
        return obj

    @classmethod
    def allocate_next_number(cls, document_type):
        """
        Database-safe atomic sequence allocation.
        Prevents race conditions using select_for_update.
        Guarantees numbers are never reused even if documents are deleted.
        """
        with transaction.atomic():
            # Ensure row exists
            cls.get_or_create_default(document_type)

            # Lock the row for update
            setting = cls.objects.select_for_update().get(document_type=document_type)

            if setting.current_sequence == 0:
                next_seq = setting.starting_number
            else:
                next_seq = setting.current_sequence + 1

            setting.current_sequence = next_seq
            setting.save(update_fields=['current_sequence'])

            padded_number = str(next_seq).zfill(setting.number_of_digits)
            current_year = str(timezone.now().year)

            formatted_number = setting.format_pattern \
                .replace('{prefix}', setting.prefix) \
                .replace('{number}', padded_number) \
                .replace('{year}', current_year)

            return formatted_number
