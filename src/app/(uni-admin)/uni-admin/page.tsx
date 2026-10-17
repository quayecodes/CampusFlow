import Link from "next/link";
import { auth } from "@/auth";

export default async function UniAdminDashboardPage() {
  const session = await auth();

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-200">
                Institutional Executive Oversight • System Administrator
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Welcome back, {session?.user?.name || "University Admin"}
              </h1>
              <p className="mt-1 text-xs text-purple-200 sm:text-sm">
                Scope: University-Wide Broadcasts, Campus Security &amp;
                Institutional Governance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/uni-admin/announcements"
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-purple-900 shadow-sm transition hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Post Broadcast →
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-purple-500"></span>
              <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                System Governance
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Authenticated Account:{" "}
              <strong className="text-slate-900">{session?.user?.email}</strong>
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Assigned Scope: Institutional Super Administrator
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
              <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                Campus-Wide Broadcasts (FR17)
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Bulletins posted at the University scope appear in every student,
              lecturer, and administrator feed instantly.
            </p>
          </div>
        </div>

        {/* Institutional Services Grid */}
        <div className="mt-8">
          <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
            Institutional Administration
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Campus Announcements */}
            <Link
              href="/uni-admin/announcements"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-purple-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700 transition group-hover:scale-105">
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
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-purple-600">
                  Campus-Wide Broadcasts
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Publish emergency alerts, academic calendar notices, and
                  official university announcements to all users across all
                  departments (FR17, FR18).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-purple-600">
                <span>Manage Broadcasts</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
