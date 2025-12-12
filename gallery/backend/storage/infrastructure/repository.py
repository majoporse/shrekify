"""
Data Access Layer for Gallery Images.
Handles all database operations and abstracts the ORM from business logic.
"""
from typing import List, Optional, Tuple
from django.db.models import Q, QuerySet
from ..domain.models import GalleryImage


class ImageRepository:
    """Repository for managing image data access."""
    
    @staticmethod
    def create(image_file, title: str = "", description: str = "") -> GalleryImage:
        """Create a new image."""
        return GalleryImage.objects.create(
            image=image_file,
            title=title,
            description=description,
        )
    
    @staticmethod
    def get_by_id(image_id) -> Optional[GalleryImage]:
        """Get image by ID."""
        try:
            return GalleryImage.objects.get(id=image_id)
        except GalleryImage.DoesNotExist:
            return None
    
    @staticmethod
    def get_all() -> QuerySet:
        """Get all images ordered by creation date."""
        return GalleryImage.objects.all().order_by('-created_at')
    
    @staticmethod
    def get_paginated(page: int, page_size: int = 20) -> Tuple[List[GalleryImage], int]:
        """Get paginated images."""
        queryset = ImageRepository.get_all()
        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        items = list(queryset[start:end])
        return items, total_count
    
    @staticmethod
    def search(query: str) -> QuerySet:
        """Search images by title or description."""
        return GalleryImage.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        ).order_by('-created_at')
    
    @staticmethod
    def search_paginated(query: str, page: int, page_size: int = 20) -> Tuple[List[GalleryImage], int]:
        """Search with pagination."""
        queryset = ImageRepository.search(query)
        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        items = list(queryset[start:end])
        return items, total_count
    
    @staticmethod
    def update(image_id, **kwargs) -> Optional[GalleryImage]:
        """Update image metadata."""
        image = ImageRepository.get_by_id(image_id)
        if not image:
            return None
        
        for key, value in kwargs.items():
            if hasattr(image, key) and key not in ['id', 'image', 'created_at']:
                setattr(image, key, value)
        
        image.save()
        return image
    
    @staticmethod
    def delete(image_id) -> bool:
        """Delete image by ID."""
        image = ImageRepository.get_by_id(image_id)
        if not image:
            return False
        
        # Delete the file from S3
        if image.image:
            image.image.delete()
        
        image.delete()
        return True
    
    @staticmethod
    def delete_bulk(image_ids: List) -> int:
        """Delete multiple images."""
        images = GalleryImage.objects.filter(id__in=image_ids)
        
        # Delete files from S3
        for image in images:
            if image.image:
                image.image.delete()
        
        count, _ = images.delete()
        return count
    
    @staticmethod
    def get_stats() -> dict:
        """Get gallery statistics."""
        images = GalleryImage.objects.all()
        
        if not images.exists():
            return {
                'total_images': 0,
                'total_size': 0,
                'oldest_image': None,
                'newest_image': None,
                'average_size': 0,
            }
        
        total_size = sum(img.size for img in images)
        count = images.count()
        
        return {
            'total_images': count,
            'total_size': total_size,
            'average_size': total_size // count if count > 0 else 0,
            'oldest_image': images.last().created_at if images.exists() else None,
            'newest_image': images.first().created_at if images.exists() else None,
        }
    
    @staticmethod
    def exists(image_id) -> bool:
        """Check if image exists."""
        return GalleryImage.objects.filter(id=image_id).exists()
    
    @staticmethod
    def count() -> int:
        """Get total image count."""
        return GalleryImage.objects.count()
