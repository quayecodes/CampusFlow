import { PortalShell } from "@/components/layout/PortalShell";

export const metadata = {
  title: "Lecturer Portal | CampusFlow",
  description: "Attendance tracking, assignment grading, and grade submission",
};

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell role="LECTURER">{children}</PortalShell>;
}
