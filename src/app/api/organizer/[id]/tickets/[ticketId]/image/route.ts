import { NextRequest, NextResponse } from "next/server";
import { ticketService } from "~/server/services/ticket.service";
import { uploadImage } from "~/lib/cloudinary-utils";
import { validateOrganizerTicketAccess } from "~/lib/auth/organizer-auth";

/**
 * PUT /api/organizer/[id]/tickets/[ticketId]/image
 * Update a ticket image
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> },
) {
  try {
    const { id: organizerId, ticketId } = await params;

    // Use enhanced authorization utility
    const authResult = await validateOrganizerTicketAccess(organizerId, ticketId);

    if (!authResult.success) {
      console.error("Authorization failed:", authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.statusCode || 403 },
      );
    }

    const { organizer, ticket } = authResult;
    console.log("Authorization successful for organizer:", organizer.orgName);

    // Check if the request is JSON or FormData
    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Handle JSON request (from client-side upload)
      const body = await request.json();
      imageUrl = body.imageUrl;
      imagePublicId = body.imagePublicId;

      if (!imageUrl || !imagePublicId) {
        return NextResponse.json(
          { success: false, error: "Missing image URL or public ID" },
          { status: 400 },
        );
      }
    } else {
      // Handle FormData request (direct upload)
      const formData = await request.formData();
      const file = formData.get("file") as File;

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
      const result = await uploadImage(buffer, "vbticket/tickets");

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    // Update ticket with image URL and public ID
    const updatedTicket = await ticketService.updateTicket(ticketId, {
      imageUrl,
      imagePublicId,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: updatedTicket.id,
        imageUrl: updatedTicket.imageUrl,
        imagePublicId: updatedTicket.imagePublicId,
      },
    });
  } catch (error: any) {
    console.error("Error updating ticket image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update ticket image",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/organizer/[id]/tickets/[ticketId]/image
 * Remove a ticket image
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> },
) {
  try {
    const { id: organizerId, ticketId } = await params;

    // Use enhanced authorization utility
    const authResult = await validateOrganizerTicketAccess(organizerId, ticketId);

    if (!authResult.success) {
      console.error("Authorization failed:", authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.statusCode || 403 },
      );
    }

    // Authorization already verified by validateOrganizerTicketAccess
    // Update ticket to remove image URL and public ID
    const updatedTicket = await ticketService.updateTicket(ticketId, {
      imageUrl: null,
      imagePublicId: null,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: updatedTicket.id,
      },
    });
  } catch (error: any) {
    console.error("Error removing ticket image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove ticket image",
      },
      { status: 500 },
    );
  }
}
