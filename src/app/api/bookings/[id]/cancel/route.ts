/**
 * POST /api/bookings/[id]/cancel
 * Body: { reason?: string, userId?: string }
 *
 * Cancels a booking. Refund percentage by time-before-departure:
 *   12+ hrs → 100%    6-12 hrs → 75%    2-6 hrs → 50%    <2 hrs → 0%
 */

import { NextResponse } from "next/server";
import { cancelBooking, isLiveMode } from "@/lib/data";

export const dynamic = "force-dynamic";

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

  const userId = body.userId || "guest-user";
  const result = await cancelBooking(id, userId, body.reason);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ...result, mode: "live" });
}
