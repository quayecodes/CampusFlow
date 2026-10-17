"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { GradeStatus } from "@prisma/client";
import { calculateGradePoint } from "@/services/gradeService";

interface LecturerCourse {
  id: string;
  title: string;
  creditHours: number;
  department: string;
}

interface StudentGradeEntry {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  finalScore: number | null;
  letterGrade: string | null;
  status: GradeStatus;
  approvedAt: string | null;
}

interface CourseGradeSheetData {
  courseId: string;
  courseTitle: string;
  creditHours: number;
  departmentName: string;
  semester: string;
  status: GradeStatus;
  students: StudentGradeEntry[];
  metrics: {
    totalEnrolled: number;
    gradesEnteredCount: number;
    classAverage: number | null;
    highestScore: number | null;
    lowestScore: number | null;
  };
}

export default function LecturerGradesPage() {
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [gradeSheet, setGradeSheet] = useState<CourseGradeSheetData | null>(
    null
  );
  const [scoresDraft, setScoresDraft] = useState<Record<string, string>>({});
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 1. Fetch lecturer courses
  useEffect(() => {
    async function loadCourses() {
      try {
        setIsLoadingCourses(true);
        const res = await fetch("/api/v1/attendance/courses");
        const json = await res.json();
        if (json.data?.courses) {
          setCourses(json.data.courses);
          if (json.data.courses.length > 0) {
            setSelectedCourseId(json.data.courses[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
        setNotification({
          type: "error",
          message: "Failed to load assigned courses.",
        });
      } finally {
        setIsLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  // 2. Fetch course grade sheet
  const loadGradeSheet = useCallback(async (courseId: string) => {
    if (!courseId) return;
    try {
      setIsLoadingSheet(true);
      setNotification(null);
      const res = await fetch(`/api/v1/grades/courses/${courseId}`);
      const json = await res.json();
      if (res.ok && json.data?.gradeSheet) {
        const sheet: CourseGradeSheetData = json.data.gradeSheet;
        setGradeSheet(sheet);
        // Initialize draft scores
        const draft: Record<string, string> = {};
        sheet.students.forEach((s) => {
          draft[s.enrollmentId] =
            s.finalScore !== null ? String(s.finalScore) : "";
        });
        setScoresDraft(draft);
      } else {
        setNotification({
          type: "error",
          message: json.error?.message || "Failed to load grade sheet.",
        });
        setGradeSheet(null);
      }
    } catch (err) {
      console.error("Load grade sheet error:", err);
      setNotification({
        type: "error",
        message: "Network error loading grade sheet.",
      });
    } finally {
      setIsLoadingSheet(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadGradeSheet(selectedCourseId);
    }
  }, [selectedCourseId, loadGradeSheet]);

  // Handle score change
  const handleScoreChange = (enrollmentId: string, value: string) => {
    setScoresDraft((prev) => ({
      ...prev,
      [enrollmentId]: value,
    }));
  };

  // Save all entered grades
  const handleSaveGrades = () => {
    if (!selectedCourseId || !gradeSheet) return;

    const entries: Array<{ enrollmentId: string; finalScore: number }> = [];

    for (const student of gradeSheet.students) {
      const val = scoresDraft[student.enrollmentId];
      if (val !== undefined && val.trim() !== "") {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 100) {
          setNotification({
            type: "error",
            message: `Invalid score for ${student.studentName}. Scores must be numbers between 0 and 100.`,
          });
          return;
        }
        entries.push({ enrollmentId: student.enrollmentId, finalScore: num });
      }
    }

    if (entries.length === 0) {
      setNotification({
        type: "error",
        message: "Please enter at least one grade score before saving.",
      });
      return;
    }

    startSaveTransition(async () => {
      try {
        const res = await fetch(`/api/v1/grades/courses/${selectedCourseId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries }),
        });

        const json = await res.json();
        if (res.ok) {
          setNotification({
            type: "success",
            message: `Successfully saved ${json.data.savedCount} course grade(s). Draft grades are ready for Department Admin review.`,
          });
          loadGradeSheet(selectedCourseId);
        } else {
          setNotification({
            type: "error",
            message: json.error?.message || "Failed to save grades.",
          });
        }
      } catch (err) {
        console.error("Save grades error:", err);
        setNotification({
          type: "error",
          message: "Network error occurred while saving grades.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/lecturer" className="hover:text-gray-700">
                Lecturer Portal
              </Link>
              <span>/</span>
              <span className="font-semibold text-gray-800">Final Grades</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              Final Grade Entry & Submission
            </h1>
            <p className="text-sm text-gray-500">
              Enter final percentage scores for enrolled students. Once saved,
              grades route to the Department Administrator for official approval
              and publication.
            </p>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {notification && (
          <div
            className={`mb-6 flex items-center justify-between rounded-lg border p-4 text-sm ${
              notification.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-semibold underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Academic Integrity / Workflow Info Callout */}
        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
          <div className="flex items-start space-x-3">
            <span className="text-lg">ℹ️</span>
            <div className="text-xs text-indigo-900">
              <span className="font-bold">
                Academic Workflow &amp; Audit Trail Notice:
              </span>{" "}
              Final grades remain in{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono">
                DRAFT
              </code>{" "}
              status until formally approved and published by your Department
              Admin. Any revisions made to grades after they have been published
              will be permanently logged in the audit trail per university
              governance policy (FR14).
            </div>
          </div>
        </div>

        {/* Course Selector & Class Metrics Bar */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                Select Course
              </label>
              {isLoadingCourses ? (
                <div className="mt-1 h-10 w-full animate-pulse rounded-md bg-gray-200" />
              ) : courses.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">
                  No courses assigned to you this semester.
                </p>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.department})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Overall Status */}
            <div>
              <span className="block text-xs font-bold tracking-wider text-gray-500 uppercase">
                Approval Status
              </span>
              <div className="mt-2">
                {gradeSheet?.status === GradeStatus.PUBLISHED ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    ✓ Official Published
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    Draft / Pending Dept Approval
                  </span>
                )}
              </div>
            </div>

            {/* Class Average */}
            <div>
              <span className="block text-xs font-bold tracking-wider text-gray-500 uppercase">
                Class Average
              </span>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {gradeSheet?.metrics.classAverage !== null
                  ? `${gradeSheet?.metrics.classAverage}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Grade Sheet Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 p-4">
            <h2 className="font-bold text-gray-800">
              Student Roll &amp; Scores
            </h2>
            <span className="text-xs text-gray-500">
              {gradeSheet?.metrics.gradesEnteredCount || 0} of{" "}
              {gradeSheet?.students.length || 0} grades entered
            </span>
          </div>

          {isLoadingSheet ? (
            <div className="p-12 text-center text-sm text-gray-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <p className="mt-2">Loading student grade roster...</p>
            </div>
          ) : !gradeSheet || gradeSheet.students.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              <p className="font-medium text-gray-700">No students enrolled</p>
              <p className="mt-1 text-xs">
                Students must register for this course before grades can be
                entered.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Student Name &amp; Email
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Final Score (0-100%)
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Computed Letter Grade
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {gradeSheet.students.map((student) => {
                    const draftVal = scoresDraft[student.enrollmentId] || "";
                    const numericVal = parseFloat(draftVal);
                    const calculated =
                      !isNaN(numericVal) && numericVal >= 0 && numericVal <= 100
                        ? calculateGradePoint(numericVal)
                        : null;

                    return (
                      <tr
                        key={student.enrollmentId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {student.studentName}
                          </div>
                          <div className="font-mono text-xs text-gray-500">
                            {student.studentEmail}
                          </div>
                        </td>

                        {/* Final Score Input */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={draftVal}
                              onChange={(e) =>
                                handleScoreChange(
                                  student.enrollmentId,
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 85.5"
                              className="w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-bold text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                            />
                            <span className="text-xs text-gray-400">%</span>
                          </div>
                        </td>

                        {/* Letter Grade Pill */}
                        <td className="px-6 py-4">
                          {calculated ? (
                            <span
                              className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-black ${
                                calculated.letter === "F"
                                  ? "bg-red-100 text-red-800"
                                  : calculated.letter.startsWith("A")
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              Grade {calculated.letter} (
                              {calculated.point.toFixed(1)} GP)
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Pending score entry
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          {student.status === GradeStatus.PUBLISHED ? (
                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                              Draft
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Save Action */}
          {gradeSheet && gradeSheet.students.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
              <span className="text-xs text-gray-500">
                Grades will be submitted to Department Admin for publication
                review
              </span>
              <button
                type="button"
                onClick={handleSaveGrades}
                disabled={isSaving}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSaving ? "Saving Grades..." : "Save & Submit Grades"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
