/**
 * PATCH  /api/admin/schedules/[id]  — toggle isActive / update price
 * DELETE /api/admin/schedules/[id]  — soft delete (refuses if upcoming bookings)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    isActive?: boolean;
    base_price?: number;
    sleeper_price?: number | null;
  };

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  if (body.isActive !== undefined) {
    await db`UPDATE schedules SET is_active = ${body.isActive} WHERE id = ${id}`;
  }
  if (body.base_price !== undefined) {
    await db`UPDATE schedules SET base_price = ${body.base_price} WHERE id = ${id}`;
  }
  if (body.sleeper_price !== undefined) {
    await db`UPDATE schedules SET sleeper_price = ${body.sleeper_price} WHERE id = ${id}`;
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
