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
            <p className="font-mono text-xs text-amber-600">
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
      </div>
    </div>
  );
}
