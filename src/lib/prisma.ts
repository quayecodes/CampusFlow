import { PrismaClient } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// Singleton Prisma Client
// ─────────────────────────────────────────────────────────────
// In development, Next.js hot-reloads modules on every change.
// Without this pattern each reload would create a NEW PrismaClient,
// eventually exhausting the database connection pool.
//
// The fix: cache the client on `globalThis` (which survives
// hot-reloads) and reuse it.  In production this is a no-op
// because there's no hot-reload — the module runs once.
// ─────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
