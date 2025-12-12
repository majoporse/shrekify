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

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
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

export async function getGenerationLogs(
    page?: number,
    pageSize?: number
): Promise<PaginatedResponse<GenerationLogList>> {
    const params = new URLSearchParams();
    if (page) params.set("page", page.toString());
    if (pageSize) params.set("page_size", pageSize.toString());

    const url = `${BASE_URL}/generation-logs/${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch generation logs");
    }

    return response.json();
}

export async function getGenerationLog(id: string): Promise<GenerationLogDetail> {
    const response = await fetch(`${BASE_URL}/generation-logs/${id}/`);

    if (!response.ok) {
        throw new Error("Generation log not found");
    }

    return response.json();
}

export async function createGenerationLog(
    data: GenerationLogCreate
): Promise<GenerationLogDetail> {
    const response = await fetch(`${BASE_URL}/generation-logs/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to create generation log" }));
        throw new Error(error.error || error.detail || "Failed to create generation log");
    }

    return response.json();
}

