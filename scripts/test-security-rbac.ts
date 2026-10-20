import { prisma } from "../src/lib/prisma";
import {
  gradeService,
  ForbiddenGradeError,
} from "../src/services/gradeService";
import {
  attendanceService,
  ForbiddenAttendanceError,
} from "../src/services/attendanceService";
import {
  assignmentService,
  ForbiddenAssignmentError,
} from "../src/services/assignmentService";
import {
  announcementService,
  ForbiddenAnnouncementError,
} from "../src/services/announcementService";
import {
  validateFileMagicBytes,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from "../src/lib/upload-utils";
import { AnnouncementScope, GradeStatus, Role } from "@prisma/client";

async function runSecurityRBACTests() {
  console.log("=================================================================");
  console.log("  CAMPUSFLOW PHASE 8: OWASP SECURITY & RBAC BOUNDARIES AUDIT     ");
  console.log("=================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] T${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] T${total}: ${testName}${detail ? ` -> ${detail}` : ""}`);
    }
  }

  try {
    // ── Setup: Retrieve base test entities ────────────────────
    const uniAdmin = await prisma.user.findUniqueOrThrow({
      where: { email: "admin@campusflow.edu" },
    });
    const deptAdmin = await prisma.user.findUniqueOrThrow({
      where: { email: "dept.admin@campusflow.edu" },
    });
    const lecturer = await prisma.user.findUniqueOrThrow({
      where: { email: "dr.mensah@campusflow.edu" },
    });
    const student1 = await prisma.user.findUniqueOrThrow({
      where: { email: "student1@campusflow.edu" },
    });
    const courseCS201 = await prisma.course.findUniqueOrThrow({
      where: { id: "course-cs201" },
    });

    // Create an isolated secondary department & course to test cross-tenant boundaries
    const mathDept = await prisma.department.upsert({
      where: { id: "dept-math-test-001" },
      update: {},
      create: {
        id: "dept-math-test-001",
        name: "Department of Mathematics",
      },
    });

    const mathLecturer = await prisma.user.upsert({
      where: { email: "prof.euler@campusflow.edu" },
      update: {},
      create: {
        email: "prof.euler@campusflow.edu",
        fullName: "Prof. Leonhard Euler",
        passwordHash: "dummy-hash",
        role: Role.LECTURER,
        departmentId: mathDept.id,
      },
    });

    const mathCourse = await prisma.course.upsert({
      where: { id: "course-math101-test" },
      update: {},
      create: {
        id: "course-math101-test",
        title: "MATH101: Linear Algebra",
        creditHours: 3,
        maxCapacity: 30,
        semester: "2026-Fall",
        departmentId: mathDept.id,
        lecturerId: mathLecturer.id,
      },
    });

    // ── TEST 1: Student cannot mark attendance ────────────────
    let t1Rejected = false;
    try {
      await attendanceService.saveAttendanceSession(
        courseCS201.id,
        student1.id, // Student attempting lecturer action
        "2026-10-20",
        []
      );
    } catch (err) {
      if (err instanceof ForbiddenAttendanceError) {
        t1Rejected = true;
      }
    }
    assert(
      t1Rejected,
      "RBAC: Student forbidden from marking course attendance (ForbiddenAttendanceError)"
    );

    // ── TEST 2: Student cannot create assignments ─────────────
    let t2Rejected = false;
    try {
      await assignmentService.createAssignment({
        courseId: courseCS201.id,
        lecturerId: student1.id, // Student attempting assignment creation
        title: "Unauthorized Assignment",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        maxScore: 100,
      });
    } catch (err) {
      if (err instanceof ForbiddenAssignmentError) {
        t2Rejected = true;
      }
    }
    assert(
      t2Rejected,
      "RBAC: Student forbidden from creating course assignments (ForbiddenAssignmentError)"
    );

    // ── TEST 3: Student cannot grade submissions ──────────────
    // Create temporary assignment and submission in courseCS201
    const testAssignment = await prisma.assignment.upsert({
      where: { id: "asgn-sec-test-001" },
      update: {},
      create: {
        id: "asgn-sec-test-001",
        courseId: courseCS201.id,
        title: "Security Test Assignment",
        dueDate: new Date(Date.now() + 86400000),
        maxScore: 100,
      },
    });

    const testSubmission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: testAssignment.id,
          studentId: student1.id,
        },
      },
      update: {},
      create: {
        assignmentId: testAssignment.id,
        studentId: student1.id,
        fileUrl: "/uploads/test.pdf",
        submittedAt: new Date(),
      },
    });

    let t3Rejected = false;
    try {
      await assignmentService.gradeSubmission({
        submissionId: testSubmission.id,
        lecturerId: student1.id, // Student attempting to grade
        score: 95,
        feedback: "Unauthorized grade attempt",
      });
    } catch (err) {
      if (err instanceof ForbiddenAssignmentError) {
        t3Rejected = true;
      }
    }
    assert(
      t3Rejected,
      "RBAC: Student forbidden from grading submissions (ForbiddenAssignmentError)"
    );

    // ── TEST 4: Lecturer cannot manage courses they do not teach ─
    let t4Rejected = false;
    try {
      // Dr. Mensah (CS) attempting to access math course grade sheet
      await gradeService.getCourseGradeSheet(mathCourse.id, lecturer.id);
    } catch (err) {
      if (err instanceof ForbiddenGradeError) {
        t4Rejected = true;
      }
    }
    assert(
      t4Rejected,
      "RBAC: Lecturer forbidden from accessing courses taught by others (ForbiddenGradeError)"
    );

    // ── TEST 5: Lecturer cannot approve or publish grades ─────
    let t5Rejected = false;
    try {
      // Dr. Mensah attempting to approve/publish course-cs201 grades
      await gradeService.approveAndPublishCourseGrades(courseCS201.id, lecturer.id);
    } catch (err) {
      if (err instanceof ForbiddenGradeError) {
        t5Rejected = true;
      }
    }
    assert(
      t5Rejected,
      "RBAC: Lecturer forbidden from approving grades; restricted to DEPT_ADMIN"
    );

    // ── TEST 6: Cross-Department isolation for Department Admin ──
    let t6Rejected = false;
    try {
      // CS Dept Admin attempting to approve Math Department course grades
      await gradeService.approveAndPublishCourseGrades(mathCourse.id, deptAdmin.id);
    } catch (err) {
      if (err instanceof ForbiddenGradeError) {
        t6Rejected = true;
      }
    }
    assert(
      t6Rejected,
      "Cross-Department Boundary: Dept Admin cannot approve grades of another department"
    );

    // ── TEST 7: Cross-Department isolation on audit logs ──────
    let t7Rejected = false;
    try {
      // CS Dept Admin attempting to view Math Department audit logs
      await gradeService.getGradeAuditLogs(mathCourse.id, deptAdmin.id);
    } catch (err) {
      if (err instanceof ForbiddenGradeError) {
        t7Rejected = true;
      }
    }
    assert(
      t7Rejected,
      "Cross-Department Boundary: Dept Admin cannot view audit logs of another department"
    );

    // ── TEST 8: Announcement Scoping: Student cannot post ─────
    let t8Rejected = false;
    try {
      await announcementService.createAnnouncement({
        authorId: student1.id,
        title: "Student Post",
        body: "Test content",
        scope: AnnouncementScope.DEPARTMENT,
        scopeId: student1.departmentId,
      });
    } catch (err) {
      if (err instanceof ForbiddenAnnouncementError) {
        t8Rejected = true;
      }
    }
    assert(
      t8Rejected,
      "RBAC: Student forbidden from broadcasting announcements"
    );

    // ── TEST 9: Announcement Scoping: Lecturer restricted from UNIVERSITY scope ──
    let t9Rejected = false;
    try {
      await announcementService.createAnnouncement({
        authorId: lecturer.id,
        title: "Lecturer Global Broadcast",
        body: "Test content",
        scope: AnnouncementScope.UNIVERSITY,
      });
    } catch (err) {
      if (err instanceof ForbiddenAnnouncementError) {
        t9Rejected = true;
      }
    }
    assert(
      t9Rejected,
      "RBAC: Lecturer forbidden from publishing UNIVERSITY-wide announcements"
    );

    // ── TEST 10: Announcement Scoping: Dept Admin cannot post to foreign department ─
    let t10Rejected = false;
    try {
      await announcementService.createAnnouncement({
        authorId: deptAdmin.id,
        title: "Cross Dept Post",
        body: "Illegal broadcast",
        scope: AnnouncementScope.DEPARTMENT,
        scopeId: mathDept.id, // Targeting Math Department while admin of CS
      });
    } catch (err) {
      if (err instanceof ForbiddenAnnouncementError) {
        t10Rejected = true;
      }
    }
    assert(
      t10Rejected,
      "RBAC: Department Admin forbidden from posting to foreign departments"
    );

    // ── TEST 11: Student Draft Grade Privacy Barrier ──────────
    // Ensure student1 does not see unpublished DRAFT grades
    const overview = await gradeService.getStudentResultsAndGPA(student1.id, "2026-Fall");
    const draftCourses = overview.courses.filter((c) => c.status === GradeStatus.DRAFT);
    assert(
      draftCourses.length === 0,
      "Data Isolation: Student grade overview completely excludes unapproved DRAFT grades",
      `Found ${draftCourses.length} leaked draft grades`
    );

    // ── TEST 12: Zero Password Hash Leakage Audit ─────────────
    // Check multiple services: grade sheet, attendance roster, announcement feeds
    const gradeSheet = await gradeService.getCourseGradeSheet(courseCS201.id, lecturer.id);
    const hasPasswordInGradeSheet = JSON.stringify(gradeSheet).includes("passwordHash");

    const attendanceRoster = await attendanceService.getCourseRoster(
      courseCS201.id,
      lecturer.id
    );
    const hasPasswordInAttendance = JSON.stringify(attendanceRoster).includes("passwordHash");

    const announcements = await announcementService.getUserAnnouncementFeed(student1.id);
    const hasPasswordInAnnouncements = JSON.stringify(announcements).includes("passwordHash");

    assert(
      !hasPasswordInGradeSheet && !hasPasswordInAttendance && !hasPasswordInAnnouncements,
      "OWASP A02: Zero passwordHash leakage across Grade, Attendance, and Announcement services"
    );

    // ── TEST 13: File Upload Extension Allowlist ──────────────
    const safeExtensions = [".pdf", ".docx", ".zip", ".png", ".jpg", ".txt"];
    const dangerousExtensions = [".exe", ".sh", ".php", ".svg", ".html", ".bat", ".cmd", ".vbs"];

    const safeAllowed = safeExtensions.every((ext) => ALLOWED_EXTENSIONS.has(ext));
    const dangerousBlocked = dangerousExtensions.every((ext) => !ALLOWED_EXTENSIONS.has(ext));

    assert(
      safeAllowed && dangerousBlocked,
      "OWASP A04: File upload allowlist strictly rejects executable and script extensions (.exe, .sh, .php, .svg, .html)"
    );

    // ── TEST 14: File Magic Byte Spoofing Prevention ──────────
    // Valid PDF signature: %PDF-
    const validPdfBuffer = Buffer.from("%PDF-1.7\n%Test file content");
    // Executable binary signature: MZ (0x4D 0x5A) renamed as PDF
    const spoofedPdfBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00]);
    // Valid PNG signature: 89 50 4E 47
    const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    // HTML / Script renamed as PNG
    const spoofedPngBuffer = Buffer.from("<script>alert(1)</script>");

    const validPdfAccepted = validateFileMagicBytes(validPdfBuffer, ".pdf");
    const spoofedPdfRejected = !validateFileMagicBytes(spoofedPdfBuffer, ".pdf");
    const validPngAccepted = validateFileMagicBytes(validPngBuffer, ".png");
    const spoofedPngRejected = !validateFileMagicBytes(spoofedPngBuffer, ".png");

    assert(
      validPdfAccepted && spoofedPdfRejected && validPngAccepted && spoofedPngRejected,
      "OWASP A04: Binary magic byte inspector accurately identifies and rejects spoofed files"
    );

    // ── TEST 15: File Upload Size Constraints ─────────────────
    assert(
      MAX_FILE_SIZE_BYTES === 15 * 1024 * 1024,
      "OWASP A04: File upload maximum payload limit capped at 15MB to prevent DoS"
    );

    // ── TEST 16: Parameterized Query / SQL Injection Resistance ─
    // Testing malicious input strings against Prisma parameterized queries
    const maliciousEmail = "admin' OR '1'='1' --";
    const maliciousSearch = "'; DROP TABLE \"User\"; --";

    const userLookup = await prisma.user.findUnique({
      where: { email: maliciousEmail },
    });
    const courseSearch = await prisma.course.findMany({
      where: { title: { contains: maliciousSearch } },
    });

    assert(
      userLookup === null && courseSearch.length === 0,
      "OWASP A03: Parameterized queries neutralize SQL injection payloads without syntax or logic breakage"
    );

    // Cleanup test artifacts
    await prisma.submission.deleteMany({ where: { assignmentId: "asgn-sec-test-001" } });
    await prisma.assignment.deleteMany({ where: { id: "asgn-sec-test-001" } });
    await prisma.course.deleteMany({ where: { id: "course-math101-test" } });
    await prisma.user.deleteMany({ where: { email: "prof.euler@campusflow.edu" } });
    await prisma.department.deleteMany({ where: { id: "dept-math-test-001" } });

  } catch (error) {
    console.error("Test execution exception:", error);
  }

  console.log("\n-----------------------------------------------------------------");
  console.log(`OVERALL RESULT: ${passed}/${total} SECURITY & RBAC TESTS PASSED`);
  console.log("-----------------------------------------------------------------\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runSecurityRBACTests()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
