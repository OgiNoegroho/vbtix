import QRCode from "qrcode";
import { randomBytes, createHash, createCipheriv, createDecipheriv } from "crypto";
import { env } from "~/env";

/**
 * QR Code data structure for tickets
 */
export interface TicketQRData {
  ticketId: string;
  eventId: string;
  userId: string;
  transactionId: string;
  ticketTypeId: string;
  issuedAt: string;
  expiresAt?: string;
  checksum: string;
}

/**
 * QR Code generation options
 */
export interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

/**
 * Default QR code generation options
 */
const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  width: 300,
  height: 300,
  margin: 2,
  color: {
    dark: "#000000",
    light: "#FFFFFF",
  },
  errorCorrectionLevel: "M",
};

/**
 * Encryption key for QR code data (should be from environment)
 */
const ENCRYPTION_KEY = env.QR_CODE_ENCRYPTION_KEY || "default-key-change-in-production-32-chars";
const ALGORITHM = "aes-256-cbc";

/**
 * Generate secure QR code data for a ticket
 */
export function generateQRCodeData(params: {
  ticketId: string;
  eventId: string;
  userId: string;
  transactionId: string;
  ticketTypeId: string;
  eventDate?: Date;
}): TicketQRData {
  const { ticketId, eventId, userId, transactionId, ticketTypeId, eventDate } = params;
  
  const issuedAt = new Date().toISOString();
  const expiresAt = eventDate ? new Date(eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined; // 24 hours after event
  
  // Create checksum for data integrity
  const dataToHash = `${ticketId}:${eventId}:${userId}:${transactionId}:${ticketTypeId}:${issuedAt}`;
  const checksum = createHash("sha256").update(dataToHash).digest("hex").substring(0, 16);
  
  return {
    ticketId,
    eventId,
    userId,
    transactionId,
    ticketTypeId,
    issuedAt,
    expiresAt,
    checksum,
  };
}

/**
 * Encrypt QR code data for secure storage
 */
export function encryptQRCodeData(data: TicketQRData): string {
  try {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Combine IV and encrypted data
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Error encrypting QR code data:", error);
    throw new Error("Failed to encrypt QR code data");
  }
}

/**
 * Decrypt QR code data for validation
 */
export function decryptQRCodeData(encryptedData: string): TicketQRData {
  try {
    const [ivHex, encrypted] = encryptedData.split(":");
    if (!ivHex || !encrypted) {
      throw new Error("Invalid encrypted data format");
    }
    
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return JSON.parse(decrypted) as TicketQRData;
  } catch (error) {
    console.error("Error decrypting QR code data:", error);
    throw new Error("Failed to decrypt QR code data");
  }
}

/**
 * Validate QR code data integrity
 */
export function validateQRCodeData(data: TicketQRData): boolean {
  try {
    // Check if expired
    if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
      return false;
    }
    
    // Verify checksum
    const dataToHash = `${data.ticketId}:${data.eventId}:${data.userId}:${data.transactionId}:${data.ticketTypeId}:${data.issuedAt}`;
    const expectedChecksum = createHash("sha256").update(dataToHash).digest("hex").substring(0, 16);
    
    return data.checksum === expectedChecksum;
  } catch (error) {
    console.error("Error validating QR code data:", error);
    return false;
  }
}

/**
 * Generate QR code image as base64 data URL
 */
export async function generateQRCodeImage(
  data: TicketQRData,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    // Encrypt the data before encoding in QR code
    const encryptedData = encryptQRCodeData(data);
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(encryptedData, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code image:", error);
    throw new Error("Failed to generate QR code image");
  }
}

/**
 * Generate QR code image as buffer (for file storage)
 */
export async function generateQRCodeBuffer(
  data: TicketQRData,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  try {
    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    // Encrypt the data before encoding in QR code
    const encryptedData = encryptQRCodeData(data);
    
    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(encryptedData, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    });
    
    return qrCodeBuffer;
  } catch (error) {
    console.error("Error generating QR code buffer:", error);
    throw new Error("Failed to generate QR code buffer");
  }
}

/**
 * Validate scanned QR code data
 */
export function validateScannedQRCode(encryptedData: string): {
  isValid: boolean;
  data?: TicketQRData;
  error?: string;
} {
  try {
    // Decrypt the data
    const data = decryptQRCodeData(encryptedData);
    
    // Validate the data
    const isValid = validateQRCodeData(data);
    
    if (!isValid) {
      return {
        isValid: false,
        error: "QR code data is invalid or expired",
      };
    }
    
    return {
      isValid: true,
      data,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid QR code format",
    };
  }
}

/**
 * Generate a simple QR code for public display (non-encrypted)
 */
export async function generateSimpleQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating simple QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}
