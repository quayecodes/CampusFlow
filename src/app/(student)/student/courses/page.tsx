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
      }
      if (enrollmentsRes.ok && enrollmentsJson.data?.enrollments) {
        setEnrollments(
          enrollmentsJson.data.enrollments.filter(
            (e: Enrollment) => e.status === "ENROLLED"
          )
        );
      }
    } catch {
      setErrorMessage("Failed to load courses. Please check your connection.");
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
        setSuccessMessage("Successfully registered for course!");
        await fetchData();
      }
    } catch {
      setErrorMessage("Network error during enrollment.");
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
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/student"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Student Portal
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Course Registration
            </h1>
            <p className="text-sm text-gray-500">
              Semester:{" "}
              <span className="font-semibold text-gray-700">{semester}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-xs text-gray-500">Registered Credits</p>
              <p className="text-lg font-bold text-indigo-600">
                {totalCredits}{" "}
                <span className="text-xs font-normal text-gray-500">
                  Credits
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <div className="flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <div className="flex items-center justify-between">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-500 hover:text-green-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab("available")}
              className={`border-b-2 pb-3 text-sm font-medium transition ${
                activeTab === "available"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Available Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab("my-courses")}
              className={`border-b-2 pb-3 text-sm font-medium transition ${
                activeTab === "my-courses"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              My Registered Courses ({enrollments.length})
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 animate-pulse rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
                <div className="mt-8 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-5/6 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "available" ? (
          /* Available Courses Grid */
          courses.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">
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
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">
              You have not registered for any courses this semester.
            </p>
            <button
              onClick={() => setActiveTab("available")}
              className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Browse available courses →
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Course</th>
                    <th className="px-6 py-3">Instructor</th>
                    <th className="px-6 py-3">Credits</th>
                    <th className="px-6 py-3">Enrolled On</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {enr.course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {enr.course.department?.name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {enr.course.lecturer?.fullName || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {enr.course.creditHours}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(enr.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDrop(enr.id, enr.course.title)}
                          disabled={actionLoadingId === enr.id}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
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
