"use client";

import { useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Button } from "~/components/ui/button";

/**
 * Test component to verify @zxing/library API works correctly
 * This component tests the camera enumeration and QR scanning functionality
 */
export function QRScannerTest() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Test device enumeration
  const testDeviceEnumeration = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Test the native API that we're using in the camera scanner
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error("Media devices not supported");
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      
      setDevices(videoDevices);
      setSuccess(`Found ${videoDevices.length} video devices`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Test @zxing/library initialization
  const testZxingLibrary = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const codeReader = new BrowserMultiFormatReader();
      setSuccess("@zxing/library BrowserMultiFormatReader initialized successfully");
      
      // Clean up
      codeReader.reset();
    } catch (err) {
      setError(`@zxing/library error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test camera access
  const testCameraAccess = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      setSuccess("Camera access granted successfully");
      
      // Clean up the stream
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera permission denied");
        } else if (err.name === "NotFoundError") {
          setError("No camera found");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError("Unknown camera error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">QR Scanner API Test</h2>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testDeviceEnumeration}
            disabled={isLoading}
            variant="outline"
          >
            Test Device Enumeration
          </Button>
          
          <Button 
            onClick={testZxingLibrary}
            disabled={isLoading}
            variant="outline"
          >
            Test @zxing/library
          </Button>
          
          <Button 
            onClick={testCameraAccess}
            disabled={isLoading}
            variant="outline"
          >
            Test Camera Access
          </Button>
        </div>

        {isLoading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">Testing...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-medium">Success:</p>
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {devices.length > 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <p className="font-medium mb-2">Available Video Devices:</p>
            <ul className="space-y-1">
              {devices.map((device, index) => (
                <li key={device.deviceId} className="text-sm">
                  {index + 1}. {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Click "Test Device Enumeration" to check if camera devices can be listed</li>
          <li>Click "Test @zxing/library" to verify the QR scanning library loads correctly</li>
          <li>Click "Test Camera Access" to check if camera permissions work</li>
        </ol>
      </div>
    </div>
  );
}
