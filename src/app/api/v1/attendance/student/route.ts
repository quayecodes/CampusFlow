import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { attendanceService } from "@/services/attendanceService";

/**
 * GET /api/v1/attendance/student
 * Returns attendance breakdown across all enrolled courses for the logged-in student.
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
          error: { message: "Only students can view student attendance." },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester") || "2026-Fall";

    const attendance = await attendanceService.getStudentAttendance(
      session.user.id,
      semester
    );

    return NextResponse.json({
      data: { attendance },
      error: null,
    });
  } catch (error) {
    console.error("Student attendance fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to fetch student attendance." },
      },
      { status: 500 }
    );
  }
}
