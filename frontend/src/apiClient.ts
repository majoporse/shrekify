export interface ImageResult {
    image_base64: string;
    description: string;
}

export interface ShrekifyResponse {
    images: ImageResult[];
    used_fallback: boolean;
}

export interface GalleryEntryPreview {
    id: string;
    created_at: string;
    main_image: string;
    original_image: string;
    control_images_count: number;
}

export interface GalleryEntryDetail {
    id: string;
    created_at: string;
    main_image: string;
    original_image: string;
    control_images: ImageResult[];
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function shrekifyImage(
    file: File,
    prompt?: string,
    negativePrompt?: string
): Promise<ShrekifyResponse> {
    const formData = new FormData();
    formData.append("image", file);
    if (prompt) formData.append("prompt", prompt);
    if (negativePrompt) formData.append("negative_prompt", negativePrompt);

    const response = await fetch(`${BASE_URL}/shrekify/`, {
        method: "POST",
        body: formData,
    });

    let payload: unknown;
    try {
        payload = await response.json();
    } catch (err) {
        throw new Error("Failed to read server response");
    }

    if (!response.ok) {
        const detail =
            typeof payload === "object" && payload !== null && "detail" in payload
                ?
                payload.detail
                : response.statusText;
        throw new Error(typeof detail === "string" ? detail : "Request failed");
    }

    return payload as ShrekifyResponse;
}

export async function getGalleryList(): Promise<GalleryEntryPreview[]> {
    const response = await fetch(`${BASE_URL}/gallery/`);

    if (!response.ok) {
        throw new Error("Failed to fetch gallery");
    }

    return response.json();
}

export async function getGalleryEntry(id: string): Promise<GalleryEntryDetail> {
    const response = await fetch(`${BASE_URL}/gallery/${id}/`);

    if (!response.ok) {
        throw new Error("Gallery entry not found");
    }

    return response.json();
}

export async function createGalleryEntry(
    mainImage: string,
    originalImage: string,
    controlImages: ImageResult[]
): Promise<{ id: string; created_at: string }> {
    const response = await fetch(`${BASE_URL}/gallery/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            main_image: mainImage,
            original_image: originalImage,
            control_images: controlImages,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to save to gallery");
    }

    return response.json();
}

