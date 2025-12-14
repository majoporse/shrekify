from rest_framework import serializers
from .models import GenerationLog, ControlImage
from ..application.service import GenerationLogService


class ControlImageSerializer(serializers.ModelSerializer):
    """Serializer for control images in a generation."""
    
    class Meta:
        model = ControlImage
        fields = ['id', 'image_path', 'order']
        read_only_fields = ['id']


class GenerationLogListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list view - no joined data."""
    
    class Meta:
        model = GenerationLog
        fields = [
            'id',
            'input_image_path',
            'generated_image_path',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GenerationLogSerializer(serializers.ModelSerializer):
    """Full serializer for detail view - with control images joined."""
    
    control_images = ControlImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = GenerationLog
        fields = [
            'id',
            'input_image_path',
            'generated_image_path',
            'control_images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GenerationLogCreateSerializer(serializers.Serializer):
    """Serializer for creating GenerationLog with base64 images."""
    input_image_base64 = serializers.CharField(required=False, allow_blank=True)
    generated_image_base64 = serializers.CharField(required=True)
    control_images_base64 = serializers.ListField(child=serializers.CharField(), required=False)

    def create(self, validated_data):
        input_image_base64 = validated_data.get('input_image_base64', "")
        generated_image_base64 = validated_data.get('generated_image_base64')
        control_images_base64 = validated_data.get('control_images_base64', [])
        
        return GenerationLogService.create_generation_log(
            input_image_base64=input_image_base64,
            generated_image_base64=generated_image_base64,
            control_images_base64=control_images_base64
        )
