import { PortalShell } from "@/components/layout/PortalShell";

export const metadata = {
  title: "University Admin Portal | CampusFlow",
  description: "University-wide governance and broadcasts",
};

export default function UniAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell role="UNI_ADMIN">{children}</PortalShell>;
}
