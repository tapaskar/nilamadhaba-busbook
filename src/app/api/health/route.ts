/**
 * GET /api/health
 *
 * Reports whether the app is running in live (Supabase) or demo mode.
 * If live, verifies a basic read query against the cities table.
 */

import { NextResponse } from "next/server";
import { isLiveMode } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLiveMode()) {
    return NextResponse.json({
      mode: "demo",
      ok: true,
      message: "Running with in-memory mock data. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to go live.",
    });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const probes = await Promise.allSettled([
    sb.from("cities").select("id", { count: "exact", head: true }),
    sb.from("routes").select("id", { count: "exact", head: true }),
    sb.from("buses").select("id", { count: "exact", head: true }),
    sb.from("schedules").select("id", { count: "exact", head: true }),
    sb.from("bookings").select("id", { count: "exact", head: true }),
  ]);

  const [cities, routes, buses, schedules, bookings] = probes;

  const first = probes.find((p) => p.status === "rejected");
  if (first && first.status === "rejected") {
    return NextResponse.json(
      {
        mode: "live",
        ok: false,
        error: String(first.reason),
      },
      { status: 503 },
    );
  }

  function ct(p: PromiseSettledResult<{ count: number | null }>) {
    return p.status === "fulfilled" ? p.value.count ?? 0 : 0;
  }

  return NextResponse.json({
    mode: "live",
    ok: true,
    counts: {
      cities: ct(cities as PromiseSettledResult<{ count: number | null }>),
      routes: ct(routes as PromiseSettledResult<{ count: number | null }>),
      buses: ct(buses as PromiseSettledResult<{ count: number | null }>),
      schedules: ct(schedules as PromiseSettledResult<{ count: number | null }>),
      bookings: ct(bookings as PromiseSettledResult<{ count: number | null }>),
    },
  });
}
