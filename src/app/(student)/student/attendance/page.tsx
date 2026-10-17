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
          // Default expand first course if present
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/student" className="hover:text-gray-700">
              Student Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">Attendance</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            My Course Attendance
          </h1>
          <p className="text-sm text-gray-500">
            Track your class session participation, monitor the mandatory 75%
            minimum attendance threshold, and review session histories.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Overall Health Card */}
        {!isLoading && totalCourses > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
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
                <span className="text-xs text-gray-500">across courses</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Enrolled Courses
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-gray-900">
                  {totalCourses}
                </span>
                <span className="text-xs text-gray-500">active this term</span>
              </div>
            </div>

            <div
              className={`rounded-xl border p-5 shadow-sm ${
                atRiskCount > 0
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Compliance Status
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                {atRiskCount > 0 ? (
                  <>
                    <span className="text-3xl font-extrabold text-red-600">
                      {atRiskCount}
                    </span>
                    <span className="text-xs font-medium text-red-700">
                      course(s) below 75% threshold
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold text-emerald-600">
                      0
                    </span>
                    <span className="text-xs font-medium text-emerald-700">
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
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : totalCourses === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <h3 className="text-base font-semibold text-gray-800">
              No Course Enrollments Found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven&apos;t enrolled in any courses for the active semester
              yet.
            </p>
            <div className="mt-6">
              <Link
                href="/student/courses"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Browse & Register Courses →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => {
              const isExpanded = expandedCourseId === course.courseId;
              const hasWarning = course.isAtRisk;

              return (
                <div
                  key={course.courseId}
                  className={`rounded-xl border bg-white shadow-sm transition ${
                    hasWarning
                      ? "border-red-300 ring-1 ring-red-200"
                      : "border-gray-200"
                  }`}
                >
                  {/* Course Card Header */}
                  <div className="p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-lg font-bold text-gray-900">
                            {course.courseTitle}
                          </h2>
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            {course.creditHours} Credits
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Instructor: {course.lecturerName}
                        </p>
                      </div>

                      {/* Percentage & Standing Pill */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2 sm:justify-end">
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
                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                              ⚠️ Below 75%
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                              Good Standing
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {course.presentCount} present of{" "}
                          {course.totalSessions} sessions
                        </p>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-4">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
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
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                        <span className="font-bold">
                          Attendance Requirement Warning:
                        </span>{" "}
                        Your attendance has dropped below 75%. University policy
                        requires at least 75% participation to remain eligible
                        for the final course examination.
                      </div>
                    )}

                    {/* Detailed Stats Chips */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <div className="flex space-x-4 text-xs">
                        <span className="text-gray-600">
                          Total Sessions:{" "}
                          <strong className="text-gray-900">
                            {course.totalSessions}
                          </strong>
                        </span>
                        <span className="text-emerald-700">
                          Present: <strong>{course.presentCount}</strong>
                        </span>
                        <span className="text-amber-700">
                          Late: <strong>{course.lateCount}</strong>
                        </span>
                        <span className="text-red-700">
                          Absent: <strong>{course.absentCount}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(course.courseId)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        {isExpanded
                          ? "Hide Session History ▲"
                          : `View Session History (${course.records.length}) ▼`}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Session Log Table */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50/50 p-5">
                      <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
                        Session Roll History
                      </h4>
                      {course.records.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          No class sessions have been recorded yet for this
                          course.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                            <thead className="bg-gray-50 font-semibold text-gray-600">
                              <tr>
                                <th className="px-4 py-2.5">Date</th>
                                <th className="px-4 py-2.5">Recorded Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {course.records.map((rec) => (
                                <tr key={rec.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 font-mono text-gray-700">
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
