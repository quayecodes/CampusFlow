import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { AnnouncementScope } from "@prisma/client";
import {
  announcementService,
  ForbiddenAnnouncementError,
  InvalidAnnouncementDataError,
} from "@/services/announcementService";

/**
 * GET /api/v1/announcements?scope=...
 * Returns the unified announcement feed tailored to the authenticated user's role and scopes (FR18).
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Authentication required." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scopeParam = searchParams.get("scope");
    let filterScope: AnnouncementScope | undefined = undefined;

    if (
      scopeParam === "UNIVERSITY" ||
      scopeParam === "DEPARTMENT" ||
      scopeParam === "COURSE"
    ) {
      filterScope = scopeParam as AnnouncementScope;
    }

    const announcements = await announcementService.getUserAnnouncementFeed(
      session.user.id,
      filterScope
    );

    return NextResponse.json({
      data: { announcements },
      error: null,
    });
  } catch (error) {
    if (error instanceof ForbiddenAnnouncementError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 403 }
      );
    }

    console.error("Announcements fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to retrieve announcements feed." },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/announcements
 * Body: { scope: "COURSE"|"DEPARTMENT"|"UNIVERSITY", scopeId?: string, title: string, body: string }
 * Creates an announcement with strict role and scope validation (FR15, FR16, FR17).
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Authentication required." } },
        { status: 401 }
      );
    }

    const reqBody = await request.json();
    const { scope, scopeId, title, body } = reqBody;

    if (!scope) {
      return NextResponse.json(
        { data: null, error: { message: "Announcement scope is required." } },
        { status: 400 }
      );
    }

    const announcement = await announcementService.createAnnouncement({
      authorId: session.user.id,
      scope,
      scopeId,
      title,
      body,
    });

    return NextResponse.json(
      {
        data: { announcement },
        error: null,
      },
      { status: 201 }
    );
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
        { status: 400 }
      );
    }

    console.error("Announcement creation error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to create announcement." },
      },
      { status: 500 }
    );
  }
}
