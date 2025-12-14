import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, ImageOff } from "lucide-react";
import {
  GenerationLogList,
  getGalleryList,
  PaginatedResponse,
  resolveImageUrl,
} from "@/apiClient";
import { PageLayout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";

export default function GalleryPage() {
  const PAGE_SIZE = 12;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedResponse<GenerationLogList>>({
    queryKey: ["gallery"],
    queryFn: ({ pageParam = 0 }: { pageParam?: any }) =>
      getGalleryList(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.next ? pages.length + 1 : undefined;
    },
  });

  console.log("Gallery data:", data);
  console.log("isLoading:", isLoading, "error:", error);
  const entries = data?.pages?.flatMap((p) => p.results) ?? null;

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
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {entries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/transformations/${entry.id}`}
                  className="group relative block aspect-4/3 rounded-lg overflow-hidden transition-all duration-300 transform 
                              hover:shadow-2xl hover:shadow-emerald-500/50"
                >
                  {/* Image Container: Fills the entire link/card area */}
                  <div className="w-full h-full relative">
                    <img
                      src={resolveImageUrl(entry.generated_image_path)}
                      alt={"Glow up transformation"}
                      className="w-full h-full object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-[1.05]"
                    />
                  </div>

                  {/* Gradient Overlay & Date Display: Appears on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-100 transition-opacity duration-300 p-4 flex items-end justify-between text-white">
                    {/* Date */}
                    <p className="text-sm font-semibold">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <button
                className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                    Loading...
                  </>
                ) : hasNextPage ? (
                  "Load more"
                ) : (
                  "No more"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
