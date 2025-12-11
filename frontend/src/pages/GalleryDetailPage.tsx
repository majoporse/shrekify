import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { getGalleryEntry } from "@/apiClient";
import { PageLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageCompareSlider } from "@/components/ui/image-compare-slider";

export default function GalleryDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: entry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gallery", id],
    queryFn: () => getGalleryEntry(id!),
    enabled: !!id,
  });

  const downloadImage = () => {
    if (entry) {
      const link = document.createElement("a");
      link.href = `data:image/jpeg;base64,${entry.main_image}`;
      link.download = "shrekified.jpg";
      link.click();
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-emerald-700">Result</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden">
                  <ImageCompareSlider
                    beforeImage={`data:image/jpeg;base64,${entry.original_image}`}
                    afterImage={`data:image/jpeg;base64,${entry.main_image}`}
                    beforeLabel="Original"
                    afterLabel="Shrekified"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Created on {new Date(entry.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Control images */}
            {entry.control_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-700">
                    Control Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {entry.control_images.map((img, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                          <img
                            src={`data:image/jpeg;base64,${img.image_base64}`}
                            alt={img.description}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                          {img.description}
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
