import { prisma } from "@/lib/prisma";
import { EnrollmentStatus, GradeStatus, Prisma, Role } from "@prisma/client";

export class CourseNotFoundError extends Error {
  constructor(message = "Course not found.") {
    super(message);
    this.name = "CourseNotFoundError";
  }
}

export class ForbiddenGradeError extends Error {
  constructor(
    message = "You are not authorized to view or modify grades for this course."
  ) {
    super(message);
    this.name = "ForbiddenGradeError";
  }
}

export class InvalidGradeDataError extends Error {
  constructor(message = "Invalid grade data provided.") {
    super(message);
    this.name = "InvalidGradeDataError";
  }
}

/**
 * Standard university 4.0 GPA scale conversion
 */
export function calculateGradePoint(score: number): {
  letter: string;
  point: number;
} {
  if (score >= 80) return { letter: "A", point: 4.0 };
  if (score >= 75) return { letter: "B+", point: 3.5 };
  if (score >= 70) return { letter: "B", point: 3.0 };
  if (score >= 65) return { letter: "C+", point: 2.5 };
  if (score >= 60) return { letter: "C", point: 2.0 };
  if (score >= 55) return { letter: "D+", point: 1.5 };
  if (score >= 50) return { letter: "D", point: 1.0 };
  return { letter: "F", point: 0.0 };
}

export interface StudentGradeSheetEntry {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  finalScore: number | null;
  letterGrade: string | null;
  status: GradeStatus;
  approvedAt: string | null;
}

export interface CourseGradeSheet {
  courseId: string;
  courseTitle: string;
  creditHours: number;
  departmentId: string;
  departmentName: string;
  semester: string;
  status: GradeStatus; // Overall course grade status
  students: StudentGradeSheetEntry[];
  metrics: {
    totalEnrolled: number;
    gradesEnteredCount: number;
    classAverage: number | null;
    highestScore: number | null;
    lowestScore: number | null;
  };
}

export interface StudentGPAOverview {
  studentId: string;
  studentName: string;
  semester: string;
  totalRegisteredCredits: number;
  totalEarnedCredits: number;
  gpa: number;
  courses: Array<{
    courseId: string;
    courseTitle: string;
    creditHours: number;
    finalScore: number;
    letterGrade: string;
    gradePoint: number;
    status: GradeStatus;
  }>;
}

export const gradeService = {
  /**
   * Retrieves the grade sheet for a course taught by the lecturer
   */
  async getCourseGradeSheet(
    courseId: string,
    lecturerId: string
  ): Promise<CourseGradeSheet> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        department: { select: { id: true, name: true } },
        enrollments: {
          where: { status: EnrollmentStatus.ENROLLED },
          include: {
            student: { select: { id: true, fullName: true, email: true } },
            grade: true,
          },
          orderBy: { student: { fullName: "asc" } },
        },
      },
    });

    if (!course) {
      throw new CourseNotFoundError();
    }

    if (course.lecturerId !== lecturerId) {
      throw new ForbiddenGradeError(
        "Only the assigned lecturer can manage grades for this course."
      );
    }

    let overallStatus: GradeStatus = GradeStatus.DRAFT;
    const scores: number[] = [];

    const students: StudentGradeSheetEntry[] = course.enrollments.map((enr) => {
      const g = enr.grade;
      const finalScore =
        g && g.finalScore !== null ? Number(g.finalScore) : null;
      if (finalScore !== null) {
        scores.push(finalScore);
      }

      if (g?.status === GradeStatus.PUBLISHED) {
        overallStatus = GradeStatus.PUBLISHED;
      } else if (
        g?.status === GradeStatus.APPROVED &&
        overallStatus !== GradeStatus.PUBLISHED
      ) {
        overallStatus = GradeStatus.APPROVED;
      }

      return {
        enrollmentId: enr.id,
        studentId: enr.student.id,
        studentName: enr.student.fullName,
        studentEmail: enr.student.email,
        finalScore,
        letterGrade: g?.letterGrade || null,
        status: g?.status || GradeStatus.DRAFT,
        approvedAt: g?.approvedAt ? g.approvedAt.toISOString() : null,
      };
    });

    const classAverage =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
          10
        : null;

    return {
      courseId: course.id,
      courseTitle: course.title,
      creditHours: course.creditHours,
      departmentId: course.department.id,
      departmentName: course.department.name,
      semester: course.semester,
      status: overallStatus,
      students,
      metrics: {
        totalEnrolled: course.enrollments.length,
        gradesEnteredCount: scores.length,
        classAverage,
        highestScore: scores.length > 0 ? Math.max(...scores) : null,
        lowestScore: scores.length > 0 ? Math.min(...scores) : null,
      },
    };
  },

  /**
   * Saves or updates student grades entered by the lecturer.
   * If a grade was already PUBLISHED, logs changes to GradeChangeLog (FR14).
   */
  async saveCourseGrades(
    courseId: string,
    lecturerId: string,
    entries: Array<{ enrollmentId: string; finalScore: number }>
  ) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          where: { status: EnrollmentStatus.ENROLLED },
          select: { id: true },
        },
      },
    });

    if (!course) {
      throw new CourseNotFoundError();
    }

    if (course.lecturerId !== lecturerId) {
      throw new ForbiddenGradeError(
        "Only the assigned lecturer can enter grades."
      );
    }

    const validEnrollmentIds = new Set(course.enrollments.map((e) => e.id));

    // Validate entries
    for (const entry of entries) {
      if (!validEnrollmentIds.has(entry.enrollmentId)) {
        throw new InvalidGradeDataError(
          `Enrollment ${entry.enrollmentId} does not belong to this course.`
        );
      }
      if (
        typeof entry.finalScore !== "number" ||
        isNaN(entry.finalScore) ||
        entry.finalScore < 0 ||
        entry.finalScore > 100
      ) {
        throw new InvalidGradeDataError(
          `Final score must be a number between 0 and 100.`
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const entry of entries) {
        const { letter } = calculateGradePoint(entry.finalScore);
        const newScoreDecimal = new Prisma.Decimal(entry.finalScore);

        const existingGrade = await tx.grade.findUnique({
          where: { enrollmentId: entry.enrollmentId },
        });

        if (existingGrade) {
          // FR14: If previously published and score changed, log to GradeChangeLog
          if (
            existingGrade.status === GradeStatus.PUBLISHED &&
            existingGrade.finalScore !== null &&
            Number(existingGrade.finalScore) !== entry.finalScore
          ) {
            await tx.gradeChangeLog.create({
              data: {
                gradeId: existingGrade.id,
                changedById: lecturerId,
                oldScore: existingGrade.finalScore,
                newScore: newScoreDecimal,
              },
            });
          }

          const updated = await tx.grade.update({
            where: { id: existingGrade.id },
            data: {
              finalScore: newScoreDecimal,
              letterGrade: letter,
              // If previously published, it remains published with audit trail;
              // otherwise status stays DRAFT until approved
            },
          });
          results.push(updated);
        } else {
          // Create new draft grade
          const created = await tx.grade.create({
            data: {
              enrollmentId: entry.enrollmentId,
              finalScore: newScoreDecimal,
              letterGrade: letter,
              status: GradeStatus.DRAFT,
            },
          });
          results.push(created);
        }
      }

      return results;
    });
  },

  /**
   * Retrieves department courses with grades pending approval for Department Admins (FR12)
   */
  async getDepartmentApprovalQueue(deptAdminId: string) {
    const admin = await prisma.user.findUnique({
      where: { id: deptAdminId },
      include: { department: true },
    });

    if (!admin || admin.role !== Role.DEPT_ADMIN || !admin.departmentId) {
      throw new ForbiddenGradeError(
        "Only Department Administrators can view the grade approval queue."
      );
    }

    const courses = await prisma.course.findMany({
      where: {
        departmentId: admin.departmentId,
      },
      include: {
        lecturer: { select: { fullName: true, email: true } },
        enrollments: {
          where: { status: EnrollmentStatus.ENROLLED },
          include: { grade: true },
        },
      },
      orderBy: { title: "asc" },
    });

    return courses.map((c) => {
      const totalEnrolled = c.enrollments.length;
      const grades = c.enrollments
        .map((e) => e.grade)
        .filter((g): g is NonNullable<typeof g> => g !== null);
      const gradesEntered = grades.length;
      const draftCount = grades.filter(
        (g) => g.status === GradeStatus.DRAFT
      ).length;
      const publishedCount = grades.filter(
        (g) => g.status === GradeStatus.PUBLISHED
      ).length;

      let queueStatus: "READY_FOR_APPROVAL" | "PUBLISHED" | "NO_GRADES" =
        "NO_GRADES";
      if (publishedCount > 0 && draftCount === 0) {
        queueStatus = "PUBLISHED";
      } else if (gradesEntered > 0) {
        queueStatus = "READY_FOR_APPROVAL";
      }

      return {
        courseId: c.id,
        courseTitle: c.title,
        creditHours: c.creditHours,
        lecturerName: c.lecturer.fullName,
        semester: c.semester,
        departmentName: admin.department?.name || "Department",
        totalEnrolled,
        gradesEntered,
        draftCount,
        publishedCount,
        queueStatus,
      };
    });
  },

  /**
   * Approves and publishes grades for a course in the department (FR12)
   */
  async approveAndPublishCourseGrades(courseId: string, deptAdminId: string) {
    const admin = await prisma.user.findUnique({
      where: { id: deptAdminId },
    });

    if (!admin || admin.role !== Role.DEPT_ADMIN || !admin.departmentId) {
      throw new ForbiddenGradeError(
        "Only Department Administrators can approve and publish grades."
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          where: { status: EnrollmentStatus.ENROLLED },
          select: { id: true },
        },
      },
    });

    if (!course) {
      throw new CourseNotFoundError();
    }

    // Security boundary: Dept Admin can only approve courses within their own department
    if (course.departmentId !== admin.departmentId) {
      throw new ForbiddenGradeError(
        "You can only approve grades for courses within your assigned department."
      );
    }

    const enrollmentIds = course.enrollments.map((e) => e.id);

    return prisma.$transaction(async (tx) => {
      const now = new Date();

      const result = await tx.grade.updateMany({
        where: {
          enrollmentId: { in: enrollmentIds },
          status: { in: [GradeStatus.DRAFT, GradeStatus.APPROVED] },
        },
        data: {
          status: GradeStatus.PUBLISHED,
          approvedById: deptAdminId,
          approvedAt: now,
        },
      });

      return {
        publishedCount: result.count,
        approvedAt: now.toISOString(),
      };
    });
  },

  /**
   * Retrieves audit change logs for course grades (FR14)
   */
  async getGradeAuditLogs(courseId: string, deptAdminId: string) {
    const admin = await prisma.user.findUnique({
      where: { id: deptAdminId },
    });

    if (!admin || admin.role !== Role.DEPT_ADMIN || !admin.departmentId) {
      throw new ForbiddenGradeError(
        "Only Department Administrators can inspect grade audit logs."
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new CourseNotFoundError();
    }

    if (course.departmentId !== admin.departmentId) {
      throw new ForbiddenGradeError(
        "You can only inspect audit logs for your own department."
      );
    }

    const logs = await prisma.gradeChangeLog.findMany({
      where: {
        grade: {
          enrollment: { courseId },
        },
      },
      include: {
        changedBy: { select: { fullName: true, email: true, role: true } },
        grade: {
          include: {
            enrollment: {
              include: {
                student: { select: { fullName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { changedAt: "desc" },
    });

    return logs.map((log) => ({
      id: log.id,
      studentName: log.grade.enrollment.student.fullName,
      studentEmail: log.grade.enrollment.student.email,
      changedByName: log.changedBy.fullName,
      changedByEmail: log.changedBy.email,
      changedByRole: log.changedBy.role,
      oldScore: log.oldScore !== null ? Number(log.oldScore) : null,
      newScore: log.newScore !== null ? Number(log.newScore) : null,
      changedAt: log.changedAt.toISOString(),
    }));
  },

  /**
   * Retrieves published semester results and computes student GPA (FR13).
   * Strictly enforces that unapproved/draft grades are NEVER leaked to students.
   */
  async getStudentResultsAndGPA(
    studentId: string,
    semester = "2026-Fall"
  ): Promise<StudentGPAOverview> {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("Student not found.");
    }

    // Only query enrollments with PUBLISHED grades
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        semester,
        status: EnrollmentStatus.ENROLLED,
        grade: {
          status: GradeStatus.PUBLISHED,
        },
      },
      include: {
        course: { select: { id: true, title: true, creditHours: true } },
        grade: true,
      },
      orderBy: { course: { title: "asc" } },
    });

    let totalPoints = 0;
    let totalRegisteredCredits = 0;
    let totalEarnedCredits = 0;

    const courses = enrollments.map((enr) => {
      const g = enr.grade!;
      const finalScore = Number(g.finalScore || 0);
      const { letter, point } = calculateGradePoint(finalScore);

      totalRegisteredCredits += enr.course.creditHours;
      if (letter !== "F") {
        totalEarnedCredits += enr.course.creditHours;
      }
      totalPoints += point * enr.course.creditHours;

      return {
        courseId: enr.course.id,
        courseTitle: enr.course.title,
        creditHours: enr.course.creditHours,
        finalScore,
        letterGrade: letter,
        gradePoint: point,
        status: g.status,
      };
    });

    const gpa =
      totalRegisteredCredits > 0
        ? Math.round((totalPoints / totalRegisteredCredits) * 100) / 100
        : 0.0;

    return {
      studentId: student.id,
      studentName: student.fullName,
      semester,
      totalRegisteredCredits,
      totalEarnedCredits,
      gpa,
      courses,
    };
  },
};
