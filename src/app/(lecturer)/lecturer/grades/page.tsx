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

  // 2. Fetch Course Grade Sheet
  const loadGradeSheet = useCallback(async (courseId: string) => {
    if (!courseId) return;
    try {
      setIsLoadingSheet(true);
      const res = await fetch(`/api/v1/grades/courses/${courseId}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setGradeSheet(json.data);
        // Pre-populate scores draft
        const draft: Record<string, string> = {};
        json.data.students.forEach((s: StudentGradeEntry) => {
          if (s.finalScore !== null && s.finalScore !== undefined) {
            draft[s.enrollmentId] = String(s.finalScore);
          }
        });
        setScoresDraft(draft);
      } else {
        setNotification({
          type: "error",
          message: json.error?.message || "Failed to load grade sheet.",
        });
      }
    } catch (err) {
      console.error("Grade sheet error:", err);
      setNotification({
        type: "error",
        message: "Network error loading course grade sheet.",
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

  // Handle score draft change
  const handleScoreChange = (enrollmentId: string, val: string) => {
    setScoresDraft((prev) => ({
      ...prev,
      [enrollmentId]: val,
    }));
  };

  // Submit and save grades to server
  const handleSaveGrades = () => {
    if (!selectedCourseId || !gradeSheet) return;

    // Build payload array
    const gradesToSave: Array<{ enrollmentId: string; finalScore: number }> =
      [];

    for (const student of gradeSheet.students) {
      const raw = scoresDraft[student.enrollmentId];
      if (raw !== undefined && raw.trim() !== "") {
        const num = parseFloat(raw);
        if (isNaN(num) || num < 0 || num > 100) {
          setNotification({
            type: "error",
            message: `Score for ${student.studentName} must be a number between 0 and 100.`,
          });
          return;
        }
        gradesToSave.push({
          enrollmentId: student.enrollmentId,
          finalScore: num,
        });
      }
    }

    if (gradesToSave.length === 0) {
      setNotification({
        type: "error",
        message: "Please enter at least one student score before saving.",
      });
      return;
    }

    startSaveTransition(async () => {
      try {
        const res = await fetch(`/api/v1/grades/courses/${selectedCourseId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grades: gradesToSave }),
        });

        const json = await res.json();
        if (res.ok) {
          setNotification({
            type: "success",
            message: `Successfully saved ${json.data.savedCount} course grade(s). Submitted to Dept Admin queue.`,
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
          message: "Network error saving grades.",
        });
      }
    });
  };

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <nav
              className="mb-1 flex items-center gap-1.5 text-xs text-slate-600"
              aria-label="Breadcrumb"
            >
              <Link
                href="/lecturer"
                className="font-medium hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
              >
                Lecturer Portal
              </Link>
              <span>/</span>
              <span
                className="font-semibold text-slate-900"
                aria-current="page"
              >
                Final Grades
              </span>
            </nav>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Final Grade Entry &amp; Submission
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Enter final percentage scores for enrolled students. Once saved,
              grades route to the Department Administrator for official approval
              and publication.
            </p>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {notification && (
          <div
            role="alert"
            aria-live="polite"
            className={`mb-6 flex items-center justify-between rounded-xl border p-4 text-xs font-semibold ${
              notification.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              aria-label="Dismiss feedback message"
              className="rounded px-1.5 py-0.5 underline hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Academic Integrity / Workflow Info Callout */}
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/80 p-4">
          <div className="flex items-start space-x-3">
            <span className="text-lg">ℹ️</span>
            <div className="text-xs text-indigo-950">
              <span className="font-bold">
                Academic Workflow &amp; Audit Trail Notice:
              </span>{" "}
              Final grades remain in{" "}
              <code className="rounded border border-indigo-200 bg-white px-1 py-0.5 font-mono text-[11px] font-bold text-indigo-900">
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
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="select-course-grades"
                className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
              >
                Select Course
              </label>
              {isLoadingCourses ? (
                <div className="mt-1.5 h-10 w-full animate-pulse rounded-lg bg-slate-200" />
              ) : courses.length === 0 ? (
                <p className="mt-2 text-xs text-slate-600">
                  No courses assigned to you this semester.
                </p>
              ) : (
                <select
                  id="select-course-grades"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
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
              <span className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                Approval Status
              </span>
              <div className="mt-2">
                {gradeSheet?.status === GradeStatus.PUBLISHED ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    ✓ Official Published
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    Draft / Pending Dept Approval
                  </span>
                )}
              </div>
            </div>

            {/* Class Average */}
            <div>
              <span className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                Class Average
              </span>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {gradeSheet?.metrics.classAverage !== null
                  ? `${gradeSheet?.metrics.classAverage}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Grade Sheet Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 p-4">
            <h2 className="text-sm font-bold text-slate-900">
              Student Roll &amp; Scores
            </h2>
            <span className="text-xs font-medium text-slate-600">
              {gradeSheet?.metrics.gradesEnteredCount || 0} of{" "}
              {gradeSheet?.students.length || 0} grades entered
            </span>
          </div>

          {isLoadingSheet ? (
            <div
              className="p-12 text-center text-xs text-slate-600"
              aria-busy="true"
            >
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <p className="mt-2">Loading student grade roster...</p>
            </div>
          ) : !gradeSheet || gradeSheet.students.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-600">
              <p className="font-bold text-slate-800">No students enrolled</p>
              <p className="mt-1">
                Students must register for this course before grades can be
                entered.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View (md+) */}
              <div className="hidden overflow-x-auto md:block">
                <table
                  className="min-w-full divide-y divide-slate-200 text-left text-sm"
                  aria-label="Student grade entry sheet"
                >
                  <caption className="sr-only">
                    Course grade sheet for score entry and letter grade
                    computation
                  </caption>
                  <thead className="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">
                        Student Name &amp; Email
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        Final Score (0-100%)
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        Computed Letter Grade
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-xs">
                    {gradeSheet.students.map((student) => {
                      const draftVal = scoresDraft[student.enrollmentId] || "";
                      const numericVal = parseFloat(draftVal);
                      const calculated =
                        !isNaN(numericVal) &&
                        numericVal >= 0 &&
                        numericVal <= 100
                          ? calculateGradePoint(numericVal)
                          : null;

                      return (
                        <tr
                          key={student.enrollmentId}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">
                              {student.studentName}
                            </div>
                            <div className="font-mono text-slate-600">
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
                                aria-label={`Final score percentage for ${student.studentName}`}
                                placeholder="e.g. 85.5"
                                className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                              />
                              <span className="text-xs font-semibold text-slate-600">
                                %
                              </span>
                            </div>
                          </td>

                          {/* Letter Grade Pill */}
                          <td className="px-6 py-4">
                            {calculated ? (
                              <span
                                className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-black ${
                                  calculated.letter === "F"
                                    ? "border-red-200 bg-red-50 text-red-800"
                                    : calculated.letter.startsWith("A")
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                      : "border-blue-200 bg-blue-50 text-blue-800"
                                }`}
                              >
                                Grade {calculated.letter} (
                                {calculated.point.toFixed(1)} GP)
                              </span>
                            ) : (
                              <span className="text-xs text-slate-600 italic">
                                Pending score entry
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            {student.status === GradeStatus.PUBLISHED ? (
                              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
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

              {/* Mobile Cards View (< md) */}
              <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
                {gradeSheet.students.map((student) => {
                  const draftVal = scoresDraft[student.enrollmentId] || "";
                  const numericVal = parseFloat(draftVal);
                  const calculated =
                    !isNaN(numericVal) && numericVal >= 0 && numericVal <= 100
                      ? calculateGradePoint(numericVal)
                      : null;

                  return (
                    <div
                      key={student.enrollmentId}
                      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {student.studentName}
                          </p>
                          <p className="font-mono text-xs text-slate-500">
                            {student.studentEmail}
                          </p>
                        </div>
                        {calculated ? (
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-black ${
                              calculated.letter === "F"
                                ? "border-red-200 bg-red-50 text-red-800"
                                : calculated.letter.startsWith("A")
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-blue-200 bg-blue-50 text-blue-800"
                            }`}
                          >
                            Grade {calculated.letter}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Unscored
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <label
                          htmlFor={`mobile-score-${student.enrollmentId}`}
                          className="text-xs font-semibold text-slate-700"
                        >
                          Final Score:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            id={`mobile-score-${student.enrollmentId}`}
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
                            placeholder="0-100"
                            className="w-24 rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 shadow-2xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                          />
                          <span className="text-xs font-bold text-slate-500">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer Save Action */}
          {gradeSheet && gradeSheet.students.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <span className="text-xs font-medium text-slate-600">
                Grades will route to Department Admin for publication review
              </span>
              <button
                type="button"
                onClick={handleSaveGrades}
                disabled={isSaving}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
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
