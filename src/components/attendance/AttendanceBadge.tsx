import React from "react";
import { AttendanceStatus } from "@prisma/client";

interface AttendanceBadgeProps {
  status: AttendanceStatus | null | undefined;
  size?: "sm" | "md";
}

export function AttendanceBadge({ status, size = "md" }: AttendanceBadgeProps) {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  if (!status) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-gray-100 text-gray-600 ${sizeClasses}`}
      >
        Not Marked
      </span>
    );
  }

  switch (status) {
    case AttendanceStatus.PRESENT:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 ${sizeClasses}`}
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Present
        </span>
      );
    case AttendanceStatus.LATE:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-100 text-amber-800 ${sizeClasses}`}
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
          Late
        </span>
      );
    case AttendanceStatus.ABSENT:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-red-100 text-red-800 ${sizeClasses}`}
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          Absent
        </span>
      );
  }
}
