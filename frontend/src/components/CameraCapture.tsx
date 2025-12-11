import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File, preview: string) => void;
  onError: (message: string) => void;
}

export function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      setCameraActive(true);
      // Wait for state update and video element to render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch {
      onError("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "camera-capture.jpg", {
              type: "image/jpeg",
            });
            const preview = canvas.toDataURL("image/jpeg");
            onCapture(capturedFile, preview);
            stopCamera();
          }
        }, "image/jpeg");
      }
    }
  };

  return (
    <>
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="rounded-full w-16 h-16 bg-white hover:bg-gray-100"
              >
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500" />
              </Button>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2"
              onClick={stopCamera}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-white/70">
            <Camera className="w-12 h-12 mb-3" />
            <Button onClick={startCamera} variant="secondary">
              Start Camera
            </Button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
