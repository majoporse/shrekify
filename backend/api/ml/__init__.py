"""ML module for Shrekify image generation."""

from .ml_sd15 import generate_shrek_image, try_generate_shrek_image, try_gennerate_shrek_image
from .pipeline import load_pipeline, get_pipeline, PipelineType
from .config import load_model_config, load_prompts_config, load_generation_config
from .image_utils import load_style_image, fallback_effect
from .controlnets import (
    extract_canny_edges,
    extract_softedge,
    extract_lineart,
    extract_depth,
    extract_openpose,
    try_load_controlnets,
    get_controlnets,
    process_control_images,
)

__all__ = [
    "generate_shrek_image",
    "try_generate_shrek_image",
    "try_gennerate_shrek_image",
    "load_pipeline",
    "get_pipeline",
    "PipelineType",
    "load_model_config",
    "load_prompts_config",
    "load_generation_config",
    "load_style_image",
    "fallback_effect",
    # ControlNet
    "extract_canny_edges",
    "extract_softedge",
    "extract_lineart",
    "extract_depth",
    "extract_openpose",
    "try_load_controlnets",
    "get_controlnets",
    "process_control_images",
]
