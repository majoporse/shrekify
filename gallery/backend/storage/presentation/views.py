from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from ..domain.models import GenerationLog
from ..domain.serializers import (
    GenerationLogSerializer, 
    GenerationLogListSerializer,
    GenerationLogCreateSerializer
)
from ..infrastructure.repository import GenerationLogRepository


class ImagePagination(PageNumberPagination):
    """Custom pagination."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class GenerationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing generation logs.
    
    Provides complete generation records with input, generated, and control images.
    
    - List: Returns lightweight records without control images (paginated)
    - Retrieve: Returns full record with all control images joined
    - Create: Upload new generation log with control images
    
    Supports:
    - List: GET /api/generation-logs/ (paginated, non-joined)
    - Create: POST /api/generation-logs/
    - Retrieve: GET /api/generation-logs/{id}/ (with control images joined)
    """
    
    pagination_class = ImagePagination
    
    def get_queryset(self):
        """Get queryset from repository."""
        return GenerationLogRepository.get_all()
    
    def get_serializer_class(self):
        """Use appropriate serializer based on action."""
        if self.action == 'create':
            return GenerationLogCreateSerializer
        elif self.action == 'list':
            return GenerationLogListSerializer
        return GenerationLogSerializer
    
    def list(self, request, *args, **kwargs):
        """List generation logs with pagination - no joins."""
        queryset = self.get_queryset()
        paginator = self.pagination_class()
        paginated = paginator.paginate_queryset(queryset, request)
        
        serializer = self.get_serializer(paginated, many=True)
        
        return paginator.get_paginated_response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create a new generation log."""
        serializer = GenerationLogCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            instance = serializer.save()
            # Return with full serializer (read mode)
            return Response(
                GenerationLogSerializer(instance).data,
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def retrieve(self, request, pk=None, *args, **kwargs):
        """Retrieve a single generation log with all control images joined."""
        log = GenerationLogRepository.get_by_id(pk)
        if not log:
            return Response(
                {'error': 'Generation log not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = GenerationLogSerializer(log)
        return Response(serializer.data)

