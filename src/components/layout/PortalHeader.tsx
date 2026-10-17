"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

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
          bg: "bg-indigo-50 border-indigo-200 text-indigo-700",
        };
      case "LECTURER":
        return {
          text: "Faculty Portal",
          bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        };
      case "DEPT_ADMIN":
        return {
          text: "Department Admin",
          bg: "bg-amber-50 border-amber-200 text-amber-800",
        };
      case "UNI_ADMIN":
        return {
          text: "University Admin",
          bg: "bg-purple-50 border-purple-200 text-purple-700",
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

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              aria-label="CampusFlow Homepage"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
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
                <span className="text-base font-bold tracking-tight text-gray-900">
                  CampusFlow
                </span>
                <span className="text-[10px] font-medium text-gray-600">
                  University Portal
                </span>
              </div>
            </Link>

            <span
              className={`hidden items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:inline-flex ${roleBadge.bg}`}
            >
              {roleBadge.text}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex md:items-center md:gap-1 lg:gap-2"
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
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none lg:text-sm ${
                    isActive
                      ? "bg-indigo-50 font-semibold text-indigo-700 shadow-xs"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-xs">
                {userInitials}
              </div>
              <div className="flex flex-col text-left">
                <span className="max-w-[120px] truncate text-xs font-semibold text-gray-900 lg:max-w-[150px]">
                  {user.name || "User"}
                </span>
                <span className="text-[10px] text-gray-600">{role}</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-label="Sign out of your account"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
            >
              <svg
                className="h-3.5 w-3.5 text-gray-600"
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

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none md:hidden"
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
            className="border-b border-gray-200 bg-white px-4 pt-2 pb-4 shadow-lg md:hidden"
          >
            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {userInitials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {user.name || "User"}
                  </p>
                  <p className="text-[10px] text-gray-600">{user.email}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleBadge.bg}`}
              >
                {roleBadge.text}
              </span>
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
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-50 font-semibold text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
    </>
  );
}
