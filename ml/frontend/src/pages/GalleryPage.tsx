import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, ImageOff } from "lucide-react";
import { getGalleryList, resolveImageUrl } from "@/apiClient";
import { PageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";

export default function GalleryPage() {
  const {
    data: entries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gallery"],
    queryFn: getGalleryList,
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200">
            ✨ Transformation Gallery
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real results from our community
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="py-6 text-center text-destructive">
              Failed to load gallery
            </CardContent>
          </Card>
        )}

        {entries && entries.length === 0 && (
          <Card className="border-emerald-200">
            <CardContent className="py-12 text-center text-muted-foreground">
              <ImageOff className="w-12 h-12 mx-auto mb-4 opacity-50 text-emerald-400" />
              <p className="font-medium">No transformations yet</p>
              <p className="text-sm mt-2">
                Be the first to share your glow up! ✨
              </p>
            </CardContent>
          </Card>
        )}

        {entries && entries.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <Link key={entry.id} to={`/transformations/${entry.id}`}>
                <Card className="overflow-hidden hover:ring-2 hover:ring-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer border-emerald-100">
                  <div className="aspect-[4/3] relative">
                    <img
                      src={resolveImageUrl(entry.generated_image)}
                      alt="Glow up transformation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="py-2 px-3">
                    {entry.title && (
                      <p className="text-sm font-medium text-emerald-700 truncate">
                        {entry.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                    {entry.control_images_count > 0 && (
                      <p className="text-xs text-emerald-600">
                        +{entry.control_images_count} control images
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
