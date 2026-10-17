import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  assignmentService,
  ForbiddenAssignmentError,
  InvalidAssignmentDataError,
} from "@/services/assignmentService";

/**
 * GET /api/v1/assignments?courseId=...
 * Returns assignments tailored to the caller role (Lecturer or Student)
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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") || undefined;

    if (session.user.role === Role.LECTURER) {
      const assignments = await assignmentService.getLecturerAssignments(
        session.user.id,
        courseId
      );
      return NextResponse.json({
        data: { assignments },
        error: null,
      });
    }

    if (session.user.role === Role.STUDENT) {
      const assignments = await assignmentService.getStudentAssignments(
        session.user.id,
        courseId
      );
      return NextResponse.json({
        data: { assignments },
        error: null,
      });
    }

    return NextResponse.json(
      {
        data: null,
        error: {
          message: "Only lecturers and students can access assignments.",
        },
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("Assignments fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to retrieve assignments." },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/assignments
 * Body: { courseId: string, title: string, description?: string, dueDate: string, maxScore: number }
 * Creates a new course assignment (Lecturers only)
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

    if (session.user.role !== Role.LECTURER) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Only lecturers can create assignments." },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId, title, description, dueDate, maxScore } = body;

    const assignment = await assignmentService.createAssignment({
      lecturerId: session.user.id,
      courseId,
      title,
      description,
      dueDate,
      maxScore: Number(maxScore),
    });

    return NextResponse.json(
      {
        data: { assignment },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ForbiddenAssignmentError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 403 }
      );
    }

    if (error instanceof InvalidAssignmentDataError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 400 }
      );
    }

    console.error("Assignment creation error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to create assignment." },
      },
      { status: 500 }
    );
  }
}
