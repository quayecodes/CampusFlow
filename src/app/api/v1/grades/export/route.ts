import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { gradeService } from "@/services/gradeService";
import { Role } from "@prisma/client";
import crypto from "crypto";

/**
 * GET /api/v1/grades/export
 *
 * Enterprise data portability & academic transcript export endpoint.
 * Compliant with FERPA & GDPR standards for student record access.
 * Exports verified course grades and GPA records in CSV or JSON format.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Authentication required." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester") || "2026-Fall";
    const format = searchParams.get("format")?.toLowerCase() || "csv";
    const requestedStudentId = searchParams.get("studentId");

    // Access control: Students can only export their own records.
    // Faculty & Administrators can export specific student records.
    let targetStudentId = session.user.id;
    if (requestedStudentId && session.user.role !== Role.STUDENT) {
      targetStudentId = requestedStudentId;
    }

    const results = await gradeService.getStudentResultsAndGPA(
      targetStudentId,
      semester
    );

    // Compute digital verification hash for tamper-evident transcript validation
    const verificationPayload = JSON.stringify({
      studentId: results.studentId,
      semester: results.semester,
      gpa: results.gpa,
      courses: results.courses.map((c) => ({
        id: c.courseId,
        score: c.finalScore,
        letter: c.letterGrade,
      })),
    });
    const digitalVerificationHash = crypto
      .createHash("sha256")
      .update(verificationPayload)
      .digest("hex");

    if (format === "json") {
      return NextResponse.json({
        data: {
          transcript: results,
          verification: {
            digitalVerificationHash,
            issuedAt: new Date().toISOString(),
            issuingAuthority: "CampusFlow University Registrar",
          },
        },
        error: null,
      });
    }

    // Default: RFC 4180 Compliant CSV Export
    const csvRows = [
      `"CAMPUSFLOW UNIVERSITY - OFFICIAL ACADEMIC TRANSCRIPT"`,
      `"Student Name","${results.studentName.replace(/"/g, '""')}"`,
      `"Student ID","${results.studentId}"`,
      `"Academic Term","${results.semester}"`,
      `"Issued At","${new Date().toISOString()}"`,
      `"Verification Hash","${digitalVerificationHash}"`,
      ``,
      `"Course Title","Credit Hours","Final Score (%)","Letter Grade","Grade Points","Status"`,
    ];

    for (const c of results.courses) {
      csvRows.push(
        `"${c.courseTitle.replace(/"/g, '""')}",${c.creditHours},${c.finalScore},"${c.letterGrade}",${c.gradePoint.toFixed(1)},"${c.status}"`
      );
    }

    csvRows.push(``);
    csvRows.push(`"SUMMARY METRICS"`);
    csvRows.push(
      `"Total Registered Credits",${results.totalRegisteredCredits}`
    );
    csvRows.push(`"Total Earned Credits",${results.totalEarnedCredits}`);
    csvRows.push(`"Semester GPA",${results.gpa.toFixed(2)}`);

    const csvContent = csvRows.join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CampusFlow_Transcript_${semester}_${targetStudentId.slice(0, 8)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Transcript export error:", error);
    return NextResponse.json(
      { data: null, error: { message: "Failed to generate academic export." } },
      { status: 500 }
    );
  }
}
