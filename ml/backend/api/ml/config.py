"""Configuration loading utilities for the ML pipeline."""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

CONFIG_DIR = Path(__file__).parent / "configs"


def load_config(filename: str) -> dict:
    config_path = CONFIG_DIR / filename
    with open(config_path, "r", encoding="utf-8") as f:
        cfg = json.load(f)
        logger.info("Loaded configuration from %s", config_path)
    return cfg


def load_model_config() -> dict:
    return load_config("model_config.json")


def load_prompts_config() -> dict:
    return load_config("prompts_config.json")


def load_generation_config() -> dict:
    model_config = load_model_config()
    return model_config.get("generation", {})
