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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/dept-admin" className="hover:text-gray-700">
              Department Portal
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">Announcements</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Department Announcements &amp; Bulletin
          </h1>
          <p className="text-sm text-gray-500">
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
