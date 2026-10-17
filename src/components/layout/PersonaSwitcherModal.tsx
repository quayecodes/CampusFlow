"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

interface PersonaSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: string;
}

export function PersonaSwitcherModal({
  isOpen,
  onClose,
  currentRole,
}: PersonaSwitcherModalProps) {
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  if (!isOpen) return null;

  const personas = [
    {
      role: "STUDENT",
      title: "Student Portal",
      name: "Jane Mensah",
      email: "student1@campusflow.edu",
      desc: "Course registration, attendance compliance, coursework submissions, and official GPA.",
      badge: "bg-indigo-50 border-indigo-200 text-indigo-700",
      accent: "hover:border-indigo-500 hover:bg-indigo-50/50",
      icon: "🎓",
      targetUrl: "/student",
    },
    {
      role: "LECTURER",
      title: "Faculty Lecturer",
      name: "Dr. Mensah",
      email: "dr.mensah@campusflow.edu",
      desc: "Attendance roll call, assignment creation, submission grading, and draft grade entry.",
      badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
      accent: "hover:border-emerald-500 hover:bg-emerald-50/50",
      icon: "👨‍🏫",
      targetUrl: "/lecturer",
    },
    {
      role: "DEPT_ADMIN",
      title: "Department Admin",
      name: "Prof. Mensah",
      email: "dept.admin@campusflow.edu",
      desc: "Departmental grade approval queue, official publication, and audit trail inspection.",
      badge: "bg-amber-50 border-amber-200 text-amber-800",
      accent: "hover:border-amber-500 hover:bg-amber-50/50",
      icon: "🏛️",
      targetUrl: "/dept-admin",
    },
    {
      role: "UNI_ADMIN",
      title: "University Admin",
      name: "Administrator",
      email: "admin@campusflow.edu",
      desc: "Campus-wide broadcast announcements, system governance, and institutional oversight.",
      badge: "bg-purple-50 border-purple-200 text-purple-700",
      accent: "hover:border-purple-500 hover:bg-purple-50/50",
      icon: "🛡️",
      targetUrl: "/uni-admin",
    },
  ];

  const handleSwitch = async (email: string, targetUrl: string) => {
    setSwitchingTo(email);
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
      console.error("Persona switch error:", err);
    } finally {
      setSwitchingTo(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="persona-switcher-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-200"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              ⚡
            </div>
            <div>
              <h2
                id="persona-switcher-title"
                className="text-base font-bold text-slate-900"
              >
                Instant Persona Switcher
              </h2>
              <p className="text-xs text-slate-500">
                1-Click Role Exploration for Demonstrations &amp; Testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close switcher"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Persona Options */}
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-6">
          {personas.map((p) => {
            const isCurrent = currentRole === p.role;
            const isLoading = switchingTo === p.email;

            return (
              <button
                key={p.role}
                disabled={isLoading || isCurrent}
                onClick={() => handleSwitch(p.email, p.targetUrl)}
                className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                  isCurrent
                    ? "cursor-default border-slate-300 bg-slate-50 opacity-75"
                    : `border-slate-200 bg-white ${p.accent} cursor-pointer shadow-xs hover:shadow-md`
                }`}
              >
                <div className="pt-0.5 text-2xl select-none">{p.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {p.title}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${p.badge}`}
                    >
                      {isCurrent ? "Current Active Role" : p.role}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    {p.name} •{" "}
                    <span className="font-mono text-slate-500">{p.email}</span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {p.desc}
                  </p>
                </div>
                {!isCurrent && (
                  <div className="self-center">
                    <span className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition group-hover:bg-indigo-600">
                      {isLoading ? "Switching..." : "Switch →"}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-right text-xs text-slate-500">
          Demo Session Credentials auto-injected with 2026 Edge Security
        </div>
      </div>
    </div>
  );
}
