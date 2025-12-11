import base64
from io import BytesIO
import logging

from PIL import Image
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from api.ml.ml_sd15 import try_generate_shrek_image
from api.models import GalleryEntry


logger = logging.getLogger(__name__)


def image_to_base64(image: Image.Image, quality: int = 85) -> str:
    buffer = BytesIO()
    rgb_image = image.convert("RGB")
    rgb_image.save(buffer, format="JPEG", quality=quality, optimize=True)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


class ShrekifyView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):

        upload = request.FILES.get("image")

        if upload is None:
            return Response(
                {"detail": "No image file provided (use 'image' in form-data)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            pil_image = Image.open(upload).convert("RGB")
            result = try_generate_shrek_image(pil_image)
            
            images = [
                {
                    "image_base64": image_to_base64(result.image),
                    "description": "Generated Shrek Image",
                }
            ]
            
            for control_image, description in result.control_images:
                images.append({
                    "image_base64": image_to_base64(control_image),
                    "description": description,
                })
            
            return Response(
                {
                    "images": images,
                    "used_fallback": result.used_fallback,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            logger.exception("Failed to process image")
            return Response(
                {"detail": f"Processing failed: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GalleryListView(APIView):
    """List all gallery entries or create a new one."""
    parser_classes = (JSONParser,)

    def get(self, request, *args, **kwargs):
        entries = GalleryEntry.objects.all()[:50]  # Limit to 50 most recent
        data = [
            {
                "id": str(entry.id),
                "created_at": entry.created_at.isoformat(),
                "main_image": entry.main_image,
                "original_image": entry.original_image,
                "control_images_count": len(entry.control_images),
            }
            for entry in entries
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        data = request.data
        
        main_image = data.get("main_image")
        original_image = data.get("original_image")
        control_images = data.get("control_images", [])
        
        if not main_image or not original_image:
            return Response(
                {"detail": "main_image and original_image are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        entry = GalleryEntry.objects.create(
            main_image=main_image,
            original_image=original_image,
            control_images=control_images,
        )
        
        return Response(
            {
                "id": str(entry.id),
                "created_at": entry.created_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )


class GalleryDetailView(APIView):
    """Get a single gallery entry by ID."""

    def get(self, request, entry_id, *args, **kwargs):
        try:
            entry = GalleryEntry.objects.get(id=entry_id)
        except GalleryEntry.DoesNotExist:
            return Response(
                {"detail": "Gallery entry not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        return Response(
            {
                "id": str(entry.id),
                "created_at": entry.created_at.isoformat(),
                "main_image": entry.main_image,
                "original_image": entry.original_image,
                "control_images": entry.control_images,
            },
            status=status.HTTP_200_OK,
        )
