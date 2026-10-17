"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CourseCard } from "@/components/courses/CourseCard";

interface Course {
  id: string;
  title: string;
  creditHours: number;
  maxCapacity: number;
  semester: string;
  department?: { name: string };
  lecturer?: { fullName: string; email: string };
  activeEnrollmentCount: number;
  availableSeats: number;
  isFull: boolean;
  isEnrolled: boolean;
}

interface Enrollment {
  id: string;
  semester: string;
  status: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    creditHours: number;
    department?: { name: string };
    lecturer?: { fullName: string; email: string };
  };
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeTab, setActiveTab] = useState<"available" | "my-courses">(
    "available"
  );
  const [semester] = useState("2026-Fall");

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch(`/api/v1/courses?semester=${semester}`),
        fetch(`/api/v1/enrollments?semester=${semester}`),
      ]);

      const coursesJson = await coursesRes.json();
      const enrollmentsJson = await enrollmentsRes.json();

      if (coursesRes.ok && coursesJson.data?.courses) {
        setCourses(coursesJson.data.courses);
      } else {
        setErrorMessage(
          coursesJson.error?.message || "Failed to load course list."
        );
      }

      if (enrollmentsRes.ok && enrollmentsJson.data?.enrollments) {
        setEnrollments(enrollmentsJson.data.enrollments);
      }
    } catch {
      setErrorMessage("Network error while loading registration data.");
    } finally {
      setIsLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEnroll = async (courseId: string) => {
    setActionLoadingId(courseId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/v1/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, semester }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error?.message || "Enrollment failed.");
      } else {
        setSuccessMessage("Successfully enrolled in course!");
        await fetchData();
      }
    } catch {
      setErrorMessage("Network error while enrolling.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDrop = async (enrollmentId: string, courseTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to drop ${courseTitle}? Your enrollment status will be updated to DROPPED.`
    );
    if (!confirmed) return;

    setActionLoadingId(enrollmentId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/v1/enrollments/${enrollmentId}/drop`, {
        method: "PATCH",
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error?.message || "Failed to drop course.");
      } else {
        setSuccessMessage(`Successfully dropped ${courseTitle}.`);
        await fetchData();
      }
    } catch {
      setErrorMessage("Network error while dropping course.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalCredits = enrollments.reduce(
    (sum, e) => sum + (e.course?.creditHours || 0),
    0
  );

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
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
              <span
                className="font-semibold text-slate-900"
                aria-current="page"
              >
                Course Registration
              </span>
            </nav>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Course Registration
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Active Registration Window • Semester:{" "}
              <strong className="font-semibold text-slate-900">
                {semester}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right shadow-xs">
              <p className="text-[11px] font-medium text-slate-600">
                Registered Load
              </p>
              <p className="text-base font-bold text-indigo-600">
                {totalCredits}{" "}
                <span className="text-xs font-normal text-slate-600">
                  / 18 Credits Max
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800"
          >
            <div className="flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                aria-label="Dismiss error notice"
                className="rounded p-1 text-red-600 hover:text-red-800 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800"
          >
            <div className="flex items-center justify-between">
              <span>{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                aria-label="Dismiss success notice"
                className="rounded p-1 text-emerald-600 hover:text-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <nav
            className="-mb-px flex gap-6"
            role="tablist"
            aria-label="Course registration views"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "available"}
              onClick={() => setActiveTab("available")}
              className={`border-b-2 pb-3 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none sm:text-sm ${
                activeTab === "available"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              Available Courses ({courses.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "my-courses"}
              onClick={() => setActiveTab("my-courses")}
              className={`border-b-2 pb-3 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none sm:text-sm ${
                activeTab === "my-courses"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              My Registered Courses ({enrollments.length})
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Loading course data"
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-8 space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-5/6 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "available" ? (
          /* Available Courses Grid */
          courses.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-xs text-slate-600">
                No courses available for this semester.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnroll}
                  isLoading={actionLoadingId === course.id}
                />
              ))}
            </div>
          )
        ) : /* My Registered Courses Table */
        enrollments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-xs text-slate-600">
              You have not registered for any courses this semester.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              Browse available courses →
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y divide-slate-200 text-left text-sm"
                aria-label="Registered courses table"
              >
                <caption className="sr-only">
                  List of courses you are actively enrolled in this semester
                </caption>
                <thead className="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Instructor
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Credits
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Enrolled On
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {enr.course.title}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {enr.course.department?.name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {enr.course.lecturer?.fullName || "Faculty Member"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {enr.course.creditHours}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(enr.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDrop(enr.id, enr.course.title)}
                          disabled={actionLoadingId === enr.id}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none disabled:opacity-50"
                        >
                          {actionLoadingId === enr.id
                            ? "Dropping..."
                            : "Drop Course"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
