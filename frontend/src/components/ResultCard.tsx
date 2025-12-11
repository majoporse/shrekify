import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageCompareSlider } from "@/components/ui/image-compare-slider";
import {
  Sparkles,
  ImageIcon,
  Download,
  CheckCircle2,
  Share2,
  Loader2,
} from "lucide-react";
import { createGalleryEntry, type ImageResult } from "@/apiClient";
import { BeautyFilterLoading } from "./BeautyFilterLoading";

interface ResultCardProps {
  preview: string | null;
  images: ImageResult[] | null;
  usedFallback: boolean | null;
  onDownload: () => void;
  isLoading?: boolean;
}

export function ResultCard({
  preview,
  images,
  usedFallback,
  onDownload,
  isLoading = false,
}: ResultCardProps) {
  const [shared, setShared] = useState(false);
  const queryClient = useQueryClient();

  const mainImage = images?.[0] ?? null;
  const controlImages = images?.slice(1) ?? [];

  const shareMutation = useMutation({
    mutationFn: async () => {
      if (!mainImage || !preview) return;

      // Extract base64 from preview data URL
      const originalBase64 = preview.startsWith("data:")
        ? preview.split(",")[1]
        : preview;

      return createGalleryEntry(
        mainImage.image_base64,
        originalBase64,
        controlImages
      );
    },
    onSuccess: () => {
      setShared(true);
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  // Reset shared state when images change
  const handleShare = () => {
    if (!shared) {
      shareMutation.mutate();
    }
  };

  return (
    <Card className="shadow-lg border-emerald-100 dark:border-emerald-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          Your Glow Up
        </CardTitle>
        <CardDescription>See your radiant transformation</CardDescription>
      </CardHeader>
      <CardContent>
        {mainImage && preview ? (
          <div className="space-y-4">
            {/* Status badge - at top, full width */}
            {usedFallback !== null && (
              <div
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm w-full ${
                  usedFallback
                    ? "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {usedFallback
                  ? "Quick filter applied"
                  : "AI enhancement complete"}
              </div>
            )}

            {/* Before/After Slider */}
            <ImageCompareSlider
              beforeImage={preview}
              afterImage={`data:image/jpeg;base64,${mainImage.image_base64}`}
              beforeLabel="Before"
              afterLabel="Glowed Up ✨"
              className="border border-emerald-200 rounded-xl"
            />
            <p className="text-xs text-center text-muted-foreground">
              Drag the slider to compare
            </p>

            {/* Control Images - Horizontal Scroll */}
            {controlImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Enhancement Process
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                  {controlImages.map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 w-64 space-y-1">
                      <img
                        src={`data:image/jpeg;base64,${img.image_base64}`}
                        alt={img.description}
                        className="w-full aspect-4/3 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-center text-muted-foreground">
                        {img.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download and Share buttons */}
            <div className="flex gap-2">
              <Button onClick={onDownload} variant="outline" className="flex-1">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                onClick={handleShare}
                className={`flex-1 ${
                  shared
                    ? "bg-gray-200 text-gray-600"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-200"
                }`}
                disabled={shareMutation.isPending || shared}
              >
                {shareMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : shared ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {shared ? "Shared!" : "✨ Share to Gallery"}
              </Button>
            </div>
          </div>
        ) : isLoading && preview ? (
          <BeautyFilterLoading preview={preview} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-emerald-200 rounded-xl bg-linear-to-br from-emerald-50/50 to-teal-50/50">
            <Sparkles className="w-16 h-16 mb-4 opacity-30 text-emerald-400" />
            <p className="text-sm font-medium">Your glow up awaits</p>
            <p className="text-xs opacity-70">
              Upload a selfie to reveal your radiance
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
