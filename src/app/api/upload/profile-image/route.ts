import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { uploadImage } from "~/lib/cloudinary-utils";

/**
 * POST /api/upload/profile-image
 * Upload a profile image to Cloudinary
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const customFolder = formData.get("folder") as string;
    
    // Use the provided folder or default to profiles folder
    const folder = customFolder || "vbticket/profiles";
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using standardized utility
    const result = await uploadImage(buffer, folder);

    // Return standardized response
    return NextResponse.json({
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error: any) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload profile image" },
      { status: 500 }
    );
  }
}
