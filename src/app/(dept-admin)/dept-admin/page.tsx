import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function DeptAdminDashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Department Administrator Portal
            </h1>
            <p className="text-sm text-gray-500">
              Welcome back, {session?.user?.name || "Department Admin"}
            </p>
          </div>
          <SignOutButton />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <h2 className="font-semibold text-amber-900">Session Claims</h2>
            <p className="mt-1 text-sm text-amber-700">Authenticated via JWT</p>
            <p className="mt-1 font-mono text-xs text-amber-600">
              Email: {session?.user?.email}
            </p>
            <p className="mt-1 font-mono text-xs text-amber-600">
              Role: {session?.user?.role}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-800">
              RBAC Guard Verification
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              Protected by Next.js edge middleware. Only authenticated users
              with role <span className="font-semibold">DEPT_ADMIN</span> can
              access /dept-admin routes.
            </p>
          </div>
        </div>

        {/* Feature Navigation Cards */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
            Departmental Governance
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/dept-admin/grades"
              className="flex items-center justify-between rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-sm transition hover:border-indigo-400 hover:shadow"
            >
              <div>
                <h3 className="font-bold text-indigo-900">
                  Grade Approval Queue
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Review submitted course grades, formally publish results, and
                  inspect post-publication audit logs (FR12, FR14).
                </p>
              </div>
              <span className="text-xl text-indigo-600">→</span>
            </Link>

            <Link
              href="/dept-admin/announcements"
              className="flex items-center justify-between rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow"
            >
              <div>
                <h3 className="font-bold text-amber-900">
                  Department Announcements
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Publish department broadcasts and faculty circulars (FR16),
                  and review campus-wide notifications (FR18).
                </p>
              </div>
              <span className="text-xl text-amber-600">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
