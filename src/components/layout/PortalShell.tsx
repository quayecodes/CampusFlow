import { auth } from "@/auth";
import { PortalHeader } from "./PortalHeader";

interface PortalShellProps {
  children: React.ReactNode;
  role: string;
}

export async function PortalShell({ children, role }: PortalShellProps) {
  const session = await auth();

  const user = {
    name: session?.user?.name || null,
    email: session?.user?.email || null,
    role: session?.user?.role || role,
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Subtle Ambient Background Dot Matrix */}
      <div
        className="bg-dots-subtle pointer-events-none fixed inset-0 z-0 opacity-40"
        aria-hidden="true"
      />

      {/* Navigation Header */}
      <div className="relative z-30">
        <PortalHeader user={user} />
      </div>

      {/* Main Content Viewport */}
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex-1 pb-16 focus:outline-none sm:pb-6"
      >
        {children}
      </main>

      {/* Institutional Enterprise Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/80 py-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CampusFlow</span>
            <span>•</span>
            <span>Academic Operating System</span>
            <span>•</span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
              v0.2.0-beta
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All Systems Operational
            </span>
            <span>•</span>
            <span>Academic Year 2026/27</span>
            <span>•</span>
            <span>Semester: 2026-Fall</span>
            <span>•</span>
            <span className="font-medium text-slate-700">
              WCAG 2.1 AA Compliant
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
