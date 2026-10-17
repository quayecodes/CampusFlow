"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";

interface QueueItem {
  courseId: string;
  courseTitle: string;
  creditHours: number;
  lecturerName: string;
  semester: string;
  departmentName: string;
  totalEnrolled: number;
  gradesEntered: number;
  draftCount: number;
  publishedCount: number;
  queueStatus: "READY_FOR_APPROVAL" | "PUBLISHED" | "NO_GRADES";
}

interface AuditLogEntry {
  id: string;
  studentName: string;
  studentEmail: string;
  changedByName: string;
  changedByEmail: string;
  changedByRole: string;
  oldScore: number | null;
  newScore: number | null;
  changedAt: string;
}

export default function DeptAdminGradesPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Approve & Publish action state
  const [isApproving, startApproveTransition] = useTransition();

  // Audit Logs Modal State (FR14)
  const [activeCourseAudit, setActiveCourseAudit] = useState<{
    courseId: string;
    courseTitle: string;
  } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const loadQueue = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/grades/dept-admin/queue");
      const json = await res.json();
      if (res.ok && json.data?.queue) {
        setQueue(json.data.queue);
      } else {
        setNotification({
          type: "error",
          message: json.error?.message || "Failed to load approval queue.",
        });
      }
    } catch (err) {
      console.error("Queue load error:", err);
      setNotification({
        type: "error",
        message: "Network error loading approval queue.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Handle Approve & Publish
  const handleApprove = (courseId: string, courseTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to approve and officially publish final grades for "${courseTitle}"? Published grades will become immediately visible on student transcripts.`
      )
    ) {
      return;
    }

    startApproveTransition(async () => {
      try {
        const res = await fetch("/api/v1/grades/dept-admin/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
        const json = await res.json();
        if (res.ok) {
          setNotification({
            type: "success",
            message: `Grades for "${courseTitle}" have been officially approved and published (${json.data.publishedCount} students updated).`,
          });
          loadQueue();
        } else {
          setNotification({
            type: "error",
            message: json.error?.message || "Failed to approve grades.",
          });
        }
      } catch (err) {
        console.error("Approve error:", err);
        setNotification({
          type: "error",
          message: "Network error approving grades.",
        });
      }
    });
  };

  // Open Audit Trail Modal
  const openAuditLogs = async (courseId: string, courseTitle: string) => {
    setActiveCourseAudit({ courseId, courseTitle });
    try {
      setIsLoadingAudit(true);
      const res = await fetch(
        `/api/v1/grades/dept-admin/audit?courseId=${courseId}`
      );
      const json = await res.json();
      if (res.ok && json.data?.logs) {
        setAuditLogs(json.data.logs);
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      console.error("Audit fetch error:", err);
      setAuditLogs([]);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/dept-admin" className="hover:text-gray-700">
              Department Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">Grade Approvals</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Department Grade Approval Queue
          </h1>
          <p className="text-sm text-gray-500">
            Review submitted course grades, formally publish final results to
            student transcripts, and inspect the academic integrity audit trail
            (FR12, FR14).
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

        {/* Queue Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/50 p-4">
            <h2 className="font-bold text-gray-800">
              Department Course Approval Queue
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-2">Loading grade approval queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              <p className="font-medium text-gray-700">No courses found</p>
              <p className="mt-1 text-xs">
                No active courses are assigned to this department.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Course &amp; Instructor
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Enrolled / Grades
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Queue Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {queue.map((item) => (
                    <tr key={item.courseId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          {item.courseTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          Lecturer: {item.lecturerName} • {item.creditHours}{" "}
                          Credits
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {item.gradesEntered} / {item.totalEnrolled} grades
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.draftCount} draft, {item.publishedCount}{" "}
                          published
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.queueStatus === "PUBLISHED" ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            ✓ Published
                          </span>
                        ) : item.queueStatus === "READY_FOR_APPROVAL" ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                            ⏳ Ready for Approval
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            No Grades Submitted
                          </span>
                        )}
                      </td>

                      <td className="space-x-2 px-6 py-4 text-right">
                        {item.draftCount > 0 && (
                          <button
                            type="button"
                            disabled={isApproving}
                            onClick={() =>
                              handleApprove(item.courseId, item.courseTitle)
                            }
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Approve &amp; Publish (FR12)
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            openAuditLogs(item.courseId, item.courseTitle)
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Audit Trail (FR14)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: Academic Integrity Audit Trail (FR14) */}
        {activeCourseAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Grade Modification Audit Trail (FR14)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Course: {activeCourseAudit.courseTitle}
                  </p>
                </div>
                <button
                  onClick={() => setActiveCourseAudit(null)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingAudit ? (
                  <div className="p-8 text-center text-sm text-gray-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <p className="mt-2">Loading audit trail records...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center text-xs text-gray-500">
                    No post-publication grade modifications have been recorded
                    for this course. All grades match the initial published
                    values.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <span className="text-sm font-semibold text-gray-900">
                            {log.studentName}
                          </span>
                          <span className="ml-2 font-mono text-xs text-gray-500">
                            ({log.studentEmail})
                          </span>
                          <div className="mt-1 text-xs text-gray-600">
                            Changed by:{" "}
                            <strong>
                              {log.changedByName} ({log.changedByRole})
                            </strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-xs sm:justify-end">
                            <span className="rounded bg-red-50 px-2 py-0.5 font-mono text-red-700">
                              Old: {log.oldScore}%
                            </span>
                            <span>→</span>
                            <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-700">
                              New: {log.newScore}%
                            </span>
                          </div>
                          <span className="mt-1 block font-mono text-[11px] text-gray-400">
                            {new Date(log.changedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t bg-gray-50 px-6 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setActiveCourseAudit(null)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Close Audit Log
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
