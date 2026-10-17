import { NextResponse } from "next/server";

/**
 * GET /api/v1/health
 *
 * Simple health-check endpoint. Returns 200 if the server is running.
 * Useful for deployment verification and uptime monitoring.
 */
export async function GET() {
  return NextResponse.json({
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
}
