import Link from "next/link";
import { auth } from "@/auth";

export default async function DeptAdminDashboardPage() {
  const session = await auth();

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-200">
                Department of Computer Science • Administrative Authority
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Welcome back, {session?.user?.name || "Department Admin"}
              </h1>
              <p className="mt-1 text-xs text-amber-200 sm:text-sm">
                Scope: Faculty Review, Grade Approval Queue, Department
                Broadcasts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dept-admin/grades"
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Review Grade Queue →
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
              <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                Departmental Authority
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Authenticated Account:{" "}
              <strong className="text-slate-900">{session?.user?.email}</strong>
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Assigned Department: Computer Science (dept-cs-001)
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
              <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                Audit Integrity (FR14)
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Every change to an approved or published grade is recorded in the
              tamper-evident GradeChangeLog with full timestamps and modifier
              attribution.
            </p>
          </div>
        </div>

        {/* Governance Services Grid */}
        <div className="mt-8">
          <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
            Departmental Governance Workflows
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Grade Approval Queue */}
            <Link
              href="/dept-admin/grades"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-amber-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 transition group-hover:scale-105">
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
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-amber-600">
                  Grade Approval Queue &amp; Publication
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Review submitted semester grade sheets, approve and formally
                  publish results to students, and inspect post-publication
                  audit logs (FR12, FR14).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-amber-600">
                <span>Open Approval Queue</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Department Announcements */}
            <Link
              href="/dept-admin/announcements"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-amber-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 transition group-hover:scale-105">
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
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-amber-600">
                  Department Announcements
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Publish department-wide notices to all staff and enrolled
                  students (FR16), and monitor institutional bulletins (FR18).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-amber-600">
                <span>Manage Announcements</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
