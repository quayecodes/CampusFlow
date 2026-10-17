import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";

export default async function DeptAdminAnnouncementsPage() {
  const session = await auth();

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          department: {
            include: {
              courses: { select: { id: true, title: true } },
            },
          },
        },
      })
    : null;

  const departments = user?.department
    ? [{ id: user.department.id, name: user.department.name }]
    : [];

  const courses = user?.department?.courses || [];

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <nav
            className="mb-1 flex items-center gap-1.5 text-xs text-slate-600"
            aria-label="Breadcrumb"
          >
            <Link
              href="/dept-admin"
              className="font-medium hover:text-amber-700 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
            >
              Department Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900" aria-current="page">
              Announcements
            </span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Department Announcements &amp; Bulletin
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Broadcast official notices to students and faculty in your
            department (FR16) and review campus communications (FR18).
          </p>
        </div>

        <AnnouncementFeed
          currentUserId={session?.user?.id}
          currentUserRole={session?.user?.role}
          canPost={true}
          departments={departments}
          courses={courses}
        />
      </div>
    </div>
  );
}
