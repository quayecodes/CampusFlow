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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
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

  // Departments list for quick filter
  const departments = [
    "ALL",
    ...Array.from(
      new Set(courses.map((c) => c.department?.name).filter(Boolean))
    ),
  ];

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesDept =
      selectedDept === "ALL" || c.department?.name === selectedDept;
    const matchesSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
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
                Course Registration
              </span>
            </nav>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Course Registration &amp; Curriculum
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Active Registration Window • Semester:{" "}
              <strong className="font-semibold text-slate-900">
                {semester}
              </strong>
            </p>
          </div>

          {/* Credit Load Indicator Card */}
          <div className="rounded-2xl border border-indigo-100 bg-white p-3.5 shadow-2xs sm:w-64">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Registered Load:</span>
              <span className="font-bold text-indigo-700">
                {totalCredits} / 18 Credits
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-slate-200/60 bg-slate-100">
              <div
                className={`h-full transition-all duration-300 ${
                  totalCredits > 18
                    ? "bg-red-500"
                    : totalCredits >= 15
                      ? "bg-amber-500"
                      : "bg-indigo-600"
                }`}
                style={{
                  width: `${Math.min(100, (totalCredits / 18) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-1.5 text-right text-[10px] text-slate-400">
              18 credits max allowed per university policy
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800"
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
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800"
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

        {/* View Tabs & Live Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex border-b border-slate-200">
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
                className={`border-b-2 pb-3 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none sm:text-sm ${
                  activeTab === "available"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                Available Courses ({courses.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "my-courses"}
                onClick={() => setActiveTab("my-courses")}
                className={`border-b-2 pb-3 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none sm:text-sm ${
                  activeTab === "my-courses"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                My Registered Courses ({enrollments.length})
              </button>
            </nav>
          </div>

          {activeTab === "available" && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Bar */}
              <div className="relative max-w-md flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter courses by title or keyword..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 pl-9 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                />
                <svg
                  className="absolute top-2.5 left-3 h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>

              {/* Department Pills */}
              <div className="flex gap-1.5 overflow-x-auto py-1">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept as string)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                      selectedDept === dept
                        ? "bg-slate-900 text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {dept === "ALL" ? "All Departments" : dept}
                  </button>
                ))}
              </div>
            </div>
          )}
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
                className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
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
          filteredCourses.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-sm font-semibold text-slate-700">
                No courses match your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDept("ALL");
                }}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnroll}
                  isLoading={actionLoadingId === course.id}
                />
              ))}
            </div>
          )
        ) : /* My Registered Courses View */
        enrollments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
            <p className="text-sm font-bold text-slate-800">
              No registered courses found for {semester}.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              You haven&apos;t enrolled in any courses yet this term.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
            >
              Browse Available Courses &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View (Hidden on mobile < md) */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs md:block">
              <div className="overflow-x-auto">
                <table
                  className="min-w-full divide-y divide-slate-200 text-left text-sm"
                  aria-label="Registered courses table"
                >
                  <caption className="sr-only">
                    List of courses you are actively enrolled in this semester
                  </caption>
                  <thead className="bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                    <tr>
                      <th scope="col" className="px-6 py-4">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Instructor
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Credits
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Enrolled On
                      </th>
                      <th scope="col" className="px-6 py-4 text-right">
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
                          <p className="text-[11px] text-slate-500">
                            {enr.course.department?.name}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {enr.course.lecturer?.fullName || "Faculty Member"}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          {enr.course.creditHours}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">
                          {new Date(enr.enrolledAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDrop(enr.id, enr.course.title)}
                            disabled={actionLoadingId === enr.id}
                            className="btn-tactile rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
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

            {/* Mobile Adaptive Cards View (Visible on mobile < md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {enrollments.map((enr) => (
                <div
                  key={enr.id}
                  className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {enr.course.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {enr.course.department?.name}
                      </p>
                    </div>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                      {enr.course.creditHours} Cr
                    </span>
                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-600">
                    <p>
                      Instructor:{" "}
                      <strong>
                        {enr.course.lecturer?.fullName || "Faculty"}
                      </strong>
                    </p>
                    <p className="font-mono text-[11px] text-slate-400">
                      Enrolled: {new Date(enr.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleDrop(enr.id, enr.course.title)}
                      disabled={actionLoadingId === enr.id}
                      className="btn-tactile w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {actionLoadingId === enr.id
                        ? "Dropping Course..."
                        : "Drop Course"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
