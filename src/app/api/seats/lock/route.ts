/**
 * POST /api/seats/lock
 * Body: { scheduleId, travelDate, seatNumber, userId }
 *
 * Acquires a 10-minute exclusive lock on a seat for the caller.
 * In demo mode (no Supabase), this always succeeds (no persistence).
 */

import { NextResponse } from "next/server";
import { lockSeat, isLiveMode } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scheduleId, travelDate, seatNumber, userId } = body;
    if (!scheduleId || !travelDate || !seatNumber || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    const ok = await lockSeat(scheduleId, travelDate, seatNumber, userId);
    if (!ok) {
      return NextResponse.json(
        { error: "Seat is already taken" },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, mode: isLiveMode() ? "live" : "demo" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
