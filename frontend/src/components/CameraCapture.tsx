import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File, preview: string) => void;
  onError: (message: string) => void;
  preview?: string | null;
  onClear?: () => void;
}

export function CameraCapture({
  onCapture,
  onError,
  preview: externalPreview,
  onClear,
}: CameraCaptureProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  // Use external preview if available (after cropping), otherwise use internal
  const displayPreview = externalPreview || capturedPreview;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }
    };
  }, []);

  const startCamera = async () => {
    // Make sure any existing stream is stopped first
    stopCamera();
    setCapturedPreview(null);
    setCapturedFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 960 },
      });
      streamRef.current = stream;
      setCameraActive(true);
      // Wait for state update and video element to render
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
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
            const file = new File([blob], "camera-capture.jpg", {
              type: "image/jpeg",
            });
            const preview = canvas.toDataURL("image/jpeg");
            setCapturedFile(file);
            setCapturedPreview(preview);
            // Don't stop camera - keep it running
            onCapture(file, preview);
          }
        }, "image/jpeg");
      }
    }
  };

  const retake = () => {
    setCapturedPreview(null);
    setCapturedFile(null);
    if (onClear) onClear();
    // Camera is already running, no need to restart
  };

  return (
    <>
      {cameraActive ? (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-4/3">
          {/* Always render video when camera is active */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              displayPreview ? "hidden" : ""
            }`}
          />
          {/* Show preview overlay when captured */}
          {displayPreview && (
            <img
              src={displayPreview}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            {displayPreview ? (
              <Button
                onClick={retake}
                size="sm"
                variant="secondary"
                className="shadow-lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
            ) : (
              <Button
                onClick={capturePhoto}
                size="icon"
                className="rounded-md w-9 h-9 bg-white hover:bg-gray-100 shadow-lg"
              >
                <Camera className="w-5 h-5 text-emerald-600" />
              </Button>
            )}
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2"
            onClick={stopCamera}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : displayPreview ? (
        <div className="relative rounded-xl overflow-hidden aspect-4/3">
          <img
            src={displayPreview}
            alt="Captured"
            className="w-full h-full object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={retake}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-xl text-center hover:border-emerald-500/50 transition-colors cursor-pointer aspect-4/3 flex flex-col items-center justify-center"
          onClick={startCamera}
        >
          <Camera className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Click to start camera
          </p>
          <p className="text-xs text-muted-foreground/70">
            Take a photo with your camera
          </p>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
