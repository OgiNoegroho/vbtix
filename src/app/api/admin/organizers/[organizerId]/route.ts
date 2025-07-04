import { NextRequest, NextResponse } from "next/server";
import {
  handleGetOrganizerById,
  handleDeleteOrganizer,
} from "~/server/api/admin-organizers";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/organizers/[organizerId]
 * Get organizer details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizerId: string }> },
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins can access this endpoint
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { organizerId } = await params;
    const organizer = await handleGetOrganizerById(organizerId);

    return NextResponse.json({
      success: true,
      data: organizer,
    });
  } catch (error: any) {
    const { organizerId } = await params;
    console.error(`Error getting organizer ${organizerId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get organizer",
      },
      { status: error.message === "Organizer not found" ? 404 : 500 },
    );
  }
}

/**
 * DELETE /api/admin/organizers/[organizerId]
 * Delete organizer by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organizerId: string }> },
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins can delete organizers
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { organizerId } = await params;
    await handleDeleteOrganizer(organizerId);

    return NextResponse.json({
      success: true,
      message: "Organizer deleted successfully",
    });
  } catch (error: any) {
    const { organizerId } = await params;
    console.error(`Error deleting organizer ${organizerId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete organizer",
      },
      { status: error.message === "Organizer not found" ? 404 : 500 },
    );
  }
}
