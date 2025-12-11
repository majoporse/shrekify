import base64
from io import BytesIO
import logging

from PIL import Image
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from api.ml.ml_sd15 import try_generate_shrek_image


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
