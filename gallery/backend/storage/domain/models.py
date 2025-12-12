import uuid
from django.db import models


def image_file_path(instance, filename):
    """Generate upload path for images: images/<entry_id>/<filename>"""
    return f"images/{instance.id}/{filename}"

class GenerationLog(models.Model):
    """
    Log of image generation operations.
    Stores paths to MinIO objects for input and generated images.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # MinIO paths (not foreign keys)
    input_image_path = models.CharField(
        max_length=500,
        blank=True,
        default="",
        help_text="Path to input image in MinIO (e.g., 'generations/input/abc123.jpg')"
    )
    
    generated_image_path = models.CharField(
        max_length=500,
        blank=True,
        default="",
        help_text="Path to generated output image in MinIO"
    )
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Generation logs"
        indexes = [
            models.Index(fields=["-created_at"]),
        ]
    
    def __str__(self):
        return f"Generation {self.id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class ControlImage(models.Model):
    """
    Control images associated with a generation.
    Many control images can belong to one generation log.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    generation_log = models.ForeignKey(
        GenerationLog,
        on_delete=models.CASCADE,
        related_name='control_images'
    )
    
    # MinIO path (not foreign key)
    image_path = models.CharField(
        max_length=500,
        help_text="Path to control image in MinIO"
    )
    
    order = models.IntegerField(default=0, help_text="Order of this image in the control sequence")
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = "Control images"
        indexes = [
            models.Index(fields=['generation_log', 'order']),
        ]
    
    def __str__(self):
        return f"{self.generation_log.id} - Control Image ({self.order})"

