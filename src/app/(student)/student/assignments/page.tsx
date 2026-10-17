"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";

interface StudentAssignmentItem {
  id: string;
  courseId: string;
  courseTitle: string;
  lecturerName: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "GRADED" | "OVERDUE";
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

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "PENDING" | "SUBMITTED" | "GRADED"
  >("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // File upload & submission state per assignment
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [selectedFileMap, setSelectedFileMap] = useState<
    Record<string, File | null>
  >({});
  const [isSubmitting, startSubmitTransition] = useTransition();

  const loadAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/assignments");
      const json = await res.json();
      if (res.ok && json.data?.assignments) {
        setAssignments(json.data.assignments);
      } else {
        setNotification({
          type: "error",
          message: json.error?.message || "Failed to load assignments.",
        });
      }
    } catch (err) {
      console.error("Assignments fetch error:", err);
      setNotification({
        type: "error",
        message: "Network error loading assignments.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleFileChange = (assignmentId: string, file: File | null) => {
    setSelectedFileMap((prev) => ({
      ...prev,
      [assignmentId]: file,
    }));
  };

  const handleSubmitAssignment = (assignmentId: string) => {
    const file = selectedFileMap[assignmentId];
    if (!file) {
      setNotification({
        type: "error",
        message: "Please choose a file to submit.",
      });
      return;
    }

    setUploadingForId(assignmentId);
    startSubmitTransition(async () => {
      try {
        // 1. Upload file via /api/v1/uploads
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/v1/uploads", {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();

        if (!uploadRes.ok || !uploadJson.data?.fileUrl) {
          throw new Error(uploadJson.error?.message || "File upload failed.");
        }

        const fileUrl = uploadJson.data.fileUrl;

        // 2. Submit assignment with fileUrl
        const submitRes = await fetch(
          `/api/v1/assignments/${assignmentId}/submit`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileUrl }),
          }
        );
        const submitJson = await submitRes.json();

        if (submitRes.ok) {
          const isLate = submitJson.data?.submission?.isLate;
          setNotification({
            type: "success",
            message: isLate
              ? "Assignment submitted (Note: flagged as late submission past the due date)."
              : "Assignment successfully submitted on time!",
          });
          // Reset file picker
          setSelectedFileMap((prev) => ({ ...prev, [assignmentId]: null }));
          loadAssignments();
        } else {
          setNotification({
            type: "error",
            message: submitJson.error?.message || "Submission failed.",
          });
        }
      } catch (err) {
        console.error("Submission error:", err);
        setNotification({
          type: "error",
          message:
            err instanceof Error ? err.message : "Submission error occurred.",
        });
      } finally {
        setUploadingForId(null);
      }
    });
  };

  // Filter assignments based on activeTab
  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === "PENDING") {
      return a.status === "NOT_SUBMITTED" || a.status === "OVERDUE";
    }
    if (activeTab === "SUBMITTED") {
      return a.status === "SUBMITTED";
    }
    if (activeTab === "GRADED") {
      return a.status === "GRADED";
    }
    return true;
  });

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
            <span className="font-semibold text-gray-800">Assignments</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Course Assignments & Submissions
          </h1>
          <p className="text-sm text-gray-500">
            Submit coursework files, review due dates and late policies, and
            view feedback from instructors.
          </p>
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

        {/* Tab Filters */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 text-sm">
            {(
              [
                { key: "ALL", label: "All Assignments" },
                { key: "PENDING", label: "To Submit" },
                { key: "SUBMITTED", label: "Submitted" },
                { key: "GRADED", label: "Graded" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-1 py-3 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "border-indigo-600 font-bold text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Assignments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <h3 className="text-base font-semibold text-gray-800">
              No assignments found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no assignments matching your selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAssignments.map((item) => {
              const due = new Date(item.dueDate);
              const isPastDue = new Date() > due;
              const sub = item.submission;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="p-6">
                    {/* Header: Course & Status */}
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="rounded bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
                            {item.courseTitle}
                          </span>
                          <span className="text-xs text-gray-500">
                            Instructor: {item.lecturerName}
                          </span>
                        </div>
                        <h2 className="mt-2 text-lg font-bold text-gray-900">
                          {item.title}
                        </h2>
                        {item.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="text-right">
                        {sub && sub.score !== null ? (
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">
                            Graded: {sub.score} / {item.maxScore} pts
                          </span>
                        ) : sub ? (
                          sub.isLate ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                              ⚠️ Submitted Late (FR10)
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                              ✓ Submitted On Time
                            </span>
                          )
                        ) : isPastDue ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                            Overdue
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                            Due Soon
                          </span>
                        )}
                        <p className="mt-1 font-mono text-xs text-gray-500">
                          Due: {due.toLocaleDateString()} at{" "}
                          {due.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Graded Feedback Card (FR9) */}
                    {sub && sub.score !== null && (
                      <div className="mt-5 rounded-lg border border-purple-200 bg-purple-50/50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold tracking-wider text-purple-900 uppercase">
                            Grade Report
                          </span>
                          <span className="text-xs text-purple-600">
                            Graded on{" "}
                            {sub.gradedAt
                              ? new Date(sub.gradedAt).toLocaleDateString()
                              : "recently"}
                          </span>
                        </div>
                        <div className="mt-2 text-2xl font-black text-purple-900">
                          {sub.score}{" "}
                          <span className="text-sm font-normal text-purple-700">
                            / {item.maxScore} points
                          </span>
                        </div>
                        {sub.feedback && (
                          <div className="mt-2 rounded border border-purple-100 bg-white/80 p-2.5 text-xs text-purple-800">
                            <strong className="mb-0.5 block">
                              Instructor Feedback:
                            </strong>
                            {sub.feedback}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission Attachment Details */}
                    {sub && (
                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span>Submitted File:</span>
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-indigo-600 hover:underline"
                          >
                            📎 View / Download Attachment
                          </a>
                        </div>
                        <span className="font-mono text-gray-400">
                          Uploaded: {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Submission Action Bar */}
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600">
                            {sub ? "Replace / Resubmit File:" : "Upload File:"}
                          </label>
                          <input
                            type="file"
                            onChange={(e) =>
                              handleFileChange(
                                item.id,
                                e.target.files ? e.target.files[0] : null
                              )
                            }
                            className="mt-1 block w-full text-xs text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={
                            isSubmitting ||
                            uploadingForId === item.id ||
                            !selectedFileMap[item.id]
                          }
                          onClick={() => handleSubmitAssignment(item.id)}
                          className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40 sm:mt-4"
                        >
                          {uploadingForId === item.id
                            ? "Uploading & Submitting..."
                            : sub
                              ? "Resubmit Assignment"
                              : "Submit Assignment"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
