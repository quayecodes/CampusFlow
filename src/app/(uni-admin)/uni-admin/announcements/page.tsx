import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";

export default async function UniAdminAnnouncementsPage() {
  const session = await auth();

  const [departments, courses] = await Promise.all([
    prisma.department.findMany({ select: { id: true, name: true } }),
    prisma.course.findMany({ select: { id: true, title: true } }),
  ]);

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <nav
            className="mb-1 flex items-center gap-1.5 text-xs text-slate-600"
            aria-label="Breadcrumb"
          >
            <Link
              href="/uni-admin"
              className="font-medium hover:text-purple-700 focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:outline-none"
            >
              University Admin Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900" aria-current="page">
              Announcements
            </span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            University-Wide Announcement Control
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Publish campus-wide emergency and administrative broadcasts to all
            students and faculty (FR17) and manage institutional bulletins.
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
