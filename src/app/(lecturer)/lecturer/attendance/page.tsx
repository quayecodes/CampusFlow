"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { AttendanceStatus } from "@prisma/client";
import { AttendanceBadge } from "@/components/attendance/AttendanceBadge";
import { AttendanceThresholdBadge } from "@/components/attendance/AttendanceThresholdBadge";

interface LecturerCourse {
  id: string;
  title: string;
  creditHours: number;
  department: string;
  enrolledCount: number;
}

interface StudentAttendanceStats {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  currentStatus: AttendanceStatus | null;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
  isAtRisk: boolean;
}

interface CourseRoster {
  courseId: string;
  courseTitle: string;
  semester: string;
  sessionDate: string;
  students: StudentAttendanceStats[];
  summary: {
    totalEnrolled: number;
    markedToday: number;
    presentToday: number;
    lateToday: number;
    absentToday: number;
    atRiskStudentsCount: number;
  };
}

export default function LecturerAttendancePage() {
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [roster, setRoster] = useState<CourseRoster | null>(null);
  const [attendanceDraft, setAttendanceDraft] = useState<
    Record<string, AttendanceStatus>
  >({});

  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 1. Fetch lecturer courses on mount
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
        console.error("Failed to load lecturer courses:", err);
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

  // 2. Load roster when selectedCourseId or sessionDate changes
  const loadRoster = useCallback(async (courseId: string, date: string) => {
    if (!courseId) return;
    try {
      setIsLoadingRoster(true);
      const res = await fetch(
        `/api/v1/attendance/courses/${courseId}?date=${date}`
      );
      const json = await res.json();
      if (res.ok && json.data) {
        setRoster(json.data);
        // Pre-populate draft with existing marked status for today
        const draft: Record<string, AttendanceStatus> = {};
        json.data.students.forEach((s: StudentAttendanceStats) => {
          if (s.currentStatus) {
            draft[s.enrollmentId] = s.currentStatus;
          }
        });
        setAttendanceDraft(draft);
      } else {
        setNotification({
          type: "error",
          message: json.error?.message || "Failed to load session roster.",
        });
      }
    } catch (err) {
      console.error("Roster error:", err);
      setNotification({
        type: "error",
        message: "Network error loading attendance roster.",
      });
    } finally {
      setIsLoadingRoster(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadRoster(selectedCourseId, sessionDate);
    }
  }, [selectedCourseId, sessionDate, loadRoster]);

  // Handle single student status button click
  const handleStatusChange = (
    enrollmentId: string,
    status: AttendanceStatus
  ) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [enrollmentId]: status,
    }));
  };

  // Bulk status update (Mark all present or mark all absent)
  const handleMarkAll = (status: AttendanceStatus) => {
    if (!roster) return;
    const next: Record<string, AttendanceStatus> = {};
    roster.students.forEach((s) => {
      next[s.enrollmentId] = status;
    });
    setAttendanceDraft(next);
  };

  // Submit attendance records to API
  const handleSaveAttendance = () => {
    if (!selectedCourseId || !roster) return;

    const records = Object.entries(attendanceDraft).map(
      ([enrollmentId, status]) => ({
        enrollmentId,
        status,
      })
    );

    if (records.length === 0) {
      setNotification({
        type: "error",
        message: "Please mark at least one student before saving.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/v1/attendance/courses/${selectedCourseId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionDate,
              records,
            }),
          }
        );
        const json = await res.json();
        if (res.ok) {
          setNotification({
            type: "success",
            message: `Attendance for ${sessionDate} successfully saved (${json.data.savedCount} students recorded).`,
          });
          loadRoster(selectedCourseId, sessionDate);
        } else {
          setNotification({
            type: "error",
            message: json.error?.message || "Failed to save attendance.",
          });
        }
      } catch (err) {
        console.error("Save error:", err);
        setNotification({
          type: "error",
          message: "Network error occurred while saving attendance.",
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
                Attendance Tracking
              </span>
            </nav>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Session Attendance Marking
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Record present, late, and absent attendance per class session and
              monitor student threshold compliance.
            </p>
          </div>
        </div>

        {/* Alerts / Feedback Banner */}
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
              aria-label="Dismiss message"
              className="rounded px-1.5 py-0.5 underline hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Control Bar: Course Selector & Date */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Course Selector */}
            <div>
              <label
                htmlFor="select-assigned-course"
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
                  id="select-assigned-course"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.enrolledCount} enrolled)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Session Date */}
            <div>
              <label
                htmlFor="select-session-date"
                className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
              >
                Session Date
              </label>
              <div className="mt-1.5 flex space-x-2">
                <input
                  id="select-session-date"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  max={new Date().toISOString().substring(0, 10)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setSessionDate(new Date().toISOString().substring(0, 10))
                  }
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2 md:col-span-1">
              <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                Session Status Summary
              </span>
              <div className="mt-1 flex items-center space-x-3 text-xs">
                <span className="font-bold text-emerald-800">
                  {roster?.summary.presentToday || 0} Present
                </span>
                <span className="font-bold text-amber-800">
                  {roster?.summary.lateToday || 0} Late
                </span>
                <span className="font-bold text-red-800">
                  {roster?.summary.absentToday || 0} Absent
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Attendance Threshold Alert Banner (FR6) */}
        {roster && roster.summary.atRiskStudentsCount > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center space-x-3">
              <span className="text-lg">⚠️</span>
              <div>
                <h2 className="text-sm font-bold text-amber-900">
                  Attendance Compliance Alert (FR6)
                </h2>
                <p className="text-xs text-amber-800">
                  {roster.summary.atRiskStudentsCount} student(s) currently have
                  cumulative attendance below the university requirement of 75%.
                  Review the highlighted students below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Roster & Attendance Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          {/* Table Action Header */}
          <div className="flex flex-col justify-between border-b border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">
                Student Roll Call
              </h2>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                {roster?.students.length || 0} enrolled
              </span>
            </div>

            {/* Quick Bulk Marking Actions */}
            <div className="mt-3 flex items-center space-x-2 sm:mt-0">
              <span className="text-xs font-semibold text-slate-600">
                Bulk action:
              </span>
              <button
                type="button"
                onClick={() => handleMarkAll(AttendanceStatus.PRESENT)}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll(AttendanceStatus.ABSENT)}
                className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-800 transition hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Table Content */}
          {isLoadingRoster ? (
            <div
              className="p-8 text-center text-xs text-slate-600"
              aria-busy="true"
            >
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <p className="mt-2">Loading attendance roster...</p>
            </div>
          ) : !roster || roster.students.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-600">
              <p className="font-bold text-slate-800">No students enrolled</p>
              <p className="mt-1">
                Students must register for this course before attendance can be
                recorded.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y divide-slate-200 text-left text-sm"
                aria-label="Student attendance roll call table"
              >
                <caption className="sr-only">
                  Student list with session attendance status toggles
                </caption>
                <thead className="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Student Name &amp; Contact
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Cumulative Standing
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Current Saved Status
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Mark Session Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-xs">
                  {roster.students.map((student) => {
                    const draftStatus = attendanceDraft[student.enrollmentId];

                    return (
                      <tr
                        key={student.enrollmentId}
                        className={`transition hover:bg-slate-50 ${
                          student.isAtRisk ? "bg-red-50/40" : ""
                        }`}
                      >
                        {/* Student Name */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">
                            {student.studentName}
                          </div>
                          <div className="text-slate-600">
                            {student.studentEmail}
                          </div>
                        </td>

                        {/* Cumulative Attendance Standing */}
                        <td className="px-6 py-4">
                          <AttendanceThresholdBadge
                            percentage={student.attendancePercentage}
                            totalSessions={student.totalSessions}
                          />
                          <div className="mt-1 text-slate-600">
                            {student.presentCount}P / {student.lateCount}L /{" "}
                            {student.absentCount}A ({student.totalSessions}{" "}
                            sessions total)
                          </div>
                        </td>

                        {/* Current Saved Status */}
                        <td className="px-6 py-4">
                          <AttendanceBadge status={student.currentStatus} />
                        </td>

                        {/* Interactive Status Marking Buttons */}
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  student.enrollmentId,
                                  AttendanceStatus.PRESENT
                                )
                              }
                              className={`rounded-md px-3 py-1 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none ${
                                draftStatus === AttendanceStatus.PRESENT
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-700 hover:text-emerald-800"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  student.enrollmentId,
                                  AttendanceStatus.LATE
                                )
                              }
                              className={`rounded-md px-3 py-1 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none ${
                                draftStatus === AttendanceStatus.LATE
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : "text-slate-700 hover:text-amber-800"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  student.enrollmentId,
                                  AttendanceStatus.ABSENT
                                )
                              }
                              className={`rounded-md px-3 py-1 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none ${
                                draftStatus === AttendanceStatus.ABSENT
                                  ? "bg-red-600 text-white shadow-xs"
                                  : "text-slate-700 hover:text-red-800"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Save Action */}
          {roster && roster.students.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <span className="text-xs font-medium text-slate-600">
                {Object.keys(attendanceDraft).length} of{" "}
                {roster.students.length} students marked
              </span>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isPending}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving Records...
                  </>
                ) : (
                  "Save Attendance Session"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
