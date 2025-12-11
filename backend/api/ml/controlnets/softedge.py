import logging

from controlnet_aux import HEDdetector
from PIL import Image

logger = logging.getLogger(__name__)
_HED_DETECTOR = None


def extract_softedge(image: Image.Image) -> Image.Image:
    global _HED_DETECTOR

    if _HED_DETECTOR is None:
        logger.info("Loading HED detector...")
        _HED_DETECTOR = HEDdetector.from_pretrained("lllyasviel/Annotators")
        logger.info("HED detector loaded.")

    return _HED_DETECTOR(image, safe=True)
