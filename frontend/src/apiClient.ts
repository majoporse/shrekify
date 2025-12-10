export interface ShrekifyResponse {
    image_base64: string;
    used_fallback: boolean;
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

