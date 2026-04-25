/**
 * PATCH /api/admin/routes/[id]  — toggle isActive / update distance + duration
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
    distance_km?: number;
    estimated_duration_minutes?: number;
  };

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  if (body.isActive !== undefined) {
    await db`UPDATE routes SET is_active = ${body.isActive} WHERE id = ${id}`;
    if (body.isActive === false) {
      await db`UPDATE schedules SET is_active = false WHERE route_id = ${id}`;
    }
  }
  if (body.distance_km !== undefined) {
    await db`UPDATE routes SET distance_km = ${body.distance_km} WHERE id = ${id}`;
  }
  if (body.estimated_duration_minutes !== undefined) {
    await db`UPDATE routes SET estimated_duration_minutes = ${body.estimated_duration_minutes} WHERE id = ${id}`;
  }

  return NextResponse.json({ ok: true });
}
