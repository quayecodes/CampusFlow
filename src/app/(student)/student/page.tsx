import Link from "next/link";
import { auth } from "@/auth";

export default async function StudentDashboardPage() {
  const session = await auth();

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-900/10 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div
            className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
                <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active Academic Session • 2026 Fall Term
              </span>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
                Welcome back, {session?.user?.name || "Student"}
              </h1>
              <p className="mt-1 text-xs text-indigo-200 sm:text-sm">
                BSc Computer Science • Verified Student ID
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/student/courses"
                className="btn-tactile rounded-xl bg-white px-5 py-2.5 text-xs font-black text-indigo-950 shadow-md hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Register Courses →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Academic Overview Bento Bar */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Registration Status
            </span>
            <p className="mt-1 text-xl font-black text-slate-900">
              Active Enrollment
            </p>
            <p className="text-[11px] text-slate-500">Up to 18 credits cap</p>
          </div>

          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Attendance Standing
            </span>
            <p className="mt-1 text-xl font-black text-emerald-600">
              &gt; 75% Eligible
            </p>
            <p className="text-[11px] text-slate-500">
              Exam qualification safe
            </p>
          </div>

          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Coursework Tasks
            </span>
            <p className="mt-1 text-xl font-black text-purple-700">
              Active Tracker
            </p>
            <p className="text-[11px] text-slate-500">Late detection active</p>
          </div>

          <div className="bento-card border border-slate-200 p-4">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Academic Transcript
            </span>
            <p className="mt-1 text-xl font-black text-indigo-700">
              Published Grades
            </p>
            <p className="text-[11px] text-slate-500">Official 4.00 scale</p>
          </div>
        </div>

        {/* Academic Services Grid */}
        <div className="mt-8">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Academic Services &amp; Workflows
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Course Registration */}
            <Link
              href="/student/courses"
              className="bento-card group flex flex-col justify-between border border-slate-200/90 p-6 shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
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
                      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-indigo-600">
                  Course Registration
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Browse semester courses, view real-time seat capacities,
                  enroll up to the 18-credit cap, or drop courses with atomic
                  locks.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Manage Courses</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Attendance Tracking */}
            <Link
              href="/student/attendance"
              className="bento-card group flex flex-col justify-between border border-slate-200/90 p-6 shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:scale-110">
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
                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-emerald-600">
                  Attendance Compliance (75% Rule)
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Track course participation, inspect class session dates, and
                  ensure compliance with the mandatory 75% exam qualification
                  threshold.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Check Participation</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Course Assignments */}
            <Link
              href="/student/assignments"
              className="bento-card group flex flex-col justify-between border border-slate-200/90 p-6 shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
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
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-purple-600">
                  Assignments &amp; Submissions
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Submit coursework files, review submission timestamps with
                  automated late flags (FR10), and view graded instructor
                  feedback.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-purple-600">
                <span>View Submissions</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Results & GPA */}
            <Link
              href="/student/results"
              className="bento-card group flex flex-col justify-between border border-slate-200/90 p-6 shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
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
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-5.25 6.557c-.502 0-.962-.06-1.396-.174"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-amber-600">
                  Official Transcript &amp; GPA
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Inspect official published semester grades, earned credits,
                  and semester GPA calculated on a 4.0 scale (FR13).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>View Transcript</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Campus Announcements */}
            <Link
              href="/student/announcements"
              className="bento-card group flex flex-col justify-between border border-slate-200/90 p-6 shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none sm:col-span-2 lg:col-span-2"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:scale-110">
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
                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-blue-600">
                  Unified Campus Bulletins
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Real-time unified bulletin feed combining announcements from
                  your enrolled courses, department notices, and university-wide
                  broadcasts (FR18).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-blue-600">
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
