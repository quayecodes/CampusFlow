import Link from "next/link";
import { auth } from "@/auth";

export default async function DeptAdminDashboardPage() {
  const session = await auth();

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-900/10 bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div
            className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
                <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-amber-400" />
                Department of Computer Science • Administrative Authority
              </span>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
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
                className="btn-tactile rounded-xl bg-white px-5 py-2.5 text-xs font-black text-amber-950 shadow-md hover:bg-amber-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Review Grade Queue →
              </Link>
            </div>
          </div>
        </div>

        {/* Department Overview Bento Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Department Scope
            </span>
            <p className="mt-1 text-xl font-black text-slate-900">
              Computer Science
            </p>
            <p className="text-[11px] text-slate-500">ID: dept-cs-001</p>
          </div>

          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Grade Approval Queue
            </span>
            <p className="mt-1 text-xl font-black text-amber-700">Live Queue</p>
            <p className="text-[11px] text-slate-500">Faculty draft reviews</p>
          </div>

          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Audit Compliance
            </span>
            <p className="mt-1 text-xl font-black text-emerald-600">
              FR14 Active
            </p>
            <p className="text-[11px] text-slate-500">GradeChangeLog active</p>
          </div>

          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Bulletins Authority
            </span>
            <p className="mt-1 text-xl font-black text-indigo-700">
              Department Notices
            </p>
            <p className="text-[11px] text-slate-500">Faculty &amp; Students</p>
          </div>
        </div>

        {/* Governance Services Grid */}
        <div className="mt-8">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Departmental Governance Workflows
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Grade Approval Queue */}
            <Link
              href="/dept-admin/grades"
              className="bento-card group flex flex-col justify-between border border-slate-200/90 p-6 shadow-2xs focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition group-hover:scale-110">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-amber-600">
                  Grade Approval Queue &amp; Publication
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Review submitted semester grade sheets, approve and formally
                  publish results to students, and inspect post-publication
                  audit logs (FR12, FR14).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Open Approval Queue</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Department Announcements */}
            <Link
              href="/dept-admin/announcements"
              className="bento-card group flex flex-col justify-between border border-slate-200/90 p-6 shadow-2xs focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:scale-110">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-indigo-600">
                  Department Announcements &amp; Notices
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Publish department-wide notices to all staff and enrolled
                  students (FR16), and monitor institutional bulletins (FR18).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600">
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
