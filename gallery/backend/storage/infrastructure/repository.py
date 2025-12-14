"""
Data Access Layer for Gallery Images.
Handles all database operations and abstracts the ORM from business logic.
"""
from typing import List, Optional, Tuple
from django.db.models import Q, QuerySet
from ..domain.models import GenerationLog, ControlImage


class GenerationLogRepository:
    """Repository for managing generation log data access."""
    
    @staticmethod
    def create(input_image_path: str = "", generated_image_path: str = "") -> GenerationLog:
        """Create a new generation log."""
        return GenerationLog.objects.create(
            input_image_path=input_image_path,
            generated_image_path=generated_image_path,
        )
    
    @staticmethod
    def create_control_image(generation_log: GenerationLog, image_path: str, order: int) -> ControlImage:
        """Create a control image for a generation log."""
        return ControlImage.objects.create(
            generation_log=generation_log,
            image_path=image_path,
            order=order
        )
    
    @staticmethod
    def get_all() -> QuerySet:
        """Get all generation logs ordered by creation date."""
        return GenerationLog.objects.all().order_by('-created_at')
    
    @staticmethod
    def get_by_id(generation_log_id) -> Optional[GenerationLog]:
        """Get generation log by ID with control images prefetched."""
        try:
            return GenerationLog.objects.prefetch_related('control_images').get(id=generation_log_id)
        except GenerationLog.DoesNotExist:
            return None
    
    @staticmethod
    def get_paginated(page: int, page_size: int = 20) -> Tuple[List[GenerationLog], int]:
        """Get paginated generation logs."""
        queryset = GenerationLogRepository.get_all()
        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        items = list(queryset[start:end])
        return items, total_count
