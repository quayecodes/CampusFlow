import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `auth`, contains information about the active user.
   */
  interface Session {
    user: {
      id: string;
      role: Role;
      departmentId: string | null;
      programId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    departmentId: string | null;
    programId: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    id: string;
    role: Role;
    departmentId: string | null;
    programId: string | null;
  }
}
