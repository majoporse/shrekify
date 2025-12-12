"""
Business Logic Layer for Gallery Images.
Uses the repository for data access, handles business rules and validation.
"""
from typing import List, Optional, Dict
from ..infrastructure.repository import ImageRepository
from ..domain.models import GalleryImage


class ImageService:
    """Service for image-related business logic."""
    
    @staticmethod
    def create_image(image_file, title: str = "", description: str = "") -> GalleryImage:
        """Create a new image with validation."""
        if not image_file:
            raise ValueError("Image file is required")
        
        # Validate file size (optional, e.g., max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if image_file.size > max_size:
            raise ValueError(f"File size exceeds maximum allowed size of {max_size / 1024 / 1024}MB")
        
        return ImageRepository.create(image_file, title, description)
    
    @staticmethod
    def get_image(image_id) -> Optional[GalleryImage]:
        """Get image by ID."""
        return ImageRepository.get_by_id(image_id)
    
    @staticmethod
    def get_all_images() -> List[GalleryImage]:
        """Get all images."""
        return list(ImageRepository.get_all())
    
    @staticmethod
    def get_images_paginated(page: int, page_size: int = 20) -> Dict:
        """Get paginated images."""
        items, total = ImageRepository.get_paginated(page, page_size)
        
        return {
            'items': items,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size,
        }
    
    @staticmethod
    def search_images(query: str, page: int = 1, page_size: int = 20) -> Dict:
        """Search images by query."""
        if not query or not query.strip():
            return ImageService.get_images_paginated(page, page_size)
        
        items, total = ImageRepository.search_paginated(query, page, page_size)
        
        return {
            'items': items,
            'total': total,
            'query': query,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size,
        }
    
    @staticmethod
    def update_image(image_id, **kwargs) -> Optional[GalleryImage]:
        """Update image with validation."""
        image = ImageRepository.get_by_id(image_id)
        if not image:
            raise ValueError(f"Image with ID {image_id} not found")
        
        # Only allow updating certain fields
        allowed_fields = {'title', 'description'}
        update_data = {k: v for k, v in kwargs.items() if k in allowed_fields}
        
        if not update_data:
            return image
        
        return ImageRepository.update(image_id, **update_data)
    
    @staticmethod
    def delete_image(image_id) -> bool:
        """Delete image."""
        if not ImageRepository.exists(image_id):
            raise ValueError(f"Image with ID {image_id} not found")
        
        return ImageRepository.delete(image_id)
    
    @staticmethod
    def delete_images_bulk(image_ids: List) -> int:
        """Delete multiple images."""
        if not image_ids:
            raise ValueError("No image IDs provided")
        
        return ImageRepository.delete_bulk(image_ids)
    
    @staticmethod
    def get_gallery_stats() -> Dict:
        """Get gallery statistics."""
        return ImageRepository.get_stats()
