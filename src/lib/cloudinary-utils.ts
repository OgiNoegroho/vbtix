// ~/lib/cloudinary-utils.ts
import cloudinary from "./cloudinary";
import { v4 as uuidv4 } from "uuid";

/**
 * Standard response format for Cloudinary uploads
 */
export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
}

/**
 * Upload an image to Cloudinary from the server
 * @param {Buffer} file - The file buffer to upload
 * @param {string} folder - The folder to upload to in Cloudinary
 * @param {object} options - Additional upload options
 * @returns {Promise<UploadResult>} - The upload result with image URL and details
 */
export async function uploadImage(
  file: Buffer,
  folder = "vbticket",
  options: {
    publicId?: string;
    transformation?: Record<string, any>;
  } = {},
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // Generate a unique ID if not provided
    const publicId = options.publicId || uuidv4();

    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: "auto",
          transformation: options.transformation,
        },
        (error, result) => {
          if (error || !result)
            return reject(error || new Error("Upload failed"));
          resolve(result as UploadResult);
        },
      )
      .end(file);
  });
}

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

/**
 * Generate a Cloudinary URL with transformations
 * @param {string} publicId - The public_id of the image
 * @param {object} options - Transformation options
 * @returns {string} - Transformed image URL
 */
export function getImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  } = {},
): string {
  if (!publicId) return "";

  return cloudinary.url(publicId, {
    secure: true,
    width: options.width,
    height: options.height,
    crop: options.crop || "fill",
    quality: options.quality || "auto",
    fetch_format: options.format || "auto",
  });
}
