import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ShrekifyFormData } from "@/lib/schema";

export function PromptInputs() {
  const { register } = useFormContext<ShrekifyFormData>();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt (optional)</Label>
        <Textarea
          id="prompt"
          {...register("prompt")}
          placeholder="Describe the style or scene you want..."
          className="resize-none"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="negativePrompt">Negative prompt (optional)</Label>
        <Input
          id="negativePrompt"
          {...register("negativePrompt")}
          placeholder="What to avoid in the result..."
        />
      </div>
    </div>
  );
}
