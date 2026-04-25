/**
 * GET  /api/admin/buses         — list all buses (joined with utilization)
 * POST /api/admin/buses         — create a new bus using a layout preset
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";
import { findLayout } from "@/lib/seat-layouts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const rows = await db`
    SELECT b.id, b.name, b.registration_number, b.bus_type,
           b.total_seats, b.amenities, b.is_active,
           COALESCE(sched_count.n, 0) AS schedule_count,
           COALESCE(booking_count.n, 0) AS booking_count
    FROM buses b
    LEFT JOIN (
      SELECT bus_id, COUNT(*)::integer AS n FROM schedules
      WHERE is_active = true GROUP BY bus_id
    ) sched_count ON sched_count.bus_id = b.id
    LEFT JOIN (
      SELECT s.bus_id, COUNT(*)::integer AS n FROM bookings bk
      JOIN schedules s ON s.id = bk.schedule_id
      WHERE bk.status IN ('pending', 'confirmed', 'completed')
      GROUP BY s.bus_id
    ) booking_count ON booking_count.bus_id = b.id
    ORDER BY b.is_active DESC, b.name
  `;
  return NextResponse.json({ buses: rows });
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    name?: string;
    registration_number?: string;
    layoutId?: string;
    amenities?: string[];
  };

  const { id, name, registration_number, layoutId, amenities } = body;
  if (!id || !name || !registration_number || !layoutId) {
    return NextResponse.json(
      { error: "Missing required fields: id, name, registration_number, layoutId" },
      { status: 400 },
    );
  }

  const preset = findLayout(layoutId);
  if (!preset) {
    return NextResponse.json({ error: "Unknown layout preset" }, { status: 400 });
  }

  if (!/^[a-z0-9-]+$/.test(id)) {
    return NextResponse.json(
      { error: "id must be lowercase alphanumeric with dashes" },
      { status: 400 },
    );
  }

  const layout = preset.build();
  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  try {
    const rows = (await db`
      INSERT INTO buses (id, name, registration_number, bus_type,
                         total_seats, seat_layout, amenities, photos, is_active)
      VALUES (${id}, ${name}, ${registration_number}, ${preset.bus_type},
              ${preset.totalSeats}, ${JSON.stringify(layout)}::jsonb,
              ${amenities ?? []}, ${[] as string[]}, true)
      RETURNING id, name, registration_number, bus_type, total_seats, is_active
    `) as unknown as { id: string }[];
    return NextResponse.json({ ok: true, bus: rows[0] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate key") || msg.includes("unique")) {
      return NextResponse.json(
        { error: "Bus ID or registration number already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
