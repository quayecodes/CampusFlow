import React from "react";
import { AnnouncementScope, Role } from "@prisma/client";

interface AnnouncementCardProps {
  id: string;
  title: string;
  body: string;
  scope: AnnouncementScope;
  scopeLabel: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  };
  currentUserId?: string;
  currentUserRole?: Role;
  onDelete?: (id: string) => void;
}

export function AnnouncementCard({
  id,
  title,
  body,
  scope,
  scopeLabel,
  createdAt,
  author,
  currentUserId,
  currentUserRole,
  onDelete,
}: AnnouncementCardProps) {
  const canDelete =
    Boolean(onDelete) &&
    (currentUserId === author.id ||
      currentUserRole === Role.UNI_ADMIN ||
      currentUserRole === Role.DEPT_ADMIN);

  const getScopeBadge = () => {
    switch (scope) {
      case AnnouncementScope.UNIVERSITY:
        return (
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
            🌐 University-Wide
          </span>
        );
      case AnnouncementScope.DEPARTMENT:
        return (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            🏛️ {scopeLabel}
          </span>
        );
      case AnnouncementScope.COURSE:
        return (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            📚 {scopeLabel}
          </span>
        );
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.UNI_ADMIN:
        return "University Administration";
      case Role.DEPT_ADMIN:
        return "Department Administration";
      case Role.LECTURER:
        return "Faculty Instructor";
      default:
        return "CampusFlow";
    }
  };

  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div className="flex flex-wrap items-center gap-2">
          {getScopeBadge()}
          <time
            dateTime={createdAt}
            className="font-mono text-xs text-slate-600"
          >
            {formattedDate}
          </time>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete && onDelete(id)}
            aria-label={`Delete announcement: ${title}`}
            className="rounded px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-900 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
          >
            Delete
          </button>
        )}
      </div>

      <h3 className="mt-2 text-base font-bold text-slate-900">{title}</h3>

      <div className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-700">
        {body}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-800">
            {author.fullName.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-slate-900">
              {author.fullName}
            </span>
            <span className="text-slate-600">
              {" "}
              • {getRoleBadge(author.role)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
