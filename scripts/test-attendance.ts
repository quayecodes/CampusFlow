import { prisma } from "../src/lib/prisma";
import {
  attendanceService,
  ForbiddenAttendanceError,
  InvalidAttendanceDataError,
} from "../src/services/attendanceService";
import { AttendanceStatus, EnrollmentStatus } from "@prisma/client";

async function runTests() {
  console.log("=== CampusFlow Feature 2: Attendance Tracking & Marking Test Suite ===\n");

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
    // 1. Identify Seed Users & Course
    const lecturer = await prisma.user.findUnique({
      where: { email: "dr.mensah@campusflow.edu" },
    });
    const student1 = await prisma.user.findUnique({
      where: { email: "student1@campusflow.edu" },
    });
    const student2 = await prisma.user.findUnique({
      where: { email: "student2@campusflow.edu" },
    });
    const course = await prisma.course.findUnique({
      where: { id: "course-cs201" },
    });

    if (!lecturer || !student1 || !student2 || !course) {
      throw new Error("Seed data missing. Run seed script first.");
    }

    // Ensure student1 and student2 are actively enrolled in course-cs201
    const enrollment1 = await prisma.enrollment.upsert({
      where: {
        studentId_courseId_semester: {
          studentId: student1.id,
          courseId: course.id,
          semester: "2026-Fall",
        },
      },
      update: { status: EnrollmentStatus.ENROLLED },
      create: {
        studentId: student1.id,
        courseId: course.id,
        semester: "2026-Fall",
        status: EnrollmentStatus.ENROLLED,
      },
    });

    const enrollment2 = await prisma.enrollment.upsert({
      where: {
        studentId_courseId_semester: {
          studentId: student2.id,
          courseId: course.id,
          semester: "2026-Fall",
        },
      },
      update: { status: EnrollmentStatus.ENROLLED },
      create: {
        studentId: student2.id,
        courseId: course.id,
        semester: "2026-Fall",
        status: EnrollmentStatus.ENROLLED,
      },
    });

    // Clean up any existing attendance records for clean test run
    await prisma.attendanceRecord.deleteMany({
      where: {
        enrollmentId: { in: [enrollment1.id, enrollment2.id] },
      },
    });

    // TEST 1: Lecturer retrieves assigned courses
    const lecturerCourses = await attendanceService.getLecturerCourses(
      lecturer.id,
      "2026-Fall"
    );
    assert(
      lecturerCourses.some((c) => c.id === course.id),
      "Test 1: Lecturer retrieves assigned courses including CS201"
    );

    // TEST 2: Lecturer retrieves attendance roster for empty session
    const testDate = "2026-10-01";
    const initialRoster = await attendanceService.getCourseRoster(
      course.id,
      lecturer.id,
      testDate
    );
    assert(
      initialRoster.students.length >= 2 &&
        initialRoster.summary.totalEnrolled >= 2 &&
        initialRoster.summary.markedToday === 0,
      "Test 2: Initial roster returns active enrolled students with unmarked session"
    );

    // TEST 3: Lecturer marks attendance for session 1
    const saveResult1 = await attendanceService.saveAttendanceSession(
      course.id,
      lecturer.id,
      testDate,
      [
        { enrollmentId: enrollment1.id, status: AttendanceStatus.PRESENT },
        { enrollmentId: enrollment2.id, status: AttendanceStatus.LATE },
      ]
    );
    assert(
      saveResult1.length === 2,
      "Test 3: Lecturer successfully records session attendance (student1=PRESENT, student2=LATE)"
    );

    // Verify saved roster
    const updatedRoster1 = await attendanceService.getCourseRoster(
      course.id,
      lecturer.id,
      testDate
    );
    const s1 = updatedRoster1.students.find(
      (s) => s.enrollmentId === enrollment1.id
    );
    const s2 = updatedRoster1.students.find(
      (s) => s.enrollmentId === enrollment2.id
    );
    assert(
      s1?.currentStatus === AttendanceStatus.PRESENT &&
        s2?.currentStatus === AttendanceStatus.LATE &&
        updatedRoster1.summary.markedToday === 2,
      "Test 4: Course roster reflects newly recorded attendance statuses"
    );

    // TEST 5: Unauthorized user / wrong lecturer cannot mark attendance
    let forbiddenCaught = false;
    try {
      await attendanceService.saveAttendanceSession(
        course.id,
        student1.id, // Student attempting to mark course attendance
        testDate,
        [{ enrollmentId: enrollment1.id, status: AttendanceStatus.PRESENT }]
      );
    } catch (err) {
      if (err instanceof ForbiddenAttendanceError) {
        forbiddenCaught = true;
      }
    }
    assert(
      forbiddenCaught,
      "Test 5: Unauthorized user (non-assigned lecturer) is rejected with ForbiddenAttendanceError"
    );

    // TEST 6: Session updating / idempotence (Lecturer corrects student2 from LATE to PRESENT)
    const updateResult = await attendanceService.saveAttendanceSession(
      course.id,
      lecturer.id,
      testDate,
      [{ enrollmentId: enrollment2.id, status: AttendanceStatus.PRESENT }]
    );
    const updatedRoster2 = await attendanceService.getCourseRoster(
      course.id,
      lecturer.id,
      testDate
    );
    const s2Updated = updatedRoster2.students.find(
      (s) => s.enrollmentId === enrollment2.id
    );
    assert(
      updateResult.length === 1 &&
        s2Updated?.currentStatus === AttendanceStatus.PRESENT,
      "Test 6: Idempotent upsert allows lecturer to revise previously saved session attendance"
    );

    // TEST 7: Mark additional sessions to test FR6 (Threshold < 75% warning)
    // Mark 3 more sessions where student2 is ABSENT
    const sessionDates = ["2026-10-02", "2026-10-03", "2026-10-04"];
    for (const d of sessionDates) {
      await attendanceService.saveAttendanceSession(course.id, lecturer.id, d, [
        { enrollmentId: enrollment1.id, status: AttendanceStatus.PRESENT },
        { enrollmentId: enrollment2.id, status: AttendanceStatus.ABSENT },
      ]);
    }

    // Now:
    // Student 1 has 4 sessions, 4 PRESENT -> 100% -> isAtRisk = false
    // Student 2 has 4 sessions, 1 PRESENT, 3 ABSENT -> 25% -> isAtRisk = true
    const student1Overview = await attendanceService.getStudentAttendance(
      student1.id,
      "2026-Fall"
    );
    const student2Overview = await attendanceService.getStudentAttendance(
      student2.id,
      "2026-Fall"
    );

    const s1Course = student1Overview.find((c) => c.courseId === course.id);
    const s2Course = student2Overview.find((c) => c.courseId === course.id);

    assert(
      s1Course !== undefined &&
        s1Course.attendancePercentage === 100 &&
        s1Course.isAtRisk === false,
      "Test 7: Student with 100% attendance is in Good Standing (isAtRisk=false)"
    );

    assert(
      s2Course !== undefined &&
        s2Course.totalSessions === 4 &&
        s2Course.attendancePercentage === 25 &&
        s2Course.isAtRisk === true,
      "Test 8: Student with 25% attendance is flagged At Risk (FR6 threshold <75% compliance met)"
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
