from rest_framework import serializers
from .models import GenerationLog, ControlImage


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
    """Serializer for creating GenerationLog with control image paths."""
    
    input_image_path = serializers.CharField(required=False, allow_blank=True)
    generated_image_path = serializers.CharField(required=False, allow_blank=True)
    control_image_paths = serializers.ListField(child=serializers.CharField(), required=False)
    
    def create(self, validated_data):
        """Create GenerationLog and associated control images."""
        control_image_paths = validated_data.pop('control_image_paths', [])
        
        # Create the log
        log = GenerationLog.objects.create(**validated_data)
        
        # Create control images
        for order, image_path in enumerate(control_image_paths):
            ControlImage.objects.create(
                generation_log=log,
                image_path=image_path,
                order=order
            )
        
        return log
