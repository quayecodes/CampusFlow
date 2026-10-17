import { prisma } from "../src/lib/prisma";
import {
  assignmentService,
  ForbiddenAssignmentError,
  InvalidGradingError,
  NotEnrolledInCourseError,
} from "../src/services/assignmentService";
import { EnrollmentStatus } from "@prisma/client";

async function runTests() {
  console.log("=== CampusFlow Feature 3: Assignment Creation, Submission & Grading Test Suite ===\n");

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
    const admin = await prisma.user.findUnique({
      where: { email: "admin@campusflow.edu" },
    });
    const course = await prisma.course.findUnique({
      where: { id: "course-cs201" },
    });

    if (!lecturer || !student1 || !student2 || !admin || !course) {
      throw new Error("Seed data missing. Run seed script first.");
    }

    // Ensure student1 and student2 are actively enrolled
    await prisma.enrollment.upsert({
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

    await prisma.enrollment.upsert({
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

    // TEST 1: Lecturer creates assignment (FR7)
    // Set dueDate to 2 days from now
    const futureDueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const assignment1 = await assignmentService.createAssignment({
      lecturerId: lecturer.id,
      courseId: course.id,
      title: "Lab 3: Binary Search Tree",
      description: "Implement balanced BST insertion and traversal methods.",
      dueDate: futureDueDate,
      maxScore: 100,
    });

    assert(
      assignment1.id !== undefined &&
        assignment1.title === "Lab 3: Binary Search Tree" &&
        Number(assignment1.maxScore) === 100,
      "Test 1: Lecturer can create an assignment with title, description, due date, and max score (FR7)"
    );

    // TEST 2: Student 1 submits file before due date (FR8)
    const onTimeSubmission = await assignmentService.submitAssignment({
      studentId: student1.id,
      assignmentId: assignment1.id,
      fileUrl: "/uploads/student1_bst_solution.zip",
      submittedAt: new Date(Date.now()), // current time < futureDueDate
    });

    assert(
      onTimeSubmission.id !== undefined &&
        onTimeSubmission.isLate === false &&
        onTimeSubmission.fileUrl === "/uploads/student1_bst_solution.zip",
      "Test 2: Student can submit file before due date and isLate is flagged false (FR8)"
    );

    // TEST 3: Student 2 submits after due date -> System flags late submission (FR10)
    const pastDueDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    const assignmentPastDue = await assignmentService.createAssignment({
      lecturerId: lecturer.id,
      courseId: course.id,
      title: "Quiz 1: Algorithmic Complexity",
      description: "Asymptotic analysis questions.",
      dueDate: pastDueDate,
      maxScore: 50,
    });

    const lateSubmission = await assignmentService.submitAssignment({
      studentId: student2.id,
      assignmentId: assignmentPastDue.id,
      fileUrl: "/uploads/student2_quiz1.pdf",
      submittedAt: new Date(Date.now()), // current time > pastDueDate
    });

    assert(
      lateSubmission.id !== undefined && lateSubmission.isLate === true,
      "Test 3: System flags and logs late submission when submitted after due date (FR10)"
    );

    // TEST 4: Non-enrolled user cannot submit assignment
    let notEnrolledCaught = false;
    try {
      await assignmentService.submitAssignment({
        studentId: admin.id, // Admin is not enrolled in course-cs201
        assignmentId: assignment1.id,
        fileUrl: "/uploads/fake.pdf",
      });
    } catch (err) {
      if (err instanceof NotEnrolledInCourseError) {
        notEnrolledCaught = true;
      }
    }
    assert(
      notEnrolledCaught,
      "Test 4: Non-enrolled student cannot submit assignment (NotEnrolledInCourseError)"
    );

    // TEST 5: Lecturer grades Student 1 submission and leaves feedback (FR9)
    const gradedSubmission = await assignmentService.gradeSubmission({
      lecturerId: lecturer.id,
      submissionId: onTimeSubmission.id,
      score: 95,
      feedback: "Excellent BST implementation and cleanly formatted test cases.",
    });

    assert(
      Number(gradedSubmission.score) === 95 &&
        gradedSubmission.feedback?.includes("Excellent BST") === true &&
        gradedSubmission.gradedAt !== null,
      "Test 5: Lecturer can grade a submission and leave qualitative feedback (FR9)"
    );

    // TEST 6: Invalid score (greater than maxScore or negative) is rejected
    let invalidScoreCaught = false;
    try {
      await assignmentService.gradeSubmission({
        lecturerId: lecturer.id,
        submissionId: onTimeSubmission.id,
        score: 150, // exceeds maxScore of 100
        feedback: "Impossible score",
      });
    } catch (err) {
      if (err instanceof InvalidGradingError) {
        invalidScoreCaught = true;
      }
    }
    assert(
      invalidScoreCaught,
      "Test 6: Score exceeding maxScore is rejected with InvalidGradingError"
    );

    // TEST 7: Unauthorized user / non-instructor cannot grade submission
    let forbiddenGradeCaught = false;
    try {
      await assignmentService.gradeSubmission({
        lecturerId: student2.id, // student attempting to grade submission
        submissionId: onTimeSubmission.id,
        score: 100,
        feedback: "Hacked grade",
      });
    } catch (err) {
      if (err instanceof ForbiddenAssignmentError) {
        forbiddenGradeCaught = true;
      }
    }
    assert(
      forbiddenGradeCaught,
      "Test 7: Non-instructor cannot grade submission (ForbiddenAssignmentError)"
    );

    // TEST 8: Student retrieves assignments with grades and feedback
    const student1Assignments = await assignmentService.getStudentAssignments(
      student1.id,
      course.id
    );
    const gradedItem = student1Assignments.find((a) => a.id === assignment1.id);

    assert(
      gradedItem !== undefined &&
        gradedItem.status === "GRADED" &&
        gradedItem.submission?.score === 95 &&
        gradedItem.submission?.feedback?.includes("Excellent BST") === true,
      "Test 8: Student can view their submission status, score, and instructor feedback"
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
