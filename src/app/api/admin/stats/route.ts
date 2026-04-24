/**
 * GET /api/admin/stats
 *
 * Returns aggregate booking stats for the admin dashboard.
 * Uses the service-role client, so bypass RLS — protect via auth if exposed.
 */

import { NextResponse } from "next/server";
import { isLiveMode } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLiveMode()) {
    return NextResponse.json({
      mode: "demo",
      stats: null,
      message: "Connect Supabase to see real stats.",
    });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [todayBookings, monthBookings, recentBookings] = await Promise.all([
    sb
      .from("bookings")
      .select("total_amount", { count: "exact" })
      .gte("booked_at", `${todayIso}T00:00:00Z`),
    sb
      .from("bookings")
      .select("total_amount", { count: "exact" })
      .gte("booked_at", `${monthStart}T00:00:00Z`),
    sb
      .from("bookings")
      .select("*")
      .order("booked_at", { ascending: false })
      .limit(10),
  ]);

  const todayRevenue =
    todayBookings.data?.reduce((s: number, b: { total_amount: number }) => s + b.total_amount, 0) ?? 0;
  const monthRevenue =
    monthBookings.data?.reduce((s: number, b: { total_amount: number }) => s + b.total_amount, 0) ?? 0;

  return NextResponse.json({
    mode: "live",
    stats: {
      today: {
        bookings: todayBookings.count ?? 0,
        revenue_paise: todayRevenue,
      },
      this_month: {
        bookings: monthBookings.count ?? 0,
        revenue_paise: monthRevenue,
      },
      recent_bookings: recentBookings.data ?? [],
    },
  });
}
