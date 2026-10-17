import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  gradeService,
  CourseNotFoundError,
  ForbiddenGradeError,
} from "@/services/gradeService";

/**
 * GET /api/v1/grades/dept-admin/audit?courseId=...
 * Retrieves audit log history of post-publication grade changes (FR14)
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

    if (session.user.role !== Role.DEPT_ADMIN) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message:
              "Only Department Administrators can inspect grade audit logs.",
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { data: null, error: { message: "Query param courseId is required." } },
        { status: 400 }
      );
    }

    const logs = await gradeService.getGradeAuditLogs(
      courseId,
      session.user.id
    );

    return NextResponse.json({
      data: { logs },
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

    console.error("Grade audit logs fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to retrieve grade audit logs." },
      },
      { status: 500 }
    );
  }
}
