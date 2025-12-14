

// ML backend returns images as base64 strings with optional description
export interface MLImage {
    image_base64: string;
    description?: string;
}

export interface ShrekifyResponse {
    images: MLImage[];
    used_fallback: boolean;
}

export interface ControlImage {
    id: string;
    image_path: string;
    order: number;
}

export interface GenerationLogList {
    id: string;
    input_image_path: string;
    generated_image_path: string;
    created_at: string;
    updated_at: string;
}

export interface GenerationLogDetail extends GenerationLogList {
    control_images: ControlImage[];
}

export interface GenerationLogCreate {
    input_image_path?: string;
    generated_image_path?: string;
    control_image_paths?: string[];
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

const ML_API_URL = import.meta.env.VITE_ML_API_URL;
const GALLERY_API_URL = import.meta.env.VITE_GALLERY_API_URL;
const MINIO_URL = import.meta.env.VITE_MINIO_URL;

/**
 * Construct full MinIO URL from path
 */
export function getMinioUrl(path: string): string {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    return `${MINIO_URL}/${path.startsWith("/") ? path.slice(1) : path}`;
}

export function resolveImageUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
        return url;
    }
    return getMinioUrl(url);
}

export async function shrekifyImage(
    file: File,
    prompt?: string,
    negativePrompt?: string
): Promise<ShrekifyResponse> {
    const formData = new FormData();
    formData.append("image", file);
    if (prompt) formData.append("prompt", prompt);
    if (negativePrompt) formData.append("negative_prompt", negativePrompt);

    const response = await fetch(`${ML_API_URL}/shrekify/`, {
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

export async function uploadToGalleryService(
    data: {
        input_image_base64?: string;
        generated_image_base64: string;
        control_images_base64?: string[];
    }
): Promise<GenerationLogDetail> {
    const response = await fetch(`${GALLERY_API_URL}/generation-logs/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to upload to gallery" }));
        throw new Error(error.error || error.detail || "Failed to upload to gallery");
    }

    return response.json();
}

export async function getGalleryList(
    page?: number,
    pageSize?: number
): Promise<PaginatedResponse<GenerationLogList>> {
    const params = new URLSearchParams();
    if (page) params.set("page", page.toString());
    if (pageSize) params.set("page_size", pageSize.toString());

    const url = `${GALLERY_API_URL}/generation-logs/${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url);
    console.log(response)

    if (!response.ok) {
        throw new Error("Failed to fetch gallery");
    }

    return response.json();
}

export async function getGalleryEntry(id: string): Promise<GenerationLogDetail> {
    const response = await fetch(`${GALLERY_API_URL}/generation-logs/${id}/`);

    if (!response.ok) {
        throw new Error("Gallery entry not found");
    }

    return response.json();
}

export function base64ToDataUrl(base64: string, mimeType: string = "image/jpeg"): string {
    return `data:${mimeType};base64,${base64}`;
}

