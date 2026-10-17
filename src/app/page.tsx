import { auth } from "@/auth";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function HomePage() {
  const session = await auth();

  const getDashboardHref = (role?: string) => {
    switch (role) {
      case "STUDENT":
        return "/student";
      case "LECTURER":
        return "/lecturer";
      case "DEPT_ADMIN":
        return "/dept-admin";
      case "UNI_ADMIN":
        return "/uni-admin";
      default:
        return "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
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
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                CampusFlow
              </span>
              <span className="ml-2 hidden rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 sm:inline-block">
                Academic 2026/27
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-slate-600 sm:inline">
                  Signed in as{" "}
                  <strong className="font-semibold text-slate-900">
                    {session.user?.name}
                  </strong>{" "}
                  ({session.user?.role})
                </span>
                <Link
                  href={getDashboardHref(session.user?.role)}
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Go to Dashboard →
                </Link>
                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
              Smart University Management Platform
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Unified Academic Operations for the{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Modern University
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base text-slate-600 sm:text-lg lg:text-xl">
              CampusFlow replaces fragmented spreadsheets and disconnected
              portals with a single, role-governed platform: concurrent course
              registration, 75% attendance threshold monitoring, coursework
              management, grade approval workflows, and scoped announcements.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {session ? (
                <Link
                  href={getDashboardHref(session.user?.role)}
                  className="w-full rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                >
                  Open {session.user?.role?.replace("_", " ")} Portal →
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                  >
                    Launch Demo Portals
                  </Link>
                  <Link
                    href="/register"
                    className="w-full rounded-xl border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                  >
                    Register as Student
                  </Link>
                </>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-14 grid grid-cols-2 gap-4 border-y border-slate-200/80 bg-white/60 py-6 sm:grid-cols-4 sm:gap-8">
              <div>
                <p className="text-2xl font-bold text-indigo-600 sm:text-3xl">
                  100%
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Transactional Concurrency Locking
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600 sm:text-3xl">
                  75%
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Mandatory Attendance Threshold
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600 sm:text-3xl">
                  3-Stage
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Academic Grade Governance
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600 sm:text-3xl">
                  38 / 38
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Integration Test Passing
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              Role-Based Access Control
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tailored Portals for Every University Stakeholder
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Edge middleware isolates routes and permissions across four
              distinct academic personas.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Student Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-indigo-100 bg-white p-6 shadow-xs transition hover:border-indigo-300 hover:shadow-md">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-5.25 6.557c-.502 0-.962-.06-1.396-.174"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Student Portal
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Browse and register for courses up to the 18-credit cap,
                  monitor attendance compliance, upload assignment files with
                  late detection, view official GPA and grade records.
                </p>
                <div className="mt-4 rounded-lg bg-slate-50 p-2.5 font-mono text-[11px] text-slate-600">
                  Demo:{" "}
                  <span className="font-semibold text-slate-900">
                    student1@campusflow.edu
                  </span>
                </div>
              </div>
              <Link
                href="/student"
                className="mt-6 flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Access Student Portal <span>→</span>
              </Link>
            </div>

            {/* Lecturer Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-white p-6 shadow-xs transition hover:border-emerald-300 hover:shadow-md">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Lecturer Portal
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Mark daily roll call with Present/Late/Absent toggles, create
                  assignments, grade submissions with score bounds and feedback,
                  enter draft grades and submit to department queue.
                </p>
                <div className="mt-4 rounded-lg bg-slate-50 p-2.5 font-mono text-[11px] text-slate-600">
                  Demo:{" "}
                  <span className="font-semibold text-slate-900">
                    dr.mensah@campusflow.edu
                  </span>
                </div>
              </div>
              <Link
                href="/lecturer"
                className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-600 hover:text-emerald-800"
              >
                Access Lecturer Portal <span>→</span>
              </Link>
            </div>

            {/* Dept Admin Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-amber-100 bg-white p-6 shadow-xs transition hover:border-amber-300 hover:shadow-md">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Department Admin
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Review submitted grade sheets in the departmental queue,
                  approve and publish official grades, inspect tamper-evident
                  post-publication audit trails, post department announcements.
                </p>
                <div className="mt-4 rounded-lg bg-slate-50 p-2.5 font-mono text-[11px] text-slate-600">
                  Demo:{" "}
                  <span className="font-semibold text-slate-900">
                    dept.admin@campusflow.edu
                  </span>
                </div>
              </div>
              <Link
                href="/dept-admin"
                className="mt-6 flex items-center justify-between text-xs font-semibold text-amber-600 hover:text-amber-800"
              >
                Access Dept Admin Portal <span>→</span>
              </Link>
            </div>

            {/* Uni Admin Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-purple-100 bg-white p-6 shadow-xs transition hover:border-purple-300 hover:shadow-md">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  University Admin
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  System-wide institutional governance, campus emergency
                  bulletin broadcasts, overall audit compliance, and
                  institutional user administration.
                </p>
                <div className="mt-4 rounded-lg bg-slate-50 p-2.5 font-mono text-[11px] text-slate-600">
                  Demo:{" "}
                  <span className="font-semibold text-slate-900">
                    admin@campusflow.edu
                  </span>
                </div>
              </div>
              <Link
                href="/uni-admin"
                className="mt-6 flex items-center justify-between text-xs font-semibold text-purple-600 hover:text-purple-800"
              >
                Access Uni Admin Portal <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="border-t border-slate-200/80 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for Integrity, Concurrency &amp; Compliance
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-600">
                1
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Transactional Capacity Locking
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Over-enrollment is prevented using interactive database
                transactions (
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">
                  prisma.$transaction
                </code>
                ). Seats are verified and locked atomically, eliminating
                registration race conditions.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 font-bold text-emerald-600">
                2
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                75% Attendance Compliance (FR6)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Automated session roll call instantly calculates participation
                percentages, highlighting students who fall below institutional
                exam thresholds before final exam periods arrive.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 font-bold text-purple-600">
                3
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Grade Governance &amp; Audit Trail
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Grades progress through Draft, Approved, and Published
                lifecycles. Any revisions to published grades are permanently
                preserved in{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">
                  GradeChangeLog
                </code>{" "}
                with before/after values and modifier ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-600 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CampusFlow</span>
            <span>•</span>
            <span>Final Year Project Demonstration</span>
            <span>•</span>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-800">
              v0.2.0-beta
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              Register
            </Link>
            <a
              href="https://github.com/quayecodes/CampusFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
