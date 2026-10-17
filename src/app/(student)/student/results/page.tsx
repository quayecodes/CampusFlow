"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GradeStatus } from "@prisma/client";

interface StudentCourseResult {
  courseId: string;
  courseTitle: string;
  creditHours: number;
  finalScore: number;
  letterGrade: string;
  gradePoint: number;
  status: GradeStatus;
}

interface StudentGPAOverview {
  studentId: string;
  studentName: string;
  semester: string;
  totalRegisteredCredits: number;
  totalEarnedCredits: number;
  gpa: number;
  courses: StudentCourseResult[];
}

export default function StudentResultsPage() {
  const [overview, setOverview] = useState<StudentGPAOverview | null>(null);
  const [semester, setSemester] = useState("2026-Fall");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async (sem: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/grades/student?semester=${sem}`);
      const json = await res.json();
      if (res.ok && json.data?.results) {
        setOverview(json.data.results);
      } else {
        setError(json.error?.message || "Failed to load results.");
      }
    } catch (err) {
      console.error("Results fetch error:", err);
      setError("Network error loading examination results.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults(semester);
  }, [semester, loadResults]);

  const getAcademicStanding = (gpa: number) => {
    if (gpa >= 3.6)
      return {
        label: "First Class Honours",
        color: "text-emerald-800 bg-emerald-50 border-emerald-200",
        badge: "bg-emerald-500",
      };
    if (gpa >= 3.0)
      return {
        label: "Second Class Upper",
        color: "text-blue-800 bg-blue-50 border-blue-200",
        badge: "bg-blue-500",
      };
    if (gpa >= 2.0)
      return {
        label: "Second Class Lower",
        color: "text-indigo-800 bg-indigo-50 border-indigo-200",
        badge: "bg-indigo-500",
      };
    if (gpa >= 1.5)
      return {
        label: "Pass Standing",
        color: "text-amber-800 bg-amber-50 border-amber-200",
        badge: "bg-amber-500",
      };
    return {
      label: "Academic Warning Risk",
      color: "text-red-800 bg-red-50 border-red-200",
      badge: "bg-red-500",
    };
  };

  const standing =
    overview && overview.courses.length > 0
      ? getAcademicStanding(overview.gpa)
      : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <nav
              className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500"
              aria-label="Breadcrumb"
            >
              <Link
                href="/student"
                className="font-medium hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              >
                Student Portal
              </Link>
              <span>/</span>
              <span className="font-bold text-slate-900" aria-current="page">
                Results &amp; GPA
              </span>
            </nav>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Official Semester Results &amp; Transcript
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Approved and published course grades, earned credits, and your
              official Grade Point Average (FR13).
            </p>
          </div>

          {/* Print / Export Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              <span>🖨️</span>
              <span>Print Transcript</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800"
          >
            {error}
          </div>
        )}

        {/* Semester Selector Bar */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center space-x-3">
            <label
              htmlFor="semester-select"
              className="text-xs font-bold tracking-wider text-slate-600 uppercase"
            >
              Academic Term:
            </label>
            <select
              id="semester-select"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-2xs focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              <option value="2026-Fall">2026 Fall Semester</option>
              <option value="2026-Spring">2026 Spring Semester</option>
            </select>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Scale: 4.00 Grade Point Maximum
          </span>
        </div>

        {/* GPA & Standing Summary Cards */}
        {!isLoading && overview && overview.courses.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* GPA Card */}
            <div className="bento-card border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-white p-6">
              <span className="text-xs font-bold tracking-wider text-indigo-700 uppercase">
                Semester GPA
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-4xl font-black text-indigo-900">
                  {overview.gpa.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  / 4.00 Scale
                </span>
              </div>
            </div>

            {/* Credits Card */}
            <div className="bento-card border border-slate-200 p-6">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                Earned Academic Credits
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-4xl font-black text-slate-900">
                  {overview.totalEarnedCredits}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  earned of {overview.totalRegisteredCredits} registered
                </span>
              </div>
            </div>

            {/* Classification Card */}
            {standing && (
              <div
                className={`bento-card border p-6 ${standing.color} flex flex-col justify-between`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${standing.badge}`} />
                  <span className="text-xs font-bold tracking-wider uppercase opacity-80">
                    Academic Honours
                  </span>
                </div>
                <p className="mt-2 text-xl font-black">{standing.label}</p>
                <p className="mt-1 text-[11px] opacity-75">
                  Based on institutional cumulative calculation
                </p>
              </div>
            )}
          </div>
        )}

        {/* Official Transcript Sheet */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Transcript Sheet Header */}
          <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/80 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Official Course Grade Records
              </h2>
              <p className="text-xs text-slate-500">
                Approved by Department Academic Board
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Officially Verified
            </span>
          </div>

          {isLoading ? (
            <div
              className="p-12 text-center text-xs text-slate-500"
              aria-busy="true"
            >
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-2 font-medium">Loading published results...</p>
            </div>
          ) : !overview || overview.courses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-600">
                ⏳
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">
                No Published Results Yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                Grades for this semester are currently being entered by your
                instructors and undergoing Department Administrator review.
                Official results will appear here as soon as they are approved
                and published (FR12).
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Data Grid */}
              <div className="hidden overflow-x-auto md:block">
                <table
                  className="min-w-full divide-y divide-slate-200 text-left text-sm"
                  aria-label="Official published course results"
                >
                  <caption className="sr-only">
                    Course grade transcript and grade points
                  </caption>
                  <thead className="bg-slate-50/60 text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                    <tr>
                      <th scope="col" className="px-6 py-4">
                        Course Title
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        Credits
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        Final Score
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        Letter Grade
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        Grade Points
                      </th>
                      <th scope="col" className="px-6 py-4 text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-xs">
                    {overview.courses.map((c) => (
                      <tr key={c.courseId} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {c.courseTitle}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-semibold text-slate-600">
                          {c.creditHours}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-slate-900">
                          {c.finalScore}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex rounded-lg border px-3 py-1 text-xs font-black ${
                              c.letterGrade === "F"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : c.letterGrade.startsWith("A")
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-blue-200 bg-blue-50 text-blue-800"
                            }`}
                          >
                            {c.letterGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">
                          {c.gradePoint.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            ✓ Published
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Transcript (Visible on phones) */}
              <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
                {overview.courses.map((c) => (
                  <div
                    key={c.courseId}
                    className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {c.courseTitle}
                      </h3>
                      <span
                        className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-black ${
                          c.letterGrade === "F"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : c.letterGrade.startsWith("A")
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-blue-200 bg-blue-50 text-blue-800"
                        }`}
                      >
                        {c.letterGrade}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-2 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400">
                          Credits
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {c.creditHours}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">
                          Score
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {c.finalScore}%
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">
                          Points
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {c.gradePoint.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
