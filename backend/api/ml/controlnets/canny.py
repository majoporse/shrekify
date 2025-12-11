import cv2
import numpy as np
from PIL import Image

from ..config import load_model_config


def extract_canny_edges(image: Image.Image) -> Image.Image:
    config = load_model_config()
    controlnet_config = config.get("controlnet", {})
    low_threshold = controlnet_config.get("canny_low_threshold", 100)
    high_threshold = controlnet_config.get("canny_high_threshold", 200)

    image_np = np.array(image)

    if len(image_np.shape) == 3:
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_np

    edges = cv2.Canny(gray, low_threshold, high_threshold)
    edges_rgb = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)

    return Image.fromarray(edges_rgb)
