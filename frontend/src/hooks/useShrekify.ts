import { useMutation } from "@tanstack/react-query";
import { shrekifyImage, type ShrekifyResponse } from "@/apiClient";

interface ShrekifyInput {
    file: File;
    prompt?: string;
    negativePrompt?: string;
}

export function useShrekify() {
    return useMutation<ShrekifyResponse, Error, ShrekifyInput>({
        mutationFn: ({ file, prompt, negativePrompt }) =>
            shrekifyImage(file, prompt, negativePrompt),
    });
}
