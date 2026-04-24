/**
 * GET /api/bookings/[id]
 * Returns a single booking with its passengers and schedule details.
 */

import { NextResponse } from "next/server";
import { getBookingById, isLiveMode } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const result = await getBookingById(id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...result,
    mode: isLiveMode() ? "live" : "demo",
  });
}
