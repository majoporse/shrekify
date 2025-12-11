import uuid
from django.db import models


class GalleryEntry(models.Model):
    """A gallery entry containing a shrekified image and its control images."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Main generated image (base64)
    main_image = models.TextField()
    
    # Original input image (base64)
    original_image = models.TextField()
    
    # Control images stored as JSON array of {image_base64, description}
    control_images = models.JSONField(default=list, blank=True)
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Gallery entries"
    
    def __str__(self):
        return f"Gallery {self.id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
