import logging

import numpy as np
from PIL import Image
from transformers import pipeline

logger = logging.getLogger(__name__)
_DEPTH_ESTIMATOR = None


def extract_depth(image: Image.Image) -> Image.Image:
    global _DEPTH_ESTIMATOR

    if _DEPTH_ESTIMATOR is None:
        logger.info("Loading depth estimator...")
        _DEPTH_ESTIMATOR = pipeline("depth-estimation", use_fast=True)
        logger.info("Depth estimator loaded.")

    depth = _DEPTH_ESTIMATOR(image)["depth"]
    depth_np = np.array(depth)
    depth_np = depth_np[:, :, None]
    depth_np = np.concatenate([depth_np, depth_np, depth_np], axis=2)
    return Image.fromarray(depth_np)
