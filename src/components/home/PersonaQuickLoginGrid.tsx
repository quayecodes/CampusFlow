"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function PersonaQuickLoginGrid() {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const personas = [
    {
      role: "Student",
      title: "Jane Mensah",
      email: "student1@campusflow.edu",
      roleKey: "STUDENT",
      desc: "Course registration, 75% attendance ring, assignment submission & GPA transcript",
      targetUrl: "/student",
      accent:
        "border-indigo-200/80 hover:border-indigo-500 hover:shadow-indigo-500/10",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      btnBg: "bg-indigo-600 hover:bg-indigo-700",
      icon: "🎓",
    },
    {
      role: "Faculty Lecturer",
      title: "Dr. Mensah",
      email: "dr.mensah@campusflow.edu",
      roleKey: "LECTURER",
      desc: "Roll call marking, assignment grading, late submission flags & grade sheet entry",
      targetUrl: "/lecturer",
      accent:
        "border-emerald-200/80 hover:border-emerald-500 hover:shadow-emerald-500/10",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      btnBg: "bg-emerald-600 hover:bg-emerald-700",
      icon: "👨‍🏫",
    },
    {
      role: "Department Admin",
      title: "Prof. Mensah",
      email: "dept.admin@campusflow.edu",
      roleKey: "DEPT_ADMIN",
      desc: "Grade approval queue, formal publication & tamper-evident audit log review",
      targetUrl: "/dept-admin",
      accent:
        "border-amber-200/80 hover:border-amber-500 hover:shadow-amber-500/10",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      btnBg: "bg-amber-600 hover:bg-amber-700",
      icon: "🏛️",
    },
    {
      role: "University Admin",
      title: "Administrator",
      email: "admin@campusflow.edu",
      roleKey: "UNI_ADMIN",
      desc: "Campus-wide emergency alerts, user management & system-wide governance",
      targetUrl: "/uni-admin",
      accent:
        "border-purple-200/80 hover:border-purple-500 hover:shadow-purple-500/10",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      btnBg: "bg-purple-600 hover:bg-purple-700",
      icon: "🛡️",
    },
  ];

  const handleQuickLogin = async (email: string, targetUrl: string) => {
    setLoadingRole(email);
    try {
      const result = await signIn("credentials", {
        email,
        password: "CampusFlow2026!",
        redirect: false,
      });

      if (result && !result.error) {
        window.location.href = targetUrl;
      }
    } catch (err) {
      console.error("Quick login failed:", err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {personas.map((p) => {
        const isLoading = loadingRole === p.email;

        return (
          <div
            key={p.roleKey}
            className={`bento-card flex flex-col justify-between border p-6 ${p.accent}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl select-none">{p.icon}</span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${p.badge}`}
                >
                  {p.role}
                </span>
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                {p.title}
              </h3>
              <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                {p.email}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {p.desc}
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin(p.email, p.targetUrl)}
                className={`btn-tactile flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-white shadow-xs transition ${p.btnBg} disabled:opacity-50`}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>1-Click Launch</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
