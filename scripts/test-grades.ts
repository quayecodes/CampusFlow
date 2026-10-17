import { prisma } from "../src/lib/prisma";
import {
  gradeService,
  ForbiddenGradeError,
  calculateGradePoint,
} from "../src/services/gradeService";
import { EnrollmentStatus, GradeStatus, Role } from "@prisma/client";

async function runTests() {
  console.log("=== CampusFlow Feature 4: Results, GPA & Grade Approval Workflow Test Suite ===\n");

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
    const deptAdmin = await prisma.user.findUnique({
      where: { email: "dept.admin@campusflow.edu" },
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

    if (!lecturer || !deptAdmin || !student1 || !student2 || !course) {
      throw new Error("Seed data missing. Run seed script first.");
    }

    // Ensure student1 and student2 are actively enrolled
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

    // Reset any existing grades for a clean test
    await prisma.gradeChangeLog.deleteMany({
      where: {
        grade: { enrollmentId: { in: [enrollment1.id, enrollment2.id] } },
      },
    });
    await prisma.grade.deleteMany({
      where: { enrollmentId: { in: [enrollment1.id, enrollment2.id] } },
    });

    // TEST 1: Grade Point conversion logic check
    const aGrade = calculateGradePoint(88);
    const bGrade = calculateGradePoint(72);
    const fGrade = calculateGradePoint(45);
    assert(
      aGrade.letter === "A" &&
        aGrade.point === 4.0 &&
        bGrade.letter === "B" &&
        bGrade.point === 3.0 &&
        fGrade.letter === "F" &&
        fGrade.point === 0.0,
      "Test 1: GPA conversion accurately maps numerical scores to letters and grade points"
    );

    // TEST 2: Lecturer enters final grades (FR11)
    const savedGrades = await gradeService.saveCourseGrades(
      course.id,
      lecturer.id,
      [
        { enrollmentId: enrollment1.id, finalScore: 85 }, // A (4.0)
        { enrollmentId: enrollment2.id, finalScore: 75 }, // B+ (3.5)
      ]
    );

    assert(
      savedGrades.length === 2 &&
        savedGrades.every((g) => g.status === GradeStatus.DRAFT),
      "Test 2: Lecturer enters final grades for students; initial status is DRAFT (FR11)"
    );

    // TEST 3: Students CANNOT view draft/unapproved grades (FR12, FR13 security boundary)
    const s1DraftResults = await gradeService.getStudentResultsAndGPA(
      student1.id,
      "2026-Fall"
    );
    assert(
      s1DraftResults.courses.length === 0,
      "Test 3: Draft/unapproved grades are NEVER leaked or visible to students (FR12, FR13 security boundary)"
    );

    // TEST 4: Dept Admin retrieves course in department approval queue
    const queue = await gradeService.getDepartmentApprovalQueue(deptAdmin.id);
    const queueCourse = queue.find((c) => c.courseId === course.id);
    assert(
      queueCourse !== undefined &&
        queueCourse.draftCount === 2 &&
        queueCourse.queueStatus === "READY_FOR_APPROVAL",
      "Test 4: Department Administrator sees course ready for grade approval in the queue"
    );

    // TEST 5: Dept Admin approves and publishes grades (FR12)
    const approvalResult = await gradeService.approveAndPublishCourseGrades(
      course.id,
      deptAdmin.id
    );
    assert(
      approvalResult.publishedCount === 2,
      "Test 5: Department Admin successfully approves and publishes course grades (FR12)"
    );

    // TEST 6: Student can now view published results and computed GPA (FR13)
    // Student 1 has CS201 (3 credit hours) with score 85 (Grade A, 4.0 points)
    // GPA = (3 * 4.0) / 3 = 4.00
    const s1PublishedResults = await gradeService.getStudentResultsAndGPA(
      student1.id,
      "2026-Fall"
    );
    assert(
      s1PublishedResults.courses.length === 1 &&
        s1PublishedResults.courses[0].letterGrade === "A" &&
        s1PublishedResults.courses[0].status === GradeStatus.PUBLISHED &&
        s1PublishedResults.gpa === 4.0,
      "Test 6: Student can view published grades and correctly computed GPA of 4.00 (FR13)"
    );

    // TEST 7: Academic integrity audit trail (FR14)
    // Lecturer modifies student1's published grade from 85 to 92
    await gradeService.saveCourseGrades(course.id, lecturer.id, [
      { enrollmentId: enrollment1.id, finalScore: 92 },
    ]);

    const auditLogs = await gradeService.getGradeAuditLogs(
      course.id,
      deptAdmin.id
    );

    const s1Log = auditLogs.find(
      (l) => l.studentEmail === "student1@campusflow.edu"
    );

    assert(
      s1Log !== undefined &&
        s1Log.oldScore === 85 &&
        s1Log.newScore === 92 &&
        s1Log.changedByName === lecturer.fullName,
      "Test 7: Post-publication grade change automatically recorded in GradeChangeLog audit trail (FR14)"
    );

    // TEST 8: Unauthorized user cannot modify grades
    let forbiddenCaught = false;
    try {
      await gradeService.saveCourseGrades(course.id, student2.id, [
        { enrollmentId: enrollment1.id, finalScore: 100 },
      ]);
    } catch (err) {
      if (err instanceof ForbiddenGradeError) {
        forbiddenCaught = true;
      }
    }
    assert(
      forbiddenCaught,
      "Test 8: Unauthorized user attempting to modify grades is rejected with ForbiddenGradeError"
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
