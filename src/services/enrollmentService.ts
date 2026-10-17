import { prisma } from "@/lib/prisma";
import { EnrollmentStatus } from "@prisma/client";

export class EnrollmentCapacityError extends Error {
  constructor(message = "Course has reached maximum enrollment capacity.") {
    super(message);
    this.name = "EnrollmentCapacityError";
  }
}

export class DuplicateEnrollmentError extends Error {
  constructor(
    message = "Student is already enrolled in this course for this semester."
  ) {
    super(message);
    this.name = "DuplicateEnrollmentError";
  }
}

export class CourseNotFoundError extends Error {
  constructor(message = "Course not found.") {
    super(message);
    this.name = "CourseNotFoundError";
  }
}

/**
 * Enrollment Service
 * Encapsulates transactional registration logic and capacity locking.
 * Separated from HTTP layer for testability.
 */
export const enrollmentService = {
  /**
   * Retrieves all courses for a given semester with live enrollment metrics
   * and student enrollment indicators.
   */
  async getCoursesWithEnrollmentStats(semester: string, studentId?: string) {
    const courses = await prisma.course.findMany({
      where: { semester },
      include: {
        department: { select: { id: true, name: true } },
        lecturer: { select: { id: true, fullName: true, email: true } },
        enrollments: {
          where: { semester, status: EnrollmentStatus.ENROLLED },
          select: { id: true, studentId: true, status: true },
        },
      },
      orderBy: { title: "asc" },
    });

    return courses.map((course) => {
      const activeEnrollmentCount = course.enrollments.length;
      const isEnrolled = studentId
        ? course.enrollments.some((e) => e.studentId === studentId)
        : false;
      const isFull = activeEnrollmentCount >= course.maxCapacity;

      return {
        id: course.id,
        title: course.title,
        creditHours: course.creditHours,
        maxCapacity: course.maxCapacity,
        semester: course.semester,
        department: course.department,
        lecturer: course.lecturer,
        activeEnrollmentCount,
        availableSeats: Math.max(0, course.maxCapacity - activeEnrollmentCount),
        isFull,
        isEnrolled,
      };
    });
  },

  /**
   * Retrieves all active enrollments for a specific student in a semester.
   */
  async getStudentEnrollments(studentId: string, semester?: string) {
    return prisma.enrollment.findMany({
      where: {
        studentId,
        ...(semester ? { semester } : {}),
      },
      include: {
        course: {
          include: {
            lecturer: { select: { fullName: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
  },

  /**
   * Enrolls a student into a course using an interactive database transaction.
   *
   * Race-Condition & Capacity Safety:
   * 1. Runs within an interactive database transaction (`prisma.$transaction`).
   * 2. Checks if an active enrollment already exists (enforces uniqueness).
   * 3. Counts current active enrollments inside the transaction boundary.
   * 4. Aborts transaction with `EnrollmentCapacityError` if count >= maxCapacity.
   * 5. If previously DROPPED, re-activates existing enrollment row; otherwise creates fresh record.
   */
  async enrollStudent(studentId: string, courseId: string, semester: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch course details
      const course = await tx.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new CourseNotFoundError();
      }

      // 2. Check existing enrollment for this student
      const existing = await tx.enrollment.findUnique({
        where: {
          studentId_courseId_semester: {
            studentId,
            courseId,
            semester,
          },
        },
      });

      if (existing && existing.status === EnrollmentStatus.ENROLLED) {
        throw new DuplicateEnrollmentError();
      }

      // 3. Count current active enrollments inside transaction
      const activeCount = await tx.enrollment.count({
        where: {
          courseId,
          semester,
          status: EnrollmentStatus.ENROLLED,
        },
      });

      // 4. Enforce capacity limit
      if (activeCount >= course.maxCapacity) {
        throw new EnrollmentCapacityError(
          `Course ${course.title} is full (${activeCount}/${course.maxCapacity} seats taken).`
        );
      }

      // 5. Commit enrollment
      if (existing && existing.status === EnrollmentStatus.DROPPED) {
        // Re-activate dropped enrollment
        return tx.enrollment.update({
          where: { id: existing.id },
          data: {
            status: EnrollmentStatus.ENROLLED,
            enrolledAt: new Date(),
          },
          include: { course: true },
        });
      }

      return tx.enrollment.create({
        data: {
          studentId,
          courseId,
          semester,
          status: EnrollmentStatus.ENROLLED,
        },
        include: { course: true },
      });
    });
  },

  /**
   * Drops an enrolled course.
   * Soft-updates status to DROPPED so academic history, attendance,
   * and audit logs are never deleted.
   */
  async dropEnrollment(enrollmentId: string, studentId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new Error("Enrollment record not found.");
    }

    if (enrollment.studentId !== studentId) {
      throw new Error("Unauthorized to drop another student's enrollment.");
    }

    if (enrollment.status === EnrollmentStatus.DROPPED) {
      throw new Error("Course is already dropped.");
    }

    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: EnrollmentStatus.DROPPED,
      },
    });
  },
};
