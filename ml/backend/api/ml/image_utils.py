"""Image utility functions."""

import logging
from PIL import Image, ImageEnhance, ImageFilter

logger = logging.getLogger(__name__)


def load_style_image(string_path: str) -> Image.Image | None:
    """Load a style image from the given path."""
    try:
        style_image = Image.open(string_path).convert("RGB")
        logger.info("Loaded style image from %s", string_path)
        return style_image
    except Exception as img_exc:
        logger.warning("Failed to load style image from %s: %s", string_path, img_exc)
        return None


def fallback_effect(image: Image.Image) -> Image.Image:
    """Lightweight image filter used when the diffusion model is unavailable."""
    saturated = ImageEnhance.Color(image).enhance(1.4)
    blurred_bg = saturated.filter(ImageFilter.GaussianBlur(radius=1.2))
    overlay = Image.blend(saturated, blurred_bg, alpha=0.25)
    return overlay
