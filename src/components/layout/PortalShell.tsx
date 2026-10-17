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
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
      <PortalHeader user={user} />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        {children}
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-gray-600 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">CampusFlow</span>
            <span>•</span>
            <span>Smart University Management System</span>
            <span>•</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-700">
              v0.2.0-beta
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-600">
            <span>Academic Year 2026/2027</span>
            <span>•</span>
            <span>Semester: 2026-Fall</span>
            <span>•</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
