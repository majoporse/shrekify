import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getGenerationLogs,
    getGenerationLog,
    createGenerationLog,
    type GenerationLogList,
    type GenerationLogDetail,
    type GenerationLogCreate,
    type PaginatedResponse,
} from "@/apiClient";

export function useGenerationLogs(page?: number, pageSize?: number) {
    return useQuery<PaginatedResponse<GenerationLogList>, Error>({
        queryKey: ["generation-logs", page, pageSize],
        queryFn: () => getGenerationLogs(page, pageSize),
    });
}

export function useGenerationLog(id: string) {
    return useQuery<GenerationLogDetail, Error>({
        queryKey: ["generation-log", id],
        queryFn: () => getGenerationLog(id),
        enabled: !!id,
    });
}

export function useCreateGenerationLog() {
    const queryClient = useQueryClient();

    return useMutation<GenerationLogDetail, Error, GenerationLogCreate>({
        mutationFn: createGenerationLog,
        onSuccess: () => {
            // Invalidate and refetch generation logs list
            queryClient.invalidateQueries({ queryKey: ["generation-logs"] });
        },
    });
}
