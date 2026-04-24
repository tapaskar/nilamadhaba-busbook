/**
 * GET /api/health
 *
 * Reports whether the app is running in live (Neon) or demo mode.
 * If live, runs a probe query against every critical table.
 */

import { NextResponse } from "next/server";
import { getHealth } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const h = await getHealth();
  if (h.mode === "demo") {
    return NextResponse.json({
      mode: "demo",
      ok: true,
      message:
        "Running with in-memory mock data. Set DATABASE_URL (Neon) to go live.",
    });
  }
  if (!h.ok) {
    return NextResponse.json(h, { status: 503 });
  }
  return NextResponse.json(h);
}
