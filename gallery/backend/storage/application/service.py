"""
Business Logic Layer for Generation Logs.
Uses the repository for data access, handles business rules and validation.
"""
from typing import List, Optional, Dict
import base64
import uuid
import logging
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from ..domain.models import GenerationLog, ControlImage
from ..infrastructure.repository import GenerationLogRepository
from storages.backends.s3boto3 import S3Boto3Storage

class GenerationLogService:
    """Service for generation log business logic."""
    
    @staticmethod
    def save_base64_image(base64_str: str, prefix: str) -> str:
        """Save a base64 image to storage and return the path."""
        logger = logging.getLogger("gallery.storage")
        if not base64_str:
            logger.warning("No base64 string provided for %s", prefix)
            return ""
        try:
            # Log image details
            logger.info(f"Processing {prefix} image - base64 length: {len(base64_str)} characters")
            
            format, imgstr = base64_str.split(';base64,') if ';base64,' in base64_str else (None, base64_str)
            ext = 'jpg' if not format else format.split('/')[-1]
            file_name = f"{prefix}_{uuid.uuid4().hex[:8]}.{ext}"
            
            logger.info(f"Decoded image format: {format}, extension: {ext}, filename: {file_name}")
            
            file = ContentFile(base64.b64decode(imgstr), name=file_name)

            storage_backend_name = None
            storage = S3Boto3Storage()
            storage_backend_name = 'S3Boto3Storage'

            path = storage.save(f"generations/{file_name}", file)
            logger.info(f"Successfully saved image to storage ({storage_backend_name}): {path}")
            return path
        except Exception as e:
            logger.error(f"Failed to save image to storage: {e}")
            raise ValueError(f"Invalid base64 image: {e}")
    
    @staticmethod
    def create_generation_log(
        input_image_base64: str = "",
        generated_image_base64: str = "",
        control_images_base64: List[str] = None
    ) -> GenerationLog:
        """Create a new GenerationLog with base64 images."""
        logger = logging.getLogger("gallery.storage")
        
        if control_images_base64 is None:
            control_images_base64 = []
        
        logger.info(f"Creating new GenerationLog - input_image: {'present' if input_image_base64 else 'none'}, generated_image: {'present' if generated_image_base64 else 'none'}, control_images: {len(control_images_base64)}")
        
        # Save images to storage
        input_image_path = GenerationLogService.save_base64_image(input_image_base64, "input") if input_image_base64 else ""
        generated_image_path = GenerationLogService.save_base64_image(generated_image_base64, "generated") if generated_image_base64 else ""
        
        # Create the generation log
        log = GenerationLogRepository.create(
            input_image_path=input_image_path,
            generated_image_path=generated_image_path,
        )
        
        logger.info(f"Created GenerationLog with ID: {log.id}")
        
        # Save control images
        for order, control_base64 in enumerate(control_images_base64):
            if control_base64:  # Only process non-empty control images
                logger.info(f"Processing control image {order + 1}/{len(control_images_base64)}")
                control_path = GenerationLogService.save_base64_image(control_base64, f"control_{order}")
                GenerationLogRepository.create_control_image(log, control_path, order)
        
        logger.info(f"Successfully created GenerationLog {log.id} with {len([c for c in control_images_base64 if c])} control images")
        return log
