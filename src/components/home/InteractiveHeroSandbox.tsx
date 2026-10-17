"use client";

import { useState } from "react";

export function InteractiveHeroSandbox() {
  const [activeTab, setActiveTab] = useState<
    "courses" | "attendance" | "grades" | "announcements"
  >("courses");

  // Interactive sandbox states
  const [courseSeats, setCourseSeats] = useState(28);
  const [attendancePercent, setAttendancePercent] = useState(72);
  const [gradeStage, setGradeStage] = useState<
    "draft" | "submitted" | "approved" | "published"
  >("draft");
  const [scopeFilter, setScopeFilter] = useState<
    "COURSE" | "DEPARTMENT" | "UNIVERSITY"
  >("COURSE");

  return (
    <div className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-xl">
      {/* Sandbox Window Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="ml-2 font-mono text-xs font-semibold text-slate-500">
            Interactive Product Preview • 2026 Live Sandbox
          </span>
        </div>

        {/* Tab Switchers */}
        <div className="flex gap-1 overflow-x-auto py-1">
          {[
            { id: "courses", label: "Seat Concurrency", icon: "⚡" },
            { id: "attendance", label: "75% Attendance Rule", icon: "🎯" },
            { id: "grades", label: "Grade Governance", icon: "⚖️" },
            { id: "announcements", label: "Scoped Bulletins", icon: "📢" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sandbox Content View */}
      <div className="flex min-h-[280px] items-center justify-center bg-gradient-to-b from-white to-slate-50/50 p-6 sm:p-8">
        {activeTab === "courses" && (
          <div className="w-full max-w-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase">
                  Transactional Capacity Engine
                </span>
                <h4 className="text-lg font-bold text-slate-900">
                  CS201: Data Structures &amp; Algorithms
                </h4>
                <p className="text-xs text-slate-500">
                  Max Limit: 30 Seats • Atomic Postgres Row-Locking
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                    courseSeats >= 30
                      ? "border border-red-200 bg-red-100 text-red-800"
                      : "border border-emerald-200 bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {courseSeats >= 30
                    ? "Capacity Full (0 Seats)"
                    : `${30 - courseSeats} Seats Available`}
                </span>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="space-y-1">
              <div className="h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                <div
                  className={`h-full transition-all duration-300 ${
                    courseSeats >= 30 ? "bg-red-500" : "bg-indigo-600"
                  }`}
                  style={{ width: `${(courseSeats / 30) * 100}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[11px] text-slate-500">
                <span>{courseSeats} Enrolled</span>
                <span>30 Max Cap</span>
              </div>
            </div>

            {/* Interactive Simulator Controls */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                disabled={courseSeats >= 30}
                onClick={() => setCourseSeats((s) => Math.min(30, s + 1))}
                className="btn-tactile rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-40"
              >
                + Simulate Concurrent Student Enrollment
              </button>
              <button
                disabled={courseSeats <= 0}
                onClick={() => setCourseSeats((s) => Math.max(0, s - 1))}
                className="btn-tactile rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                - Simulate Drop Course
              </button>
              <button
                onClick={() => setCourseSeats(28)}
                className="ml-auto text-xs text-slate-400 underline hover:text-slate-600"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="w-full max-w-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase">
                  Compliance Automation (FR6)
                </span>
                <h4 className="text-lg font-bold text-slate-900">
                  Exam Eligibility Threshold Monitor
                </h4>
                <p className="text-xs text-slate-500">
                  Mandatory threshold: 75% attendance across lecture sessions
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-3xl font-black ${
                    attendancePercent >= 75
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {attendancePercent}%
                </span>
              </div>
            </div>

            {/* Status Alert Banner */}
            <div
              className={`rounded-xl border p-3 text-xs ${
                attendancePercent >= 75
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {attendancePercent >= 75 ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold">✓ Good Standing:</span>
                  <span>
                    Student is eligible to sit for final examinations.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-bold">⚠️ Below 75% Threshold:</span>
                  <span>
                    Exam barred alert active. Student must attend next 2
                    sessions.
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Slider */}
            <div>
              <label
                htmlFor="attendance-slider"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Drag slider to simulate student roll call changes:
              </label>
              <input
                id="attendance-slider"
                type="range"
                min="40"
                max="100"
                value={attendancePercent}
                onChange={(e) => setAttendancePercent(Number(e.target.value))}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="w-full max-w-xl space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase">
                Institutional Integrity (FR11–14)
              </span>
              <h4 className="text-lg font-bold text-slate-900">
                Multi-Stage Academic Grade Governance
              </h4>
              <p className="text-xs text-slate-500">
                Lecturer inputs drafts &rarr; Department reviews &rarr; Dean
                approves &rarr; Published with audit logs
              </p>
            </div>

            {/* Stepper Visualization */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[
                { key: "draft", label: "1. Draft Entry", role: "Lecturer" },
                {
                  key: "submitted",
                  label: "2. Queue Submit",
                  role: "Dept Queue",
                },
                {
                  key: "approved",
                  label: "3. Dept Approved",
                  role: "Dept Admin",
                },
                {
                  key: "published",
                  label: "4. Live to Student",
                  role: "Published",
                },
              ].map((step, idx) => {
                const stages = ["draft", "submitted", "approved", "published"];
                const isCurrent = gradeStage === step.key;
                const isPassed =
                  stages.indexOf(gradeStage) >= stages.indexOf(step.key);

                return (
                  <button
                    key={step.key}
                    onClick={() => setGradeStage(step.key as typeof gradeStage)}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      isCurrent
                        ? "border-indigo-500 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-500/20"
                        : isPassed
                          ? "border-slate-300 bg-white"
                          : "border-slate-200 bg-slate-50 opacity-60"
                    }`}
                  >
                    <p className="font-mono text-[10px] text-slate-400">
                      Step {idx + 1}
                    </p>
                    <p className="text-xs font-bold text-slate-800">
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-indigo-600">
                      {step.role}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <span>
                State:{" "}
                <strong className="text-slate-900 uppercase">
                  {gradeStage}
                </strong>{" "}
                • Revisions logged in{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">
                  GradeChangeLog
                </code>
              </span>
              <button
                onClick={() => {
                  const stages: (typeof gradeStage)[] = [
                    "draft",
                    "submitted",
                    "approved",
                    "published",
                  ];
                  const nextIdx = (stages.indexOf(gradeStage) + 1) % 4;
                  setGradeStage(stages[nextIdx]);
                }}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Advance Stage &rarr;
              </button>
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="w-full max-w-xl space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-purple-600 uppercase">
                Audience Scoping (FR15–18)
              </span>
              <h4 className="text-lg font-bold text-slate-900">
                Hierarchical Campus Bulletins
              </h4>
              <p className="text-xs text-slate-500">
                Notices strictly filter to authorized student and faculty
                cohorts
              </p>
            </div>

            {/* Scope Filter Buttons */}
            <div className="flex gap-2">
              {(["COURSE", "DEPARTMENT", "UNIVERSITY"] as const).map(
                (scope) => (
                  <button
                    key={scope}
                    onClick={() => setScopeFilter(scope)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      scopeFilter === scope
                        ? "bg-slate-900 text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {scope === "COURSE"
                      ? "Course Scope"
                      : scope === "DEPARTMENT"
                        ? "Department Scope"
                        : "University-Wide"}
                  </button>
                )
              )}
            </div>

            {/* Preview Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                    scopeFilter === "COURSE"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : scopeFilter === "DEPARTMENT"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-purple-200 bg-purple-50 text-purple-700"
                  }`}
                >
                  {scopeFilter} ANNOUNCEMENT
                </span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <h5 className="mt-2 text-sm font-bold text-slate-900">
                {scopeFilter === "COURSE"
                  ? "CS201: Lab 3 Submission Due Date Extended"
                  : scopeFilter === "DEPARTMENT"
                    ? "Computer Science Department: Annual Tech Symposium"
                    : "University Senate: Fall Examination Timetable Released"}
              </h5>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {scopeFilter === "COURSE"
                  ? "Only students currently registered for CS201 and teaching assistants receive this bulletin."
                  : scopeFilter === "DEPARTMENT"
                    ? "Delivered to all faculty and students affiliated with Department of Computer Science."
                    : "Broadcast to all authenticated students, faculty, and administrators campus-wide."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sandbox Footer */}
      <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/70 px-6 py-3 text-xs text-slate-500">
        <span>Powered by Next.js 15 Server Actions &amp; Prisma ORM</span>
        <span className="font-semibold text-indigo-600">
          Try live in any portal &rarr;
        </span>
      </div>
    </div>
  );
}
