/**
 * POST /api/bookings
 * Body: {
 *   scheduleId, travelDate, totalAmount, paymentId?,
 *   contactEmail, contactPhone,
 *   passengers: [{ seat_number, name, age, gender, is_primary }]
 * }
 *
 * Creates a booking atomically via the create_booking() Postgres function.
 * In demo mode, returns a synthetic booking ID.
 *
 * NOTE: user identity currently falls back to 'guest-user'.
 * Swap in Clerk / Auth.js / NextAuth to attribute bookings to real users.
 */

import { NextResponse } from "next/server";
import { createBooking, isLiveMode } from "@/lib/data";

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
      // Optional: explicit user id from auth (fallback to guest)
      userId: providedUserId,
    } = body;

    if (
      !scheduleId ||
      !travelDate ||
      !totalAmount ||
      !contactEmail ||
      !contactPhone ||
      !Array.isArray(passengers) ||
      passengers.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const userId = providedUserId || "guest-user";

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
