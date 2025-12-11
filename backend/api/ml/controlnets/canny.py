import cv2
import numpy as np
from PIL import Image


def extract_canny_edges(image: Image.Image) -> Image.Image:
    image_np = np.array(image)

    if len(image_np.shape) == 3:
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_np

    edges = cv2.Canny(gray, 100, 200)
    edges_rgb = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)

    return Image.fromarray(edges_rgb)
