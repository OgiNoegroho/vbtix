import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { uploadImage } from "~/lib/cloudinary-utils";

/**
 * POST /api/upload/ticket-image
 * Upload a ticket image to Cloudinary
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only organizers and admins can upload ticket images
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const customFolder = formData.get("folder") as string;

    // Use the provided folder or default to tickets folder
    const folder = customFolder || "vbticket/tickets";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
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
    console.error("Error uploading ticket image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload ticket image",
      },
      { status: 500 },
    );
  }
}
