from django.urls import path

from .views import ShrekifyView

urlpatterns = [
    path("shrekify/", ShrekifyView.as_view(), name="shrekify"),
]


