"""
URL configuration for gallery_api project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from storage.views import ImageViewSet

router = DefaultRouter()
router.register(r'images', ImageViewSet, basename='image')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
