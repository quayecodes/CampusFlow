import Link from "next/link";
import { auth } from "@/auth";

export default async function StudentDashboardPage() {
  const session = await auth();

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-200">
                Semester: 2026-Fall • Active Session
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Welcome back, {session?.user?.name || "Student"}
              </h1>
              <p className="mt-1 text-xs text-indigo-200 sm:text-sm">
                BSc Computer Science • Verified Student ID
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/student/courses"
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-900 shadow-sm transition hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Register Courses →
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                Session Identity
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Authenticated Account:{" "}
              <strong className="text-slate-900">{session?.user?.email}</strong>
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Assigned Scope: Student Academic Portal (Level 200)
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
              <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                Security &amp; Edge RBAC
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Protected by Next.js Edge Middleware. Enforces strict student data
              isolation across all academic endpoints.
            </p>
          </div>
        </div>

        {/* Academic Services Grid */}
        <div className="mt-8">
          <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
            Academic Services &amp; Workflows
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Course Registration */}
            <Link
              href="/student/courses"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-indigo-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 transition group-hover:scale-105">
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
                      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-indigo-600">
                  Course Registration
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Browse semester courses, view real-time seat capacities,
                  enroll up to the 18-credit cap, or drop courses.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Manage Courses</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Attendance Tracking */}
            <Link
              href="/student/attendance"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-blue-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:scale-105">
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
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600">
                  My Attendance
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Track course participation, inspect class session dates, and
                  monitor compliance with the 75% attendance threshold (FR6).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Check Participation</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Course Assignments */}
            <Link
              href="/student/assignments"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-purple-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
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
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-purple-600">
                  Course Assignments
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Submit coursework files, review submission timestamps and late
                  submission flags (FR10), and view graded feedback.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-purple-600">
                <span>View Submissions</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Results & GPA */}
            <Link
              href="/student/results"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-emerald-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition group-hover:scale-105">
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
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-600">
                  Results &amp; GPA
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Inspect official published semester grades, earned credits,
                  and semester GPA calculated on a 4.0 scale (FR13).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>View Transcript</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Campus Announcements */}
            <Link
              href="/student/announcements"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-amber-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none sm:col-span-2 lg:col-span-2"
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
                  Unified Campus Announcements
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Real-time unified bulletin feed combining announcements from
                  your enrolled courses, department notices, and university-wide
                  broadcasts (FR18).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-amber-600">
                <span>View Bulletin Feed</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
