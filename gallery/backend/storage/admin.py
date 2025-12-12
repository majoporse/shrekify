from django.contrib import admin
from .models import GalleryImage


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'size', 'mime_type', 'created_at')
    list_filter = ('mime_type', 'created_at')
    search_fields = ('title', 'description', 'id')
    readonly_fields = ('id', 'size', 'mime_type', 'created_at', 'updated_at', 'image_preview')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Image', {
            'fields': ('image', 'image_preview')
        }),
        ('Metadata', {
            'fields': ('title', 'description')
        }),
        ('Storage Info', {
            'fields': ('id', 'size', 'mime_type', 'created_at', 'updated_at')
        }),
    )
    
    def image_preview(self, obj):
        """Show image preview in admin."""
        if obj.image:
            return f'<img src="{obj.image.url}" width="300" />'
        return 'No image'
    image_preview.allow_tags = True
    image_preview.short_description = 'Image Preview'
