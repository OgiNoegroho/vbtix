"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useQRCodeScanner } from "~/lib/api/hooks/qr-code";
import { CameraQRScanner } from "./camera-qr-scanner";
import {
  Scan,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Ticket,
  Calendar,
  Clock,
  RefreshCw,
  Camera,
  CameraOff,
  Keyboard,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatDate } from "~/lib/utils";

export interface QRCodeScannerProps {
  organizerId: string;
  onScanSuccess?: (result: any) => void;
  onScanError?: (error: string) => void;
  className?: string;
}

interface ScanResult {
  success: boolean;
  message: string;
  ticket?: {
    id: string;
    checkedIn: boolean;
    checkInTime?: string;
    event: {
      title: string;
    };
    ticketType: {
      name: string;
    };
    holder: {
      fullName: string;
      email: string;
    };
  };
}

export function QRCodeScanner({
  organizerId,
  onScanSuccess,
  onScanError,
  className,
}: QRCodeScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [validatedTicket, setValidatedTicket] = useState<any>(null);
  const [validatedQRData, setValidatedQRData] = useState<string>("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { scanAndValidate, scanAndCheckIn } = useQRCodeScanner(organizerId);

  // Step 1: Validate QR code and show ticket details
  const handleValidateQR = useCallback(
    async (qrData: string) => {
      if (!qrData.trim()) return;

      setIsScanning(true);
      setScanResult(null);
      setValidatedTicket(null);

      try {
        const result = await scanAndValidate(qrData);

        setScanResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 scans

        if (result.success) {
          setValidatedTicket(result.data?.ticket);
          setValidatedQRData(qrData); // Store the QR data for check-in
          onScanSuccess?.(result);
          setManualInput(""); // Clear input after successful validation
        } else {
          onScanError?.(result.message);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Validation failed";
        const errorResult = {
          success: false,
          message: errorMessage,
        };
        setScanResult(errorResult);
        setScanHistory((prev) => [errorResult, ...prev.slice(0, 9)]);
        onScanError?.(errorMessage);
      } finally {
        setIsScanning(false);
      }
    },
    [scanAndValidate, onScanSuccess, onScanError]
  );

  // Step 2: Confirm check-in for validated ticket
  const handleConfirmCheckIn = useCallback(
    async () => {
      if (!validatedQRData || !validatedTicket) return;

      setIsCheckingIn(true);

      try {
        const result = await scanAndCheckIn(validatedQRData);

        setScanResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 9)]);

        if (result.success) {
          setValidatedTicket(null); // Clear validated ticket after check-in
          setValidatedQRData(""); // Clear QR data
          onScanSuccess?.(result);
        } else {
          onScanError?.(result.message);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Check-in failed";
        const errorResult = {
          success: false,
          message: errorMessage,
        };
        setScanResult(errorResult);
        setScanHistory((prev) => [errorResult, ...prev.slice(0, 9)]);
        onScanError?.(errorMessage);
      } finally {
        setIsCheckingIn(false);
      }
    },
    [scanAndCheckIn, validatedTicket, validatedQRData, onScanSuccess, onScanError]
  );

  const handleManualValidate = () => {
    handleValidateQR(manualInput);
  };

  const handleManualCheckIn = () => {
    handleConfirmCheckIn(manualInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleManualValidate();
    }
  };

  // Handle camera scan result
  const handleCameraScan = useCallback(
    (qrData: string) => {
      handleValidateQR(qrData);
    },
    [handleValidateQR]
  );

  // Reset validation state when switching modes
  useEffect(() => {
    setValidatedTicket(null);
    setValidatedQRData("");
    setScanResult(null);
  }, [scanMode]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Scanner Mode Toggle */}
      <MagicCard
        className="border-0 bg-background/50 backdrop-blur-sm"
        gradientColor="rgba(59, 130, 246, 0.1)"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">QR Code Scanner</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant={scanMode === "camera" ? "default" : "outline"}
                size="sm"
                onClick={() => setScanMode("camera")}
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera
              </Button>
              <Button
                variant={scanMode === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => setScanMode("manual")}
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Manual
              </Button>
            </div>
          </div>
        </div>
      </MagicCard>

      {/* Camera Scanner */}
      {scanMode === "camera" && (
        <MagicCard
          className="border-0 bg-background/50 backdrop-blur-sm"
          gradientColor="rgba(59, 130, 246, 0.1)"
        >
          <div className="p-6 space-y-4">
            <h4 className="font-semibold">Camera Scanner</h4>
            <p className="text-sm text-muted-foreground">
              Use your device camera to scan QR codes automatically.
            </p>

            <CameraQRScanner
              onScan={handleCameraScan}
              onError={(error) => onScanError?.(error)}
              isScanning={isScanning}
            />
          </div>
        </MagicCard>
      )}

      {/* Manual Input Scanner */}
      {scanMode === "manual" && (
        <MagicCard
          className="border-0 bg-background/50 backdrop-blur-sm"
          gradientColor="rgba(59, 130, 246, 0.1)"
        >
          <div className="p-6 space-y-4">
            <h4 className="font-semibold">Manual Input</h4>
            <p className="text-sm text-muted-foreground">
              Paste or type QR code data to validate tickets.
            </p>

            {/* Manual Input */}
            <div className="space-y-2">
              <Label htmlFor="qr-input">QR Code Data</Label>
              <Textarea
                ref={inputRef}
                id="qr-input"
                placeholder="Paste QR code data here..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[100px] font-mono text-sm"
                disabled={isScanning}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Press Ctrl+Enter to validate quickly
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleManualValidate}
                disabled={!manualInput.trim() || isScanning}
                className="flex-1"
              >
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2" />
                )}
                Validate Ticket
              </Button>
            </div>
          </div>
        </MagicCard>
      )}

      {/* Check-in Confirmation */}
      {validatedTicket && scanResult?.success && !validatedTicket.checkedIn && (
        <MagicCard
          className="border-0 bg-blue-50/50 backdrop-blur-sm border-blue-200"
          gradientColor="rgba(59, 130, 246, 0.1)"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Ready for Check-in</h3>
            </div>

            <p className="text-sm text-blue-700">
              Ticket validated successfully. Click the button below to confirm check-in.
            </p>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Attendee</Label>
                  <p className="font-medium">{validatedTicket.holder.fullName}</p>
                  <p className="text-xs text-gray-500">{validatedTicket.holder.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Event</Label>
                  <p className="font-medium">{validatedTicket.event.title}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Ticket Type</Label>
                  <p className="font-medium">{validatedTicket.ticketType.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Ready for Check-in
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConfirmCheckIn}
                disabled={isCheckingIn}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isCheckingIn ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Confirm Check-in
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setValidatedTicket(null);
                  setValidatedQRData("");
                  setScanResult(null);
                }}
                disabled={isCheckingIn}
              >
                Cancel
              </Button>
            </div>
          </div>
        </MagicCard>
      )}

      {/* Scan Result */}
      {scanResult && (
        <ScanResultDisplay
          result={scanResult}
          showCheckInButton={false} // We handle check-in separately now
        />
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <MagicCard
          className="border-0 bg-background/50 backdrop-blur-sm"
          gradientColor="rgba(59, 130, 246, 0.1)"
        >
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Recent Scans</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scanHistory.map((result, index) => (
                <ScanHistoryItem key={index} result={result} />
              ))}
            </div>
          </div>
        </MagicCard>
      )}
    </div>
  );
}

function ScanResultDisplay({
  result,
  showCheckInButton = true
}: {
  result: ScanResult;
  showCheckInButton?: boolean;
}) {
  const isSuccess = result.success;
  const ticket = result.ticket;

  return (
    <MagicCard
      className={cn(
        "border-0 backdrop-blur-sm",
        isSuccess
          ? "bg-green-50/50 border-green-200"
          : "bg-red-50/50 border-red-200"
      )}
      gradientColor={isSuccess ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <h3 className={cn(
            "text-lg font-semibold",
            isSuccess ? "text-green-800" : "text-red-800"
          )}>
            {isSuccess ? "Valid Ticket" : "Invalid Ticket"}
          </h3>
        </div>

        <p className={cn(
          "text-sm",
          isSuccess ? "text-green-700" : "text-red-700"
        )}>
          {result.message}
        </p>

        {ticket && (
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Event</Label>
                <p className="font-medium">{ticket.event.title}</p>
              </div>
              <div>
                <Label className="text-gray-600">Ticket Type</Label>
                <p className="font-medium">{ticket.ticketType.name}</p>
              </div>
              <div>
                <Label className="text-gray-600">Holder</Label>
                <p className="font-medium">{ticket.holder.fullName}</p>
                <p className="text-xs text-gray-500">{ticket.holder.email}</p>
              </div>
              <div>
                <Label className="text-gray-600">Status</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={ticket.checkedIn ? "default" : "secondary"}
                    className={
                      ticket.checkedIn
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {ticket.checkedIn ? "Checked In" : "Not Checked In"}
                  </Badge>
                </div>
                {ticket.checkInTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatDate(ticket.checkInTime)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MagicCard>
  );
}

function ScanHistoryItem({ result }: { result: ScanResult }) {
  const isSuccess = result.success;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      isSuccess
        ? "bg-green-50 border-green-200"
        : "bg-red-50 border-red-200"
    )}>
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isSuccess ? "text-green-800" : "text-red-800"
        )}>
          {result.ticket?.holder.fullName || "Unknown"}
        </p>
        <p className={cn(
          "text-xs truncate",
          isSuccess ? "text-green-600" : "text-red-600"
        )}>
          {result.message}
        </p>
      </div>
      <div className="text-xs text-gray-500">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
