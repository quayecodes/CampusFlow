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

  // Close audit modal on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeCourseAudit) {
        setActiveCourseAudit(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCourseAudit]);

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
            message: json.error?.message || "Failed to publish grades.",
          });
        }
      } catch (err) {
        console.error("Approve error:", err);
        setNotification({
          type: "error",
          message: "Network error during grade publication.",
        });
      }
    });
  };

  // Open Audit Trail Modal
  const openAuditLogs = async (courseId: string, courseTitle: string) => {
    setActiveCourseAudit({ courseId, courseTitle });
    setIsLoadingAudit(true);
    try {
      const res = await fetch(
        `/api/v1/grades/dept-admin/audit?courseId=${courseId}`
      );
      const json = await res.json();
      if (res.ok && json.data?.auditLogs) {
        setAuditLogs(json.data.auditLogs);
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
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="mb-6">
          <nav
            className="mb-1 flex items-center gap-1.5 text-xs text-slate-600"
            aria-label="Breadcrumb"
          >
            <Link
              href="/dept-admin"
              className="font-medium hover:text-amber-700 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
            >
              Department Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900" aria-current="page">
              Grade Approvals
            </span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Department Grade Approval Queue
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Review submitted course grades, formally publish final results to
            student transcripts, and inspect the academic integrity audit trail
            (FR12, FR14).
          </p>
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
              aria-label="Dismiss message"
              className="rounded px-1.5 py-0.5 underline hover:opacity-80 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Queue Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-200 bg-slate-50/70 p-4">
            <h2 className="text-sm font-bold text-slate-900">
              Department Course Approval Queue
            </h2>
          </div>

          {isLoading ? (
            <div
              className="p-12 text-center text-xs text-slate-600"
              aria-busy="true"
            >
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-2">Loading grade approval queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-600">
              <p className="font-bold text-slate-800">No courses found</p>
              <p className="mt-1">
                No active courses are assigned to this department.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y divide-slate-200 text-left text-sm"
                aria-label="Department course approval queue table"
              >
                <caption className="sr-only">
                  Course grade review queue with actions for approving and
                  publishing grades
                </caption>
                <thead className="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Course &amp; Instructor
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Enrolled / Grades
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Queue Status
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-xs">
                  {queue.map((item) => (
                    <tr key={item.courseId} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {item.courseTitle}
                        </div>
                        <div className="text-slate-600">
                          Lecturer: {item.lecturerName} • {item.creditHours}{" "}
                          Credits
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {item.gradesEntered} / {item.totalEnrolled} grades
                        </div>
                        <div className="text-slate-600">
                          {item.draftCount} draft, {item.publishedCount}{" "}
                          published
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.queueStatus === "PUBLISHED" ? (
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            ✓ Published
                          </span>
                        ) : item.queueStatus === "READY_FOR_APPROVAL" ? (
                          <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                            Ready for Review ({item.draftCount} draft)
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            No Grades Submitted
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              openAuditLogs(item.courseId, item.courseTitle)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
                          >
                            Audit Log (FR14)
                          </button>

                          {item.queueStatus === "READY_FOR_APPROVAL" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleApprove(item.courseId, item.courseTitle)
                              }
                              disabled={isApproving}
                              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                            >
                              {isApproving
                                ? "Publishing..."
                                : "Approve & Publish"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: Audit Trail Viewer (FR14) */}
        {activeCourseAudit && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-audit-title"
          >
            <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <div>
                  <h3
                    id="modal-audit-title"
                    className="text-base font-bold text-slate-900"
                  >
                    Grade Modification Audit Trail (FR14)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Course: {activeCourseAudit.courseTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCourseAudit(null)}
                  aria-label="Close audit log dialog"
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingAudit ? (
                  <div
                    className="p-8 text-center text-xs text-slate-600"
                    aria-busy="true"
                  >
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <p className="mt-2">Loading audit trail records...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-600">
                    No post-publication grade modifications have been recorded
                    for this course. All grades match the initial published
                    values.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col gap-2 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900">
                            {log.studentName}
                          </span>
                          <span className="ml-2 font-mono text-slate-600">
                            ({log.studentEmail})
                          </span>
                          <div className="mt-0.5 text-slate-600">
                            Changed by:{" "}
                            <strong className="text-slate-800">
                              {log.changedByName} ({log.changedByRole})
                            </strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-2 font-semibold sm:justify-end">
                            <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-red-700">
                              Old: {log.oldScore}%
                            </span>
                            <span>→</span>
                            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-800">
                              New: {log.newScore}%
                            </span>
                          </div>
                          <time
                            dateTime={log.changedAt}
                            className="mt-1 block font-mono text-[11px] text-slate-600"
                          >
                            {new Date(log.changedAt).toLocaleString()}
                          </time>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setActiveCourseAudit(null)}
                  className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
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
