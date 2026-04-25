/**
 * GET  /api/admin/schedules — every schedule joined with route + bus
 * POST /api/admin/schedules — create schedule
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const url = new URL(req.url);
  const routeId = url.searchParams.get("routeId");

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const rows = routeId
    ? await db`
        SELECT s.id, s.route_id, s.bus_id, s.departure_time, s.arrival_time,
               s.base_price, s.sleeper_price, s.days_of_week, s.is_active,
               s.valid_from, s.valid_until,
               b.name AS bus_name, b.bus_type, b.total_seats,
               o.name AS origin_name, d.name AS destination_name
        FROM schedules s
        JOIN routes r ON r.id = s.route_id
        JOIN cities o ON o.id = r.origin_city_id
        JOIN cities d ON d.id = r.destination_city_id
        JOIN buses b  ON b.id = s.bus_id
        WHERE s.route_id = ${routeId}
        ORDER BY s.is_active DESC, s.departure_time
      `
    : await db`
        SELECT s.id, s.route_id, s.bus_id, s.departure_time, s.arrival_time,
               s.base_price, s.sleeper_price, s.days_of_week, s.is_active,
               s.valid_from, s.valid_until,
               b.name AS bus_name, b.bus_type, b.total_seats,
               o.name AS origin_name, d.name AS destination_name
        FROM schedules s
        JOIN routes r ON r.id = s.route_id
        JOIN cities o ON o.id = r.origin_city_id
        JOIN cities d ON d.id = r.destination_city_id
        JOIN buses b  ON b.id = s.bus_id
        ORDER BY s.is_active DESC, o.name, s.departure_time
      `;
  return NextResponse.json({ schedules: rows });
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    route_id?: string;
    bus_id?: string;
    departure_time?: string;
    arrival_time?: string;
    base_price?: number;
    sleeper_price?: number | null;
    days_of_week?: number[];
  };

  const { id, route_id, bus_id, departure_time, arrival_time, base_price } = body;
  if (!id || !route_id || !bus_id || !departure_time || !arrival_time || !base_price) {
    return NextResponse.json(
      { error: "id, route_id, bus_id, departure_time, arrival_time, base_price required" },
      { status: 400 },
    );
  }
  if (!/^[a-z0-9-]+$/.test(id)) {
    return NextResponse.json({ error: "id must be lowercase alphanumeric with dashes" }, { status: 400 });
  }
  if (base_price < 0 || base_price > 1_000_000) {
    return NextResponse.json({ error: "base_price (paise) out of range" }, { status: 400 });
  }
  const days = body.days_of_week ?? [0, 1, 2, 3, 4, 5, 6];

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  try {
    const rows = (await db`
      INSERT INTO schedules (id, route_id, bus_id, departure_time, arrival_time,
                             base_price, sleeper_price, days_of_week,
                             is_active, valid_from, valid_until)
      VALUES (${id}, ${route_id}, ${bus_id}, ${departure_time}, ${arrival_time},
              ${base_price}, ${body.sleeper_price ?? null}, ${days},
              true, CURRENT_DATE, NULL)
      RETURNING id
    `) as unknown as { id: string }[];
    return NextResponse.json({ ok: true, schedule: rows[0] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate")) {
      return NextResponse.json({ error: "Schedule id already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
