import { auth } from "@/auth";
import Link from "next/link";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";

export default async function StudentAnnouncementsPage() {
  const session = await auth();

  return (
    <div className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <nav
            className="mb-1 flex items-center gap-1.5 text-xs text-slate-600"
            aria-label="Breadcrumb"
          >
            <Link
              href="/student"
              className="font-medium hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              Student Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900" aria-current="page">
              Announcements
            </span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Campus Announcements &amp; Notices
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Your unified bulletin board for university broadcasts, department
            notices, and course updates from your instructors (FR18).
          </p>
        </div>

        <AnnouncementFeed
          currentUserId={session?.user?.id}
          currentUserRole={session?.user?.role}
          canPost={false}
        />
      </div>
    </div>
  );
}
