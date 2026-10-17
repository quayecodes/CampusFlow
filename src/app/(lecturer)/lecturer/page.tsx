import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function LecturerDashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lecturer Portal
            </h1>
            <p className="text-sm text-gray-500">
              Welcome back, {session?.user?.name || "Lecturer"}
            </p>
          </div>
          <SignOutButton />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <h2 className="font-semibold text-emerald-900">Session Claims</h2>
            <p className="mt-1 text-sm text-emerald-700">
              Authenticated via JWT
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-600">
              Email: {session?.user?.email}
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-600">
              Role: {session?.user?.role}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-800">
              RBAC Guard Verification
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              Protected by Next.js edge middleware. Only authenticated users
              with role <span className="font-semibold">LECTURER</span> can
              access /lecturer routes.
            </p>
          </div>
        </div>

        {/* Feature Navigation Cards */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
            Instructional Services
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/lecturer/attendance"
              className="flex items-center justify-between rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow"
            >
              <div>
                <h3 className="font-bold text-emerald-900">
                  Attendance Tracking
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Mark daily class roll call, track present/late/absent rates,
                  and monitor students at risk.
                </p>
              </div>
              <span className="text-xl text-emerald-600">→</span>
            </Link>

            <Link
              href="/lecturer/assignments"
              className="flex items-center justify-between rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow"
            >
              <div>
                <h3 className="font-bold text-teal-900">
                  Assignment Management
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Create coursework, inspect student submissions, view late
                  flags, and record grades with feedback.
                </p>
              </div>
              <span className="text-xl text-teal-600">→</span>
            </Link>

            <Link
              href="/lecturer/grades"
              className="flex items-center justify-between rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-sm transition hover:border-indigo-400 hover:shadow"
            >
              <div>
                <h3 className="font-bold text-indigo-900">
                  Final Grade Entry &amp; Submission
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Enter student final scores and submit draft grade sheets to
                  the Department Administrator for publication approval (FR11,
                  FR14).
                </p>
              </div>
              <span className="text-xl text-indigo-600">→</span>
            </Link>

            <Link
              href="/lecturer/announcements"
              className="flex items-center justify-between rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow"
            >
              <div>
                <h3 className="font-bold text-blue-900">
                  Course Announcements
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Publish notices to your enrolled classes (FR15) and monitor
                  department and university bulletins (FR18).
                </p>
              </div>
              <span className="text-xl text-blue-600">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
