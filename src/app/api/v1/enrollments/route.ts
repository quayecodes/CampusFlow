import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  enrollmentService,
  EnrollmentCapacityError,
  DuplicateEnrollmentError,
  CourseNotFoundError,
} from "@/services/enrollmentService";
import { Role } from "@prisma/client";

/**
 * GET /api/v1/enrollments
 * Retrieves the authenticated student's active enrollments.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Unauthorized. Please log in." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester") || undefined;

    const enrollments = await enrollmentService.getStudentEnrollments(
      session.user.id,
      semester
    );

    return NextResponse.json({
      data: { enrollments },
      error: null,
    });
  } catch (error) {
    console.error("Fetch enrollments error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to fetch student enrollments." },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/enrollments
 * Body: { courseId: string, semester: string }
 *
 * Enrolls a student in a course inside an interactive transaction,
 * enforcing seat capacity limits and preventing duplicate registrations.
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

    if (session.user.role !== Role.STUDENT) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Only students are eligible to enroll in courses.",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId, semester } = body;

    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json(
        { data: null, error: { message: "Valid courseId is required." } },
        { status: 400 }
      );
    }

    const sem =
      semester && typeof semester === "string" ? semester : "2026-Fall";

    const enrollment = await enrollmentService.enrollStudent(
      session.user.id,
      courseId,
      sem
    );

    return NextResponse.json(
      {
        data: { enrollment },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof EnrollmentCapacityError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 409 }
      );
    }

    if (error instanceof DuplicateEnrollmentError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 409 }
      );
    }

    if (error instanceof CourseNotFoundError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 404 }
      );
    }

    console.error("Course enrollment transaction error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Internal server error during course enrollment." },
      },
      { status: 500 }
    );
  }
}
