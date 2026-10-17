import Link from "next/link";

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ requiredRole?: string }>;
}) {
  const { requiredRole } = (await searchParams) || {};

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl font-extrabold text-red-700 shadow-xs">
          403
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
          Access Forbidden
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          You do not have the required institutional permissions to view this
          resource.
          {requiredRole ? (
            <span className="mt-1 block font-semibold text-slate-900">
              Required Permission Scope: {requiredRole}
            </span>
          ) : (
            " This section is restricted to authorized personnel."
          )}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Switch Account / Re-authenticate
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
