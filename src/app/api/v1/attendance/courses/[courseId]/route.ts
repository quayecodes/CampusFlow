import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  attendanceService,
  CourseNotFoundError,
  ForbiddenAttendanceError,
  InvalidAttendanceDataError,
} from "@/services/attendanceService";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/v1/attendance/courses/[courseId]?date=YYYY-MM-DD
 * Retrieves attendance roster for a specific date and course.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Authentication required." } },
        { status: 401 }
      );
    }

    if (session.user.role !== Role.LECTURER) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Only lecturers can view course attendance." },
        },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || undefined;

    const roster = await attendanceService.getCourseRoster(
      courseId,
      session.user.id,
      dateStr
    );

    return NextResponse.json({
      data: { roster },
      error: null,
    });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 404 }
      );
    }

    if (error instanceof ForbiddenAttendanceError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 403 }
      );
    }

    if (error instanceof InvalidAttendanceDataError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 400 }
      );
    }

    console.error("Course roster fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Internal server error fetching attendance roster." },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/attendance/courses/[courseId]
 * Body: { date: "YYYY-MM-DD", records: [{ enrollmentId: string, status: "PRESENT"|"ABSENT"|"LATE" }] }
 * Saves or updates attendance for a course session.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Authentication required." } },
        { status: 401 }
      );
    }

    if (session.user.role !== Role.LECTURER) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Only lecturers can mark course attendance." },
        },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();
    const { date, records } = body;

    if (!date || typeof date !== "string") {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Valid date string (YYYY-MM-DD) is required." },
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Records array with at least one entry is required.",
          },
        },
        { status: 400 }
      );
    }

    const saved = await attendanceService.saveAttendanceSession(
      courseId,
      session.user.id,
      date,
      records
    );

    return NextResponse.json({
      data: {
        savedCount: saved.length,
        sessionDate: date,
      },
      error: null,
    });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 404 }
      );
    }

    if (error instanceof ForbiddenAttendanceError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 403 }
      );
    }

    if (error instanceof InvalidAttendanceDataError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 400 }
      );
    }

    console.error("Attendance save error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to save attendance session." },
      },
      { status: 500 }
    );
  }
}
