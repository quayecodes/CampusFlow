"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { AnnouncementScope, Role } from "@prisma/client";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  scope: AnnouncementScope;
  scopeId: string | null;
  scopeLabel: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  };
}

interface AnnouncementFeedProps {
  currentUserId?: string;
  currentUserRole?: Role;
  defaultScope?: AnnouncementScope;
  canPost?: boolean;
  courses?: Array<{ id: string; title: string }>;
  departments?: Array<{ id: string; name: string }>;
}

export function AnnouncementFeed({
  currentUserId,
  currentUserRole,
  canPost = false,
  courses = [],
  departments = [],
}: AnnouncementFeedProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | AnnouncementScope>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Post Announcement Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [postScope, setPostScope] = useState<AnnouncementScope>(
    currentUserRole === Role.LECTURER
      ? AnnouncementScope.COURSE
      : currentUserRole === Role.DEPT_ADMIN
        ? AnnouncementScope.DEPARTMENT
        : AnnouncementScope.UNIVERSITY
  );
  const [postScopeId, setPostScopeId] = useState<string>("");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [isPosting, startPostTransition] = useTransition();

  const loadFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/announcements");
      const json = await res.json();
      if (res.ok && json.data?.announcements) {
        setAnnouncements(json.data.announcements);
      } else {
        setNotification({
          type: "error",
          message: json.error?.message || "Failed to load announcements.",
        });
      }
    } catch (err) {
      console.error("Feed error:", err);
      setNotification({
        type: "error",
        message: "Network error loading announcements feed.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Handle ESC key for modal dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showPostModal) {
        setShowPostModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPostModal]);

  // Set default scopeId on post scope change
  useEffect(() => {
    if (postScope === AnnouncementScope.COURSE && courses.length > 0) {
      setPostScopeId(courses[0].id);
    } else if (
      postScope === AnnouncementScope.DEPARTMENT &&
      departments.length > 0
    ) {
      setPostScopeId(departments[0].id);
    } else {
      setPostScopeId("");
    }
  }, [postScope, courses, departments]);

  // Post Announcement Handler
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) {
      setNotification({
        type: "error",
        message: "Please enter both a title and body.",
      });
      return;
    }

    startPostTransition(async () => {
      try {
        const res = await fetch("/api/v1/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scope: postScope,
            scopeId: postScopeId || undefined,
            title: postTitle.trim(),
            body: postBody.trim(),
          }),
        });

        const json = await res.json();
        if (res.ok) {
          setNotification({
            type: "success",
            message: "Announcement posted successfully.",
          });
          setShowPostModal(false);
          setPostTitle("");
          setPostBody("");
          loadFeed();
        } else {
          setNotification({
            type: "error",
            message: json.error?.message || "Failed to post announcement.",
          });
        }
      } catch (err) {
        console.error("Post error:", err);
        setNotification({
          type: "error",
          message: "Network error posting announcement.",
        });
      }
    });
  };

  // Delete Announcement Handler
  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/announcements/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotification({
          type: "success",
          message: "Announcement deleted.",
        });
        loadFeed();
      } else {
        const json = await res.json();
        setNotification({
          type: "error",
          message: json.error?.message || "Failed to delete announcement.",
        });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({
        type: "error",
        message: "Network error deleting announcement.",
      });
    }
  };

  // Filter announcements
  const filtered = announcements.filter((a) => {
    const matchesTab = activeTab === "ALL" ? true : a.scope === activeTab;
    const matchesSearch =
      searchQuery.trim() === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.scopeLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div>
      {/* Feedback Banner */}
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
            className="rounded px-1.5 py-0.5 underline hover:opacity-80 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar: Scope Tabs & Post Button */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Scope Filter Tabs */}
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter announcements by scope"
        >
          {(
            [
              { key: "ALL", label: "All Updates" },
              { key: AnnouncementScope.UNIVERSITY, label: "🌐 University" },
              { key: AnnouncementScope.DEPARTMENT, label: "🏛️ Department" },
              { key: AnnouncementScope.COURSE, label: "📚 Courses" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Search Filter */}
          <div className="relative">
            <label htmlFor="feed-search" className="sr-only">
              Search announcements
            </label>
            <input
              id="feed-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs placeholder:text-slate-600 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none sm:w-56"
            />
          </div>

          {canPost && (
            <button
              type="button"
              onClick={() => setShowPostModal(true)}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              + Post Announcement
            </button>
          )}
        </div>
      </div>

      {/* Announcements Stream */}
      {isLoading ? (
        <div
          className="space-y-4"
          aria-busy="true"
          aria-label="Loading announcements"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600">
            📢
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-900">
            No announcements found
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            There are no announcements matching your current scope filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <AnnouncementCard
              key={item.id}
              id={item.id}
              title={item.title}
              body={item.body}
              scope={item.scope}
              scopeLabel={item.scopeLabel}
              createdAt={item.createdAt}
              author={item.author}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onDelete={handleDeleteAnnouncement}
            />
          ))}
        </div>
      )}

      {/* Post Announcement Modal Dialog */}
      {showPostModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-announcement-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3
                id="modal-announcement-title"
                className="text-lg font-bold text-slate-900"
              >
                Post New Announcement
              </h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                aria-label="Close dialog"
                className="rounded-lg p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="mt-4 space-y-4">
              {/* Scope Selection */}
              <div>
                <label
                  htmlFor="post-scope"
                  className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                >
                  Target Scope *
                </label>
                <select
                  id="post-scope"
                  value={postScope}
                  onChange={(e) =>
                    setPostScope(e.target.value as AnnouncementScope)
                  }
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                >
                  {currentUserRole === Role.UNI_ADMIN && (
                    <option value={AnnouncementScope.UNIVERSITY}>
                      🌐 University-Wide (FR17)
                    </option>
                  )}
                  {(currentUserRole === Role.UNI_ADMIN ||
                    currentUserRole === Role.DEPT_ADMIN) && (
                    <option value={AnnouncementScope.DEPARTMENT}>
                      🏛️ Department-Wide (FR16)
                    </option>
                  )}
                  <option value={AnnouncementScope.COURSE}>
                    📚 Specific Course (FR15)
                  </option>
                </select>
              </div>

              {/* Course Selector (if Course Scope) */}
              {postScope === AnnouncementScope.COURSE && (
                <div>
                  <label
                    htmlFor="post-course"
                    className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                  >
                    Select Course *
                  </label>
                  <select
                    id="post-course"
                    value={postScopeId}
                    onChange={(e) => setPostScopeId(e.target.value)}
                    required
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label
                  htmlFor="post-title"
                  className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                >
                  Announcement Title *
                </label>
                <input
                  id="post-title"
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Midterm Examination Schedule Released"
                  required
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs placeholder:text-slate-600 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                />
              </div>

              {/* Body Textarea */}
              <div>
                <label
                  htmlFor="post-body"
                  className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                >
                  Message Content *
                </label>
                <textarea
                  id="post-body"
                  rows={4}
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="Type your announcement details..."
                  required
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs placeholder:text-slate-600 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                >
                  {isPosting ? "Posting..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
