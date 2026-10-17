import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";

export default async function LecturerAnnouncementsPage() {
  const session = await auth();

  const courses = session?.user?.id
    ? await prisma.course.findMany({
        where: { lecturerId: session.user.id },
        select: { id: true, title: true },
      })
    : [];

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <nav
            className="mb-1 flex items-center gap-1.5 text-xs text-slate-600"
            aria-label="Breadcrumb"
          >
            <Link
              href="/lecturer"
              className="font-medium hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              Lecturer Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900" aria-current="page">
              Announcements
            </span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Course Announcements &amp; Campus Feed
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Post course announcements to your enrolled students (FR15) and view
            department and campus-wide communications (FR18).
          </p>
        </div>

        <AnnouncementFeed
          currentUserId={session?.user?.id}
          currentUserRole={session?.user?.role}
          canPost={true}
          courses={courses}
        />
      </div>
    </div>
  );
}
