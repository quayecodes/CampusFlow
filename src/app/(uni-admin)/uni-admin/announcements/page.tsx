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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/uni-admin" className="hover:text-gray-700">
              University Admin Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">Announcements</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            University-Wide Announcement Control
          </h1>
          <p className="text-sm text-gray-500">
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
