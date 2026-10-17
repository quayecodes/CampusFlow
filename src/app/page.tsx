import { auth } from "@/auth";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { InteractiveHeroSandbox } from "@/components/home/InteractiveHeroSandbox";
import { PersonaQuickLoginGrid } from "@/components/home/PersonaQuickLoginGrid";

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
      {/* Top Glass Header */}
      <header className="glass-header sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
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
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                CampusFlow
              </span>
              <span className="ml-2 hidden rounded-full border border-indigo-200 bg-indigo-50/80 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 sm:inline-block">
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
                  className="btn-tactile rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Go to Dashboard →
                </Link>
                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-tactile rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mesh-gradient-hero relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* 2026 Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 px-3.5 py-1 text-xs font-bold text-indigo-700 shadow-xs">
              <span className="pulse-glow flex h-2 w-2 rounded-full bg-emerald-500" />
              Next-Gen Academic ERP • 2026 Enterprise Edition
            </div>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl leading-tight font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              The Intelligent Operating System for{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Higher Education
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg lg:text-xl">
              CampusFlow replaces fragmented spreadsheets with unified
              governance: transactional course capacity locking, automated 75%
              attendance compliance monitoring, coursework file pipelines, and
              tamper-evident 3-stage grade approval workflows.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {session ? (
                <Link
                  href={getDashboardHref(session.user?.role)}
                  className="btn-tactile w-full rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                >
                  Open {session.user?.role?.replace("_", " ")} Portal →
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-tactile w-full rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                  >
                    Launch Interactive Demo
                  </Link>
                  <Link
                    href="/register"
                    className="btn-tactile w-full rounded-xl border border-slate-300 bg-white px-7 py-3 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
                  >
                    Register as Student
                  </Link>
                </>
              )}
            </div>

            {/* Interactive Sandbox Product Tour */}
            <InteractiveHeroSandbox />

            {/* Platform Metrics Bar */}
            <div className="mt-14 grid grid-cols-2 gap-4 rounded-2xl border-y border-slate-200/80 bg-white/70 py-6 backdrop-blur-md sm:grid-cols-4 sm:gap-8">
              <div>
                <p className="text-3xl font-black text-indigo-600">100%</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  Transactional Concurrency Locking
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-600">75%</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  Automated Attendance Rule
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-amber-600">3-Stage</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  Audited Grade Approval Queue
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-purple-600">38 / 38</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  Pass Rate on Test Suites
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portals Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              Role-Based Access Control
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Tailored Portals for Every Campus Stakeholder
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
              Edge middleware isolates routes and permissions across four
              distinct academic personas. Click any persona below for 1-click
              instant login:
            </p>
          </div>

          <PersonaQuickLoginGrid />
        </div>
      </section>

      {/* Core Capabilities Bento Grid */}
      <section className="border-t border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              Engineered For Institutional Scale
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Architected for Integrity, Concurrency &amp; Compliance
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bento-card border border-slate-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600">
                1
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Transactional Capacity Locking
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Over-enrollment is mathematically prevented using interactive
                database transactions (
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">
                  prisma.$transaction
                </code>
                ). Seats are verified and locked atomically, eliminating
                registration race conditions even during registration rush.
              </p>
            </div>

            <div className="bento-card border border-slate-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-600">
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

            <div className="bento-card border border-slate-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg font-bold text-purple-600">
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
      <footer className="border-t border-slate-200 bg-slate-900 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-xs sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              CF
            </div>
            <div>
              <p className="text-sm font-bold text-white">CampusFlow</p>
              <p className="text-[11px] text-slate-400">
                Smart University Management System • Academic 2026/27
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <Link href="/login" className="transition hover:text-white">
              Sign In
            </Link>
            <Link href="/register" className="transition hover:text-white">
              Student Registration
            </Link>
            <a
              href="https://github.com/quayecodes/CampusFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              GitHub Repository
            </a>
          </div>

          <div className="text-[11px] text-slate-400">
            Release v0.2.0-beta • WCAG 2.1 AA Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
