export interface ImagePath {
    path: string;
}

export interface ShrekifyResponse {
    images: ImagePath[];
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

const ML_API_URL = import.meta.env.VITE_ML_API_URL || "http://localhost:8080/api";
const GALLERY_API_URL = import.meta.env.VITE_GALLERY_API_URL || "http://localhost:8000/api";
const MINIO_URL = import.meta.env.VITE_MINIO_URL || "http://localhost:9000/gallery";

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

/**
 * Resolve a relative image URL to an absolute URL
 */
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

/**
 * Upload generation result to gallery service
 */
export async function uploadToGalleryService(
    data: GenerationLogCreate
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

/**
 * Get paginated list of generation logs from gallery service
 */
export async function getGalleryList(
    page?: number,
    pageSize?: number
): Promise<PaginatedResponse<GenerationLogList>> {
    const params = new URLSearchParams();
    if (page) params.set("page", page.toString());
    if (pageSize) params.set("page_size", pageSize.toString());

    const url = `${GALLERY_API_URL}/generation-logs/${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch gallery");
    }

    return response.json();
}

/**
 * Get generation log detail from gallery service
 */
export async function getGalleryEntry(id: string): Promise<GenerationLogDetail> {
    const response = await fetch(`${GALLERY_API_URL}/generation-logs/${id}/`);

    if (!response.ok) {
        throw new Error("Gallery entry not found");
    }

    return response.json();
}

/**
 * Convert a base64 string to a data URL
 */
export function base64ToDataUrl(base64: string, mimeType: string = "image/jpeg"): string {
    return `data:${mimeType};base64,${base64}`;
}

