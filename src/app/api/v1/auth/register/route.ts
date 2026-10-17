import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { validateRegistrationInput } from "@/lib/auth/validation";
import { Role } from "@prisma/client";

/**
 * POST /api/v1/auth/register
 *
 * Registers a new user account with validated credentials and hashed password.
 * Follows the standard response envelope { data, error }.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate payload
    const validation = validateRegistrationInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Validation failed",
            details: validation.errors,
          },
        },
        { status: 400 }
      );
    }

    const email = (body.email as string).toLowerCase().trim();
    const fullName = (body.fullName as string).trim();
    const password = body.password as string;
    const role = body.role as Role;
    const departmentId = body.departmentId
      ? (body.departmentId as string)
      : null;
    const programId = body.programId ? (body.programId as string) : null;

    // 2. Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "An account with this email address already exists.",
          },
        },
        { status: 409 }
      );
    }

    // 3. Verify relations if IDs were supplied
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        return NextResponse.json(
          {
            data: null,
            error: { message: "Specified department not found." },
          },
          { status: 400 }
        );
      }
    }

    if (programId) {
      const program = await prisma.program.findUnique({
        where: { id: programId },
      });
      if (!program) {
        return NextResponse.json(
          {
            data: null,
            error: { message: "Specified program not found." },
          },
          { status: 400 }
        );
      }
    }

    // 4. Hash password with bcrypt (12 salt rounds)
    const passwordHash = await hashPassword(password);

    // 5. Create user record
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
        departmentId,
        programId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        departmentId: true,
        programId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        data: {
          user,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: "Internal server error during registration.",
        },
      },
      { status: 500 }
    );
  }
}
