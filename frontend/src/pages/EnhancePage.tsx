import { useState } from "react";
import { useShrekify } from "@/hooks/useShrekify";
import { PageLayout } from "@/components/Layout";
import { ImageInputCard } from "@/components/ImageInputCard";
import { ResultCard } from "@/components/ResultCard";

export default function EnhancePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const onSubmit = () => {
    if (!file) {
      setValidationError("Please select or capture an image first.");
      return;
    }

    setValidationError(null);
    shrekifyMutation.mutate({
      file,
      prompt: undefined,
      negativePrompt: undefined,
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
    <PageLayout>
      <div className="grid gap-6 lg:grid-cols-2">
        <ImageInputCard
          file={file}
          preview={preview}
          loading={shrekifyMutation.isPending}
          error={error}
          onFileSelect={handleFileSelect}
          onClearImage={clearImage}
          onSubmit={onSubmit}
          onError={setValidationError}
        />

        <ResultCard
          preview={preview}
          images={shrekifyMutation.data?.images ?? null}
          usedFallback={shrekifyMutation.data?.used_fallback ?? null}
          onDownload={downloadResult}
          isLoading={shrekifyMutation.isPending}
        />
      </div>
    </PageLayout>
  );
}
