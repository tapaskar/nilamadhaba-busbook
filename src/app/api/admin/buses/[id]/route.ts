/**
 * PATCH  /api/admin/buses/[id]  — toggle active or rename
 * DELETE /api/admin/buses/[id]  — soft-delete (sets is_active = false)
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
    name?: string;
    amenities?: string[];
  };

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  if (body.isActive !== undefined && body.name !== undefined && body.amenities !== undefined) {
    await db`UPDATE buses SET is_active = ${body.isActive}, name = ${body.name}, amenities = ${body.amenities} WHERE id = ${id}`;
  } else if (body.isActive !== undefined && body.name !== undefined) {
    await db`UPDATE buses SET is_active = ${body.isActive}, name = ${body.name} WHERE id = ${id}`;
  } else if (body.isActive !== undefined) {
    await db`UPDATE buses SET is_active = ${body.isActive} WHERE id = ${id}`;
  } else if (body.name !== undefined) {
    await db`UPDATE buses SET name = ${body.name} WHERE id = ${id}`;
  } else if (body.amenities !== undefined) {
    await db`UPDATE buses SET amenities = ${body.amenities} WHERE id = ${id}`;
  } else {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
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

  // Refuse deletion if there are upcoming bookings
  const rows = (await db`
    SELECT COUNT(*)::integer AS n
    FROM bookings b
    JOIN schedules s ON s.id = b.schedule_id
    WHERE s.bus_id = ${id}
      AND b.status IN ('pending', 'confirmed')
      AND b.travel_date >= CURRENT_DATE
  `) as unknown as { n: number }[];

  if (rows[0]?.n > 0) {
    return NextResponse.json(
      {
        error: `Cannot remove bus — it has ${rows[0].n} upcoming booking${rows[0].n > 1 ? "s" : ""}. Deactivate it instead.`,
      },
      { status: 409 },
    );
  }

  await db`UPDATE buses SET is_active = false WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
