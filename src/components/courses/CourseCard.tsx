"use client";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    creditHours: number;
    maxCapacity: number;
    semester: string;
    department?: { name: string };
    lecturer?: { fullName: string; email: string };
    activeEnrollmentCount: number;
    availableSeats: number;
    isFull: boolean;
    isEnrolled: boolean;
  };
  onEnroll?: (courseId: string) => void;
  isLoading?: boolean;
}

export function CourseCard({ course, onEnroll, isLoading }: CourseCardProps) {
  const percentage = Math.min(
    100,
    Math.round((course.activeEnrollmentCount / course.maxCapacity) * 100)
  );

  const getCapacityBadge = () => {
    if (course.isFull) {
      return (
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
          Course Full (0 seats)
        </span>
      );
    }
    if (course.availableSeats <= 3) {
      return (
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          {course.availableSeats} seat{course.availableSeats === 1 ? "" : "s"}{" "}
          left
        </span>
      );
    }
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
        {course.availableSeats} seats open
      </span>
    );
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base leading-snug font-bold text-gray-900">
            {course.title}
          </h3>
          {getCapacityBadge()}
        </div>

        <p className="mt-1 text-xs text-gray-500">
          {course.department?.name || "Academic Department"}
        </p>

        <div className="mt-4 space-y-1.5 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Instructor:</span>
            <span className="font-medium text-gray-800">
              {course.lecturer?.fullName || "Unassigned"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Credit Hours:</span>
            <span className="font-medium text-gray-800">
              {course.creditHours} Credits
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Capacity:</span>
            <span className="font-medium text-gray-800">
              {course.activeEnrollmentCount} / {course.maxCapacity} enrolled
            </span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full transition-all duration-300 ${
                course.isFull
                  ? "bg-red-500"
                  : percentage > 75
                    ? "bg-amber-500"
                    : "bg-indigo-600"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-3">
        {course.isEnrolled ? (
          <button
            disabled
            className="w-full cursor-default rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
          >
            ✓ Currently Enrolled
          </button>
        ) : course.isFull ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-medium text-gray-400"
          >
            Closed (Full)
          </button>
        ) : (
          <button
            onClick={() => onEnroll && onEnroll(course.id)}
            disabled={isLoading}
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:outline-none disabled:opacity-50"
          >
            {isLoading ? "Enrolling..." : "Enroll in Course"}
          </button>
        )}
      </div>
    </div>
  );
}
