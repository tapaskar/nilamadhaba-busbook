/**
 * POST /api/bookings/[id]/cancel
 * Body: { reason?: string }
 *
 * Cancels a booking. Refund amount is computed by time-before-departure:
 *   12+ hrs → 100%    6-12 hrs → 75%    2-6 hrs → 50%    <2 hrs → 0%
 */

import { NextResponse } from "next/server";
import { isLiveMode } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function computeRefundPct(departureIso: string): number {
  const dep = new Date(departureIso).getTime();
  const now = Date.now();
  const hrs = (dep - now) / (1000 * 60 * 60);
  if (hrs >= 12) return 100;
  if (hrs >= 6) return 75;
  if (hrs >= 2) return 50;
  return 0;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (!isLiveMode()) {
    return NextResponse.json({
      ok: true,
      refund_amount: 0,
      refund_pct: 100,
      mode: "demo",
    });
  }

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch booking + schedule to compute refund window
  const { data: booking, error: bErr } = await sb
    .from("bookings")
    .select("*, schedule:schedules!inner(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (bErr || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const sch = (booking as unknown as { schedule: { departure_time: string } })
    .schedule;
  const departureIso = `${(booking as { travel_date: string }).travel_date}T${
    sch.departure_time
  }+05:30`;
  const pct = computeRefundPct(departureIso);
  const refund = Math.round(
    ((booking as { total_amount: number }).total_amount * pct) / 100,
  );

  const update = {
    status: "cancelled" as const,
    cancelled_at: new Date().toISOString(),
    cancellation_reason: body.reason || null,
    refund_amount: refund,
    payment_status: (refund === 0
      ? (booking as { payment_status: string }).payment_status
      : pct === 100
        ? "refunded"
        : "partially_refunded") as
      | "pending"
      | "paid"
      | "refunded"
      | "partially_refunded",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: uErr } = await (sb as any)
    .from("bookings")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id);

  if (uErr) {
    return NextResponse.json({ error: uErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    refund_amount: refund,
    refund_pct: pct,
    mode: "live",
  });
}
