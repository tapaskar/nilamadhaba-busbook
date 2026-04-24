/**
 * GET /api/seats?scheduleId=...&date=...
 * Returns currently booked + locked seats for a given trip.
 *
 * POST /api/seats/lock { scheduleId, travelDate, seatNumber, userId? }
 * Acquires a 10-minute exclusive lock on a seat for the caller.
 */

import { NextResponse } from "next/server";
import { getBookedSeats, getLockedSeats, isLiveMode } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scheduleId = searchParams.get("scheduleId");
  const date = searchParams.get("date");
  const userId = searchParams.get("userId") || "anonymous";

  if (!scheduleId || !date) {
    return NextResponse.json(
      { error: "Missing scheduleId or date" },
      { status: 400 },
    );
  }

  const [booked, locked] = await Promise.all([
    getBookedSeats(scheduleId, date),
    getLockedSeats(scheduleId, date, userId),
  ]);

  return NextResponse.json({
    booked_seats: booked,
    locked_seats: locked,
    mode: isLiveMode() ? "live" : "demo",
  });
}
