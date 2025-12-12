import uuid
from django.db import models


def image_file_path(instance, filename):
    """Generate upload path for images: images/<entry_id>/<filename>"""
    return f"images/{instance.id}/{filename}"


class GalleryImage(models.Model):
    """An image stored in the gallery with metadata."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Image file stored on S3/MinIO
    image = models.ImageField(upload_to=image_file_path)
    
    # Metadata
    title = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    
    # Storage metadata
    size = models.BigIntegerField(default=0)  # File size in bytes
    mime_type = models.CharField(max_length=100, default="image/jpeg")
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Gallery images"
        indexes = [
            models.Index(fields=["-created_at"]),
        ]
    
    def __str__(self):
        return f"{self.title or self.id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        """Auto-populate size when image is saved."""
        if self.image:
            self.size = self.image.size
        super().save(*args, **kwargs)
