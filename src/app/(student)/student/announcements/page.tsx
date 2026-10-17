import { auth } from "@/auth";
import Link from "next/link";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";

export default async function StudentAnnouncementsPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/student" className="hover:text-gray-700">
              Student Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">Announcements</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Campus Announcements &amp; Notices
          </h1>
          <p className="text-sm text-gray-500">
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
