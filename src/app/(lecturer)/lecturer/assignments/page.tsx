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

  // Create Assignment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseId, setNewCourseId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("100");
  const [isCreating, startCreateTransition] = useTransition();

  // Submissions & Grading Drawer/Modal State
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

  // 1. Fetch lecturer courses and assignments
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [coursesRes, assignmentsRes] = await Promise.all([
        fetch("/api/v1/attendance/courses"),
        fetch(
          `/api/v1/assignments${
            selectedCourseFilter ? `?courseId=${selectedCourseFilter}` : ""
          }`
        ),
      ]);

      const coursesJson = await coursesRes.json();
      const assignmentsJson = await assignmentsRes.json();

      if (coursesJson.data?.courses) {
        setCourses(coursesJson.data.courses);
        if (!newCourseId && coursesJson.data.courses.length > 0) {
          setNewCourseId(coursesJson.data.courses[0].id);
        }
      }

      if (assignmentsJson.data?.assignments) {
        setAssignments(assignmentsJson.data.assignments);
      }
    } catch (err) {
      console.error("Failed to load assignments:", err);
      setNotification({
        type: "error",
        message: "Failed to load assignment data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseFilter, newCourseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Open Submissions Details Modal
  const openSubmissions = async (assignmentId: string) => {
    setActiveAssignmentId(assignmentId);
    try {
      setIsLoadingDetails(true);
      const res = await fetch(`/api/v1/assignments/${assignmentId}`);
      const json = await res.json();
      if (res.ok && json.data?.assignment) {
        const details: AssignmentDetails = json.data.assignment;
        setAssignmentDetails(details);
        // Initialize grading draft with existing scores
        const draft: Record<string, { score: string; feedback: string }> = {};
        details.students.forEach((s) => {
          if (s.submission) {
            draft[s.submission.id] = {
              score:
                s.submission.score !== null ? String(s.submission.score) : "",
              feedback: s.submission.feedback || "",
            };
          }
        });
        setGradingDraft(draft);
      } else {
        setNotification({
          type: "error",
          message: json.error?.message || "Failed to load submission details.",
        });
        setActiveAssignmentId(null);
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
      setNotification({
        type: "error",
        message: "Network error loading submissions.",
      });
      setActiveAssignmentId(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // 3. Create Assignment Handler
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
            title: newTitle,
            description: newDescription,
            dueDate: newDueDate,
            maxScore: parseFloat(newMaxScore),
          }),
        });

        const json = await res.json();
        if (res.ok) {
          setNotification({
            type: "success",
            message: `Assignment "${newTitle}" successfully created.`,
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
        console.error("Create assignment error:", err);
        setNotification({
          type: "error",
          message: "Network error creating assignment.",
        });
      }
    });
  };

  // 4. Save Grade for a single submission
  const handleSaveGrade = (submissionId: string) => {
    const draft = gradingDraft[submissionId];
    if (!draft || draft.score === "") {
      setNotification({
        type: "error",
        message: "Please enter a valid numeric grade score.",
      });
      return;
    }

    const scoreNum = parseFloat(draft.score);
    if (
      isNaN(scoreNum) ||
      scoreNum < 0 ||
      (assignmentDetails && scoreNum > assignmentDetails.maxScore)
    ) {
      setNotification({
        type: "error",
        message: `Score must be between 0 and ${assignmentDetails?.maxScore}.`,
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/lecturer" className="hover:text-gray-700">
                Lecturer Portal
              </Link>
              <span>/</span>
              <span className="font-semibold text-gray-800">Assignments</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              Assignment Management & Grading
            </h1>
            <p className="text-sm text-gray-500">
              Create course assignments, monitor student submissions, inspect
              late flags, and enter scores with feedback.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            + Create Assignment
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {notification && (
          <div
            className={`mb-6 flex items-center justify-between rounded-lg border p-4 text-sm ${
              notification.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-semibold underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Filter by Course:
            </span>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Assigned Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-gray-500">
            {assignments.length} assignments total
          </span>
        </div>

        {/* Assignments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <h3 className="text-base font-semibold text-gray-800">
              No Assignments Created
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first course assignment.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
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
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          {item.courseTitle}
                        </span>
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                          Max: {item.maxScore} pts
                        </span>
                        {isPastDue ? (
                          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                            Due Passed
                          </span>
                        ) : (
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Active
                          </span>
                        )}
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-gray-900">
                        {item.title}
                      </h2>
                      {item.description && (
                        <p className="mt-1 text-xs text-gray-600">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-2 font-mono text-xs text-gray-500">
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
                      className="inline-flex items-center rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      View & Grade Submissions ({item.metrics.totalSubmissions})
                      →
                    </button>
                  </div>

                  {/* Submission Progress & Metrics Bar */}
                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                      <div className="rounded-lg bg-gray-50 p-2.5">
                        <span className="text-gray-500">Submitted</span>
                        <p className="text-base font-bold text-gray-900">
                          {item.metrics.totalSubmissions} /{" "}
                          {item.metrics.totalEnrolled}
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-2.5">
                        <span className="font-medium text-emerald-700">
                          Graded
                        </span>
                        <p className="text-base font-bold text-emerald-900">
                          {item.metrics.gradedCount}
                        </p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-2.5">
                        <span className="font-medium text-amber-700">
                          Pending Grading
                        </span>
                        <p className="text-base font-bold text-amber-900">
                          {item.metrics.pendingGradingCount}
                        </p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-2.5">
                        <span className="font-medium text-red-700">
                          Late Submissions (FR10)
                        </span>
                        <p className="text-base font-bold text-red-900">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Create Course Assignment
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-lg text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleCreateAssignment}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                    Course *
                  </label>
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lab 3: Binary Search Tree Implementation"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                    Description & Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Outline submission requirements, allowed file formats, and evaluation criteria..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                      Due Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-wider text-gray-700 uppercase">
                      Max Score (Points) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={newMaxScore}
                      onChange={(e) => setNewMaxScore(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isCreating ? "Creating..." : "Create Assignment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: View Submissions & Grade Modal */}
        {activeAssignmentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {assignmentDetails?.title || "Submissions Roll"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {assignmentDetails?.courseTitle} • Max Score:{" "}
                    {assignmentDetails?.maxScore} pts
                  </p>
                </div>
                <button
                  onClick={() => setActiveAssignmentId(null)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body / Table */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingDetails ? (
                  <div className="p-12 text-center text-sm text-gray-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    <p className="mt-2">Loading submissions...</p>
                  </div>
                ) : !assignmentDetails ||
                  assignmentDetails.students.length === 0 ? (
                  <p className="p-8 text-center text-sm text-gray-500">
                    No students currently enrolled in this course.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-200">
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
                            <h4 className="text-sm font-bold text-gray-900">
                              {item.studentName}
                            </h4>
                            <p className="font-mono text-xs text-gray-500">
                              {item.studentEmail}
                            </p>
                            {sub ? (
                              <div className="mt-1 flex items-center space-x-2">
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:underline"
                                >
                                  📎 Download Attachment
                                </a>
                                {sub.isLate ? (
                                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                                    ⚠️ Late Submission (FR10)
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                    ✓ On Time
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                Not Submitted
                              </span>
                            )}
                          </div>

                          {/* Submission Timestamp */}
                          <div className="text-xs text-gray-500 md:w-1/4">
                            {sub ? (
                              <>
                                <span>Submitted:</span>
                                <p className="font-mono text-gray-700">
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
                              <div className="w-20">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                  Score
                                </label>
                                <input
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
                                  className="block w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                                />
                              </div>

                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase">
                                  Feedback
                                </label>
                                <input
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
                                  className="block w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSaveGrade(sub.id)}
                                disabled={isGrading}
                                className="mt-3.5 rounded bg-emerald-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic md:w-5/12">
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
              <div className="border-t bg-gray-50 px-6 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setActiveAssignmentId(null)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300"
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
