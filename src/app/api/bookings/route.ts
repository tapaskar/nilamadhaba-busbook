/**
 * POST /api/bookings
 * Body: {
 *   scheduleId, travelDate, totalAmount, paymentId?,
 *   contactEmail, contactPhone,
 *   passengers: [{ seat_number, name, age, gender, is_primary }]
 * }
 *
 * Creates a booking atomically via the create_booking RPC.
 * In demo mode, returns a synthetic booking ID.
 */

import { NextResponse } from "next/server";
import { createBooking, isLiveMode } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function generatePaymentId() {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      scheduleId,
      travelDate,
      totalAmount,
      paymentId,
      contactEmail,
      contactPhone,
      passengers,
    } = body;

    if (!scheduleId || !travelDate || !totalAmount || !contactEmail || !contactPhone || !Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Resolve user ID. In live mode, use the authenticated Supabase user.
    // In demo mode (or unauthenticated), use a stable "guest" identity.
    let userId = "guest-user";
    if (isLiveMode()) {
      try {
        const sb = await createClient();
        const { data: { user } } = await sb.auth.getUser();
        if (user?.id) userId = user.id;
      } catch {
        // cookie/ssr failure — fall back to guest
      }
    }

    const result = await createBooking({
      userId,
      scheduleId,
      travelDate,
      totalAmount,
      paymentId: paymentId || generatePaymentId(),
      contactEmail,
      contactPhone,
      passengers,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({
      ok: true,
      id: result.id,
      mode: isLiveMode() ? "live" : "demo",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
