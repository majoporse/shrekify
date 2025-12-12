import base64
import os
import logging
from io import BytesIO
from typing import Tuple

import torch
from diffusers import (
    BitsAndBytesConfig,
    SD3Transformer2DModel,
    StableDiffusion3Pipeline,
)
from huggingface_hub import login
from PIL import Image, ImageEnhance, ImageFilter

logger = logging.getLogger(__name__)

PipelineType = object
_PIPELINE: PipelineType | None = None


def load_pipeline() -> PipelineType | None:
    """
    Lazy-load the Stable Diffusion 3.5 pipeline.

    If the heavy dependencies are not installed or loading fails, we return None
    and the caller can decide to fall back to a lightweight effect.
    """
    global _PIPELINE
    if _PIPELINE is not None:
        return _PIPELINE

    try:
        # NOTE: the correct repo name includes "3.5". The previous "3" caused
        # 404s on config.json (see logs around lines 933-1010).
        model_id = "stabilityai/stable-diffusion-3.5-medium"
        hf_token = os.getenv("HF_TOKEN")
        logger.info(
            "Loading SD3.5 pipeline | torch=%s | cuda_available=%s | hf_token=%s",
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

        # Pick device/dtype; still enable CPU offload if CUDA missing.
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32
        logger.info("Selected device=%s dtype=%s", device, dtype)

        # Load the transformer in 4-bit NF4 to reduce VRAM usage.
        nf4_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=dtype,
        )

        model_nf4 = SD3Transformer2DModel.from_pretrained(
            model_id,
            subfolder="transformer",
            quantization_config=nf4_config,
            torch_dtype=dtype,
        )

        pipeline = StableDiffusion3Pipeline.from_pretrained(
            model_id,
            transformer=model_nf4,
            torch_dtype=dtype,
        )

        # Enable xFormers speedup if installed.
        if hasattr(pipeline, "enable_xformers_memory_efficient_attention"):
            try:
                pipeline.enable_xformers_memory_efficient_attention()
                logger.info("Enabled xFormers memory efficient attention.")
            except Exception as xformers_exc:
                logger.warning("xFormers enable failed: %s", xformers_exc)

        # On constrained VRAM, consider CPU offload; comment this out if you want
        # pure CUDA execution and have enough headroom.
        pipeline.enable_model_cpu_offload()

        pipeline.to(device)

        _PIPELINE = pipeline
        logger.info("Stable Diffusion pipeline loaded successfully.")
    except Exception as exc:
        logger.exception("Pipeline load failed; falling back. Reason: %s", exc)
        _PIPELINE = None

    return _PIPELINE


def _fallback_effect(image: Image.Image) -> Image.Image:
    """
    Lightweight image filter used when the diffusion model is unavailable.
    """
    saturated = ImageEnhance.Color(image).enhance(1.4)
    blurred_bg = saturated.filter(ImageFilter.GaussianBlur(radius=1.2))
    overlay = Image.blend(saturated, blurred_bg, alpha=0.25)
    return overlay


def generate_shrek_image(
    input_image: Image.Image,
    prompt: str | None = None,
    negative_prompt: str | None = None,
) -> Tuple[Image.Image, bool]:
    """
    Run the diffusion model (if available) to generate a Shrekified image.

    Returns:
        (output_image, used_fallback)
    """
    pipeline = load_pipeline()
    if pipeline is None:
        logger.info("Using fallback image effect because pipeline is unavailable.")
        return _fallback_effect(input_image), True

    prompt_text = (
        prompt
        or "A friendly ogre-inspired portrait, cinematic lighting, photorealistic."
    )
    negative = (
        negative_prompt
        or "low quality, blurry, distorted, text, watermark, signature"
    )

    result = pipeline(
        prompt=prompt_text,
        negative_prompt=negative,
        num_inference_steps=30,
        guidance_scale=4.5,
        max_sequence_length=512,
    ).images[0]
    logger.info("Generation complete with diffusion model.")
    return result, False


def image_to_base64(image: Image.Image) -> str:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


