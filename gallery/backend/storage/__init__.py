"""
Gallery Storage App - Clean layered architecture.

Layers:
- presentation: REST API views and viewsets
- application: Business logic and services
- domain: Models, serializers, and data structures
- infrastructure: Data access and repository patterns

Import from specific layers:
  from storage.domain.models import GalleryImage
  from storage.domain.serializers import GalleryImageSerializer
  from storage.application.service import ImageService
  from storage.infrastructure.repository import ImageRepository
  from storage.presentation.views import ImageViewSet
"""
