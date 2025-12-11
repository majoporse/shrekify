import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface FileUploadDropzoneProps {
  onFileSelect: (file: File | null) => void;
}

export function FileUploadDropzone({ onFileSelect }: FileUploadDropzoneProps) {
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

  return (
    <div
      className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
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
