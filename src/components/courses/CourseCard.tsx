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
        <span className="rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
          Course Full (0 seats)
        </span>
      );
    }
    if (course.availableSeats <= 3) {
      return (
        <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          {course.availableSeats} seat{course.availableSeats === 1 ? "" : "s"}{" "}
          left
        </span>
      );
    }
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
        {course.availableSeats} seats open
      </span>
    );
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base leading-snug font-bold text-slate-900">
            {course.title}
          </h3>
          {getCapacityBadge()}
        </div>

        <p className="mt-1 text-xs text-slate-600">
          {course.department?.name || "Academic Department"}
        </p>

        <div className="mt-4 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Instructor:</span>
            <span className="font-semibold text-slate-900">
              {course.lecturer?.fullName || "Faculty Member"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Credit Hours:</span>
            <span className="font-semibold text-slate-900">
              {course.creditHours} Credits
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Capacity:</span>
            <span className="font-semibold text-slate-900">
              {course.activeEnrollmentCount} / {course.maxCapacity} enrolled
            </span>
          </div>
        </div>

        {/* Accessible Capacity Bar */}
        <div className="mt-3">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Enrollment capacity: ${percentage}% full`}
          >
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

      <div className="mt-5 border-t border-slate-100 pt-3">
        {course.isEnrolled ? (
          <button
            disabled
            className="w-full cursor-default rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"
          >
            ✓ Currently Enrolled
          </button>
        ) : course.isFull ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
          >
            Registration Closed (Full)
          </button>
        ) : (
          <button
            onClick={() => onEnroll && onEnroll(course.id)}
            disabled={isLoading}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          >
            {isLoading ? "Enrolling..." : "Enroll in Course"}
          </button>
        )}
      </div>
    </div>
  );
}
