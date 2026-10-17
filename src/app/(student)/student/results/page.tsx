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

  // Academic standing label
  const getAcademicStanding = (gpa: number) => {
    if (gpa >= 3.6)
      return {
        label: "First Class Honours",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    if (gpa >= 3.0)
      return {
        label: "Second Class Upper",
        color: "text-blue-700 bg-blue-50 border-blue-200",
      };
    if (gpa >= 2.0)
      return {
        label: "Second Class Lower",
        color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      };
    if (gpa >= 1.5)
      return {
        label: "Pass Standing",
        color: "text-amber-700 bg-amber-50 border-amber-200",
      };
    return {
      label: "Academic Probation Risk",
      color: "text-red-700 bg-red-50 border-red-200",
    };
  };

  const standing =
    overview && overview.courses.length > 0
      ? getAcademicStanding(overview.gpa)
      : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/student" className="hover:text-gray-700">
              Student Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">
              Results &amp; GPA
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Official Semester Results &amp; Transcript
          </h1>
          <p className="text-sm text-gray-500">
            View officially approved and published course grades, earned
            credits, and your computed Grade Point Average (FR13).
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Semester Selector Bar */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Academic Term:
            </span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value="2026-Fall">2026 Fall Semester</option>
              <option value="2026-Spring">2026 Spring Semester</option>
            </select>
          </div>
        </div>

        {/* GPA & Standing Summary Cards */}
        {!isLoading && overview && overview.courses.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* GPA Card */}
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
              <span className="text-xs font-bold tracking-wider text-indigo-700 uppercase">
                Semester GPA
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-4xl font-black text-indigo-900">
                  {overview.gpa.toFixed(2)}
                </span>
                <span className="text-xs font-medium text-indigo-600">
                  / 4.00
                </span>
              </div>
            </div>

            {/* Credits Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Academic Credits
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-gray-900">
                  {overview.totalEarnedCredits}
                </span>
                <span className="text-xs text-gray-500">
                  earned of {overview.totalRegisteredCredits} registered
                </span>
              </div>
            </div>

            {/* Standing Card */}
            {standing && (
              <div
                className={`rounded-xl border p-6 shadow-sm ${standing.color}`}
              >
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">
                  Academic Classification
                </span>
                <p className="mt-2 text-xl font-black">{standing.label}</p>
              </div>
            )}
          </div>
        )}

        {/* Official Results Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 p-4">
            <h2 className="font-bold text-gray-800">Published Course Grades</h2>
            <span className="text-xs text-gray-500">
              {overview?.courses.length || 0} published courses
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-2">Loading published results...</p>
            </div>
          ) : !overview || overview.courses.length === 0 ? (
            <div className="p-12 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl text-amber-600">
                ⏳
              </div>
              <h3 className="mt-3 text-base font-bold text-gray-900">
                No Published Results Yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-gray-500">
                Grades for this semester are currently being entered by your
                instructors and undergoing Department Administrator review.
                Official results will appear here as soon as they are approved
                and published (FR12).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Course Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Credits
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Final Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Letter Grade
                    </th>
                    <th scope="col" className="px-6 py-3 text-center">
                      Grade Points
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Verification
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {overview.courses.map((c) => (
                    <tr key={c.courseId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {c.courseTitle}
                      </td>

                      <td className="px-6 py-4 text-center font-mono text-gray-600">
                        {c.creditHours}
                      </td>

                      <td className="px-6 py-4 text-center font-mono font-bold text-gray-900">
                        {c.finalScore}%
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex rounded px-2.5 py-0.5 text-xs font-black ${
                            c.letterGrade === "F"
                              ? "bg-red-100 text-red-800"
                              : c.letterGrade.startsWith("A")
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {c.letterGrade}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center font-mono text-gray-600">
                        {c.gradePoint.toFixed(1)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          ✓ Official
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
