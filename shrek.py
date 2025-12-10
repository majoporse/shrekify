import torch
from diffusers import BitsAndBytesConfig, SD3Transformer2DModel
from diffusers import StableDiffusion3Pipeline
from huggingface_hub import login
from PIL import Image
from diffusers.utils import load_image

# This will prompt an interactive login prompt in the console or display 
# a widget in a notebook where you can paste your token.
login("")

model_id = "stabilityai/stable-diffusion-3.5-medium"

nf4_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

model_nf4 = SD3Transformer2DModel.from_pretrained(
    model_id,
    subfolder="transformer",
    quantization_config=nf4_config,
    torch_dtype=torch.bfloat16
)

pipeline = StableDiffusion3Pipeline.from_pretrained(
    model_id, 
    transformer=model_nf4,
    torch_dtype=torch.bfloat16
)
pipeline.enable_model_cpu_offload()

local_image_path = "C:/Users/majop/Downloads/rubeus-hagrid-1140-wikithumb.png" 
image = load_image("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAs_TDUTeHiZQ1tqLJlvItaBOjcmRTeoSbHw&s")

# Load the image from the file path, convert to RGB, and resize.
init_image = Image.open(local_image_path).convert("RGB")
init_image = init_image.resize((768, 512))
# --- END LOCAL IMAGE LOADING ---

prompt = "A highly detailed character portrait blending **Rubeus Hagrid (Harry Potter)** and **Shrek (DreamWorks)**, inspired by the pose and likeness of the initial image. **Hagrid as an ogre**, featuring Shrek's iconic, friendly, and slightly gruff expression. They have warm, earthy green skin, subtle facial folds, and large, expressive eyes. **The character retains Hagrid's distinctive beard, long messy brown hair, and signature rugged clothing, but rendered in Shrek's aesthetic.** Emphasize a broad, round nose and prominent, short head-ears. The attire is rustic and worn, composed of coarse, natural fabrics, with subtle signs of swamp life like dirt or moss. The background is a blurred, atmospheric swamp with gnarled trees and dappled, magical light. **Cinematic lighting, photorealistic character design, intricate concept art, 8k, volumetric lighting, fantasy portrait.**"
neg = "deformed, ugly, disfigured, poor anatomy, extra limbs, missing limbs, bad proportions, distorted face, blurry, low quality, **low resolution**, **mutated**, cartoon, painting, illustration, **text, signature, watermark**"
images = pipeline(prompt=prompt,  negative_prompt=neg,
    num_inference_steps=40,
    guidance_scale=4.5,
    max_sequence_length=512,).images
images[0].save("fantasy_landscape.png")
