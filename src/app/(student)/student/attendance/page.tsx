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

function AttendanceProgressRing({
  percentage,
  size = 72,
  strokeWidth = 6,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isHealthy = percentage >= 75;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="-rotate-90 transform" width={size} height={size}>
        <circle
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`transition-all duration-700 ease-out ${
            isHealthy ? "text-emerald-500" : "text-red-500"
          }`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span
        className={`absolute text-xs font-black ${
          isHealthy ? "text-emerald-700" : "text-red-700"
        }`}
      >
        {percentage}%
      </span>
    </div>
  );
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
              Attendance Compliance
            </span>
          </nav>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Attendance &amp; Exam Eligibility (FR6)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor class roll call, track compliance with the 75% minimum
            threshold for exam qualification, and inspect session histories.
          </p>
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

        {/* Cockpit Summary Bento Grid */}
        {!isLoading && totalCourses > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bento-card flex items-center justify-between border border-slate-200 p-6">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  Institutional Average
                </span>
                <p className="mt-1 text-3xl font-black text-slate-900">
                  {overallAverage}%
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Across all registered courses
                </p>
              </div>
              <AttendanceProgressRing percentage={overallAverage} size={70} />
            </div>

            <div className="bento-card border border-slate-200 p-6">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Active Enrolled Courses
              </span>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {totalCourses} Courses
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Current semester: 2026-Fall
              </p>
            </div>

            <div
              className={`bento-card border p-6 ${
                atRiskCount > 0
                  ? "border-red-200 bg-red-50/50"
                  : "border-emerald-200 bg-emerald-50/50"
              }`}
            >
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Compliance Status (FR6)
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-black ${
                    atRiskCount > 0 ? "text-red-700" : "text-emerald-700"
                  }`}
                >
                  {atRiskCount > 0 ? `${atRiskCount} At Risk` : "100% Eligible"}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-600">
                {atRiskCount > 0
                  ? "Action required: Must attend upcoming lectures"
                  : "All courses meet or exceed 75% threshold"}
              </p>
            </div>
          </div>
        )}

        {/* Course Attendance Cards */}
        {isLoading ? (
          <div
            className="space-y-4"
            aria-busy="true"
            aria-label="Loading attendance data"
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
            <p className="text-sm font-bold text-slate-800">
              You are not registered in any courses this semester.
            </p>
            <Link
              href="/student/courses"
              className="mt-3 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
            >
              Register for Courses &rarr;
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
                  className={`overflow-hidden rounded-2xl border bg-white shadow-2xs transition hover:shadow-md ${
                    hasWarning ? "border-red-300" : "border-slate-200"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <AttendanceProgressRing
                          percentage={course.attendancePercentage}
                          size={64}
                          strokeWidth={6}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-slate-900">
                              {course.courseTitle}
                            </h2>
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                              {course.creditHours} Credits
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Instructor:{" "}
                            <span className="font-semibold text-slate-700">
                              {course.lecturerName}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Percentage Badge */}
                      <div className="flex items-center justify-between sm:flex-col sm:items-end">
                        {hasWarning ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                            <span className="pulse-glow h-2 w-2 rounded-full bg-red-500" />
                            &lt;75% At-Risk (FR6)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Exam Eligible
                          </span>
                        )}
                        <span className="mt-1 font-mono text-xs text-slate-500">
                          {course.presentCount} of {course.totalSessions}{" "}
                          sessions
                        </span>
                      </div>
                    </div>

                    {/* Low Attendance Notice Banner (FR6) */}
                    {hasWarning && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs leading-relaxed text-red-900">
                        <strong className="font-bold">Attendance Alert:</strong>{" "}
                        Your participation is below the mandatory 75% threshold.
                        Under university policy, students with attendance below
                        75% are ineligible to sit for the final examination.
                      </div>
                    )}

                    {/* Stats Chips & Toggle */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex flex-wrap gap-4 text-xs font-semibold">
                        <span className="text-slate-600">
                          Total Sessions:{" "}
                          <strong className="text-slate-900">
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
                        aria-expanded={isExpanded}
                        className="btn-tactile text-xs font-bold text-indigo-600 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                      >
                        {isExpanded
                          ? "Hide Session Logs ▲"
                          : `View Session Logs (${course.records.length}) ▼`}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Session Log */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/70 p-5">
                      <h3 className="mb-3 text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                        Recorded Session History
                      </h3>
                      {course.records.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No lecture roll-calls recorded yet for this course.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                          {course.records.map((rec) => (
                            <div
                              key={rec.id}
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
                            >
                              <span className="font-mono text-xs font-semibold text-slate-800">
                                {rec.sessionDate}
                              </span>
                              <AttendanceBadge status={rec.status} size="sm" />
                            </div>
                          ))}
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
