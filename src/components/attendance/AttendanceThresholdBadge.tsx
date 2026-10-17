import React from "react";

interface AttendanceThresholdBadgeProps {
  percentage: number;
  totalSessions: number;
  threshold?: number;
}

export function AttendanceThresholdBadge({
  percentage,
  totalSessions,
  threshold = 75,
}: AttendanceThresholdBadgeProps) {
  if (totalSessions === 0) {
    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
        No sessions yet
      </span>
    );
  }

  const isAtRisk = percentage < threshold;

  return (
    <div className="flex items-center space-x-2">
      <span
        className={`inline-flex items-center text-sm font-bold ${
          isAtRisk ? "text-red-700" : "text-emerald-700"
        }`}
      >
        {percentage}%
      </span>
      {isAtRisk ? (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
          ⚠️ At Risk (&lt;{threshold}%)
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
          Good Standing
        </span>
      )}
    </div>
  );
}
