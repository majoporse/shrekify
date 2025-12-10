import base64
import json
import logging
import os
from io import BytesIO
from pathlib import Path
from typing import Tuple

import torch
from diffusers import StableDiffusionPipeline
from huggingface_hub import login
from PIL import Image, ImageEnhance, ImageFilter
from ip_adapter import IPAdapter

logger = logging.getLogger(__name__)

PipelineType = object
_PIPELINE: PipelineType | None = None


def load_prompts_config() -> dict:
    
    cfg: dict = {}
    config_path = Path(__file__).parent / "prompts_config.json"
    
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
        logger.info("Loaded prompts configuration from %s", config_path)
    
    return cfg

def login() -> None:
    hf_token = os.getenv("HF_TOKEN")
    if hf_token:
        try:
            login(token=hf_token, add_to_git_credential=False)
            logger.info("Authenticated with provided HF token.")
        except Exception as auth_exc:
            logger.warning("HF login failed: %s", auth_exc)

def try_add_xformers(pipeline: PipelineType) -> None:
    if hasattr(pipeline, "enable_xformers_memory_efficient_attention"):
        try:
            logger.debug("Attempting to enable xFormers memory efficient attention...")
            pipeline.enable_xformers_memory_efficient_attention()
            logger.info("Enabled xFormers memory efficient attention.")
        except Exception as xformers_exc:
            logger.warning("xFormers enable failed: %s", xformers_exc)
    else:
        logger.debug("Pipeline does not have xFormers attention method.")

def try_add_ip_adapter(pipeline: PipelineType) -> None:

    if not hasattr(pipeline, "load_ip_adapter"):
        logger.debug("Pipeline does not support IP-Adapter.")
        return

    try:
        logger.debug("Attempting to load IP-Adapter...")
        pipeline.load_ip_adapter(
            ["h94/IP-Adapter"],
            subfolder="models",
            weight_name=["ip-adapter-plus-face_sd15.safetensors", "ip-adapter_sd15.safetensors"]
        )
        pipeline.ip_adapter_enabled = True
        logger.info("IP-Adapter loaded successfully.")
    except Exception as ip_exc:
        logger.warning("IP-Adapter load failed: %s", ip_exc)
        pipeline.ip_adapter_enabled = False

def load_pipeline() -> PipelineType | None:

    global _PIPELINE
    if _PIPELINE is not None:
        return _PIPELINE

    login()
    try:
        model_id = "runwayml/stable-diffusion-v1-5"
        logger.info(
            "Loading Stable Diffusion v1.5 | torch=%s | cuda_available=%s | hf_token=%s",
            torch.__version__,
            torch.cuda.is_available()
        )

        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32

        pipeline = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=dtype,
        )

        try_add_xformers(pipeline)
        try_add_ip_adapter(pipeline)
        pipeline.to(device)
        
        _PIPELINE = pipeline
    except Exception as exc:
        logger.exception("Pipeline load failed; falling back. Reason: %s", exc)
        _PIPELINE = None

    return _PIPELINE

def load_style_image(string_path: str) -> Image.Image | None:
    try:
        style_image = Image.open(string_path).convert("RGB")
        logger.info("Loaded style image from %s", string_path)
        return style_image
    except Exception as img_exc:
        logger.warning("Failed to load style image from %s: %s", string_path, img_exc)
        return None

def _fallback_effect(image: Image.Image) -> Image.Image:
    """Lightweight image filter used when the diffusion model is unavailable."""
    saturated = ImageEnhance.Color(image).enhance(1.4)
    blurred_bg = saturated.filter(ImageFilter.GaussianBlur(radius=1.2))
    overlay = Image.blend(saturated, blurred_bg, alpha=0.25)
    return overlay

def generate_shrek_image(
    input_image: Image.Image,
) -> Tuple[Image.Image, bool]:

    config = load_prompts_config()
    
    style_image_path = config.get("style_image_path", "")
    prompt_text = config.get("default_prompt", "")
    negative = config.get("default_negative_prompt", "")

    pipeline = load_pipeline()

    if pipeline is None:
        logger.info("Using fallback image effect because pipeline is unavailable.")
        logger.debug("Applying fallback effect to image...")
        fallback_result = _fallback_effect(input_image)
        logger.debug("Fallback effect applied successfully.")
        return fallback_result, True
    

    gen_params = config.get("generation_params", {})
    height = gen_params.get("height", 768)
    width = gen_params.get("width", 768)
    num_inference_steps = gen_params.get("num_inference_steps", 50)
    guidance_scale = gen_params.get("guidance_scale", 7.5)
    
    logger.debug("Starting Stable Diffusion v1.5 image generation...")
    
    style_image = load_style_image(style_image_path) if style_image_path else None

    adapter_scales = config.get("ip_adapter_scales", {})
    face_scale = adapter_scales.get("face_scale", 0.6)
    style_scale = adapter_scales.get("style_scale", 0.4)
    
    pipeline.set_ip_adapter_scale([face_scale, style_scale])
    logger.debug("Set IP-Adapter scales: face=%s, style=%s", face_scale, style_scale)
    
    face_image = input_image.resize((width, height), Image.LANCZOS)

    result = pipeline(
        ip_adapter_image=[face_image, style_image],
        prompt=prompt_text,
        negative_prompt=negative,
        height=height,
        width=width,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
    ).images[0]

    logger.info("Generation complete with Stable Diffusion v1.5.")
    return result, False

def try_gennerate_shrek_image(
    input_image: Image.Image,
) -> Tuple[Image.Image, bool]:
    try:
        return generate_shrek_image(input_image)
    except Exception as gen_exc:
        logger.exception("Image generation failed; using fallback effect. Reason: %s", gen_exc)
        fallback_result = _fallback_effect(input_image)
        return fallback_result, True