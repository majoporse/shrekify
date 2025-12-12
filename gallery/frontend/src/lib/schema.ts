import { z } from "zod";

export const shrekifyFormSchema = z.object({
    prompt: z.string().optional(),
    negativePrompt: z.string().optional(),
});

export type ShrekifyFormData = z.infer<typeof shrekifyFormSchema>;
