"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { PersonaSwitcherModal } from "./PersonaSwitcherModal";
import { CommandPalette } from "./CommandPalette";

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

interface PortalHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function PortalHeader({ user }: PortalHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (isPersonaModalOpen) setIsPersonaModalOpen(false);
        if (isCommandOpen) setIsCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, isPersonaModalOpen, isCommandOpen]);

  const role = user.role || "STUDENT";

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "STUDENT":
        return [
          { label: "Dashboard", href: "/student" },
          { label: "Registration", href: "/student/courses" },
          { label: "Attendance", href: "/student/attendance" },
          { label: "Assignments", href: "/student/assignments" },
          { label: "Results & GPA", href: "/student/results" },
          { label: "Announcements", href: "/student/announcements" },
        ];
      case "LECTURER":
        return [
          { label: "Dashboard", href: "/lecturer" },
          { label: "Roll Call", href: "/lecturer/attendance" },
          { label: "Assignments", href: "/lecturer/assignments" },
          { label: "Grade Entry", href: "/lecturer/grades" },
          { label: "Announcements", href: "/lecturer/announcements" },
        ];
      case "DEPT_ADMIN":
        return [
          { label: "Dashboard", href: "/dept-admin" },
          { label: "Grade Approvals", href: "/dept-admin/grades" },
          { label: "Announcements", href: "/dept-admin/announcements" },
        ];
      case "UNI_ADMIN":
        return [
          { label: "Dashboard", href: "/uni-admin" },
          { label: "Announcements", href: "/uni-admin/announcements" },
        ];
      default:
        return [];
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case "STUDENT":
        return {
          text: "Student Portal",
          bg: "bg-indigo-50/90 border-indigo-200/80 text-indigo-700",
        };
      case "LECTURER":
        return {
          text: "Faculty Portal",
          bg: "bg-emerald-50/90 border-emerald-200/80 text-emerald-700",
        };
      case "DEPT_ADMIN":
        return {
          text: "Department Admin",
          bg: "bg-amber-50/90 border-amber-200/80 text-amber-800",
        };
      case "UNI_ADMIN":
        return {
          text: "University Admin",
          bg: "bg-purple-50/90 border-purple-200/80 text-purple-700",
        };
      default:
        return {
          text: "Portal",
          bg: "bg-gray-50 border-gray-200 text-gray-700",
        };
    }
  };

  const navItems = getNavItems();
  const roleBadge = getRoleBadge();
  const userInitials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CF";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Skip to Main Content Link for WCAG 2.1 AA keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Top Glass Navigation Header */}
      <header className="glass-header sticky top-0 z-40 shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              aria-label="CampusFlow Homepage"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm transition group-hover:scale-105">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-5.25 6.557c-.502 0-.962-.06-1.396-.174"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  CampusFlow
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Academic 2026/27
                </span>
              </div>
            </Link>

            <span
              className={`hidden items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:inline-flex ${roleBadge.bg}`}
            >
              {roleBadge.text}
            </span>
          </div>

          {/* Quick Command Search Pill */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            aria-label="Search navigation commands (Cmd+K)"
            className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/70 px-3.5 py-1.5 text-xs text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none md:flex"
          >
            <svg
              className="h-3.5 w-3.5 text-slate-400"
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
            <span>Search or jump to...</span>
            <kbd className="ml-1 rounded border border-slate-300/80 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden lg:flex lg:items-center lg:gap-1"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === `/student` ||
                item.href === `/lecturer` ||
                item.href === `/dept-admin` ||
                item.href === `/uni-admin`
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                    isActive
                      ? "bg-indigo-50 font-semibold text-indigo-700 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Demo Switcher Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1-Click Persona Switcher Trigger */}
            <button
              type="button"
              onClick={() => setIsPersonaModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              title="Instant Role Switcher (Demo / Testing)"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Switch Role</span>
            </button>

            {/* User Chip */}
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-2.5 py-1 shadow-2xs sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-xs">
                {userInitials}
              </div>
              <div className="flex flex-col text-left">
                <span className="max-w-[110px] truncate text-xs font-semibold text-slate-900">
                  {user.name || "User"}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {role}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-label="Sign out of your account"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
            >
              <svg
                className="h-3.5 w-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
              <span className="hidden sm:inline">
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </span>
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile Navigation"
            className="animate-in slide-in-from-top-2 border-b border-slate-200 bg-white/95 px-4 pt-3 pb-5 shadow-xl backdrop-blur-md duration-200 lg:hidden"
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs">
                  {userInitials}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {user.name || "User"}
                  </p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleBadge.bg}`}
              >
                {roleBadge.text}
              </span>
            </div>

            {/* Quick search button for mobile */}
            <div className="mb-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCommandOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
              >
                <svg
                  className="h-4 w-4 text-slate-400"
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
                <span>Search features &amp; pages...</span>
              </button>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === `/student` ||
                  item.href === `/lecturer` ||
                  item.href === `/dept-admin` ||
                  item.href === `/uni-admin`
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-2xs"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Floating 2026 Mobile Quick Dock (Phones under 640px) */}
      <nav
        aria-label="Mobile Dock Navigation"
        className="glass-panel fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-slate-200/80 px-3 py-2 shadow-xl sm:hidden"
      >
        <Link
          href={
            role === "STUDENT"
              ? "/student"
              : role === "LECTURER"
                ? "/lecturer"
                : role === "DEPT_ADMIN"
                  ? "/dept-admin"
                  : "/uni-admin"
          }
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            pathname === "/student" ||
            pathname === "/lecturer" ||
            pathname === "/dept-admin" ||
            pathname === "/uni-admin"
              ? "text-indigo-600"
              : "text-slate-500"
          }`}
        >
          <span className="text-base">🏠</span>
          <span>Home</span>
        </Link>

        {role === "STUDENT" && (
          <>
            <Link
              href="/student/courses"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
                pathname.startsWith("/student/courses")
                  ? "text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              <span className="text-base">📚</span>
              <span>Courses</span>
            </Link>
            <Link
              href="/student/attendance"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
                pathname.startsWith("/student/attendance")
                  ? "text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              <span className="text-base">🎯</span>
              <span>Attendance</span>
            </Link>
            <Link
              href="/student/results"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
                pathname.startsWith("/student/results")
                  ? "text-indigo-600"
                  : "text-slate-500"
              }`}
            >
              <span className="text-base">🏆</span>
              <span>Results</span>
            </Link>
          </>
        )}

        {role === "LECTURER" && (
          <>
            <Link
              href="/lecturer/attendance"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
                pathname.startsWith("/lecturer/attendance")
                  ? "text-emerald-600"
                  : "text-slate-500"
              }`}
            >
              <span className="text-base">✅</span>
              <span>Roll Call</span>
            </Link>
            <Link
              href="/lecturer/grades"
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
                pathname.startsWith("/lecturer/grades")
                  ? "text-emerald-600"
                  : "text-slate-500"
              }`}
            >
              <span className="text-base">📊</span>
              <span>Grades</span>
            </Link>
          </>
        )}

        {role === "DEPT_ADMIN" && (
          <Link
            href="/dept-admin/grades"
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              pathname.startsWith("/dept-admin/grades")
                ? "text-amber-700"
                : "text-slate-500"
            }`}
          >
            <span className="text-base">⚖️</span>
            <span>Approvals</span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => setIsPersonaModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-indigo-600"
        >
          <span className="text-base">⚡</span>
          <span>Switch</span>
        </button>
      </nav>

      {/* Interactive Modals */}
      <PersonaSwitcherModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        currentRole={role}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        role={role}
      />
    </>
  );
}
