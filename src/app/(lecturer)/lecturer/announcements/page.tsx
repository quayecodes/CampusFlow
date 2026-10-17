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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/lecturer" className="hover:text-gray-700">
              Lecturer Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">Announcements</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Course Announcements &amp; Campus Feed
          </h1>
          <p className="text-sm text-gray-500">
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
