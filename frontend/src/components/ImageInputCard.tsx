import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, SlidingTabsList } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Upload,
  ImageIcon,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { FileUploadDropzone } from "./FileUploadDropzone";
import { CameraCapture } from "./CameraCapture";
import { ImagePreview } from "./ImagePreview";

const TARGET_ASPECT_RATIO = 4 / 3;

function cropImageToAspectRatio(
  imageSrc: string,
  aspectRatio: number
): Promise<{ file: File; preview: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      const srcWidth = img.width;
      const srcHeight = img.height;
      const srcAspect = srcWidth / srcHeight;

      let cropWidth: number;
      let cropHeight: number;
      let offsetX: number;
      let offsetY: number;

      if (srcAspect > aspectRatio) {
        cropHeight = srcHeight;
        cropWidth = srcHeight * aspectRatio;
        offsetX = (srcWidth - cropWidth) / 2;
        offsetY = 0;
      } else {
        cropWidth = srcWidth;
        cropHeight = srcWidth / aspectRatio;
        offsetX = 0;
        offsetY = (srcHeight - cropHeight) / 2;
      }

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      const preview = canvas.toDataURL("image/jpeg", 0.9);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          const file = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
          });
          resolve({ file, preview });
        },
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageSrc;
  });
}

interface ImageInputCardProps {
  file: File | null;
  preview: string | null;
  loading: boolean;
  error: string | null;
  onFileSelect: (file: File | null, preview?: string) => void;
  onClearImage: () => void;
  onSubmit: () => void;
  onError: (message: string) => void;
}

export function ImageInputCard({
  file,
  preview,
  loading,
  error,
  onFileSelect,
  onClearImage,
  onSubmit,
  onError,
}: ImageInputCardProps) {
  const [activeTab, setActiveTab] = useState("upload");

  const handleFileSelect = async (selectedFile: File | null) => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const { file, preview } = await cropImageToAspectRatio(
            reader.result as string,
            TARGET_ASPECT_RATIO
          );
          onFileSelect(file, preview);
        } catch {
          onError("Failed to process image");
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCameraCapture = async (
    _capturedFile: File,
    capturedPreview: string
  ) => {
    try {
      const { file, preview } = await cropImageToAspectRatio(
        capturedPreview,
        TARGET_ASPECT_RATIO
      );
      onFileSelect(file, preview);
    } catch {
      onError("Failed to process captured image");
    }
  };

  return (
    <Card className="shadow-lg border-emerald-100 dark:border-emerald-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-emerald-500" />
          Start Your Glow Up
        </CardTitle>
        <CardDescription>
          Upload your selfie for instant AI-powered enhancement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <SlidingTabsList
            activeTab={activeTab}
            tabs={[
              {
                value: "upload",
                label: (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                ),
              },
              {
                value: "camera",
                label: (
                  <>
                    <Camera className="w-4 h-4" />
                    Camera
                  </>
                ),
              },
            ]}
          />

          <TabsContent value="upload" className="mt-4">
            <FileUploadDropzone
              onFileSelect={handleFileSelect}
              preview={preview}
              onClear={onClearImage}
            />
          </TabsContent>

          <TabsContent value="camera" className="mt-4">
            <CameraCapture
              onCapture={handleCameraCapture}
              onError={onError}
              preview={preview}
              onClear={onClearImage}
            />
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={loading || !file}
          className="w-full h-12 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 rounded-full font-semibold"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Enhancing your beauty...
            </>
          ) : (
            <>
              ✨ Enhance Now
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
