from django.contrib import admin
from .domain.models import GenerationLog, ControlImage


class ControlImageInline(admin.TabularInline):
    """Inline editor for control images in a generation log."""
    model = ControlImage
    extra = 1
    fields = ('image_path', 'order')
    readonly_fields = ('id',)


@admin.register(GenerationLog)
class GenerationLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('id', 'input_image_path', 'generated_image_path')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    inlines = [ControlImageInline]
    
    fieldsets = (
        ('Image Paths', {
            'fields': ('input_image_path', 'generated_image_path')
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ControlImage)
class ControlImageAdmin(admin.ModelAdmin):
    list_display = ('generation_log', 'order', 'image_path')
    list_filter = ('generation_log__created_at',)
    search_fields = ('generation_log__id', 'image_path')
    readonly_fields = ('id',)
    ordering = ('generation_log', 'order')
