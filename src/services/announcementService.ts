import { prisma } from "@/lib/prisma";
import {
  AnnouncementScope,
  EnrollmentStatus,
  Prisma,
  Role,
} from "@prisma/client";

export class ForbiddenAnnouncementError extends Error {
  constructor(
    message = "You are not authorized to post or manage announcements in this scope."
  ) {
    super(message);
    this.name = "ForbiddenAnnouncementError";
  }
}

export class InvalidAnnouncementDataError extends Error {
  constructor(message = "Invalid announcement data provided.") {
    super(message);
    this.name = "InvalidAnnouncementDataError";
  }
}

export interface CreateAnnouncementDTO {
  authorId: string;
  scope: AnnouncementScope;
  scopeId?: string | null;
  title: string;
  body: string;
}

export interface EnrichedAnnouncement {
  id: string;
  title: string;
  body: string;
  scope: AnnouncementScope;
  scopeId: string | null;
  scopeLabel: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  };
}

export const announcementService = {
  /**
   * Creates an announcement adhering to strict role-based scope boundaries:
   * - UNI_ADMIN: UNIVERSITY-wide (FR17), or any department/course
   * - DEPT_ADMIN: DEPARTMENT-wide for their assigned department (FR16), or their department's courses
   * - LECTURER: COURSE-specific for courses they instruct (FR15)
   */
  async createAnnouncement(data: CreateAnnouncementDTO) {
    const author = await prisma.user.findUnique({
      where: { id: data.authorId },
    });

    if (!author) {
      throw new ForbiddenAnnouncementError("Author account not found.");
    }

    if (!data.title || data.title.trim().length === 0) {
      throw new InvalidAnnouncementDataError("Announcement title is required.");
    }

    if (!data.body || data.body.trim().length === 0) {
      throw new InvalidAnnouncementDataError("Announcement body is required.");
    }

    let finalScopeId: string | null = null;

    switch (data.scope) {
      case AnnouncementScope.UNIVERSITY: {
        // FR17: Only University Admins can post university-wide announcements
        if (author.role !== Role.UNI_ADMIN) {
          throw new ForbiddenAnnouncementError(
            "Only University Administrators can post university-wide announcements."
          );
        }
        finalScopeId = null;
        break;
      }

      case AnnouncementScope.DEPARTMENT: {
        // FR16: Dept Admin can post to their department; Uni Admin can post to any department
        if (author.role !== Role.DEPT_ADMIN && author.role !== Role.UNI_ADMIN) {
          throw new ForbiddenAnnouncementError(
            "Only Department or University Administrators can post department announcements."
          );
        }

        if (
          author.role === Role.DEPT_ADMIN &&
          data.scopeId &&
          data.scopeId !== author.departmentId
        ) {
          throw new ForbiddenAnnouncementError(
            "Department Administrators can only post to their assigned department."
          );
        }

        const targetDeptId =
          author.role === Role.DEPT_ADMIN
            ? author.departmentId
            : data.scopeId || author.departmentId;

        if (!targetDeptId) {
          throw new InvalidAnnouncementDataError("Department ID is required.");
        }

        const deptExists = await prisma.department.findUnique({
          where: { id: targetDeptId },
        });

        if (!deptExists) {
          throw new InvalidAnnouncementDataError("Department does not exist.");
        }

        finalScopeId = targetDeptId;
        break;
      }

      case AnnouncementScope.COURSE: {
        // FR15: Lecturer can post to courses they teach
        if (!data.scopeId) {
          throw new InvalidAnnouncementDataError(
            "Course ID is required for course-scoped announcements."
          );
        }

        const course = await prisma.course.findUnique({
          where: { id: data.scopeId },
        });

        if (!course) {
          throw new InvalidAnnouncementDataError("Course does not exist.");
        }

        if (author.role === Role.LECTURER && course.lecturerId !== author.id) {
          throw new ForbiddenAnnouncementError(
            "Lecturers can only post announcements to courses they instruct."
          );
        }

        if (
          author.role === Role.DEPT_ADMIN &&
          course.departmentId !== author.departmentId
        ) {
          throw new ForbiddenAnnouncementError(
            "Department Administrators can only post to courses within their department."
          );
        }

        finalScopeId = course.id;
        break;
      }

      default:
        throw new InvalidAnnouncementDataError("Invalid announcement scope.");
    }

    return prisma.announcement.create({
      data: {
        authorId: author.id,
        scope: data.scope,
        scopeId: finalScopeId,
        title: data.title.trim(),
        body: data.body.trim(),
      },
      include: {
        author: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });
  },

  /**
   * Retrieves the unified announcement feed for a user combining:
   * - University-wide announcements
   * - User's department announcements
   * - Enrolled courses (for students) / taught courses (for lecturers)
   * - Announcements authored by the user
   * (FR18: Every user sees a single feed combining announcements relevant to their role/scope)
   */
  async getUserAnnouncementFeed(
    userId: string,
    filterScope?: AnnouncementScope
  ): Promise<EnrichedAnnouncement[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new ForbiddenAnnouncementError("User not found.");
    }

    // 1. Determine course IDs relevant to this user
    let relevantCourseIds: string[] = [];

    if (user.role === Role.STUDENT) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          studentId: user.id,
          status: EnrollmentStatus.ENROLLED,
        },
        select: { courseId: true },
      });
      relevantCourseIds = enrollments.map((e) => e.courseId);
    } else if (user.role === Role.LECTURER) {
      const courses = await prisma.course.findMany({
        where: { lecturerId: user.id },
        select: { id: true },
      });
      relevantCourseIds = courses.map((c) => c.id);
    } else if (user.role === Role.DEPT_ADMIN && user.departmentId) {
      const courses = await prisma.course.findMany({
        where: { departmentId: user.departmentId },
        select: { id: true },
      });
      relevantCourseIds = courses.map((c) => c.id);
    }

    // 2. Build Prisma OR conditions for visibility
    const orConditions: Prisma.AnnouncementWhereInput[] = [
      // Always include university-wide
      { scope: AnnouncementScope.UNIVERSITY },
      // Always include announcements created by this user
      { authorId: user.id },
    ];

    // Include department announcements if user belongs to a department
    if (user.departmentId) {
      orConditions.push({
        scope: AnnouncementScope.DEPARTMENT,
        scopeId: user.departmentId,
      });
    }

    // Include course announcements
    if (user.role === Role.UNI_ADMIN) {
      orConditions.push({ scope: AnnouncementScope.COURSE });
    } else if (relevantCourseIds.length > 0) {
      orConditions.push({
        scope: AnnouncementScope.COURSE,
        scopeId: { in: relevantCourseIds },
      });
    }

    const whereClause: Prisma.AnnouncementWhereInput = {
      OR: orConditions,
      ...(filterScope ? { scope: filterScope } : {}),
    };

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Enrich scope metadata (Course titles and Department names)
    const courseIdsToFetch = announcements
      .filter((a) => a.scope === AnnouncementScope.COURSE && a.scopeId)
      .map((a) => a.scopeId as string);

    const deptIdsToFetch = announcements
      .filter((a) => a.scope === AnnouncementScope.DEPARTMENT && a.scopeId)
      .map((a) => a.scopeId as string);

    const [courses, depts] = await Promise.all([
      prisma.course.findMany({
        where: { id: { in: courseIdsToFetch } },
        select: { id: true, title: true },
      }),
      prisma.department.findMany({
        where: { id: { in: deptIdsToFetch } },
        select: { id: true, name: true },
      }),
    ]);

    const courseMap = new Map(courses.map((c) => [c.id, c.title]));
    const deptMap = new Map(depts.map((d) => [d.id, d.name]));

    return announcements.map((a) => {
      let scopeLabel = "University-Wide";
      if (a.scope === AnnouncementScope.DEPARTMENT && a.scopeId) {
        scopeLabel = `Department of ${deptMap.get(a.scopeId) || "Academic Affairs"}`;
      } else if (a.scope === AnnouncementScope.COURSE && a.scopeId) {
        scopeLabel = `Course: ${courseMap.get(a.scopeId) || "Course Update"}`;
      }

      return {
        id: a.id,
        title: a.title,
        body: a.body,
        scope: a.scope,
        scopeId: a.scopeId,
        scopeLabel,
        createdAt: a.createdAt.toISOString(),
        author: a.author,
      };
    });
  },

  /**
   * Deletes an announcement if caller is the author, Uni Admin, or Dept Admin of that department
   */
  async deleteAnnouncement(announcementId: string, userId: string) {
    const caller = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!caller) {
      throw new ForbiddenAnnouncementError("Caller account not found.");
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new InvalidAnnouncementDataError("Announcement not found.");
    }

    const isAuthor = announcement.authorId === caller.id;
    const isUniAdmin = caller.role === Role.UNI_ADMIN;
    const isDeptAdminOfDept =
      caller.role === Role.DEPT_ADMIN &&
      announcement.scope === AnnouncementScope.DEPARTMENT &&
      announcement.scopeId === caller.departmentId;

    if (!isAuthor && !isUniAdmin && !isDeptAdminOfDept) {
      throw new ForbiddenAnnouncementError(
        "You do not have permission to delete this announcement."
      );
    }

    return prisma.announcement.delete({
      where: { id: announcementId },
    });
  },
};
