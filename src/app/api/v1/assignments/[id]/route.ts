import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import {
  assignmentService,
  AssignmentNotFoundError,
  ForbiddenAssignmentError,
} from "@/services/assignmentService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/assignments/[id]
 * Retrieves details of a specific assignment. For lecturers, includes the submission roll.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Authentication required." } },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (session.user.role === Role.LECTURER) {
      const details = await assignmentService.getAssignmentDetailsForLecturer(
        id,
        session.user.id
      );
      return NextResponse.json({
        data: { assignment: details },
        error: null,
      });
    }

    return NextResponse.json(
      {
        data: null,
        error: { message: "Unauthorized access to assignment details." },
      },
      { status: 403 }
    );
  } catch (error) {
    if (error instanceof AssignmentNotFoundError) {
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

    console.error("Assignment details fetch error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: "Failed to fetch assignment details." },
      },
      { status: 500 }
    );
  }
}
