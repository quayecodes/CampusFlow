import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { gradeService, ForbiddenGradeError } from "@/services/gradeService";

/**
 * GET /api/v1/grades/dept-admin/queue
 * Retrieves department courses pending grade approval and publication.
 */
export async function GET() {
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
              "Only Department Administrators can access the approval queue.",
          },
        },
        { status: 403 }
      );
    }

    const queue = await gradeService.getDepartmentApprovalQueue(
      session.user.id
    );

    return NextResponse.json({
      data: { queue },
      error: null,
    });
  } catch (error) {
    if (error instanceof ForbiddenGradeError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 403 }
      );
    }

    console.error("Grade approval queue fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to retrieve grade approval queue." },
      },
      { status: 500 }
    );
  }
}
