import logging

from controlnet_aux import LineartDetector
from PIL import Image

logger = logging.getLogger(__name__)
_LINEART_DETECTOR = None


def extract_lineart(image: Image.Image) -> Image.Image:
    global _LINEART_DETECTOR

    if _LINEART_DETECTOR is None:
        logger.info("Loading Lineart detector...")
        _LINEART_DETECTOR = LineartDetector.from_pretrained("lllyasviel/Annotators")
        logger.info("Lineart detector loaded.")

    return _LINEART_DETECTOR(image)
