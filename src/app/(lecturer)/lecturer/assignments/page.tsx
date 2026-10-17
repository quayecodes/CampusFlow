"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";

interface LecturerCourse {
  id: string;
  title: string;
}

interface AssignmentItem {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  metrics: {
    totalEnrolled: number;
    totalSubmissions: number;
    gradedCount: number;
    pendingGradingCount: number;
    lateCount: number;
  };
}

interface StudentSubmissionRoll {
  studentId: string;
  studentName: string;
  studentEmail: string;
  submission: {
    id: string;
    fileUrl: string;
    submittedAt: string;
    isLate: boolean;
    score: number | null;
    feedback: string | null;
    gradedAt: string | null;
  } | null;
}

interface AssignmentDetails {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  students: StudentSubmissionRoll[];
}

export default function LecturerAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal 1: Create Assignment State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseId, setNewCourseId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("100");
  const [isCreating, startCreateTransition] = useTransition();

  // Modal 2: View Submissions & Grade Drawer State
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(
    null
  );
  const [assignmentDetails, setAssignmentDetails] =
    useState<AssignmentDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [gradingDraft, setGradingDraft] = useState<
    Record<string, { score: string; feedback: string }>
  >({});
  const [isGrading, startGradeTransition] = useTransition();

  // Handle ESC key to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeAssignmentId) setActiveAssignmentId(null);
        if (showCreateModal) setShowCreateModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAssignmentId, showCreateModal]);

  // Load assignments and courses
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = selectedCourseFilter
        ? `/api/v1/assignments?courseId=${selectedCourseFilter}`
        : "/api/v1/assignments";

      const [assignRes, coursesRes] = await Promise.all([
        fetch(url),
        fetch("/api/v1/attendance/courses"),
      ]);

      const assignJson = await assignRes.json();
      const coursesJson = await coursesRes.json();

      if (assignRes.ok && assignJson.data?.assignments) {
        setAssignments(assignJson.data.assignments);
      }

      if (coursesRes.ok && coursesJson.data?.courses) {
        setCourses(coursesJson.data.courses);
        if (!newCourseId && coursesJson.data.courses.length > 0) {
          setNewCourseId(coursesJson.data.courses[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load assignments:", err);
      setNotification({
        type: "error",
        message: "Network error loading assignments.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseFilter, newCourseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler: Open Submissions Modal
  const openSubmissions = async (assignmentId: string) => {
    setActiveAssignmentId(assignmentId);
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`/api/v1/assignments/${assignmentId}`);
      const json = await res.json();
      if (res.ok && json.data?.assignment) {
        const details: AssignmentDetails = json.data.assignment;
        setAssignmentDetails(details);

        // Prepopulate grading draft
        const draft: Record<string, { score: string; feedback: string }> = {};
        details.students.forEach((item) => {
          if (item.submission) {
            draft[item.submission.id] = {
              score:
                item.submission.score !== null
                  ? String(item.submission.score)
                  : "",
              feedback: item.submission.feedback || "",
            };
          }
        });
        setGradingDraft(draft);
      } else {
        setNotification({
          type: "error",
          message: json.error?.message || "Failed to load submission roll.",
        });
      }
    } catch (err) {
      console.error("Submissions roll error:", err);
      setNotification({
        type: "error",
        message: "Network error loading submissions.",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handler: Create Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseId || !newTitle || !newDueDate || !newMaxScore) {
      setNotification({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    startCreateTransition(async () => {
      try {
        const res = await fetch("/api/v1/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: newCourseId,
            title: newTitle.trim(),
            description: newDescription.trim() || undefined,
            dueDate: new Date(newDueDate).toISOString(),
            maxScore: Number(newMaxScore),
          }),
        });

        const json = await res.json();
        if (res.ok) {
          setNotification({
            type: "success",
            message: "Assignment created successfully.",
          });
          setShowCreateModal(false);
          setNewTitle("");
          setNewDescription("");
          setNewDueDate("");
          loadData();
        } else {
          setNotification({
            type: "error",
            message: json.error?.message || "Failed to create assignment.",
          });
        }
      } catch (err) {
        console.error("Create error:", err);
        setNotification({
          type: "error",
          message: "Network error creating assignment.",
        });
      }
    });
  };

  // Handler: Submit Single Grade
  const handleSaveGrade = (submissionId: string) => {
    const draft = gradingDraft[submissionId];
    if (!draft || draft.score === "") {
      setNotification({
        type: "error",
        message: "Please enter a score before saving.",
      });
      return;
    }

    const scoreNum = Number(draft.score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setNotification({
        type: "error",
        message: "Score must be a positive number.",
      });
      return;
    }

    if (assignmentDetails && scoreNum > assignmentDetails.maxScore) {
      setNotification({
        type: "error",
        message: `Score cannot exceed the maximum of ${assignmentDetails.maxScore} points.`,
      });
      return;
    }

    startGradeTransition(async () => {
      try {
        const res = await fetch(
          `/api/v1/assignments/${activeAssignmentId}/grade`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              submissionId,
              score: scoreNum,
              feedback: draft.feedback,
            }),
          }
        );

        const json = await res.json();
        if (res.ok) {
          setNotification({
            type: "success",
            message: "Grade and feedback saved successfully.",
          });
          if (activeAssignmentId) {
            openSubmissions(activeAssignmentId);
            loadData();
          }
        } else {
          setNotification({
            type: "error",
            message: json.error?.message || "Failed to save grade.",
          });
        }
      } catch (err) {
        console.error("Grade submission error:", err);
        setNotification({
          type: "error",
          message: "Network error saving grade.",
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
                Assignments
              </span>
            </nav>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Assignment Management &amp; Grading
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Create course assignments, monitor student submissions, inspect
              late flags, and enter scores with feedback.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            + Create Assignment
          </button>
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

        {/* Filter Toolbar */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center space-x-3">
            <label
              htmlFor="filter-course-select"
              className="text-xs font-bold tracking-wider text-slate-700 uppercase"
            >
              Filter by Course:
            </label>
            <select
              id="filter-course-select"
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              <option value="">All Assigned Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs font-medium text-slate-600">
            {assignments.length} assignment{assignments.length === 1 ? "" : "s"}{" "}
            total
          </span>
        </div>

        {/* Assignments List */}
        {isLoading ? (
          <div
            className="space-y-4"
            aria-busy="true"
            aria-label="Loading assignments list"
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <h2 className="text-base font-bold text-slate-900">
              No Assignments Created
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Get started by creating your first course assignment.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              + Create Assignment Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {assignments.map((item) => {
              const due = new Date(item.dueDate);
              const isPastDue = new Date() > due;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="rounded-md border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          {item.courseTitle}
                        </span>
                        <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                          Max: {item.maxScore} pts
                        </span>
                        {isPastDue ? (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                            Due Passed
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                            Active
                          </span>
                        )}
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-slate-900">
                        {item.title}
                      </h2>
                      {item.description && (
                        <p className="mt-1 text-xs text-slate-600">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-2 font-mono text-xs text-slate-600">
                        Due: {due.toLocaleDateString()} at{" "}
                        {due.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openSubmissions(item.id)}
                      className="inline-flex items-center rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                    >
                      View &amp; Grade Submissions (
                      {item.metrics.totalSubmissions}) →
                    </button>
                  </div>

                  {/* Submission Progress & Metrics Bar */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <span className="text-[11px] font-semibold text-slate-600">
                          Submitted
                        </span>
                        <p className="text-base font-extrabold text-slate-900">
                          {item.metrics.totalSubmissions} /{" "}
                          {item.metrics.totalEnrolled}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Graded
                        </span>
                        <p className="text-base font-extrabold text-emerald-900">
                          {item.metrics.gradedCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <span className="text-[11px] font-semibold text-amber-700">
                          Pending Review
                        </span>
                        <p className="text-base font-extrabold text-amber-900">
                          {item.metrics.pendingGradingCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <span className="text-[11px] font-semibold text-red-700">
                          Late (FR10)
                        </span>
                        <p className="text-base font-extrabold text-red-900">
                          {item.metrics.lateCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL 1: Create Assignment */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-create-title"
          >
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3
                  id="modal-create-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Create Course Assignment
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close dialog"
                  className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleCreateAssignment}
                className="mt-4 space-y-4"
              >
                <div>
                  <label
                    htmlFor="create-course-select"
                    className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                  >
                    Course *
                  </label>
                  <select
                    id="create-course-select"
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="create-title-input"
                    className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                  >
                    Assignment Title *
                  </label>
                  <input
                    id="create-title-input"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lab 3: Binary Search Tree Implementation"
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs placeholder:text-slate-600 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="create-desc-input"
                    className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                  >
                    Description &amp; Instructions
                  </label>
                  <textarea
                    id="create-desc-input"
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Outline submission requirements, allowed file formats, and evaluation criteria..."
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs placeholder:text-slate-600 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="create-duedate-input"
                      className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                    >
                      Due Date &amp; Time *
                    </label>
                    <input
                      id="create-duedate-input"
                      type="datetime-local"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      required
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="create-maxscore-input"
                      className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                    >
                      Max Score (Points) *
                    </label>
                    <input
                      id="create-maxscore-input"
                      type="number"
                      step="1"
                      min="1"
                      value={newMaxScore}
                      onChange={(e) => setNewMaxScore(e.target.value)}
                      required
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                  >
                    {isCreating ? "Creating..." : "Create Assignment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: View Submissions & Grade Drawer */}
        {activeAssignmentId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-submissions-title"
          >
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <div>
                  <h3
                    id="modal-submissions-title"
                    className="text-base font-bold text-slate-900"
                  >
                    {assignmentDetails?.title || "Submissions Roll"}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {assignmentDetails?.courseTitle} • Max Score:{" "}
                    {assignmentDetails?.maxScore} pts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAssignmentId(null)}
                  aria-label="Close submissions dialog"
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body / Table */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingDetails ? (
                  <div
                    className="p-12 text-center text-xs text-slate-600"
                    aria-busy="true"
                  >
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    <p className="mt-2">Loading submissions...</p>
                  </div>
                ) : !assignmentDetails ||
                  assignmentDetails.students.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-600">
                    No students currently enrolled in this course.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {assignmentDetails.students.map((item) => {
                      const sub = item.submission;
                      const draft = sub
                        ? gradingDraft[sub.id] || { score: "", feedback: "" }
                        : { score: "", feedback: "" };

                      return (
                        <div
                          key={item.studentId}
                          className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
                        >
                          {/* Student Info & Submission Link */}
                          <div className="md:w-1/3">
                            <h4 className="text-sm font-bold text-slate-900">
                              {item.studentName}
                            </h4>
                            <p className="font-mono text-xs text-slate-600">
                              {item.studentEmail}
                            </p>
                            {sub ? (
                              <div className="mt-1 flex items-center space-x-2">
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center rounded text-xs font-semibold text-indigo-600 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                                >
                                  📎 Download Attachment
                                </a>
                                {sub.isLate ? (
                                  <span className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                                    ⚠️ Late Submission (FR10)
                                  </span>
                                ) : (
                                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                    ✓ On Time
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                Not Submitted
                              </span>
                            )}
                          </div>

                          {/* Submission Timestamp */}
                          <div className="text-xs text-slate-600 md:w-1/4">
                            {sub ? (
                              <>
                                <span className="font-medium">Submitted:</span>
                                <p className="font-mono text-slate-800">
                                  {new Date(sub.submittedAt).toLocaleString()}
                                </p>
                              </>
                            ) : (
                              <span>—</span>
                            )}
                          </div>

                          {/* Grading & Feedback Controls */}
                          {sub ? (
                            <div className="flex items-center space-x-2 md:w-5/12">
                              <div className="w-24">
                                <label
                                  htmlFor={`score-${sub.id}`}
                                  className="block text-[10px] font-bold text-slate-700 uppercase"
                                >
                                  Score
                                </label>
                                <input
                                  id={`score-${sub.id}`}
                                  type="number"
                                  min="0"
                                  max={assignmentDetails.maxScore}
                                  value={draft.score}
                                  onChange={(e) =>
                                    setGradingDraft((prev) => ({
                                      ...prev,
                                      [sub.id]: {
                                        ...draft,
                                        score: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder={`/ ${assignmentDetails.maxScore}`}
                                  className="block w-full rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                                />
                              </div>

                              <div className="flex-1">
                                <label
                                  htmlFor={`feedback-${sub.id}`}
                                  className="block text-[10px] font-bold text-slate-700 uppercase"
                                >
                                  Feedback
                                </label>
                                <input
                                  id={`feedback-${sub.id}`}
                                  type="text"
                                  value={draft.feedback}
                                  onChange={(e) =>
                                    setGradingDraft((prev) => ({
                                      ...prev,
                                      [sub.id]: {
                                        ...draft,
                                        feedback: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Leave comments..."
                                  className="block w-full rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-900 shadow-xs focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSaveGrade(sub.id)}
                                disabled={isGrading}
                                className="mt-3.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-600 italic md:w-5/12">
                              Cannot grade unsubmitted assignment.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setActiveAssignmentId(null)}
                  className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                >
                  Close Roll
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
