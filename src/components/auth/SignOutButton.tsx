"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={
        className ||
        "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      }
    >
      Sign Out
    </button>
  );
}
