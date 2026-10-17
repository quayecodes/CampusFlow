import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { enrollmentService } from "@/services/enrollmentService";
import { Role } from "@prisma/client";

/**
 * PATCH /api/v1/enrollments/[id]/drop
 * Drops a student's active course enrollment (soft update status to DROPPED).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
            message: "Only students can drop their course enrollments.",
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const dropped = await enrollmentService.dropEnrollment(id, session.user.id);

    return NextResponse.json({
      data: { enrollment: dropped },
      error: null,
    });
  } catch (error) {
    console.error("Drop enrollment error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to drop enrollment.";
    return NextResponse.json(
      {
        data: null,
        error: { message },
      },
      { status: 400 }
    );
  }
}
