import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { gradeService } from "@/services/gradeService";

/**
 * GET /api/v1/grades/student?semester=...
 * Returns published course results and computed GPA for the authenticated student (FR13).
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

    if (session.user.role !== Role.STUDENT) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Only students can access student results." },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester") || "2026-Fall";

    const results = await gradeService.getStudentResultsAndGPA(
      session.user.id,
      semester
    );

    return NextResponse.json({
      data: { results },
      error: null,
    });
  } catch (error) {
    console.error("Student results fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to retrieve student results." },
      },
      { status: 500 }
    );
  }
}
