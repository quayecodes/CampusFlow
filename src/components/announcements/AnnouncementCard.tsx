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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            🌐 University-Wide
          </span>
        );
      case AnnouncementScope.DEPARTMENT:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            🏛️ {scopeLabel}
          </span>
        );
      case AnnouncementScope.COURSE:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
    <article className="bento-card border border-slate-200/90 p-6 shadow-2xs">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div className="flex flex-wrap items-center gap-2">
          {getScopeBadge()}
          <time
            dateTime={createdAt}
            className="font-mono text-[11px] text-slate-400"
          >
            {formattedDate}
          </time>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete && onDelete(id)}
            aria-label={`Delete announcement: ${title}`}
            className="btn-tactile rounded-lg px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:text-red-800 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
          >
            Delete
          </button>
        )}
      </div>

      <h3 className="mt-3 text-base leading-snug font-bold text-slate-900">
        {title}
      </h3>

      <div className="mt-2 text-xs leading-relaxed whitespace-pre-line text-slate-600">
        {body}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-700">
            {author.fullName.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-slate-800">
              {author.fullName}
            </span>
            <span className="text-slate-400">
              {" "}
              • {getRoleBadge(author.role)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
