import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  announcementService,
  ForbiddenAnnouncementError,
  InvalidAnnouncementDataError,
} from "@/services/announcementService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/v1/announcements/[id]
 * Deletes an announcement with author/administrator permission checks.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Authentication required." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await announcementService.deleteAnnouncement(id, session.user.id);

    return NextResponse.json({
      data: { success: true },
      error: null,
    });
  } catch (error) {
    if (error instanceof ForbiddenAnnouncementError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 403 }
      );
    }

    if (error instanceof InvalidAnnouncementDataError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 404 }
      );
    }

    console.error("Announcement deletion error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to delete announcement." },
      },
      { status: 500 }
    );
  }
}
