import { PortalShell } from "@/components/layout/PortalShell";

export const metadata = {
  title: "Department Admin Portal | CampusFlow",
  description: "Grade approvals, audit logs, and department notices",
};

export default function DeptAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell role="DEPT_ADMIN">{children}</PortalShell>;
}
