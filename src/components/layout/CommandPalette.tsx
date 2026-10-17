"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Academic" | "System";
  href: string;
  roles?: string[];
  icon: string;
}

export function CommandPalette({ isOpen, onClose, role }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const items: CommandItem[] = [
    {
      id: "student-dash",
      title: "Student Dashboard",
      subtitle: "Overview of courses, GPA, and announcements",
      category: "Navigation",
      href: "/student",
      roles: ["STUDENT"],
      icon: "📊",
    },
    {
      id: "student-courses",
      title: "Course Registration",
      subtitle: "Enroll in semester courses with seat locking",
      category: "Academic",
      href: "/student/courses",
      roles: ["STUDENT"],
      icon: "📚",
    },
    {
      id: "student-attendance",
      title: "Attendance & 75% Compliance",
      subtitle: "Monitor attendance eligibility and session history",
      category: "Academic",
      href: "/student/attendance",
      roles: ["STUDENT"],
      icon: "🎯",
    },
    {
      id: "student-assignments",
      title: "Course Assignments",
      subtitle: "Submit coursework files and review grades",
      category: "Academic",
      href: "/student/assignments",
      roles: ["STUDENT"],
      icon: "📝",
    },
    {
      id: "student-results",
      title: "Official Results & GPA",
      subtitle: "Published semester grades, credits, and GPA transcript",
      category: "Academic",
      href: "/student/results",
      roles: ["STUDENT"],
      icon: "🏆",
    },
    {
      id: "lecturer-dash",
      title: "Lecturer Dashboard",
      subtitle: "Faculty courses and quick actions",
      category: "Navigation",
      href: "/lecturer",
      roles: ["LECTURER"],
      icon: "👨‍🏫",
    },
    {
      id: "lecturer-attendance",
      title: "Mark Attendance Roll Call",
      subtitle: "Record student attendance with Present/Late/Absent",
      category: "Academic",
      href: "/lecturer/attendance",
      roles: ["LECTURER"],
      icon: "✅",
    },
    {
      id: "lecturer-assignments",
      title: "Manage Coursework & Submissions",
      subtitle: "Create assignments and grade student uploads",
      category: "Academic",
      href: "/lecturer/assignments",
      roles: ["LECTURER"],
      icon: "📂",
    },
    {
      id: "lecturer-grades",
      title: "Grade Entry Sheet",
      subtitle: "Input raw scores and submit to department queue",
      category: "Academic",
      href: "/lecturer/grades",
      roles: ["LECTURER"],
      icon: "📊",
    },
    {
      id: "dept-grades",
      title: "Grade Approval Queue",
      subtitle: "Review submitted grade sheets and publish to students",
      category: "Academic",
      href: "/dept-admin/grades",
      roles: ["DEPT_ADMIN"],
      icon: "⚖️",
    },
    {
      id: "announcements",
      title: "Campus Bulletins & Announcements",
      subtitle: "Scoped university and department announcements",
      category: "Navigation",
      href:
        role === "STUDENT"
          ? "/student/announcements"
          : role === "LECTURER"
            ? "/lecturer/announcements"
            : role === "DEPT_ADMIN"
              ? "/dept-admin/announcements"
              : "/uni-admin/announcements",
      icon: "📢",
    },
  ];

  // Filter items by role and search string
  const filtered = items.filter((item) => {
    const matchesRole = !item.roles || (role && item.roles.includes(role));
    if (!matchesRole) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q)
    );
  });

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command search palette"
      className="animate-in fade-in fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 px-4 pt-20 backdrop-blur-sm duration-150"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-100 bg-white px-4 py-3">
          <svg
            className="mr-3 h-5 w-5 text-slate-400"
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
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, feature or navigate to..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500 sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 space-y-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching destinations found for &quot;{search}&quot;
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors hover:bg-indigo-50/80 focus-visible:bg-indigo-50 focus-visible:outline-none"
              >
                <span className="text-xl select-none">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-slate-500">
                    {item.subtitle}
                  </p>
                </div>
                <span className="text-slate-300 transition group-hover:text-indigo-600">
                  →
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-500">
          <span>CampusFlow Global Navigation</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
