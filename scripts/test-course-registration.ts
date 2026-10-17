import { prisma } from "../src/lib/prisma";
import {
  enrollmentService,
  EnrollmentCapacityError,
  DuplicateEnrollmentError,
} from "../src/services/enrollmentService";
import { EnrollmentStatus } from "@prisma/client";

async function runCourseRegistrationTests() {
  console.log("======================================================");
  console.log("  CAMPUSFLOW FEATURE 1: COURSE REGISTRATION TESTS     ");
  console.log("======================================================\n");

  let allPassed = true;

  try {
    // Setup test environment
    const semester = "2026-Fall";
    const student1 = await prisma.user.findUniqueOrThrow({
      where: { email: "student1@campusflow.edu" },
    });
    const student2 = await prisma.user.findUniqueOrThrow({
      where: { email: "student2@campusflow.edu" },
    });

    // Create a temporary 3rd student for capacity overflow testing
    const student3 = await prisma.user.upsert({
      where: { email: "student3.temp@campusflow.edu" },
      update: {},
      create: {
        email: "student3.temp@campusflow.edu",
        fullName: "Test Student Three",
        passwordHash: "dummy",
        role: "STUDENT",
      },
    });

    // Reset any previous enrollments for course-cs202
    await prisma.enrollment.deleteMany({
      where: { courseId: "course-cs202", semester },
    });

    // ── TEST 1: Retrieve courses with live stats ──
    const initialCourses = await enrollmentService.getCoursesWithEnrollmentStats(
      semester,
      student1.id
    );
    const cs202 = initialCourses.find((c) => c.id === "course-cs202");
    if (cs202 && cs202.activeEnrollmentCount === 0 && cs202.maxCapacity === 2) {
      console.log("[PASS] T1: Correctly calculates initial course capacity (0/2 seats taken)");
    } else {
      console.error("[FAIL] T1: Unexpected initial capacity metrics:", cs202);
      allPassed = false;
    }

    // ── TEST 2: Transactional student enrollment ──
    const enr1 = await enrollmentService.enrollStudent(
      student1.id,
      "course-cs202",
      semester
    );
    if (enr1 && enr1.status === EnrollmentStatus.ENROLLED) {
      console.log("[PASS] T2: Successfully enrolled student1 inside interactive transaction");
    } else {
      console.error("[FAIL] T2: Failed to enroll student1");
      allPassed = false;
    }

    // ── TEST 3: Duplicate enrollment prevention ──
    try {
      await enrollmentService.enrollStudent(student1.id, "course-cs202", semester);
      console.error("[FAIL] T3: Expected DuplicateEnrollmentError but succeeded");
      allPassed = false;
    } catch (err: any) {
      if (err instanceof DuplicateEnrollmentError) {
        console.log("[PASS] T3: Duplicate enrollment correctly rejected with 409 Conflict");
      } else {
        console.error("[FAIL] T3: Wrong error thrown for duplicate:", err);
        allPassed = false;
      }
    }

    // ── TEST 4: Capacity limit enforcement (Max Capacity = 2) ──
    // Enroll student2 -> course is now 2/2 (FULL)
    await enrollmentService.enrollStudent(student2.id, "course-cs202", semester);

    // Attempting to enroll student3 must fail with EnrollmentCapacityError
    try {
      await enrollmentService.enrollStudent(student3.id, "course-cs202", semester);
      console.error("[FAIL] T4: Enrolled past capacity limit of 2!");
      allPassed = false;
    } catch (err: any) {
      if (err instanceof EnrollmentCapacityError) {
        console.log(
          "[PASS] T4: Transactional capacity lock rejected 3rd student when course is full (2/2)"
        );
      } else {
        console.error("[FAIL] T4: Unexpected error thrown for full course:", err);
        allPassed = false;
      }
    }

    // ── TEST 5: Soft drop preserves record and frees capacity ──
    await enrollmentService.dropEnrollment(enr1.id, student1.id);

    const droppedRecord = await prisma.enrollment.findUnique({
      where: { id: enr1.id },
    });

    const coursesAfterDrop = await enrollmentService.getCoursesWithEnrollmentStats(
      semester
    );
    const cs202AfterDrop = coursesAfterDrop.find((c) => c.id === "course-cs202");

    if (
      droppedRecord?.status === EnrollmentStatus.DROPPED &&
      cs202AfterDrop?.activeEnrollmentCount === 1 &&
      cs202AfterDrop?.availableSeats === 1
    ) {
      console.log(
        "[PASS] T5: Dropping soft-updates status to DROPPED and immediately frees 1 seat"
      );
    } else {
      console.error("[FAIL] T5: Soft drop verification failed:", {
        droppedRecord,
        cs202AfterDrop,
      });
      allPassed = false;
    }

    // ── TEST 6: Student3 can now take the freed seat ──
    const enr3 = await enrollmentService.enrollStudent(
      student3.id,
      "course-cs202",
      semester
    );
    if (enr3 && enr3.status === EnrollmentStatus.ENROLLED) {
      console.log("[PASS] T6: Freed seat immediately available and claimed by student3");
    } else {
      console.error("[FAIL] T6: Failed to enroll in freed seat");
      allPassed = false;
    }

    // Cleanup student3
    await prisma.enrollment.deleteMany({
      where: { studentId: student3.id },
    });
    await prisma.user.delete({
      where: { id: student3.id },
    });
  } catch (err) {
    console.error("Test execution exception:", err);
    allPassed = false;
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n------------------------------------------------------");
  console.log(
    `OVERALL RESULT: ${allPassed ? "ALL 6/6 TESTS PASSED" : "TESTS FAILED"}`
  );
  console.log("------------------------------------------------------\n");

  if (!allPassed) {
    process.exit(1);
  }
}

runCourseRegistrationTests();
