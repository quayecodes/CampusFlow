import { prisma } from "@/lib/prisma";
import { AttendanceStatus, EnrollmentStatus } from "@prisma/client";

export class CourseNotFoundError extends Error {
  constructor(message = "Course not found.") {
    super(message);
    this.name = "CourseNotFoundError";
  }
}

export class ForbiddenAttendanceError extends Error {
  constructor(
    message = "You are not authorized to manage attendance for this course."
  ) {
    super(message);
    this.name = "ForbiddenAttendanceError";
  }
}

export class InvalidAttendanceDataError extends Error {
  constructor(message = "Invalid attendance data provided.") {
    super(message);
    this.name = "InvalidAttendanceDataError";
  }
}

export interface StudentAttendanceStats {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  currentStatus: AttendanceStatus | null;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
  isAtRisk: boolean; // Flagged when attendance falls below 75%
}

export interface CourseAttendanceRoster {
  courseId: string;
  courseTitle: string;
  semester: string;
  sessionDate: string; // YYYY-MM-DD
  students: StudentAttendanceStats[];
  summary: {
    totalEnrolled: number;
    markedToday: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
    atRiskStudentsCount: number;
  };
}

export interface StudentCourseAttendance {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  creditHours: number;
  lecturerName: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
  isAtRisk: boolean;
  records: Array<{
    id: string;
    sessionDate: string;
    status: AttendanceStatus;
  }>;
}

/**
 * Normalizes a date string (YYYY-MM-DD) to a midnight UTC Date object
 */
export function normalizeSessionDate(dateStr: string): Date {
  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    throw new InvalidAttendanceDataError(
      "Invalid date format. Expected YYYY-MM-DD."
    );
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new InvalidAttendanceDataError("Invalid numeric date components.");
  }

  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

export const attendanceService = {
  /**
   * Retrieves all courses assigned to a lecturer
   */
  async getLecturerCourses(lecturerId: string, semester = "2026-Fall") {
    const courses = await prisma.course.findMany({
      where: {
        lecturerId,
        semester,
      },
      include: {
        department: { select: { name: true } },
        _count: {
          select: {
            enrollments: {
              where: { status: EnrollmentStatus.ENROLLED },
            },
          },
        },
      },
      orderBy: { title: "asc" },
    });

    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      creditHours: c.creditHours,
      department: c.department.name,
      enrolledCount: c._count.enrollments,
    }));
  },

  /**
   * Retrieves attendance roster for a course on a specific date,
   * including cumulative attendance percentages and <75% at-risk flags.
   */
  async getCourseRoster(
    courseId: string,
    lecturerId: string,
    dateStr?: string
  ): Promise<CourseAttendanceRoster> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          where: { status: EnrollmentStatus.ENROLLED },
          include: {
            student: {
              select: { id: true, fullName: true, email: true },
            },
            attendance: {
              orderBy: { sessionDate: "asc" },
            },
          },
        },
      },
    });

    if (!course) {
      throw new CourseNotFoundError();
    }

    if (course.lecturerId !== lecturerId) {
      throw new ForbiddenAttendanceError();
    }

    const todayStr = dateStr || new Date().toISOString().substring(0, 10);
    const targetSessionDate = normalizeSessionDate(todayStr);

    let markedToday = 0;
    let presentToday = 0;
    let lateToday = 0;
    let absentToday = 0;
    let atRiskCount = 0;

    const students: StudentAttendanceStats[] = course.enrollments.map((enr) => {
      const records = enr.attendance;
      const totalSessions = records.length;
      const presentCount = records.filter(
        (r) => r.status === AttendanceStatus.PRESENT
      ).length;
      const lateCount = records.filter(
        (r) => r.status === AttendanceStatus.LATE
      ).length;
      const absentCount = records.filter(
        (r) => r.status === AttendanceStatus.ABSENT
      ).length;

      // Cumulative attendance %: Present + (Late * 0.5)
      const attendancePercentage =
        totalSessions > 0
          ? Math.round(((presentCount + lateCount * 0.5) / totalSessions) * 100)
          : 100;

      // FR6: Flag student if attendance falls below 75% threshold (after at least 1 session)
      const isAtRisk = totalSessions > 0 && attendancePercentage < 75;
      if (isAtRisk) {
        atRiskCount++;
      }

      // Find record for this target session date
      const targetRecord = records.find(
        (r) => r.sessionDate.getTime() === targetSessionDate.getTime()
      );

      const currentStatus = targetRecord ? targetRecord.status : null;
      if (currentStatus) {
        markedToday++;
        if (currentStatus === AttendanceStatus.PRESENT) presentToday++;
        else if (currentStatus === AttendanceStatus.LATE) lateToday++;
        else if (currentStatus === AttendanceStatus.ABSENT) absentToday++;
      }

      return {
        enrollmentId: enr.id,
        studentId: enr.student.id,
        studentName: enr.student.fullName,
        studentEmail: enr.student.email,
        currentStatus,
        totalSessions,
        presentCount,
        lateCount,
        absentCount,
        attendancePercentage,
        isAtRisk,
      };
    });

    return {
      courseId: course.id,
      courseTitle: course.title,
      semester: course.semester,
      sessionDate: todayStr,
      students,
      summary: {
        totalEnrolled: course.enrollments.length,
        markedToday,
        presentToday,
        lateToday,
        absentToday,
        atRiskStudentsCount: atRiskCount,
      },
    };
  },

  /**
   * Saves attendance records for a specific course session inside a transaction
   */
  async saveAttendanceSession(
    courseId: string,
    lecturerId: string,
    dateStr: string,
    records: Array<{ enrollmentId: string; status: AttendanceStatus }>
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
      throw new ForbiddenAttendanceError();
    }

    const sessionDate = normalizeSessionDate(dateStr);
    const validEnrollmentIds = new Set(course.enrollments.map((e) => e.id));

    // Validate all records belong to active enrolled students of this course
    for (const rec of records) {
      if (!validEnrollmentIds.has(rec.enrollmentId)) {
        throw new InvalidAttendanceDataError(
          `Enrollment ${rec.enrollmentId} does not belong to this course or is not active.`
        );
      }
    }

    return prisma.$transaction(async (tx) => {
      const saved = [];
      for (const rec of records) {
        const item = await tx.attendanceRecord.upsert({
          where: {
            enrollmentId_sessionDate: {
              enrollmentId: rec.enrollmentId,
              sessionDate,
            },
          },
          update: {
            status: rec.status,
            markedById: lecturerId,
          },
          create: {
            enrollmentId: rec.enrollmentId,
            sessionDate,
            status: rec.status,
            markedById: lecturerId,
          },
        });
        saved.push(item);
      }
      return saved;
    });
  },

  /**
   * Retrieves student's attendance records across all enrolled courses
   */
  async getStudentAttendance(
    studentId: string,
    semester = "2026-Fall"
  ): Promise<StudentCourseAttendance[]> {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        semester,
        status: EnrollmentStatus.ENROLLED,
      },
      include: {
        course: {
          include: {
            lecturer: { select: { fullName: true } },
          },
        },
        attendance: {
          orderBy: { sessionDate: "desc" },
        },
      },
      orderBy: { course: { title: "asc" } },
    });

    return enrollments.map((enr) => {
      const records = enr.attendance;
      const totalSessions = records.length;
      const presentCount = records.filter(
        (r) => r.status === AttendanceStatus.PRESENT
      ).length;
      const lateCount = records.filter(
        (r) => r.status === AttendanceStatus.LATE
      ).length;
      const absentCount = records.filter(
        (r) => r.status === AttendanceStatus.ABSENT
      ).length;

      const attendancePercentage =
        totalSessions > 0
          ? Math.round(((presentCount + lateCount * 0.5) / totalSessions) * 100)
          : 100;

      const isAtRisk = totalSessions > 0 && attendancePercentage < 75;

      return {
        enrollmentId: enr.id,
        courseId: enr.course.id,
        courseTitle: enr.course.title,
        creditHours: enr.course.creditHours,
        lecturerName: enr.course.lecturer.fullName,
        totalSessions,
        presentCount,
        lateCount,
        absentCount,
        attendancePercentage,
        isAtRisk,
        records: records.map((r) => ({
          id: r.id,
          sessionDate: r.sessionDate.toISOString().substring(0, 10),
          status: r.status,
        })),
      };
    });
  },
};
