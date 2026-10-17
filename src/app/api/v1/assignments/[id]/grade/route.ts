import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  assignmentService,
  SubmissionNotFoundError,
  ForbiddenAssignmentError,
  InvalidGradingError,
} from "@/services/assignmentService";

/**
 * PATCH /api/v1/assignments/[id]/grade
 * Body: { submissionId: string, score: number, feedback?: string }
 * Grades an assignment submission and records feedback (Lecturer only)
 */
export async function PATCH(request: Request) {
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
          error: { message: "Only lecturers can grade submissions." },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { submissionId, score, feedback } = body;

    const updated = await assignmentService.gradeSubmission({
      lecturerId: session.user.id,
      submissionId,
      score: Number(score),
      feedback,
    });

    return NextResponse.json({
      data: {
        submission: {
          id: updated.id,
          score: Number(updated.score),
          feedback: updated.feedback,
          gradedAt: updated.gradedAt ? updated.gradedAt.toISOString() : null,
        },
      },
      error: null,
    });
  } catch (error) {
    if (error instanceof SubmissionNotFoundError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 404 }
      );
    }

    if (error instanceof ForbiddenAssignmentError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 403 }
      );
    }

    if (error instanceof InvalidGradingError) {
      return NextResponse.json(
        { data: null, error: { message: error.message } },
        { status: 400 }
      );
    }

    console.error("Grading error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to grade submission." },
      },
      { status: 500 }
    );
  }
}
