import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  onClear: () => void;
}

export function ImagePreview({ src, onClear }: ImagePreviewProps) {
  return (
    <div className="relative rounded-xl overflow-hidden border">
      <img
        src={src}
        alt="Preview"
        className="w-full h-auto max-h-64 object-contain bg-muted"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2"
        onClick={onClear}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
