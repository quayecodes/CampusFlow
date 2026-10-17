"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "Student",
      title: "Jane Mensah",
      email: "student1@campusflow.edu",
      roleKey: "STUDENT",
      icon: "🎓",
      badge: "border-indigo-200 bg-indigo-50/80 text-indigo-700",
      activeBorder: "ring-2 ring-indigo-500 border-indigo-500",
    },
    {
      role: "Lecturer",
      title: "Dr. Mensah",
      email: "dr.mensah@campusflow.edu",
      roleKey: "LECTURER",
      icon: "👨‍🏫",
      badge: "border-emerald-200 bg-emerald-50/80 text-emerald-700",
      activeBorder: "ring-2 ring-emerald-500 border-emerald-500",
    },
    {
      role: "Dept Admin",
      title: "Prof. Mensah",
      email: "dept.admin@campusflow.edu",
      roleKey: "DEPT_ADMIN",
      icon: "🏛️",
      badge: "border-amber-200 bg-amber-50/80 text-amber-800",
      activeBorder: "ring-2 ring-amber-500 border-amber-500",
    },
    {
      role: "Uni Admin",
      title: "Administrator",
      email: "admin@campusflow.edu",
      roleKey: "UNI_ADMIN",
      icon: "🛡️",
      badge: "border-purple-200 bg-purple-50/80 text-purple-700",
      activeBorder: "ring-2 ring-purple-500 border-purple-500",
    },
  ];

  const fillDemoAccount = (demoEmail: string, roleKey: string) => {
    setEmail(demoEmail);
    setPassword("CampusFlow2026!");
    setSelectedPersona(roleKey);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password. Please verify your credentials.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white">
      {/* Left Showcase Banner - Desktop (lg+) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        {/* Ambient Gradient Mesh Background */}
        <div
          className="absolute inset-0 bg-cover opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #6366f1 0%, transparent 40%), radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 40%)",
          }}
          aria-hidden="true"
        />

        {/* Brand Top Header */}
        <div className="relative z-10">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-md transition group-hover:scale-105">
              <svg
                className="h-6 w-6"
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
            <span className="text-xl font-black tracking-tight text-white">
              CampusFlow
            </span>
          </Link>
        </div>

        {/* Showcase Core Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Academic Operations Platform 2026/27
          </div>

          <h2 className="text-3xl leading-snug font-extrabold tracking-tight text-white sm:text-4xl">
            Streamlined academic workflows for faculty, students, and deans.
          </h2>

          <p className="text-sm leading-relaxed text-slate-300">
            From atomic course capacity locking to automated 75% attendance
            compliance tracking and tamper-evident grade governance, experience
            institutional software built to modern standards.
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
              <p className="text-2xl font-black text-indigo-400">100%</p>
              <p className="text-xs text-slate-400">Race Condition Free</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-400">WCAG 2.1</p>
              <p className="text-xs text-slate-400">
                AA Certified Accessibility
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>CampusFlow ERP v0.2.0-beta</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Edge RBAC Active
          </span>
        </div>
      </div>

      {/* Right Column - Authentication Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl">
          {/* Header */}
          <div className="text-center">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none lg:hidden"
              aria-label="Return to CampusFlow homepage"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
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
              <span className="text-xl font-bold tracking-tight text-slate-900">
                CampusFlow
              </span>
            </Link>

            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Sign In to Portal
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Choose a demo persona or enter institutional credentials
            </p>
          </div>

          {/* 1-Click Interactive Persona Quick-Fill Tabs */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                1-Click Demo Personas:
              </span>
              <span className="text-[10px] text-slate-400">
                Click to autofill
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => {
                const isSelected = selectedPersona === acc.roleKey;

                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemoAccount(acc.email, acc.roleKey)}
                    className={`btn-tactile flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${
                      isSelected
                        ? acc.activeBorder + " bg-white shadow-xs"
                        : `${acc.badge} hover:opacity-90`
                    }`}
                    aria-label={`Select ${acc.role} demo account`}
                  >
                    <span className="text-base select-none">{acc.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="leading-tight font-bold">{acc.role}</p>
                      <p className="truncate text-[10px] opacity-75">
                        {acc.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800"
            >
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Institutional Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedPersona(null);
                }}
                placeholder="e.g. student1@campusflow.edu"
                className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-2xs transition placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-tactile flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign In to Portal →"}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Need a student account?{" "}
            <Link
              href="/register"
              className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-600">
            Loading authentication portal...
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
