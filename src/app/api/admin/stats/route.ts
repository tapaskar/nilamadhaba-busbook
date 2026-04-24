/**
 * GET /api/admin/stats
 *
 * Aggregate booking stats for the admin dashboard.
 * NOTE: protect this behind auth before exposing publicly.
 */

import { NextResponse } from "next/server";
import { getAdminStats, isLiveMode } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLiveMode()) {
    return NextResponse.json({
      mode: "demo",
      stats: null,
      message: "Connect Neon (DATABASE_URL) to see real stats.",
    });
  }
  const stats = await getAdminStats();
  if (!stats) {
    return NextResponse.json(
      { mode: "live", stats: null, error: "query failed" },
      { status: 503 },
    );
  }
  return NextResponse.json({ mode: "live", stats });
}
