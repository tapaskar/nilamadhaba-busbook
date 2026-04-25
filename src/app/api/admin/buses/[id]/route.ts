/**
 * GET    /api/admin/buses/[id]
 *        Returns full bus row including seat_layout JSON.
 *
 * PATCH  /api/admin/buses/[id]
 *        Body — any subset of:
 *          isActive             boolean
 *          name                 text
 *          registration_number  text
 *          amenities            text[]
 *          photos               text[]   (URLs)
 *          layoutId             text     (preset id; rebuilds seat_layout
 *                                         + total_seats. Refuses if there
 *                                         are upcoming bookings.)
 *          ladiesOnlySeats      string[] (overrides which seat ids are
 *                                         ladies-only, keeps current layout)
 *
 * DELETE /api/admin/buses/[id]
 *        Soft-delete (sets is_active=false). Refuses if upcoming
 *        bookings exist.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";
import { findLayout } from "@/lib/seat-layouts";
import type { SeatLayout } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;
  const { id } = await params;

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const rows = (await db`
    SELECT b.id, b.name, b.registration_number, b.bus_type,
           b.total_seats, b.seat_layout, b.amenities, b.photos, b.is_active,
           COALESCE(sched_count.n, 0) AS schedule_count
    FROM buses b
    LEFT JOIN (
      SELECT bus_id, COUNT(*)::integer AS n FROM schedules
      WHERE is_active = true GROUP BY bus_id
    ) sched_count ON sched_count.bus_id = b.id
    WHERE b.id = ${id}
    LIMIT 1
  `) as unknown as Array<unknown>;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Bus not found" }, { status: 404 });
  }
  return NextResponse.json({ bus: rows[0] });
}

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
    registration_number?: string;
    amenities?: string[];
    photos?: string[];
    layoutId?: string;
    ladiesOnlySeats?: string[];
  };

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  // Ensure bus exists
  const existsRows = (await db`SELECT 1 FROM buses WHERE id = ${id} LIMIT 1`) as unknown as Array<unknown>;
  if (existsRows.length === 0) {
    return NextResponse.json({ error: "Bus not found" }, { status: 404 });
  }

  // Layout swap is destructive — refuse if there are upcoming bookings
  if (body.layoutId !== undefined) {
    const preset = findLayout(body.layoutId);
    if (!preset) return NextResponse.json({ error: "Unknown layout preset" }, { status: 400 });

    const upcoming = (await db`
      SELECT COUNT(*)::integer AS n
      FROM bookings b
      JOIN schedules s ON s.id = b.schedule_id
      WHERE s.bus_id = ${id}
        AND b.status IN ('pending', 'confirmed')
        AND b.travel_date >= CURRENT_DATE
    `) as unknown as Array<{ n: number }>;
    if (upcoming[0]?.n > 0) {
      return NextResponse.json(
        {
          error: `Cannot swap layout — bus has ${upcoming[0].n} upcoming booking${upcoming[0].n > 1 ? "s" : ""}. Wait until those trips complete or move them to another bus first.`,
        },
        { status: 409 },
      );
    }

    const layout = preset.build();
    await db`
      UPDATE buses
      SET seat_layout = ${JSON.stringify(layout)}::jsonb,
          total_seats = ${preset.totalSeats},
          bus_type    = ${preset.bus_type}
      WHERE id = ${id}
    `;
  }

  // Ladies-only override (works on the EXISTING layout — flips the
  // ladies_only flag on each seat in the layout JSON)
  if (body.ladiesOnlySeats !== undefined) {
    const ladiesSet = new Set(body.ladiesOnlySeats);
    const rows = (await db`SELECT seat_layout FROM buses WHERE id = ${id} LIMIT 1`) as unknown as Array<{ seat_layout: SeatLayout }>;
    const layout = rows[0]?.seat_layout;
    if (layout && Array.isArray(layout.decks)) {
      const updated = {
        ...layout,
        decks: layout.decks.map((d) => ({
          ...d,
          seats: d.seats.map((s) => ({ ...s, ladies_only: ladiesSet.has(s.id) })),
        })),
      };
      await db`UPDATE buses SET seat_layout = ${JSON.stringify(updated)}::jsonb WHERE id = ${id}`;
    }
  }

  if (body.isActive !== undefined) {
    await db`UPDATE buses SET is_active = ${body.isActive} WHERE id = ${id}`;
  }
  if (body.name !== undefined) {
    await db`UPDATE buses SET name = ${body.name} WHERE id = ${id}`;
  }
  if (body.registration_number !== undefined) {
    try {
      await db`UPDATE buses SET registration_number = ${body.registration_number} WHERE id = ${id}`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("duplicate") || msg.includes("unique")) {
        return NextResponse.json(
          { error: "Another bus already uses this registration number" },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }
  if (body.amenities !== undefined) {
    await db`UPDATE buses SET amenities = ${body.amenities} WHERE id = ${id}`;
  }
  if (body.photos !== undefined) {
    await db`UPDATE buses SET photos = ${body.photos} WHERE id = ${id}`;
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
