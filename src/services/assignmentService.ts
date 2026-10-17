import { prisma } from "@/lib/prisma";
import { EnrollmentStatus, Prisma } from "@prisma/client";

export class AssignmentNotFoundError extends Error {
  constructor(message = "Assignment not found.") {
    super(message);
    this.name = "AssignmentNotFoundError";
  }
}

export class SubmissionNotFoundError extends Error {
  constructor(message = "Submission not found.") {
    super(message);
    this.name = "SubmissionNotFoundError";
  }
}

export class ForbiddenAssignmentError extends Error {
  constructor(
    message = "You are not authorized to manage assignments or grades for this course."
  ) {
    super(message);
    this.name = "ForbiddenAssignmentError";
  }
}

export class InvalidAssignmentDataError extends Error {
  constructor(message = "Invalid assignment data provided.") {
    super(message);
    this.name = "InvalidAssignmentDataError";
  }
}

export class InvalidGradingError extends Error {
  constructor(message = "Invalid score or grading values provided.") {
    super(message);
    this.name = "InvalidGradingError";
  }
}

export class NotEnrolledInCourseError extends Error {
  constructor(
    message = "Student is not enrolled in the course for this assignment."
  ) {
    super(message);
    this.name = "NotEnrolledInCourseError";
  }
}

export interface CreateAssignmentDTO {
  lecturerId: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate: string | Date;
  maxScore: number;
}

export interface GradeSubmissionDTO {
  lecturerId: string;
  submissionId: string;
  score: number;
  feedback?: string;
}

export interface SubmitAssignmentDTO {
  studentId: string;
  assignmentId: string;
  fileUrl: string;
  submittedAt?: Date;
}

export const assignmentService = {
  /**
   * Creates a new assignment for a course taught by the lecturer
   */
  async createAssignment(data: CreateAssignmentDTO) {
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new InvalidAssignmentDataError("Course does not exist.");
    }

    if (course.lecturerId !== data.lecturerId) {
      throw new ForbiddenAssignmentError(
        "Only the instructor of this course can create assignments."
      );
    }

    if (!data.title || data.title.trim().length === 0) {
      throw new InvalidAssignmentDataError("Assignment title is required.");
    }

    const dueDate = new Date(data.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new InvalidAssignmentDataError("A valid due date is required.");
    }

    if (typeof data.maxScore !== "number" || data.maxScore <= 0) {
      throw new InvalidAssignmentDataError("Max score must be greater than 0.");
    }

    return prisma.assignment.create({
      data: {
        courseId: data.courseId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        dueDate,
        maxScore: new Prisma.Decimal(data.maxScore),
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });
  },

  /**
   * Retrieves assignments created by a lecturer, with submission and grading metrics
   */
  async getLecturerAssignments(lecturerId: string, courseId?: string) {
    const whereClause: Prisma.AssignmentWhereInput = {
      course: { lecturerId },
      ...(courseId ? { courseId } : {}),
    };

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            _count: {
              select: {
                enrollments: {
                  where: { status: EnrollmentStatus.ENROLLED },
                },
              },
            },
          },
        },
        submissions: {
          select: {
            id: true,
            isLate: true,
            score: true,
          },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    return assignments.map((a) => {
      const totalEnrolled = a.course._count.enrollments;
      const totalSubmissions = a.submissions.length;
      const gradedCount = a.submissions.filter((s) => s.score !== null).length;
      const lateCount = a.submissions.filter((s) => s.isLate).length;
      const pendingGradingCount = totalSubmissions - gradedCount;

      return {
        id: a.id,
        courseId: a.course.id,
        courseTitle: a.course.title,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate.toISOString(),
        maxScore: Number(a.maxScore),
        metrics: {
          totalEnrolled,
          totalSubmissions,
          gradedCount,
          pendingGradingCount,
          lateCount,
        },
      };
    });
  },

  /**
   * Retrieves an assignment along with all student submissions for a lecturer
   */
  async getAssignmentDetailsForLecturer(
    assignmentId: string,
    lecturerId: string
  ) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            lecturerId: true,
            enrollments: {
              where: { status: EnrollmentStatus.ENROLLED },
              include: {
                student: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
          },
        },
        submissions: {
          include: {
            student: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new AssignmentNotFoundError();
    }

    if (assignment.course.lecturerId !== lecturerId) {
      throw new ForbiddenAssignmentError();
    }

    const submissionMap = new Map(
      assignment.submissions.map((s) => [s.studentId, s])
    );

    const studentRoll = assignment.course.enrollments.map((enr) => {
      const sub = submissionMap.get(enr.student.id);
      return {
        studentId: enr.student.id,
        studentName: enr.student.fullName,
        studentEmail: enr.student.email,
        submission: sub
          ? {
              id: sub.id,
              fileUrl: sub.fileUrl,
              submittedAt: sub.submittedAt.toISOString(),
              isLate: sub.isLate,
              score: sub.score !== null ? Number(sub.score) : null,
              feedback: sub.feedback,
              gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : null,
            }
          : null,
      };
    });

    return {
      id: assignment.id,
      courseId: assignment.course.id,
      courseTitle: assignment.course.title,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.toISOString(),
      maxScore: Number(assignment.maxScore),
      students: studentRoll,
    };
  },

  /**
   * Grades a student's submission and records optional qualitative feedback
   */
  async gradeSubmission(data: GradeSubmissionDTO) {
    const submission = await prisma.submission.findUnique({
      where: { id: data.submissionId },
      include: {
        assignment: {
          include: {
            course: { select: { lecturerId: true } },
          },
        },
      },
    });

    if (!submission) {
      throw new SubmissionNotFoundError();
    }

    if (submission.assignment.course.lecturerId !== data.lecturerId) {
      throw new ForbiddenAssignmentError(
        "Only the course lecturer can grade this submission."
      );
    }

    const maxScore = Number(submission.assignment.maxScore);
    if (
      typeof data.score !== "number" ||
      isNaN(data.score) ||
      data.score < 0 ||
      data.score > maxScore
    ) {
      throw new InvalidGradingError(
        `Score must be between 0 and maximum possible score of ${maxScore}.`
      );
    }

    return prisma.submission.update({
      where: { id: data.submissionId },
      data: {
        score: new Prisma.Decimal(data.score),
        feedback: data.feedback?.trim() || null,
        gradedAt: new Date(),
      },
    });
  },

  /**
   * Retrieves assignments for courses where the student is actively enrolled
   */
  async getStudentAssignments(studentId: string, courseId?: string) {
    // 1. Get all active course enrollments for this student
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        status: EnrollmentStatus.ENROLLED,
        ...(courseId ? { courseId } : {}),
      },
      select: { courseId: true },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    if (enrolledCourseIds.length === 0) {
      return [];
    }

    // 2. Fetch assignments for these courses
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: enrolledCourseIds },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            lecturer: { select: { fullName: true } },
          },
        },
        submissions: {
          where: { studentId },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return assignments.map((a) => {
      const sub = a.submissions.length > 0 ? a.submissions[0] : null;
      const isOverdue = !sub && new Date() > a.dueDate;

      let status: "NOT_SUBMITTED" | "SUBMITTED" | "GRADED" | "OVERDUE" =
        "NOT_SUBMITTED";
      if (sub) {
        status = sub.score !== null ? "GRADED" : "SUBMITTED";
      } else if (isOverdue) {
        status = "OVERDUE";
      }

      return {
        id: a.id,
        courseId: a.course.id,
        courseTitle: a.course.title,
        lecturerName: a.course.lecturer.fullName,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate.toISOString(),
        maxScore: Number(a.maxScore),
        status,
        submission: sub
          ? {
              id: sub.id,
              fileUrl: sub.fileUrl,
              submittedAt: sub.submittedAt.toISOString(),
              isLate: sub.isLate,
              score: sub.score !== null ? Number(sub.score) : null,
              feedback: sub.feedback,
              gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : null,
            }
          : null,
      };
    });
  },

  /**
   * Submits a file for an assignment, automatically checking and flagging late submissions
   */
  async submitAssignment(data: SubmitAssignmentDTO) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
    });

    if (!assignment) {
      throw new AssignmentNotFoundError();
    }

    // Verify student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: data.studentId,
        courseId: assignment.courseId,
        status: EnrollmentStatus.ENROLLED,
      },
    });

    if (!enrollment) {
      throw new NotEnrolledInCourseError();
    }

    if (!data.fileUrl || data.fileUrl.trim().length === 0) {
      throw new InvalidAssignmentDataError("File submission URL is required.");
    }

    const submittedAt = data.submittedAt || new Date();

    // FR10: System flags and logs late submissions
    const isLate = submittedAt.getTime() > assignment.dueDate.getTime();

    return prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: data.assignmentId,
          studentId: data.studentId,
        },
      },
      update: {
        fileUrl: data.fileUrl.trim(),
        submittedAt,
        isLate,
      },
      create: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        fileUrl: data.fileUrl.trim(),
        submittedAt,
        isLate,
      },
    });
  },
};
