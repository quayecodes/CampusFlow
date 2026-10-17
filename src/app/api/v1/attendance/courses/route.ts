import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { attendanceService } from "@/services/attendanceService";

/**
 * GET /api/v1/attendance/courses
 * Returns all courses taught by the authenticated lecturer for attendance marking.
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

    if (session.user.role !== Role.LECTURER) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Only lecturers can access this endpoint." },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester") || "2026-Fall";

    const courses = await attendanceService.getLecturerCourses(
      session.user.id,
      semester
    );

    return NextResponse.json({
      data: { courses },
      error: null,
    });
  } catch (error) {
    console.error("Lecturer courses fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to retrieve lecturer courses." },
      },
      { status: 500 }
    );
  }
}
