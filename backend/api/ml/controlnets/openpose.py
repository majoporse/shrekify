import logging

from controlnet_aux import OpenposeDetector
from PIL import Image

logger = logging.getLogger(__name__)
_OPENPOSE_DETECTOR = None


def extract_openpose(image: Image.Image) -> Image.Image:
    global _OPENPOSE_DETECTOR

    if _OPENPOSE_DETECTOR is None:
        logger.info("Loading OpenPose detector...")
        _OPENPOSE_DETECTOR = OpenposeDetector.from_pretrained("lllyasviel/Annotators")
        logger.info("OpenPose detector loaded.")

    return _OPENPOSE_DETECTOR(image)
