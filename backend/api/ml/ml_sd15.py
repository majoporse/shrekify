"""Stable Diffusion v1.5 image generation for Shrekify."""

import logging
from dataclasses import dataclass

from PIL import Image

from .config import load_generation_config, load_model_config, load_prompts_config
from .controlnets import get_controlnets, process_control_images
from .image_utils import fallback_effect, load_style_image
from .pipeline import load_pipeline

logger = logging.getLogger(__name__)


@dataclass
class GenerationResult:
    image: Image.Image
    used_fallback: bool
    control_images: list[tuple[Image.Image, str]]


def generate_shrek_image(input_image: Image.Image) -> GenerationResult:

    prompts_config = load_prompts_config()
    gen_config = load_generation_config()
    model_config = load_model_config()

    style_image_path = prompts_config.get("style_image_path", "")
    prompt_text = prompts_config.get("default_prompt", "")
    negative = prompts_config.get("default_negative_prompt", "")

    logger.debug("Generating Shrek image with prompt: %s", prompt_text)
    logger.debug("Using negative prompt: %s", negative)

    pipeline = load_pipeline()

    if pipeline is None:
        raise Exception("Pipeline is unavailable.")

    height = gen_config.get("height", 768)
    width = gen_config.get("width", 768)
    num_inference_steps = gen_config.get("num_inference_steps", 50)
    guidance_scale = gen_config.get("guidance_scale", 7.5)

    logger.debug("Starting Stable Diffusion v1.5 image generation...")

    style_image = load_style_image(style_image_path) if style_image_path else None

    adapter_scales = gen_config.get("ip_adapter_scales", {})
    face_scale = adapter_scales.get("face_scale", 0.6)
    style_scale = adapter_scales.get("style_scale", 0.4)

    pipeline.set_ip_adapter_scale([face_scale, style_scale])
    logger.debug("Set IP-Adapter scales: face=%s, style=%s", face_scale, style_scale)

    face_image = input_image.resize((width, height), Image.LANCZOS)

    gen_kwargs = {
        "ip_adapter_image": [face_image, style_image],
        "prompt": prompt_text,
        "negative_prompt": negative,
        "height": height,
        "width": width,
        "num_inference_steps": num_inference_steps,
        "guidance_scale": guidance_scale,
    }

    # Handle multi-ControlNet
    controlnets = get_controlnets()
    controlnet_config = model_config.get("controlnet", {})
    control_images_with_desc: list[tuple[Image.Image, str]] = []

    if controlnets and controlnet_config.get("enabled", False):
        controlnet_types = controlnet_config.get("types", [])
        
        control_images_with_desc = process_control_images(face_image, controlnet_types)
        
        if control_images_with_desc:
            control_images = [img for img, _ in control_images_with_desc]
            controlnet_scales = gen_config.get("controlnet_conditioning_scale", 0.8)
            
            if isinstance(controlnet_scales, (int, float)):
                controlnet_scales = [controlnet_scales] * len(control_images)
            
            gen_kwargs["image"] = control_images
            gen_kwargs["controlnet_conditioning_scale"] = controlnet_scales
            
            logger.debug(
                "ControlNet enabled: types=%s, conditioning_scales=%s",
                controlnet_types, controlnet_scales
            )

    result = pipeline(**gen_kwargs).images[0]

    logger.info("Generation complete with Stable Diffusion v1.5.")
    return GenerationResult(
        image=result,
        used_fallback=False,
        control_images=control_images_with_desc,
    )


def try_generate_shrek_image(input_image: Image.Image) -> GenerationResult:
    try:
        return generate_shrek_image(input_image)
    except Exception as gen_exc:
        logger.exception("Image generation failed; using fallback effect. Reason: %s", gen_exc)
        fallback_result = fallback_effect(input_image)
        return GenerationResult(
            image=fallback_result,
            used_fallback=True,
            control_images=[],
        )
