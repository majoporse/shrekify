import { useState } from "react";
import { useShrekify, useUploadToGallery } from "@/hooks/useShrekify";
import { base64ToDataUrl, getMinioUrl } from "@/apiClient";
import { PageLayout } from "@/components/Layout";
import { ImageInputCard } from "@/components/ImageInputCard";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

export default function EnhancePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const shrekifyMutation = useShrekify();
  const uploadToGalleryMutation = useUploadToGallery();

  const handleFileSelect = (
    selectedFile: File | null,
    filePreview?: string
  ) => {
    setFile(selectedFile);
    setPreview(filePreview ?? null);
    shrekifyMutation.reset();
    uploadToGalleryMutation.reset();
    setValidationError(null);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    shrekifyMutation.reset();
    uploadToGalleryMutation.reset();
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
      link.href = getMinioUrl(mainImage.path);
      link.download = "glowup-transformation.jpg";
      link.target = "_blank";
      link.click();
    }
  };

  const saveToGallery = () => {
    const result = shrekifyMutation.data;
    if (!result || !result.images[0]) {
      setValidationError("No image to save");
      return;
    }

    // Assume input image path is available from ML service
    // This would typically come from the ML service response
    uploadToGalleryMutation.mutate({
      input_image_path: preview ? "" : "", // Placeholder, depends on ML service
      generated_image_path: result.images[0].path,
      control_image_paths: [],
    });
  };

  const error =
    validationError ||
    shrekifyMutation.error?.message ||
    uploadToGalleryMutation.error?.message ||
    null;

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

        <div className="space-y-4">
          <ResultCard
            preview={preview}
            images={shrekifyMutation.data?.images ?? null}
            usedFallback={shrekifyMutation.data?.used_fallback ?? null}
            onDownload={downloadResult}
            isLoading={shrekifyMutation.isPending}
          />

          {shrekifyMutation.data && shrekifyMutation.data.images.length > 0 && (
            <Button
              onClick={saveToGallery}
              disabled={uploadToGalleryMutation.isPending}
              className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {uploadToGalleryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving to Gallery...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Save to Gallery
                </>
              )}
            </Button>
          )}

          {uploadToGalleryMutation.isSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700">
              <p className="font-semibold">✓ Saved to Gallery!</p>
              <p className="text-sm">
                Your transformation has been added to the gallery.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
