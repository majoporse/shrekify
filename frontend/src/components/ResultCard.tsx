import { useState } from "react";
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

interface ResultCardProps {
  preview: string | null;
  images: ImageResult[] | null;
  usedFallback: boolean | null;
  onDownload: () => void;
}

export function ResultCard({
  preview,
  images,
  usedFallback,
  onDownload,
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
          <Sparkles className="w-5 h-5" />
          Result
        </CardTitle>
        <CardDescription>
          Your transformed image will appear here
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mainImage && preview ? (
          <div className="space-y-4">
            {/* Before/After Slider */}
            <ImageCompareSlider
              beforeImage={preview}
              afterImage={`data:image/jpeg;base64,${mainImage.image_base64}`}
              beforeLabel="Original"
              afterLabel="Shrekified"
              className="border"
            />
            <p className="text-xs text-center text-muted-foreground">
              Drag the slider to compare
            </p>

            {/* Control Images - Horizontal Scroll */}
            {controlImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Control Images
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

            {/* Status badge */}
            {usedFallback !== null && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  usedFallback
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {usedFallback
                  ? "Fallback filter applied"
                  : "AI transformation complete"}
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
                variant={shared ? "secondary" : "default"}
                className="flex-1"
                disabled={shareMutation.isPending || shared}
              >
                {shareMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : shared ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {shared ? "Shared!" : "Share to Gallery"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-xl">
            <ImageIcon className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm">No result yet</p>
            <p className="text-xs opacity-70">
              Upload an image and click Shrekify
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
