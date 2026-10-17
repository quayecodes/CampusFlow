"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage(null);

    // Client-side confirmation check
    if (formData.password !== formData.confirmPassword) {
      setErrors(["Passwords do not match."]);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.details && Array.isArray(json.error.details)) {
          setErrors(json.error.details);
        } else {
          setErrors([json.error?.message || "Registration failed."]);
        }
      } else {
        setSuccessMessage(
          "Account created successfully! Redirecting to login..."
        );
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white">
      {/* Left Showcase Banner */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div
          className="absolute inset-0 bg-cover opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 30%, #4f46e5 0%, transparent 40%), radial-gradient(circle at 30% 80%, #7c3aed 0%, transparent 40%)",
          }}
          aria-hidden="true"
        />

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

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Instant University Onboarding
          </div>

          <h2 className="text-3xl leading-snug font-extrabold tracking-tight text-white sm:text-4xl">
            Join thousands of students and faculty on CampusFlow.
          </h2>

          <p className="text-sm leading-relaxed text-slate-300">
            Create your account to unlock concurrent course registration, live
            75% attendance compliance tracking, assignment submissions, and
            verified semester GPA records.
          </p>

          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-indigo-300">
              <span>🛡️ Secure Institutional Standard</span>
            </div>
            <p>
              All passwords require 8+ characters with uppercase, lowercase,
              numeric and symbol requirements, hashed via Bcrypt with 12 salt
              rounds.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>CampusFlow ERP v0.2.0-beta</span>
          <span>FERPA &amp; GDPR Compliant</span>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl">
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
              Create an Account
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Enroll in CampusFlow to manage your academic profile
            </p>
          </div>

          {errors.length > 0 && (
            <div
              role="alert"
              aria-live="polite"
              className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800"
            >
              {errors.map((err, idx) => (
                <p key={idx}>• {err}</p>
              ))}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800"
            >
              {successMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-slate-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Jane Mensah"
                className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              />
            </div>

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
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. j.mensah@campusflow.edu"
                className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-xs font-semibold text-slate-700"
              >
                Account Persona
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              >
                <option value="STUDENT">Student</option>
                <option value="LECTURER">Lecturer</option>
                <option value="DEPT_ADMIN">Department Administrator</option>
                <option value="UNI_ADMIN">University Administrator</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter strong password"
                className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              />
              {/* Password Checklist Pills */}
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] text-slate-500">
                <span
                  className={
                    hasLength
                      ? "font-semibold text-emerald-700"
                      : "text-slate-400"
                  }
                >
                  {hasLength ? "✓" : "○"} 8+ characters
                </span>
                <span
                  className={
                    hasUpper
                      ? "font-semibold text-emerald-700"
                      : "text-slate-400"
                  }
                >
                  {hasUpper ? "✓" : "○"} Uppercase letter
                </span>
                <span
                  className={
                    hasLower
                      ? "font-semibold text-emerald-700"
                      : "text-slate-400"
                  }
                >
                  {hasLower ? "✓" : "○"} Lowercase letter
                </span>
                <span
                  className={
                    hasNumber && hasSpecial
                      ? "font-semibold text-emerald-700"
                      : "text-slate-400"
                  }
                >
                  {hasNumber && hasSpecial ? "✓" : "○"} Number &amp; symbol
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition placeholder:text-slate-400 focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-tactile flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Complete Registration →"}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
