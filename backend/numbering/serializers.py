from rest_framework import serializers
from django.utils import timezone
from .models import NumberingSettings

class NumberingSettingsSerializer(serializers.ModelSerializer):
    sample_preview = serializers.SerializerMethodField()

    class Meta:
        model = NumberingSettings
        fields = (
            'id', 'document_type', 'prefix', 'starting_number',
            'number_of_digits', 'format_pattern', 'current_sequence',
            'sample_preview', 'updated_at'
        )
        read_only_fields = ('id', 'document_type', 'current_sequence', 'updated_at')

    def get_sample_preview(self, obj):
        sample_num = (obj.current_sequence + 1) if obj.current_sequence > 0 else obj.starting_number
        padded = str(sample_num).zfill(obj.number_of_digits)
        year = str(timezone.now().year)
        return obj.format_pattern.replace('{prefix}', obj.prefix).replace('{number}', padded).replace('{year}', year)
