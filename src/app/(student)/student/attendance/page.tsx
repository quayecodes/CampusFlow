"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AttendanceStatus } from "@prisma/client";
import { AttendanceBadge } from "@/components/attendance/AttendanceBadge";

interface AttendanceRecordItem {
  id: string;
  sessionDate: string;
  status: AttendanceStatus;
}

interface StudentCourseAttendance {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  creditHours: number;
  lecturerName: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
  isAtRisk: boolean;
  records: AttendanceRecordItem[];
}

export default function StudentAttendancePage() {
  const [courses, setCourses] = useState<StudentCourseAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAttendance() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/v1/attendance/student");
        const json = await res.json();
        if (res.ok && json.data?.attendance) {
          setCourses(json.data.attendance);
          if (json.data.attendance.length > 0) {
            setExpandedCourseId(json.data.attendance[0].courseId);
          }
        } else {
          setError(json.error?.message || "Failed to load attendance records.");
        }
      } catch (err) {
        console.error("Attendance fetch error:", err);
        setError("Network error loading attendance data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAttendance();
  }, []);

  const toggleExpand = (courseId: string) => {
    setExpandedCourseId((prev) => (prev === courseId ? null : courseId));
  };

  // Compute summary stats
  const totalCourses = courses.length;
  const atRiskCount = courses.filter((c) => c.isAtRisk).length;
  const overallAverage =
    totalCourses > 0
      ? Math.round(
          courses.reduce((acc, c) => acc + c.attendancePercentage, 0) /
            totalCourses
        )
      : 100;

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Header */}
        <div className="mb-6">
          <nav
            className="mb-1 flex items-center gap-1.5 text-xs text-slate-600"
            aria-label="Breadcrumb"
          >
            <Link
              href="/student"
              className="font-medium hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              Student Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900" aria-current="page">
              Attendance
            </span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            My Course Attendance
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Track your class session participation, monitor the mandatory 75%
            minimum attendance threshold, and review session histories.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800"
          >
            {error}
          </div>
        )}

        {/* Overall Health Card */}
        {!isLoading && totalCourses > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                Average Attendance
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span
                  className={`text-3xl font-extrabold ${
                    overallAverage >= 75 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {overallAverage}%
                </span>
                <span className="text-xs text-slate-600">across courses</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                Enrolled Courses
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {totalCourses}
                </span>
                <span className="text-xs text-slate-600">active this term</span>
              </div>
            </div>

            <div
              className={`rounded-xl border p-5 shadow-xs ${
                atRiskCount > 0
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                Compliance Status (FR6)
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                {atRiskCount > 0 ? (
                  <>
                    <span className="text-3xl font-extrabold text-red-600">
                      {atRiskCount}
                    </span>
                    <span className="text-xs font-semibold text-red-800">
                      course(s) below 75% threshold
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold text-emerald-600">
                      0
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      All courses in good standing
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Course Attendance List */}
        {isLoading ? (
          <div
            className="space-y-4"
            aria-busy="true"
            aria-label="Loading attendance data"
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <p className="text-xs text-slate-600">
              You are not registered in any courses for this semester.
            </p>
            <Link
              href="/student/courses"
              className="mt-3 inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              Go to Course Registration →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => {
              const isExpanded = expandedCourseId === course.courseId;
              const hasWarning = course.isAtRisk && course.totalSessions > 0;

              return (
                <div
                  key={course.courseId}
                  className={`overflow-hidden rounded-xl border bg-white shadow-xs transition hover:shadow-md ${
                    hasWarning ? "border-red-300" : "border-slate-200"
                  }`}
                >
                  {/* Course Card Header */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">
                            {course.courseTitle}
                          </h2>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                            {course.creditHours} Credits
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          Instructor:{" "}
                          <span className="font-semibold text-slate-800">
                            {course.lecturerName}
                          </span>
                        </p>
                      </div>

                      {/* Percentage & Standing */}
                      <div className="flex flex-col items-start sm:items-end">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-2xl font-black ${
                              course.attendancePercentage >= 75
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {course.attendancePercentage}%
                          </span>
                          {hasWarning ? (
                            <span className="rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                              ⚠️ &lt;75% At Risk
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                              ✓ Good Standing
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {course.presentCount} present of{" "}
                          {course.totalSessions} sessions
                        </p>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-4">
                      <div
                        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-valuenow={course.attendancePercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${course.courseTitle} attendance: ${course.attendancePercentage}%`}
                      >
                        <div
                          className={`h-full transition-all duration-500 ${
                            course.attendancePercentage >= 75
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              course.attendancePercentage
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Low Attendance Warning Box (FR6) */}
                    {hasWarning && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                        <span className="font-bold">
                          Attendance Requirement Warning:
                        </span>{" "}
                        Your attendance has dropped below 75%. University policy
                        requires at least 75% participation to remain eligible
                        for the final course examination.
                      </div>
                    )}

                    {/* Detailed Stats Chips */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex space-x-4 text-xs font-medium">
                        <span className="text-slate-700">
                          Total Sessions:{" "}
                          <strong className="text-slate-900">
                            {course.totalSessions}
                          </strong>
                        </span>
                        <span className="text-emerald-800">
                          Present: <strong>{course.presentCount}</strong>
                        </span>
                        <span className="text-amber-800">
                          Late: <strong>{course.lateCount}</strong>
                        </span>
                        <span className="text-red-800">
                          Absent: <strong>{course.absentCount}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(course.courseId)}
                        aria-expanded={isExpanded}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                      >
                        {isExpanded
                          ? "Hide Session History ▲"
                          : `View Session History (${course.records.length}) ▼`}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Session Log Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/70 p-5">
                      <h3 className="mb-3 text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                        Session Roll History
                      </h3>
                      {course.records.length === 0 ? (
                        <p className="text-xs text-slate-600">
                          No class sessions have been recorded yet for this
                          course.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table
                            className="min-w-full divide-y divide-slate-200 text-left text-xs"
                            aria-label={`Session history for ${course.courseTitle}`}
                          >
                            <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase">
                              <tr>
                                <th scope="col" className="px-4 py-2.5">
                                  Date
                                </th>
                                <th scope="col" className="px-4 py-2.5">
                                  Recorded Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {course.records.map((rec) => (
                                <tr key={rec.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-2 font-mono text-slate-800">
                                    {rec.sessionDate}
                                  </td>
                                  <td className="px-4 py-2">
                                    <AttendanceBadge
                                      status={rec.status}
                                      size="sm"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
