import logging
from typing import Callable

import torch
from diffusers import ControlNetModel
from PIL import Image

from ..config import load_model_config
from .canny import extract_canny_edges
from .depth import extract_depth
from .lineart import extract_lineart
from .openpose import extract_openpose
from .softedge import extract_softedge

logger = logging.getLogger(__name__)
_CONTROLNETS: list[ControlNetModel] = []

CONTROLNET_PREPROCESSORS: dict[str, Callable[[Image.Image], Image.Image]] = {
    "canny": extract_canny_edges,
    "softedge": extract_softedge,
    "lineart": extract_lineart,
    "depth": extract_depth,
    "openpose": extract_openpose,
}

DEFAULT_CONTROLNET_MODELS: dict[str, str] = {
    "canny": "lllyasviel/control_v11p_sd15_canny",
    "softedge": "lllyasviel/control_v11p_sd15_softedge",
    "lineart": "lllyasviel/control_v11p_sd15_lineart",
    "depth": "lllyasviel/control_v11f1p_sd15_depth",
    "openpose": "lllyasviel/control_v11p_sd15_openpose",
}

CONTROLNET_DESCRIPTIONS: dict[str, str] = {
    "canny": "Canny Edge Detection",
    "softedge": "Soft Edge Detection (HED)",
    "lineart": "Line Art Extraction",
    "depth": "Depth Map Estimation",
    "openpose": "Pose Detection (OpenPose)",
}

def get_controlnet_models() -> dict[str, str]:
    model_config = load_model_config()
    controlnet_config = model_config.get("controlnet", {})
    config_models = controlnet_config.get("models", {})
    return {**DEFAULT_CONTROLNET_MODELS, **config_models}


def get_preprocessor(controlnet_type: str) -> Callable[[Image.Image], Image.Image] | None:
    return CONTROLNET_PREPROCESSORS.get(controlnet_type)


def try_load_controlnets(dtype: torch.dtype) -> list[ControlNetModel]:
    global _CONTROLNETS

    if _CONTROLNETS:
        return _CONTROLNETS

    model_config = load_model_config()
    controlnet_config = model_config.get("controlnet", {})

    if not controlnet_config.get("enabled", False):
        logger.debug("ControlNet is not enabled in configuration.")
        return []

    controlnet_types = controlnet_config.get("types", [])
    if not controlnet_types:
        logger.debug("No ControlNet types specified.")
        return []

    controlnet_models = get_controlnet_models()
    loaded_controlnets = []

    for cn_type in controlnet_types:
        model_id = controlnet_models.get(cn_type)
        if not model_id:
            logger.warning("Unknown ControlNet type: %s", cn_type)
            continue

        try:
            logger.info("Loading ControlNet '%s' from %s...", cn_type, model_id)
            controlnet = ControlNetModel.from_pretrained(model_id, torch_dtype=dtype)
            loaded_controlnets.append(controlnet)
            logger.info("ControlNet '%s' loaded successfully.", cn_type)
            logger.debug("ControlNet '%s' details: %s", cn_type, controlnet)
        except Exception as cn_exc:
            logger.warning("ControlNet '%s' load failed: %s", cn_type, cn_exc)

    _CONTROLNETS = loaded_controlnets
    return _CONTROLNETS


def get_controlnets() -> list[ControlNetModel]:
    return _CONTROLNETS


def process_control_images(
    image: Image.Image,
    controlnet_types: list[str],
) -> list[tuple[Image.Image, str]]:
    control_images = []

    for cn_type in controlnet_types:
        preprocessor = get_preprocessor(cn_type)
        if preprocessor is None:
            logger.warning("No preprocessor found for ControlNet type: %s", cn_type)
            continue

        try:
            control_image = preprocessor(image)
            description = CONTROLNET_DESCRIPTIONS.get(cn_type, cn_type)
            control_images.append((control_image, description))
            logger.debug("Processed control image for '%s'", cn_type)
        except Exception as e:
            logger.warning("Failed to process control image for '%s': %s", cn_type, e)

    return control_images
