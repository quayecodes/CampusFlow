import { PortalShell } from "@/components/layout/PortalShell";

export const metadata = {
  title: "Student Portal | CampusFlow",
  description: "Course registration, attendance, assignments, and results",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell role="STUDENT">{children}</PortalShell>;
}
