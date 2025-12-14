import { useState, useEffect } from "react";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeautyFilterLoadingProps {
  preview: string;
}

const filterSteps = [
  {
    name: "Analyzing facial features",
    duration: 3000,
    filter: "brightness(1.05)",
  },
  {
    name: "Smoothing skin texture",
    duration: 3500,
    filter: "brightness(1.1) contrast(0.95)",
  },
  {
    name: "Enhancing natural glow",
    duration: 3000,
    filter: "brightness(1.15) saturate(1.1)",
  },
  {
    name: "Perfecting complexion",
    duration: 2500,
    filter: "brightness(1.2) saturate(1.15) contrast(0.9)",
  },
  {
    name: "Applying radiance boost",
    duration: 2000,
    filter: "brightness(1.25) saturate(1.2) contrast(0.85) hue-rotate(5deg)",
  },
  {
    name: "Finalizing your glow up",
    duration: 4000,
    filter: "brightness(1.3) saturate(1.25) contrast(0.8) hue-rotate(10deg)",
  },
];

export function BeautyFilterLoading({ preview }: BeautyFilterLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const totalSteps = filterSteps.length;

  useEffect(() => {
    if (currentStep >= totalSteps) {
      return;
    }

    const stepDuration = filterSteps[currentStep].duration;

    const timerId = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, stepDuration);

    return () => {
      clearTimeout(timerId);
    };
    
  }, [currentStep, totalSteps]);

  const filterIndex = Math.min(currentStep, totalSteps - 1);
  const currentFilter = filterSteps[filterIndex]?.filter || "";
  
  const displayStep = Math.min(currentStep, totalSteps - 1);
  
  return (
    <div className="space-y-4">
      <div className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-emerald-200 animate-pulse-glow">
        <img
          src={preview}
          alt="Processing"
          className="w-full h-full object-cover transition-all duration-500"
          style={{ filter: currentFilter }}
        />

        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" />

        <div className="absolute inset-0 pointer-events-none">
          <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/80 animate-pulse" />
          <Sparkles className="absolute bottom-8 left-6 w-4 h-4 text-white/60 animate-pulse delay-300" />
          <Sparkles className="absolute top-1/3 left-1/4 w-5 h-5 text-white/70 animate-pulse delay-500" />
        </div>

        <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-white text-sm">
            {currentStep < totalSteps && (
                <Sparkles className="w-4 h-4 animate-spin" />
            )}
            <span className="font-medium">
              {filterSteps[displayStep]?.name || "Processing Complete!"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filterSteps.map((step, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center gap-3 text-sm transition-all duration-300",
              completedSteps.includes(idx) 
                ? "text-emerald-600"
                : currentStep === idx 
                ? "text-emerald-700 font-medium"
                : "text-muted-foreground/50"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                completedSteps.includes(idx)
                  ? "bg-emerald-500 text-white"
                  : currentStep === idx
                  ? "bg-emerald-100 border-2 border-emerald-500"
                  : "bg-gray-100 border border-gray-200"
              )}
            >
              {completedSteps.includes(idx) ? (
                <Check className="w-3 h-3" />
              ) : currentStep === idx && currentStep < totalSteps ? (
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              ) : null}
            </div>
            <span>{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}