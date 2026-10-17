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
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Full (0 seats)
        </span>
      );
    }
    if (course.availableSeats <= 3) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
          <span className="pulse-glow h-1.5 w-1.5 rounded-full bg-amber-500" />
          {course.availableSeats} seat{course.availableSeats === 1 ? "" : "s"}{" "}
          left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {course.availableSeats} open seats
      </span>
    );
  };

  return (
    <div className="bento-card flex flex-col justify-between border border-slate-200/90 p-5 shadow-2xs">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
            {course.creditHours} Credits
          </span>
          {getCapacityBadge()}
        </div>

        <h3 className="mt-3 text-base leading-snug font-bold text-slate-900">
          {course.title}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {course.department?.name || "Academic Department"}
        </p>

        <div className="mt-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Instructor:</span>
            <span className="font-semibold text-slate-800">
              {course.lecturer?.fullName || "Faculty Member"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Seat Capacity:</span>
            <span className="font-mono font-semibold text-slate-800">
              {course.activeEnrollmentCount} / {course.maxCapacity} enrolled
            </span>
          </div>
        </div>

        {/* Accessible Capacity Progress Bar */}
        <div className="mt-3">
          <div
            className="h-2 w-full overflow-hidden rounded-full border border-slate-200/60 bg-slate-100"
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

      <div className="mt-5 border-t border-slate-100 pt-3.5">
        {course.isEnrolled ? (
          <button
            disabled
            className="w-full cursor-default rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-center text-xs font-bold text-emerald-800"
          >
            ✓ Currently Enrolled
          </button>
        ) : course.isFull ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-center text-xs font-semibold text-slate-500"
          >
            Capacity Full (Locked)
          </button>
        ) : (
          <button
            onClick={() => onEnroll && onEnroll(course.id)}
            disabled={isLoading}
            className="btn-tactile w-full rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          >
            {isLoading ? "Enrolling..." : "Enroll in Course →"}
          </button>
        )}
      </div>
    </div>
  );
}
