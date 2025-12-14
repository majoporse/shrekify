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
    console.log("[Frontend Upload] File selected:", {
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
      fileType: selectedFile?.type,
      hasPreview: !!filePreview,
      previewLength: filePreview?.length,
    });

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

    console.log("[Frontend Upload] Starting image enhancement upload:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString(),
    });

    setValidationError(null);
    shrekifyMutation.mutate(
      {
        file,
        prompt: undefined,
        negativePrompt: undefined,
      },
      {
        onSuccess: (data) => {
          console.log("[Frontend Upload] Enhancement completed successfully:", {
            imagesCount: data.images?.length,
            usedFallback: data.used_fallback,
            timestamp: new Date().toISOString(),
          });
        },
        onError: (error) => {
          console.error("[Frontend Upload] Enhancement failed:", {
            error: error?.message || error,
            timestamp: new Date().toISOString(),
          });
        },
      }
    );
  };

  const downloadResult = () => {
    const mainImage = shrekifyMutation.data?.images?.[0];
    if (mainImage) {
      // Create a data URL from base64
      const dataUrl = `data:image/jpeg;base64,${mainImage.image_base64}`;
      const link = document.createElement("a");
      link.href = dataUrl;
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

    console.log("[Frontend Upload] Starting gallery upload:", {
      hasInputImage: !!preview,
      inputImageLength: preview?.length,
      generatedImageBase64Length: result.images[0].image_base64?.length,
      controlImagesCount: result.images.slice(1).length,
      controlImagesBase64Lengths: result.images
        .slice(1)
        .map((img) => img.image_base64?.length),
      timestamp: new Date().toISOString(),
    });

    // Prepare base64 payload for gallery backend
    uploadToGalleryMutation.mutate(
      {
        input_image_base64: preview || "",
        generated_image_base64: result.images[0].image_base64
          ? `data:image/jpeg;base64,${result.images[0].image_base64}`
          : "",
        control_images_base64: result.images
          .slice(1)
          .map((img) =>
            img.image_base64 ? `data:image/jpeg;base64,${img.image_base64}` : ""
          ),
      },
      {
        onError: (error: any) => {
          console.error("[Frontend Upload] Gallery upload failed:", {
            error: error?.message || error,
            timestamp: new Date().toISOString(),
          });

          if (error instanceof Error) {
            setValidationError(error.message);
          } else if (typeof error === "string") {
            setValidationError(error);
          } else {
            setValidationError("Failed to upload to gallery");
          }
        },
      }
    );
  };

  const error =
    validationError ||
    shrekifyMutation.error?.message ||
    uploadToGalleryMutation.error?.message ||
    null;

  // Prepare images for ResultCard: convert base64 to data URLs
  const resultImages = shrekifyMutation.data?.images
    ? shrekifyMutation.data.images.map((img) => ({
        ...img,
        src: img.image_base64
          ? `data:image/jpeg;base64,${img.image_base64}`
          : undefined,
      }))
    : null;

  // Always use the original preview (input image) for the before image
  const previewUrl = preview;

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
            preview={previewUrl}
            images={resultImages}
            usedFallback={shrekifyMutation.data?.used_fallback ?? null}
            onDownload={downloadResult}
            isLoading={shrekifyMutation.isPending}
          />

          {resultImages && resultImages.length > 0 && (
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

          {uploadToGalleryMutation.isSuccess &&
            (() => {
              console.log(
                "[Frontend Upload] Gallery upload completed successfully:",
                {
                  timestamp: new Date().toISOString(),
                }
              );
              return null;
            })()}
        </div>
      </div>
    </PageLayout>
  );
}
