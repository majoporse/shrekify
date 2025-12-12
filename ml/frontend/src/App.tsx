import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShrekify } from "@/hooks/useShrekify";
import { shrekifyFormSchema, type ShrekifyFormData } from "@/lib/schema";
import { PageLayout } from "@/components/Layout";
import { ImageInputCard } from "@/components/ImageInputCard";
import { ResultCard } from "@/components/ResultCard";
import { Testimonials } from "@/components/Testimonials";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const form = useForm<ShrekifyFormData>({
    resolver: zodResolver(shrekifyFormSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
    },
  });

  const shrekifyMutation = useShrekify();

  const handleFileSelect = (
    selectedFile: File | null,
    filePreview?: string
  ) => {
    setFile(selectedFile);
    setPreview(filePreview ?? null);
    shrekifyMutation.reset();
    setValidationError(null);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    shrekifyMutation.reset();
    setValidationError(null);
  };

  const onSubmit = (data: ShrekifyFormData) => {
    if (!file) {
      setValidationError("Please select or capture an image first.");
      return;
    }

    setValidationError(null);
    shrekifyMutation.mutate({
      file,
      prompt: data.prompt?.trim() || undefined,
      negativePrompt: data.negativePrompt?.trim() || undefined,
    });
  };

  const downloadResult = () => {
    const mainImage = shrekifyMutation.data?.images?.[0];
    if (mainImage) {
      const link = document.createElement("a");
      link.href = `data:image/jpeg;base64,${mainImage.image_base64}`;
      link.download = "glowup-transformation.jpg";
      link.click();
    }
  };

  const error = validationError || shrekifyMutation.error?.message || null;

  return (
    <FormProvider {...form}>
      <PageLayout>
        <div className="grid gap-6 lg:grid-cols-2">
          <ImageInputCard
            file={file}
            preview={preview}
            loading={shrekifyMutation.isPending}
            error={error}
            onFileSelect={handleFileSelect}
            onClearImage={clearImage}
            onSubmit={form.handleSubmit(onSubmit)}
            onError={setValidationError}
          />

          <ResultCard
            preview={preview}
            images={shrekifyMutation.data?.images ?? null}
            usedFallback={shrekifyMutation.data?.used_fallback ?? null}
            onDownload={downloadResult}
          />
        </div>

        <Testimonials />
      </PageLayout>
    </FormProvider>
  );
}

export default App;
