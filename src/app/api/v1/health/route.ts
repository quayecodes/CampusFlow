import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/v1/health
 *
 * Enterprise-grade observability & system diagnostics probe.
 * Checks PostgreSQL connectivity, measures round-trip database latency,
 * evaluates process memory utilization, and returns health status for
 * Kubernetes readiness / liveness checks and enterprise SLA monitoring.
 */
export async function GET() {
  let dbStatus = "unreachable";
  let dbLatencyMs = -1;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (err) {
    console.error("Health check database probe failed:", err);
    dbStatus = "error";
  }

  const memoryUsage = process.memoryUsage();
  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      data: {
        status: isHealthy ? "HEALTHY" : "DEGRADED",
        service: "CampusFlow Academic Operations Engine",
        version: "0.3.0-rc1",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        diagnostics: {
          database: {
            status: dbStatus,
            latencyMs: dbLatencyMs,
          },
          memory: {
            rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
            heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          },
        },
      },
      error: null,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
