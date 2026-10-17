import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  assignmentService,
  AssignmentNotFoundError,
  NotEnrolledInCourseError,
  InvalidAssignmentDataError,
} from "@/services/assignmentService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/assignments/[id]/submit
 * Body: { fileUrl: string }
 * Submits work for an assignment. Enforces enrollment and automatically marks late submissions.
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

    if (session.user.role !== Role.STUDENT) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Only students can submit assignments." },
        },
        { status: 403 }
      );
    }

    const { id: assignmentId } = await params;
    const body = await request.json();
    const { fileUrl } = body;

    const submission = await assignmentService.submitAssignment({
      studentId: session.user.id,
      assignmentId,
      fileUrl,
    });

    return NextResponse.json(
      {
        data: {
          submission: {
            id: submission.id,
            fileUrl: submission.fileUrl,
            submittedAt: submission.submittedAt.toISOString(),
            isLate: submission.isLate,
          },
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AssignmentNotFoundError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 404 }
      );
    }

    if (error instanceof NotEnrolledInCourseError) {
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

    console.error("Assignment submission error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to submit assignment." },
      },
      { status: 500 }
    );
  }
}
