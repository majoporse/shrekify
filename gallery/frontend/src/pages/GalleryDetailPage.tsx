import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { resolveImageUrl } from "@/apiClient"; 
import { PageLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageCompareSlider } from "@/components/ui/image-compare-slider";
import { useGalleryEntry } from "@/hooks/useShrekify";

export default function GalleryDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: entry,
    isLoading,
    error,
  } = useGalleryEntry(id!); 

  const downloadImage = () => {
    if (entry) {
      const link = document.createElement("a");
      link.href = resolveImageUrl(entry.generated_image_path);
      link.download = "glowup-transformation.jpg";
      link.target = "_blank";
      link.click();
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <Link
          to="/transformations"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transformations
        </Link>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="py-6 text-center text-destructive">
              Gallery entry not found
            </CardContent>
          </Card>
        )}

        {entry && (
          <div className="space-y-6">
            {/* Main comparison */}
            <Card className="border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-emerald-700 flex items-center gap-2">
                  <span>✨</span> Transformation
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                  className="gap-2 border-emerald-200"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden border border-emerald-200">
                  <ImageCompareSlider
                    beforeImage={resolveImageUrl(entry.input_image_path)}
                    afterImage={resolveImageUrl(entry.generated_image_path)}
                    beforeLabel="Before"
                    afterLabel="Glowed Up ✨"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Created on {new Date(entry.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Control images */}
            {entry.control_images.length > 0 && (
              <Card className="border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-emerald-700">
                    Enhancement Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {entry.control_images.map((img) => (
                      <div key={img.id} className="space-y-2">
                        <div className="aspect-4/3 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={resolveImageUrl(img.image_path)}
                            alt={"Control image " + img.order}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                          {"Order: " + img.order}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}