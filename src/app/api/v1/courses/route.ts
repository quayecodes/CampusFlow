import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { enrollmentService } from "@/services/enrollmentService";

/**
 * GET /api/v1/courses?semester=2026-Fall
 *
 * Retrieves available courses with capacity metrics and student enrollment state.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester") || "2026-Fall";
    const studentId = session?.user?.id;

    const courses = await enrollmentService.getCoursesWithEnrollmentStats(
      semester,
      studentId
    );

    return NextResponse.json({
      data: { courses },
      error: null,
    });
  } catch (error) {
    console.error("Courses fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to retrieve courses." },
      },
      { status: 500 }
    );
  }
}
