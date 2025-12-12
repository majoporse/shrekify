from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.paginator import Paginator
from django.db import models
from .models import GalleryImage
from .serializers import GalleryImageSerializer



class ImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing gallery images.
    
    Supports:
    - List: GET /api/images/ (paginated)
    - Create: POST /api/images/
    - Retrieve: GET /api/images/{id}/
    - Update: PATCH /api/images/{id}/
    - Delete: DELETE /api/images/{id}/
    - Search: GET /api/images/search/?q=query
    """
    
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    filterset_fields = ['created_at']
    ordering_fields = ['-created_at', 'title', 'size']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter queryset based on query parameters."""
        queryset = GalleryImage.objects.all()
        
        # Search by title or description
        search = self.request.query_params.get('q', None)
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) | models.Q(description__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Handle image upload."""
        serializer.save()
    
    def perform_update(self, serializer):
        """Handle image metadata updates."""
        serializer.save()
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Delete multiple images by IDs.
        
        Request body: {"ids": ["id1", "id2", ...]}
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'ids list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count, _ = GalleryImage.objects.filter(id__in=ids).delete()
        return Response(
            {'deleted': deleted_count},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get gallery statistics."""
        images = GalleryImage.objects.all()
        return Response({
            'total_images': images.count(),
            'total_size': sum(img.size for img in images) or 0,
            'oldest_image': images.last().created_at if images.exists() else None,
            'newest_image': images.first().created_at if images.exists() else None,
        })
