import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    shrekifyImage,
    uploadToGalleryService,
    getGalleryList,
    getGalleryEntry,
    type ShrekifyResponse,
    type GenerationLogDetail,
    type GenerationLogCreate,
    type PaginatedResponse,
    type GenerationLogList,
} from "@/apiClient";

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

export function useUploadToGallery() {
    const queryClient = useQueryClient();

    return useMutation<GenerationLogDetail, Error, GenerationLogCreate>({
        mutationFn: uploadToGalleryService,
        onSuccess: () => {
            // Invalidate and refetch gallery list
            queryClient.invalidateQueries({ queryKey: ["gallery-list"] });
        },
    });
}

export function useGalleryList(page?: number, pageSize?: number) {
    return useQuery<PaginatedResponse<GenerationLogList>, Error>({
        queryKey: ["gallery-list", page, pageSize],
        queryFn: () => getGalleryList(page, pageSize),
    });
}

export function useGalleryEntry(id: string) {
    return useQuery<GenerationLogDetail, Error>({
        queryKey: ["gallery-entry", id],
        queryFn: () => getGalleryEntry(id),
        enabled: !!id,
    });
}
