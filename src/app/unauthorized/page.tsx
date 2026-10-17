import Link from "next/link";

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ requiredRole?: string }>;
}) {
  const { requiredRole } = (await searchParams) || {};

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl font-bold text-red-600">
          403
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
          Access Forbidden
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          You do not have the required permissions to view this resource.
          {requiredRole ? (
            <span className="mt-1 block font-medium text-gray-800">
              Required Role: {requiredRole}
            </span>
          ) : (
            " This zone is restricted to authorized personnel."
          )}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Switch Account
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
