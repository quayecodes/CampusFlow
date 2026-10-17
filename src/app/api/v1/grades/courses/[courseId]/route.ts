import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  gradeService,
  CourseNotFoundError,
  ForbiddenGradeError,
  InvalidGradeDataError,
} from "@/services/gradeService";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/v1/grades/courses/[courseId]
 * Retrieves student grade sheet for a course (Lecturer only)
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
          error: { message: "Only lecturers can view course grade sheets." },
        },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const gradeSheet = await gradeService.getCourseGradeSheet(
      courseId,
      session.user.id
    );

    return NextResponse.json({
      data: { gradeSheet },
      error: null,
    });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 404 }
      );
    }

    if (error instanceof ForbiddenGradeError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 403 }
      );
    }

    console.error("Grade sheet fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to retrieve course grade sheet." },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/grades/courses/[courseId]
 * Body: { entries: [{ enrollmentId: string, finalScore: number }] }
 * Saves course grades entered by the lecturer. Automatically logs post-publication changes (FR14).
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
          error: { message: "Only lecturers can enter course grades." },
        },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    const body = await request.json();
    const { entries } = body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Entries array with at least one grade is required.",
          },
        },
        { status: 400 }
      );
    }

    const saved = await gradeService.saveCourseGrades(
      courseId,
      session.user.id,
      entries
    );

    return NextResponse.json({
      data: {
        savedCount: saved.length,
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

    if (error instanceof ForbiddenGradeError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 403 }
      );
    }

    if (error instanceof InvalidGradeDataError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 400 }
      );
    }

    console.error("Save grades error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to save course grades." },
      },
      { status: 500 }
    );
  }
}
