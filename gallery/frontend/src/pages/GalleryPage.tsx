import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useGenerationLogs } from "@/hooks/useShrekify";
import { getMinioUrl } from "@/apiClient";
import { PageLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GalleryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGenerationLogs(page, 20);

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

        {data && data.results.length === 0 && (
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

        {data && data.results.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.results.map((entry) => (
                <Link key={entry.id} to={`/transformations/${entry.id}`}>
                  <Card className="overflow-hidden hover:ring-2 hover:ring-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer border-emerald-100">
                    <div className="aspect-[4/3] relative">
                      {entry.generated_image_path && (
                        <img
                          src={getMinioUrl(entry.generated_image_path)}
                          alt="Glow up transformation"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardContent className="py-2 px-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.previous}
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">Page {page}</span>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.next}
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
