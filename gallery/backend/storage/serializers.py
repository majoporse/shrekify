from rest_framework import serializers
from .models import GalleryImage


class GalleryImageSerializer(serializers.ModelSerializer):
    """Serializer for GalleryImage with metadata and S3 URL."""
    
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GalleryImage
        fields = [
            'id',
            'image',
            'image_url',
            'title',
            'description',
            'size',
            'mime_type',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'size', 'mime_type', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Return the S3/MinIO URL for the image."""
        if obj.image:
            return obj.image.url
        return None
    
    def create(self, validated_data):
        """Create image and auto-populate metadata."""
        image = GalleryImage(**validated_data)
        
        if image.image:
            image.mime_type = image.image.content_type or "image/jpeg"
        
        image.save()
        return image
