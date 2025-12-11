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
import { PromptInputs } from "./PromptInputs";

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

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(selectedFile, reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCameraCapture = (capturedFile: File, capturedPreview: string) => {
    onFileSelect(capturedFile, capturedPreview);
  };

  return (
    <Card className="shadow-lg border-emerald-100 dark:border-emerald-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Select Image
        </CardTitle>
        <CardDescription>
          Upload a photo or take one with your camera
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
            <FileUploadDropzone onFileSelect={handleFileSelect} />
          </TabsContent>

          <TabsContent value="camera" className="mt-4">
            <CameraCapture onCapture={handleCameraCapture} onError={onError} />
          </TabsContent>
        </Tabs>

        {/* Preview */}
        {preview && <ImagePreview src={preview} onClear={onClearImage} />}

        {/* Prompts */}
        <PromptInputs />

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={loading || !file}
          className="w-full h-12 text-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Shrekify!
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
