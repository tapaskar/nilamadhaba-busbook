/**
 * PATCH  /api/admin/schedules/[id]
 *        Body — any subset of:
 *          isActive            boolean
 *          bus_id              text   (must reference an existing bus)
 *          departure_time      "HH:MM" or "HH:MM:SS"
 *          arrival_time        "HH:MM" or "HH:MM:SS"
 *          base_price          integer paise (>= 0)
 *          sleeper_price       integer paise | null
 *          days_of_week        integer[]  (0 = Sunday … 6 = Saturday)
 *          valid_from          "YYYY-MM-DD"
 *          valid_until         "YYYY-MM-DD" | null
 *
 * DELETE /api/admin/schedules/[id]
 *        Soft delete (sets is_active = false). Refuses if there are
 *        upcoming pending/confirmed bookings.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    isActive?: boolean;
    bus_id?: string;
    departure_time?: string;
    arrival_time?: string;
    base_price?: number;
    sleeper_price?: number | null;
    days_of_week?: number[];
    valid_from?: string;
    valid_until?: string | null;
  };

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  // Validation
  if (body.base_price !== undefined && (!Number.isFinite(body.base_price) || body.base_price < 0 || body.base_price > 1_000_000)) {
    return NextResponse.json({ error: "base_price (paise) out of range" }, { status: 400 });
  }
  if (body.sleeper_price !== undefined && body.sleeper_price !== null && (!Number.isFinite(body.sleeper_price) || body.sleeper_price < 0 || body.sleeper_price > 1_000_000)) {
    return NextResponse.json({ error: "sleeper_price (paise) out of range" }, { status: 400 });
  }
  if (body.departure_time !== undefined && !TIME_RE.test(body.departure_time)) {
    return NextResponse.json({ error: "departure_time must be HH:MM" }, { status: 400 });
  }
  if (body.arrival_time !== undefined && !TIME_RE.test(body.arrival_time)) {
    return NextResponse.json({ error: "arrival_time must be HH:MM" }, { status: 400 });
  }
  if (body.days_of_week !== undefined) {
    if (
      !Array.isArray(body.days_of_week) ||
      body.days_of_week.length === 0 ||
      body.days_of_week.some((d) => !Number.isInteger(d) || d < 0 || d > 6)
    ) {
      return NextResponse.json(
        { error: "days_of_week must be a non-empty array of integers 0–6" },
        { status: 400 },
      );
    }
  }

  // Bus existence check (only when changing)
  if (body.bus_id !== undefined) {
    const busRows = (await db`
      SELECT 1 FROM buses WHERE id = ${body.bus_id} AND is_active = true LIMIT 1
    `) as unknown as Array<unknown>;
    if (busRows.length === 0) {
      return NextResponse.json(
        { error: `Bus ${body.bus_id} not found or inactive` },
        { status: 400 },
      );
    }
  }

  // Apply each field individually — keeps SQL static and safe.
  if (body.isActive !== undefined) {
    await db`UPDATE schedules SET is_active = ${body.isActive} WHERE id = ${id}`;
  }
  if (body.bus_id !== undefined) {
    await db`UPDATE schedules SET bus_id = ${body.bus_id} WHERE id = ${id}`;
  }
  if (body.departure_time !== undefined) {
    await db`UPDATE schedules SET departure_time = ${body.departure_time} WHERE id = ${id}`;
  }
  if (body.arrival_time !== undefined) {
    await db`UPDATE schedules SET arrival_time = ${body.arrival_time} WHERE id = ${id}`;
  }
  if (body.base_price !== undefined) {
    await db`UPDATE schedules SET base_price = ${body.base_price} WHERE id = ${id}`;
  }
  if (body.sleeper_price !== undefined) {
    await db`UPDATE schedules SET sleeper_price = ${body.sleeper_price} WHERE id = ${id}`;
  }
  if (body.days_of_week !== undefined) {
    await db`UPDATE schedules SET days_of_week = ${body.days_of_week} WHERE id = ${id}`;
  }
  if (body.valid_from !== undefined) {
    await db`UPDATE schedules SET valid_from = ${body.valid_from} WHERE id = ${id}`;
  }
  if (body.valid_until !== undefined) {
    await db`UPDATE schedules SET valid_until = ${body.valid_until} WHERE id = ${id}`;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;
  const { id } = await params;

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const rows = (await db`
    SELECT COUNT(*)::integer AS n FROM bookings
    WHERE schedule_id = ${id} AND status IN ('pending', 'confirmed')
      AND travel_date >= CURRENT_DATE
  `) as unknown as { n: number }[];

  if (rows[0]?.n > 0) {
    return NextResponse.json(
      { error: `Cannot remove — ${rows[0].n} upcoming booking${rows[0].n > 1 ? "s" : ""} on this schedule.` },
      { status: 409 },
    );
  }

  await db`UPDATE schedules SET is_active = false WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
