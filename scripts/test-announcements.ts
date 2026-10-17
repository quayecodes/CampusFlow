import { prisma } from "../src/lib/prisma";
import {
  announcementService,
  ForbiddenAnnouncementError,
} from "../src/services/announcementService";
import { AnnouncementScope, EnrollmentStatus, Role } from "@prisma/client";

async function runTests() {
  console.log("=== CampusFlow Feature 5: Scoped Announcements & Unified Feed Test Suite ===\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Identify Seed Users, Departments & Courses
    const uniAdmin = await prisma.user.findUnique({
      where: { email: "admin@campusflow.edu" },
    });
    const deptAdmin = await prisma.user.findUnique({
      where: { email: "dept.admin@campusflow.edu" },
    });
    const lecturer = await prisma.user.findUnique({
      where: { email: "dr.mensah@campusflow.edu" },
    });
    const student1 = await prisma.user.findUnique({
      where: { email: "student1@campusflow.edu" },
    });
    const csDept = await prisma.department.findFirst({
      where: {
        OR: [{ id: "dept-cs-001" }, { name: { contains: "Computer Science" } }],
      },
    });
    const courseCS201 = await prisma.course.findUnique({
      where: { id: "course-cs201" },
    });

    if (!uniAdmin || !deptAdmin || !lecturer || !student1 || !csDept || !courseCS201) {
      throw new Error("Required seed data missing. Run seed script first.");
    }

    // Ensure student1 is enrolled in courseCS201
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId_semester: {
          studentId: student1.id,
          courseId: courseCS201.id,
          semester: "2026-Fall",
        },
      },
      update: { status: EnrollmentStatus.ENROLLED },
      create: {
        studentId: student1.id,
        courseId: courseCS201.id,
        semester: "2026-Fall",
        status: EnrollmentStatus.ENROLLED,
      },
    });

    // Create a dummy second department and unenrolled course to verify scope isolation
    const mathDept = await prisma.department.upsert({
      where: { id: "dept-math" },
      update: {},
      create: { id: "dept-math", name: "Mathematics" },
    });

    const mathCourse = await prisma.course.upsert({
      where: { id: "course-math101" },
      update: {},
      create: {
        id: "course-math101",
        title: "MATH101: Linear Algebra",
        creditHours: 3,
        maxCapacity: 50,
        semester: "2026-Fall",
        departmentId: mathDept.id,
        lecturerId: lecturer.id,
      },
    });

    // Clean up announcements for clean test execution
    await prisma.announcement.deleteMany({});

    // TEST 1: Uni Admin posts university-wide announcement (FR17)
    const uniNotice = await announcementService.createAnnouncement({
      authorId: uniAdmin.id,
      scope: AnnouncementScope.UNIVERSITY,
      title: "University Library 24/7 Access During Midterms",
      body: "All campus libraries will remain open 24 hours daily during examination periods.",
    });

    assert(
      uniNotice.id !== undefined &&
        uniNotice.scope === AnnouncementScope.UNIVERSITY &&
        uniNotice.scopeId === null,
      "Test 1: University Administrator can broadcast university-wide announcements (FR17)"
    );

    // TEST 2: Dept Admin posts department announcement (FR16)
    const deptNotice = await announcementService.createAnnouncement({
      authorId: deptAdmin.id,
      scope: AnnouncementScope.DEPARTMENT,
      scopeId: csDept.id,
      title: "Computer Science Career Fair Next Friday",
      body: "Over 20 tech employers will be hosting student technical interviews.",
    });

    assert(
      deptNotice.id !== undefined &&
        deptNotice.scope === AnnouncementScope.DEPARTMENT &&
        deptNotice.scopeId === csDept.id,
      "Test 2: Department Administrator can post department-scoped announcements (FR16)"
    );

    // TEST 3: Lecturer posts course-specific announcement (FR15)
    const courseNotice = await announcementService.createAnnouncement({
      authorId: lecturer.id,
      scope: AnnouncementScope.COURSE,
      scopeId: courseCS201.id,
      title: "CS201: Lab 3 Submission Window Extended by 24 Hours",
      body: "The deadline for the Binary Search Tree assignment is moved to Saturday 11:59 PM.",
    });

    assert(
      courseNotice.id !== undefined &&
        courseNotice.scope === AnnouncementScope.COURSE &&
        courseNotice.scopeId === courseCS201.id,
      "Test 3: Lecturer can post course-specific announcement to enrolled students (FR15)"
    );

    // TEST 4: Post announcement to another department (Isolation benchmark)
    const mathDeptNotice = await announcementService.createAnnouncement({
      authorId: uniAdmin.id,
      scope: AnnouncementScope.DEPARTMENT,
      scopeId: mathDept.id,
      title: "Math Olympiad Registration",
      body: "Only for mathematics department students.",
    });

    assert(
      mathDeptNotice.id !== undefined,
      "Test 4: Unrelated department announcement created for scope filtering test"
    );

    // TEST 5: Authorization boundary check: Lecturer cannot post university-wide announcements
    let forbiddenUniCaught = false;
    try {
      await announcementService.createAnnouncement({
        authorId: lecturer.id,
        scope: AnnouncementScope.UNIVERSITY,
        title: "Unauthorized Broadcast",
        body: "Should fail.",
      });
    } catch (err) {
      if (err instanceof ForbiddenAnnouncementError) {
        forbiddenUniCaught = true;
      }
    }
    assert(
      forbiddenUniCaught,
      "Test 5: Lecturer attempting to post university-wide announcement is rejected with ForbiddenAnnouncementError"
    );

    // TEST 6: Authorization boundary check: Dept Admin cannot post to another department
    let forbiddenDeptCaught = false;
    try {
      await announcementService.createAnnouncement({
        authorId: deptAdmin.id, // CS Dept Admin
        scope: AnnouncementScope.DEPARTMENT,
        scopeId: mathDept.id, // Target Math Dept
        title: "Cross-department post attempt",
        body: "Should fail.",
      });
    } catch (err) {
      if (err instanceof ForbiddenAnnouncementError) {
        forbiddenDeptCaught = true;
      }
    }
    assert(
      forbiddenDeptCaught,
      "Test 6: Department Admin attempting to post outside their assigned department is rejected"
    );

    // TEST 7: Unified Feed Scoping for Student 1 (FR18)
    // Student 1 (in CS Dept, enrolled in CS201) MUST see:
    // - University Notice (Library)
    // - CS Dept Notice (Career Fair)
    // - CS201 Course Notice (Lab 3)
    // Student 1 MUST NOT see:
    // - Math Dept Notice (Math Olympiad)
    const student1Feed = await announcementService.getUserAnnouncementFeed(student1.id);
    const feedIds = student1Feed.map((a) => a.id);

    const hasUniNotice = feedIds.includes(uniNotice.id);
    const hasCSDeptNotice = feedIds.includes(deptNotice.id);
    const hasCourseNotice = feedIds.includes(courseNotice.id);
    const hasMathNotice = feedIds.includes(mathDeptNotice.id);

    assert(
      hasUniNotice && hasCSDeptNotice && hasCourseNotice && !hasMathNotice,
      "Test 7: Student sees unified feed combining University, Department, and enrolled Course notices while isolated from other departments (FR18)"
    );

    // TEST 8: Announcement Deletion (Author or Uni Admin can delete)
    await announcementService.deleteAnnouncement(courseNotice.id, lecturer.id);
    const student1FeedAfterDelete = await announcementService.getUserAnnouncementFeed(student1.id);
    const hasDeletedNotice = student1FeedAfterDelete.some((a) => a.id === courseNotice.id);

    assert(
      hasDeletedNotice === false,
      "Test 8: Instructor can safely delete course announcement and feed updates immediately"
    );

    console.log(`\nResults: ${passed}/${total} tests passed.`);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
