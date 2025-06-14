"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Camera,
  CameraOff,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface CameraQRScannerProps {
  onScan: (qrData: string) => void;
  onError: (error: string) => void;
  isScanning?: boolean;
  className?: string;
}

export function CameraQRScanner({
  onScan,
  onError,
  isScanning = false,
  className,
}: CameraQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<number>(0);

  // Initialize code reader
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);

    return () => {
      reader.reset();
    };
  }, []);

  // Get available cameras using the correct API
  const getDevices = useCallback(async () => {
    try {
      // Use the browser's native API to get media devices
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error("Media devices not supported");
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');

      setDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Prefer back camera if available
        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        setSelectedDeviceId(backCamera?.deviceId || videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting video devices:", error);
      onError("Failed to access camera devices. Please ensure camera permissions are granted.");
    }
  }, [selectedDeviceId, onError]);

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!codeReader || !videoRef.current) return;

    try {
      setIsActive(true);
      setHasPermission(null);

      // First get devices to ensure we have camera access
      await getDevices();

      // Request camera permission and start streaming
      let constraints: MediaStreamConstraints;

      if (selectedDeviceId) {
        constraints = {
          video: { deviceId: { exact: selectedDeviceId } }
        };
      } else {
        // Fallback constraints - try back camera first, then any camera
        constraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
      }

      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError) {
        console.warn("Failed with specific constraints, trying fallback:", constraintError);
        // Fallback to basic video constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Start decoding from the video element
      codeReader.decodeFromVideoDevice(
        selectedDeviceId || undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const now = Date.now();
            // Prevent duplicate scans within 2 seconds
            if (now - lastScanTime > 2000) {
              setLastScanTime(now);
              setScanCount(prev => prev + 1);
              onScan(result.getText());
            }
          }

          if (error && !(error instanceof NotFoundException)) {
            console.warn("QR scan error:", error);
          }
        }
      );

      setHasPermission(true);
    } catch (error) {
      console.error("Error starting camera:", error);
      setHasPermission(false);
      setIsActive(false);

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          onError("Camera permission denied. Please allow camera access and try again.");
        } else if (error.name === "NotFoundError") {
          onError("No camera found. Please connect a camera and try again.");
        } else if (error.name === "NotReadableError") {
          onError("Camera is already in use by another application.");
        } else if (error.name === "OverconstrainedError") {
          onError("Camera constraints could not be satisfied. Try selecting a different camera.");
        } else {
          onError(`Camera error: ${error.message}`);
        }
      } else {
        onError("Failed to start camera");
      }
    }
  }, [codeReader, selectedDeviceId, lastScanTime, onScan, onError, getDevices]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    try {
      // Stop the code reader
      if (codeReader) {
        codeReader.reset();
      }

      // Stop the video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      setIsActive(false);
      setHasPermission(null);
    } catch (error) {
      console.error("Error stopping camera:", error);
      setIsActive(false);
      setHasPermission(null);
    }
  }, [codeReader]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Camera Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Scans: {scanCount}
          </Badge>
          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="text-sm border rounded px-2 py-1"
              disabled={isActive}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={startScanning} size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" size="sm">
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Camera
            </Button>
          )}
        </div>
      </div>

      {/* Camera Preview */}
      <div className="relative">
        <video
          ref={videoRef}
          className={cn(
            "w-full h-64 bg-black rounded-lg object-cover",
            !isActive && "hidden"
          )}
          playsInline
          muted
        />

        {/* Overlay for scanning state */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning frame */}
            <div className="absolute inset-4 border-2 border-blue-500 rounded-lg">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>

            {/* Scanning indicator */}
            {isScanning && (
              <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Processing...
              </div>
            )}
          </div>
        )}

        {/* Permission/Error States */}
        {!isActive && (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center">
              {hasPermission === false ? (
                <>
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
                  <p className="text-red-600 font-medium">Camera Access Denied</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please allow camera access in your browser settings
                  </p>
                </>
              ) : (
                <>
                  <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Click "Start Camera" to begin scanning</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Position QR code within the frame
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {isActive && (
        <div className="text-center text-sm text-gray-600">
          <p>Position the QR code within the blue frame</p>
          <p className="text-xs mt-1">The scanner will automatically detect and validate tickets</p>
        </div>
      )}
    </div>
  );
}
