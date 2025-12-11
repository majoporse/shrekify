import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShrekify } from "@/hooks/useShrekify";
import { shrekifyFormSchema, type ShrekifyFormData } from "@/lib/schema";
import { Header, Footer } from "@/components/Layout";
import { ImageInputCard } from "@/components/ImageInputCard";
import { ResultCard } from "@/components/ResultCard";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const form = useForm<ShrekifyFormData>({
    resolver: zodResolver(shrekifyFormSchema),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
    },
  });

  const shrekifyMutation = useShrekify();

  const handleFileSelect = (
    selectedFile: File | null,
    filePreview?: string
  ) => {
    setFile(selectedFile);
    setPreview(filePreview ?? null);
    shrekifyMutation.reset();
    setValidationError(null);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    shrekifyMutation.reset();
    setValidationError(null);
  };

  const onSubmit = (data: ShrekifyFormData) => {
    if (!file) {
      setValidationError("Please select or capture an image first.");
      return;
    }

    setValidationError(null);
    shrekifyMutation.mutate({
      file,
      prompt: data.prompt?.trim() || undefined,
      negativePrompt: data.negativePrompt?.trim() || undefined,
    });
  };

  const downloadResult = () => {
    if (shrekifyMutation.data?.image_base64) {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${shrekifyMutation.data.image_base64}`;
      link.download = "shrekified.png";
      link.click();
    }
  };

  const error = validationError || shrekifyMutation.error?.message || null;

  return (
    <FormProvider {...form}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Header />

          <div className="grid gap-6 lg:grid-cols-2">
            <ImageInputCard
              file={file}
              preview={preview}
              loading={shrekifyMutation.isPending}
              error={error}
              onFileSelect={handleFileSelect}
              onClearImage={clearImage}
              onSubmit={form.handleSubmit(onSubmit)}
              onError={setValidationError}
            />

            <ResultCard
              preview={preview}
              result={shrekifyMutation.data?.image_base64 ?? null}
              usedFallback={shrekifyMutation.data?.used_fallback ?? null}
              onDownload={downloadResult}
            />
          </div>

          <Footer />
        </div>
      </div>
    </FormProvider>
  );
}

export default App;
