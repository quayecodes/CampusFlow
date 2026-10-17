import Link from "next/link";
import { auth } from "@/auth";

export default async function UniAdminDashboardPage() {
  const session = await auth();

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-900/10 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div
            className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200">
                <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-purple-400" />
                Institutional Executive Oversight • System Administrator
              </span>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
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
                className="btn-tactile rounded-xl bg-white px-5 py-2.5 text-xs font-black text-purple-950 shadow-md hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Post Broadcast →
              </Link>
            </div>
          </div>
        </div>

        {/* Institutional Overview Bento Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Authority Tier
            </span>
            <p className="mt-1 text-xl font-black text-slate-900">SuperAdmin</p>
            <p className="text-[11px] text-slate-500">Institution-Wide</p>
          </div>

          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Broadcast Reach
            </span>
            <p className="mt-1 text-xl font-black text-purple-700">
              100% Campus
            </p>
            <p className="text-[11px] text-slate-500">All 4 Roles Targeted</p>
          </div>

          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Compliance Standard
            </span>
            <p className="mt-1 text-xl font-black text-emerald-600">
              FERPA &amp; AA
            </p>
            <p className="text-[11px] text-slate-500">Security Grade 2026</p>
          </div>

          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Session Security
            </span>
            <p className="mt-1 text-xl font-black text-indigo-700">Edge RBAC</p>
            <p className="text-[11px] text-slate-500">Middleware Guarded</p>
          </div>
        </div>

        {/* Institutional Services Grid */}
        <div className="mt-8">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Institutional Administration
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Campus Announcements */}
            <Link
              href="/uni-admin/announcements"
              className="bento-card group flex flex-col justify-between border border-slate-200/90 p-6 shadow-2xs focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 transition group-hover:scale-110">
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
                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-purple-600">
                  Campus-Wide Broadcasts
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Publish emergency alerts, academic calendar notices, and
                  official university announcements to all users across all
                  departments (FR17, FR18).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-purple-600">
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
