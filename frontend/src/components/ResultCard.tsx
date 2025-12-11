import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageCompareSlider } from "@/components/ui/image-compare-slider";
import { Sparkles, ImageIcon, Download, CheckCircle2 } from "lucide-react";

interface ImageResult {
  image_base64: string;
  description: string;
}

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
  const mainImage = images?.[0] ?? null;
  const controlImages = images?.slice(1) ?? [];

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

            {/* Control Images Grid */}
            {controlImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Control Images
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {controlImages.map((img, idx) => (
                    <div key={idx} className="space-y-1">
                      <img
                        src={`data:image/jpeg;base64,${img.image_base64}`}
                        alt={img.description}
                        className="w-full rounded-lg border"
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

            {/* Download button */}
            <Button onClick={onDownload} variant="outline" className="w-full">
              <Download className="w-4 h-4" />
              Download Image
            </Button>
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
