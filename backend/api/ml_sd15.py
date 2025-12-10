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


def load_pipeline() -> PipelineType | None:
    """
    Lazy-load a Stable Diffusion v1.5 text-to-image pipeline.

    Returns None if loading fails; callers can fall back to a lightweight effect.
    """
    global _PIPELINE
    if _PIPELINE is not None:
        return _PIPELINE

    try:
        model_id = "runwayml/stable-diffusion-v1-5"
        hf_token = os.getenv("HF_TOKEN")
        logger.info(
            "Loading Stable Diffusion v1.5 | torch=%s | cuda_available=%s | hf_token=%s",
            torch.__version__,
            torch.cuda.is_available(),
            bool(hf_token),
        )

        if hf_token:
            try:
                login(token=hf_token, add_to_git_credential=False)
                logger.info("Authenticated with provided HF token.")
            except Exception as auth_exc:
                logger.warning("HF login failed: %s", auth_exc)

        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32

        pipeline = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=dtype,
        )

        if hasattr(pipeline, "enable_xformers_memory_efficient_attention"):
            try:
                logger.debug("Attempting to enable xFormers memory efficient attention...")
                pipeline.enable_xformers_memory_efficient_attention()
                logger.info("Enabled xFormers memory efficient attention.")
            except Exception as xformers_exc:
                logger.warning("xFormers enable failed: %s", xformers_exc)
        else:
            logger.debug("Pipeline does not have xFormers attention method.")

        logger.debug("Moving pipeline to device=%s...", device)
        pipeline.to(device)
        logger.debug("Pipeline successfully moved to device.")
        
        try:
            logger.debug("Initializing IP-Adapter with FaceID and Style adapters...")
            pipeline.load_ip_adapter(
                ["h94/IP-Adapter"],
                subfolder="models",
                weight_name=["ip-adapter-plus-face_sd15.safetensors", "ip-adapter_sd15.safetensors"]
            )
            pipeline.ip_adapter_enabled = True

        except Exception as ip_exc:
            logger.warning("IP-Adapter initialization failed: %s", ip_exc)
            pipeline.ip_adapter_enabled = False
        
        _PIPELINE = pipeline
    except Exception as exc:
        logger.exception("Pipeline load failed; falling back. Reason: %s", exc)
        _PIPELINE = None

    return _PIPELINE


def _fallback_effect(image: Image.Image) -> Image.Image:
    """Lightweight image filter used when the diffusion model is unavailable."""
    saturated = ImageEnhance.Color(image).enhance(1.4)
    blurred_bg = saturated.filter(ImageFilter.GaussianBlur(radius=1.2))
    overlay = Image.blend(saturated, blurred_bg, alpha=0.25)
    return overlay


def generate_shrek_image(
    input_image: Image.Image,
    prompt: str | None = None,
    negative_prompt: str | None = None,
    style_image: Image.Image | None = None,
    ip_adapter_scale: float = 0.8,
) -> Tuple[Image.Image, bool]:

    # Load configuration
    config = load_prompts_config()
    
    # Load style image from config path if not provided
    if style_image is None:
        style_image_path = config.get("style_image_path", "./Style.webp")
        try:
            style_image = Image.open(style_image_path).convert("RGB")
            logger.debug("Loaded style image from %s", style_image_path)
        except Exception as img_exc:
            logger.warning("Failed to load style image from %s: %s", style_image_path, img_exc)
            style_image = None

    pipeline = load_pipeline()

    if pipeline is None:
        logger.info("Using fallback image effect because pipeline is unavailable.")
        logger.debug("Applying fallback effect to image...")
        fallback_result = _fallback_effect(input_image)
        logger.debug("Fallback effect applied successfully.")
        return fallback_result, True
    
    # Load prompts from config
    prompt_text = prompt or config.get("default_prompt", "")
    negative = negative_prompt or config.get("default_negative_prompt", "")

    try:
        # Get generation parameters from config
        gen_params = config.get("generation_params", {})
        height = gen_params.get("height", 768)
        width = gen_params.get("width", 768)
        num_inference_steps = gen_params.get("num_inference_steps", 50)
        guidance_scale = gen_params.get("guidance_scale", 7.5)
        
        logger.debug("Starting Stable Diffusion v1.5 image generation...")
        logger.debug("Parameters: steps=%s, guidance=%s, size=%sx%s", num_inference_steps, guidance_scale, width, height)
        
        gen_kwargs = {
            "prompt": prompt_text,
            "negative_prompt": negative,
            "height": height,
            "width": width,
            "num_inference_steps": num_inference_steps,
            "guidance_scale": guidance_scale,
        }
        
        if hasattr(pipeline, "ip_adapter_enabled") and pipeline.ip_adapter_enabled and style_image is not None:
            # Get adapter scales from config
            adapter_scales = config.get("ip_adapter_scales", {})
            face_scale = adapter_scales.get("face_scale", 0.6)
            style_scale = adapter_scales.get("style_scale", 0.4)
            
            # Set adapter scales from config
            pipeline.set_ip_adapter_scale([face_scale, style_scale])
            logger.debug("Set IP-Adapter scales: face=%s, style=%s", face_scale, style_scale)
            
            face_image = input_image.resize((width, height), Image.LANCZOS)

            result = pipeline(
                ip_adapter_image=[face_image, style_image],
                **gen_kwargs
            ).images[0]

            logger.debug("Generation completed with IP-Adapter (face + style). Output image shape=%s", result.size)
        else:
            logger.debug("Generating without IP-Adapter...")
            result = pipeline(**gen_kwargs).images[0]
        
        logger.info("Generation complete with Stable Diffusion v1.5.")
        return result, False
    except Exception as gen_exc:
        logger.exception("Generation failed with error: %s", gen_exc)
        logger.info("Falling back to lightweight effect due to generation failure.")
        return _fallback_effect(input_image), True


def image_to_base64(image: Image.Image) -> str:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

