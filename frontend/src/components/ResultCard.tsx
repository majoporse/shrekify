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

interface ResultCardProps {
  preview: string | null;
  result: string | null;
  usedFallback: boolean | null;
  onDownload: () => void;
}

export function ResultCard({
  preview,
  result,
  usedFallback,
  onDownload,
}: ResultCardProps) {
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
        {result && preview ? (
          <div className="space-y-4">
            {/* Before/After Slider */}
            <ImageCompareSlider
              beforeImage={preview}
              afterImage={`data:image/png;base64,${result}`}
              beforeLabel="Original"
              afterLabel="Shrekified"
              className="border"
            />
            <p className="text-xs text-center text-muted-foreground">
              Drag the slider to compare
            </p>

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
