import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface FileUploadDropzoneProps {
  onFileSelect: (file: File | null) => void;
  preview?: string | null;
  onClear?: () => void;
}

export function FileUploadDropzone({
  onFileSelect,
  preview,
  onClear,
}: FileUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      onFileSelect(droppedFile);
    }
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden aspect-4/3">
        <img
          src={preview}
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

  return (
    <div
      className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer aspect-4/3 flex flex-col items-center justify-center"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
      <p className="text-sm text-muted-foreground mb-2">
        Click to upload or drag and drop
      </p>
      <p className="text-xs text-muted-foreground/70">
        PNG, JPG, WEBP up to 10MB
      </p>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
