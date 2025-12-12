"""
Storage app URL configuration - part of the presentation layer.
This is the main entry point for storage API routing.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from .views import GenerationLogViewSet

# Configure routing
router = DefaultRouter()
router.register(r'generation-logs', GenerationLogViewSet, basename='generation-log')

# All presentation layer URLs
urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # API Documentation
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
