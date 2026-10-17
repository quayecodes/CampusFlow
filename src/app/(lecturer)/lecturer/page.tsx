import Link from "next/link";
import { auth } from "@/auth";

export default async function LecturerDashboardPage() {
  const session = await auth();

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-200">
                Department of Computer Science • Faculty Member
              </span>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Welcome back, {session?.user?.name || "Lecturer"}
              </h1>
              <p className="mt-1 text-xs text-emerald-200 sm:text-sm">
                Assigned Courses: CS201 (Data Structures), CS202 (Database
                Systems)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/lecturer/attendance"
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                Mark Roll Call →
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
                Instructor Credentials
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Authenticated Account:{" "}
              <strong className="text-slate-900">{session?.user?.email}</strong>
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Role: Faculty Lecturer (Authorized Course Scope)
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
              <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase">
                Academic Governance
              </h2>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Grade entries require Department Administrator approval prior to
              student publication (FR12). All revisions are logged (FR14).
            </p>
          </div>
        </div>

        {/* Instructional Services Grid */}
        <div className="mt-8">
          <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
            Instructional Services &amp; Management
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Attendance Roll Call */}
            <Link
              href="/lecturer/attendance"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-emerald-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
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
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-600">
                  Attendance Roll Call
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Record daily lecture attendance with Present, Late, or Absent
                  toggles and monitor at-risk students below 75% (FR4, FR6).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>Mark Attendance</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Assignments & Grading */}
            <Link
              href="/lecturer/assignments"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-teal-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition group-hover:scale-105">
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
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-teal-600">
                  Coursework Management
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Create assignments, view student uploaded attachments, inspect
                  automatic late flags, and submit scores with feedback
                  (FR7–10).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-teal-600">
                <span>Grade Submissions</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Final Grade Entry */}
            <Link
              href="/lecturer/grades"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-indigo-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
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
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-indigo-600">
                  Grade Entry Sheet
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Enter final raw scores, calculate real-time letter grades, and
                  submit grade sheets to Department Admin for approval.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Enter Grades</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Course Announcements */}
            <Link
              href="/lecturer/announcements"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-blue-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
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
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-blue-600">
                  Course Bulletins
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Post class notices to your enrolled courses (FR15) and monitor
                  department and university announcements (FR18).
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Manage Bulletins</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
