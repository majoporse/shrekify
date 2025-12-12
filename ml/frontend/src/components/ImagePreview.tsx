import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  onClear: () => void;
}

export function ImagePreview({ src, onClear }: ImagePreviewProps) {
  return (
    <div className="relative rounded-xl overflow-hidden border aspect-4/3">
      <img
        src={src}
        alt="Preview"
        className="w-full h-full object-cover bg-muted"
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
