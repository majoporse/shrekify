import { useState } from "react";
import { useGenerationLogs, useGenerationLog } from "@/hooks/useShrekify";
import { getMinioUrl } from "@/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export function GalleryView() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, error } = useGenerationLogs(page, 20);
  const { data: selectedLog } = useGenerationLog(selectedId || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading gallery: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Generation Gallery</h1>

      {/* Grid of generation logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.results.map((log) => (
          <Card
            key={log.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedId(log.id)}
          >
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                {new Date(log.created_at).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Input</p>
                  {log.input_image_path && (
                    <img
                      src={getMinioUrl(log.input_image_path)}
                      alt="Input"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Generated</p>
                  {log.generated_image_path && (
                    <img
                      src={getMinioUrl(log.generated_image_path)}
                      alt="Generated"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.previous}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.next}
            variant="outline"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedId(null)}
        >
          <Card
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>
                Generation Details
                <Button
                  variant="ghost"
                  className="float-right"
                  onClick={() => setSelectedId(null)}
                >
                  Close
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-500">
                {new Date(selectedLog.created_at).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Input Image</h3>
                  {selectedLog.input_image_path && (
                    <img
                      src={getMinioUrl(selectedLog.input_image_path)}
                      alt="Input"
                      className="w-full rounded"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Generated Image</h3>
                  {selectedLog.generated_image_path && (
                    <img
                      src={getMinioUrl(selectedLog.generated_image_path)}
                      alt="Generated"
                      className="w-full rounded"
                    />
                  )}
                </div>
              </div>

              {selectedLog.control_images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Control Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedLog.control_images.map((ci) => (
                      <div key={ci.id}>
                        <img
                          src={getMinioUrl(ci.image_path)}
                          alt={`Control ${ci.order}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Order: {ci.order}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
