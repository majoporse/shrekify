"""Stable Diffusion pipeline loading and configuration."""

import logging
import os
from typing import TypeAlias, Union

import torch
from diffusers import ControlNetModel, StableDiffusionControlNetPipeline, StableDiffusionPipeline, LCMScheduler
from huggingface_hub import login as hf_login

from .config import load_model_config
from .controlnets import get_controlnets, try_load_controlnets

logger = logging.getLogger(__name__)

PipelineType: TypeAlias = Union[StableDiffusionPipeline, StableDiffusionControlNetPipeline]
_PIPELINE: PipelineType | None = None


def login() -> None:
    hf_token = os.getenv("HF_TOKEN")
    if hf_token:
        try:
            hf_login(token=hf_token, add_to_git_credential=False)
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


def try_add_ip_adapter(pipeline: PipelineType, model_config: dict) -> None:
    
    if not hasattr(pipeline, "load_ip_adapter"):
        logger.debug("Pipeline does not support IP-Adapter.")
        return

    ip_config = model_config.get("ip_adapter", {})
    if not ip_config:
        logger.debug("No IP-Adapter configuration found.")
        return

    try:
        logger.debug("Attempting to load IP-Adapter...")
        pipeline.load_ip_adapter(
            [ip_config.get("repo", "h94/IP-Adapter")],
            subfolder=ip_config.get("subfolder", "models"),
            weight_name=ip_config.get("weight_names", [])
        )
        pipeline.ip_adapter_enabled = True
        logger.info("IP-Adapter loaded successfully.")
    except Exception as ip_exc:
        logger.warning("IP-Adapter load failed: %s", ip_exc)
        pipeline.ip_adapter_enabled = False


def try_add_textual_inversion(pipeline: PipelineType, ti_paths: list[str]) -> None:

    for ti_path in ti_paths:
        try:
            logger.debug("Attempting to load Textual Inversion from %s...", ti_path)
            pipeline.load_textual_inversion(ti_path)
            logger.info("Loaded Textual Inversion from %s.", ti_path)
        except Exception as ti_exc:
            logger.warning("Textual Inversion load failed for %s: %s", ti_path, ti_exc)


def try_add_lcm_lora(pipeline: PipelineType, lcm_config: dict) -> None:
    """Load LCM-LoRA for faster inference (4-8 steps)."""
    if not lcm_config.get("enabled", False):
        logger.debug("LCM-LoRA not enabled.")
        return

    try:
        lora_id = lcm_config.get("lora_id", "latent-consistency/lcm-lora-sdv1-5")
        logger.debug("Loading LCM-LoRA from %s...", lora_id)
        
        pipeline.load_lora_weights(lora_id)
        pipeline.fuse_lora()
        
        pipeline.scheduler = LCMScheduler.from_config(pipeline.scheduler.config)
        
        pipeline.lcm_enabled = True
        logger.info("LCM-LoRA loaded and scheduler set to LCMScheduler.")
    except Exception as lcm_exc:
        logger.warning("LCM-LoRA load failed: %s", lcm_exc)
        pipeline.lcm_enabled = False


def load_pipeline() -> PipelineType | None:

    global _PIPELINE
    if _PIPELINE is not None:
        return _PIPELINE

    login()
    try:
        model_config = load_model_config()
        model_id = model_config.get("model_id", "runwayml/stable-diffusion-v1-5")

        logger.info(
            "Loading %s | torch=%s | cuda_available=%s",
            model_id,
            torch.__version__,
            torch.cuda.is_available()
        )

        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32

        controlnets = try_load_controlnets(dtype)
        
        if controlnets:
            logger.info("Using StableDiffusionControlNetPipeline with %d ControlNet(s).", len(controlnets))
            pipeline = StableDiffusionControlNetPipeline.from_pretrained(
                model_id,
                controlnet=controlnets,
                torch_dtype=dtype,
            )
        else:
            pipeline = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=dtype,
            )

        if model_config.get("enable_xformers", True):
            try_add_xformers(pipeline)

        try_add_ip_adapter(pipeline, model_config)
        try_add_textual_inversion(
            pipeline,
            model_config.get("textual_inversion_paths", []),
        )
        try_add_lcm_lora(pipeline, model_config.get("lcm_lora", {}))

        if model_config.get("enable_cpu_offload", False):
            logger.info("Enabling model CPU offload for memory efficiency...")
            pipeline.enable_model_cpu_offload()
        else:
            pipeline.to(device)

        _PIPELINE = pipeline
    except Exception as exc:
        logger.exception("Pipeline load failed; falling back. Reason: %s", exc)
        _PIPELINE = None

    return _PIPELINE


def get_pipeline() -> PipelineType | None:
    return _PIPELINE
