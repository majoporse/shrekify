from django.urls import path

from .views import ShrekifyView, GalleryListView, GalleryDetailView

urlpatterns = [
    path("shrekify/", ShrekifyView.as_view(), name="shrekify"),
    path("gallery/", GalleryListView.as_view(), name="gallery-list"),
    path("gallery/<uuid:entry_id>/", GalleryDetailView.as_view(), name="gallery-detail"),
]


