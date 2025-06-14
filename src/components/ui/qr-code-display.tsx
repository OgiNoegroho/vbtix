"use client";

import { useState, useEffect } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  QrCode,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { cn } from "~/lib/utils";

export interface QRCodeDisplayProps {
  ticketId: string;
  qrCodeImageUrl?: string;
  status?: "PENDING" | "GENERATED" | "ACTIVE" | "USED" | "EXPIRED";
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onDownload?: () => void;
  className?: string;
  showControls?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  PENDING: {
    label: "Generating",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  GENERATED: {
    label: "Generated",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  USED: {
    label: "Used",
    color: "bg-gray-100 text-gray-800",
    icon: CheckCircle,
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
};

const sizeConfig = {
  sm: {
    container: "w-48 h-48",
    qr: "w-32 h-32",
    text: "text-sm",
  },
  md: {
    container: "w-64 h-64",
    qr: "w-48 h-48",
    text: "text-base",
  },
  lg: {
    container: "w-80 h-80",
    qr: "w-64 h-64",
    text: "text-lg",
  },
};

export function QRCodeDisplay({
  ticketId,
  qrCodeImageUrl,
  status = "PENDING",
  isLoading = false,
  error,
  onRefresh,
  onDownload,
  className,
  showControls = true,
  size = "md",
}: QRCodeDisplayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const statusInfo = statusConfig[status];
  const sizeInfo = sizeConfig[size];

  useEffect(() => {
    if (qrCodeImageUrl) {
      setImageLoaded(false);
    }
  }, [qrCodeImageUrl]);

  const handleDownload = () => {
    if (qrCodeImageUrl && onDownload) {
      onDownload();
    } else if (qrCodeImageUrl) {
      // Default download behavior
      const link = document.createElement("a");
      link.href = qrCodeImageUrl;
      link.download = `ticket-${ticketId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <MagicCard
      className={cn(
        "border-0 bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all duration-300",
        sizeInfo.container,
        className
      )}
      gradientColor="rgba(59, 130, 246, 0.1)"
    >
      <div className="p-6 flex flex-col items-center justify-center h-full space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={statusInfo.color}>
            <statusInfo.icon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
          {showControls && onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
            </Button>
          )}
        </div>

        {/* QR Code Display Area */}
        <div className={cn("relative flex items-center justify-center", sizeInfo.qr)}>
          {isLoading ? (
            <div className="flex flex-col items-center space-y-2">
              <Skeleton className={cn("rounded-lg", sizeInfo.qr)} />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-2 text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className={cn("text-red-600", sizeInfo.text)}>{error}</p>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          ) : qrCodeImageUrl ? (
            <div className="relative">
              {!imageLoaded && (
                <Skeleton className={cn("absolute inset-0 rounded-lg", sizeInfo.qr)} />
              )}
              <img
                src={qrCodeImageUrl}
                alt={`QR Code for ticket ${ticketId}`}
                className={cn(
                  "rounded-lg border transition-opacity duration-300",
                  sizeInfo.qr,
                  imageLoaded ? "opacity-100" : "opacity-0",
                  !isVisible && "blur-sm"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
              {!isVisible && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                  <EyeOff className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-center">
              <QrCode className="w-12 h-12 text-gray-400" />
              <p className={cn("text-gray-500", sizeInfo.text)}>
                {status === "PENDING" ? "QR Code will be generated after payment verification" : "QR Code not available"}
              </p>
              {status === "PENDING" && (
                <p className={cn("text-xs text-gray-400", sizeInfo.text)}>
                  Please wait for organizer approval
                </p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && qrCodeImageUrl && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="flex-1"
            >
              {isVisible ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        )}

        {/* Ticket ID */}
        <p className="text-xs text-gray-500 font-mono">
          {ticketId.slice(-8)}
        </p>
      </div>
    </MagicCard>
  );
}

/**
 * Compact QR Code display for lists
 */
export function QRCodeDisplayCompact({
  ticketId,
  qrCodeImageUrl,
  status = "PENDING",
  className,
  onClick,
}: Pick<QRCodeDisplayProps, "ticketId" | "qrCodeImageUrl" | "status" | "className"> & {
  onClick?: () => void;
}) {
  const statusInfo = statusConfig[status];

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        onClick && "cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors",
        className
      )}
      onClick={onClick}
    >
      <div className="w-8 h-8 flex items-center justify-center border rounded">
        {qrCodeImageUrl ? (
          <img
            src={qrCodeImageUrl}
            alt={`QR Code for ticket ${ticketId}`}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <QrCode className={cn(
            "w-4 h-4",
            status === "PENDING" ? "text-orange-400" : "text-gray-400"
          )} />
        )}
      </div>
      <Badge variant="secondary" className={cn("text-xs", statusInfo.color)}>
        <statusInfo.icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
      {onClick && qrCodeImageUrl && (
        <Eye className="w-3 h-3 text-gray-400 ml-1" />
      )}
    </div>
  );
}
