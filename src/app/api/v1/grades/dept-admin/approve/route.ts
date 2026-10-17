import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  gradeService,
  CourseNotFoundError,
  ForbiddenGradeError,
} from "@/services/gradeService";

/**
 * POST /api/v1/grades/dept-admin/approve
 * Body: { courseId: string }
 * Approves and publishes all student grades for a course (Dept Admin only - FR12)
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

    if (session.user.role !== Role.DEPT_ADMIN) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message:
              "Only Department Administrators can approve and publish grades.",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json(
        { data: null, error: { message: "Valid courseId is required." } },
        { status: 400 }
      );
    }

    const result = await gradeService.approveAndPublishCourseGrades(
      courseId,
      session.user.id
    );

    return NextResponse.json({
      data: {
        publishedCount: result.publishedCount,
        approvedAt: result.approvedAt,
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

    console.error("Approve grades error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to approve and publish grades." },
      },
      { status: 500 }
    );
  }
}
