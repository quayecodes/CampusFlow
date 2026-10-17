import { auth } from "@/auth";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm border border-gray-200 text-center">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          Smart University Management System
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          CampusFlow
        </h1>
        <p className="mt-3 text-base text-gray-600 sm:text-lg">
          Centralized academic and administrative platform for students, lecturers,
          and administrators.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {session ? (
            <div className="space-y-4 w-full">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-sm text-green-800">
                Logged in as <span className="font-semibold">{session.user?.name}</span> ({session.user?.role})
              </div>
              <div className="flex justify-center gap-3">
                <Link
                  href={
                    session.user?.role === "STUDENT"
                      ? "/student"
                      : session.user?.role === "LECTURER"
                      ? "/lecturer"
                      : session.user?.role === "DEPT_ADMIN"
                      ? "/dept-admin"
                      : "/uni-admin"
                  }
                  className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Go to Dashboard
                </Link>
                <SignOutButton />
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Sign In to Portal
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
