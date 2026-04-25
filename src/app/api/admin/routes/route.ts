/**
 * GET  /api/admin/routes — list every route, joined with origin + dest
 * POST /api/admin/routes — create route
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const rows = await db`
    SELECT r.id, r.distance_km, r.estimated_duration_minutes, r.is_active,
           r.origin_city_id, r.destination_city_id,
           o.name AS origin_name, o.state AS origin_state,
           d.name AS destination_name, d.state AS destination_state,
           COALESCE(sc.n, 0) AS schedule_count
    FROM routes r
    JOIN cities o ON o.id = r.origin_city_id
    JOIN cities d ON d.id = r.destination_city_id
    LEFT JOIN (
      SELECT route_id, COUNT(*)::integer AS n
      FROM schedules WHERE is_active = true GROUP BY route_id
    ) sc ON sc.route_id = r.id
    ORDER BY r.is_active DESC, o.name, d.name
  `;
  return NextResponse.json({ routes: rows });
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    origin_city_id?: string;
    destination_city_id?: string;
    distance_km?: number;
    estimated_duration_minutes?: number;
  };

  const { id, origin_city_id, destination_city_id, distance_km, estimated_duration_minutes } = body;

  if (!id || !origin_city_id || !destination_city_id) {
    return NextResponse.json({ error: "id, origin_city_id, destination_city_id required" }, { status: 400 });
  }
  if (origin_city_id === destination_city_id) {
    return NextResponse.json({ error: "Origin and destination must differ" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(id)) {
    return NextResponse.json({ error: "id must be lowercase alphanumeric with dashes" }, { status: 400 });
  }

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  try {
    const rows = (await db`
      INSERT INTO routes (id, origin_city_id, destination_city_id,
                          distance_km, estimated_duration_minutes, is_active)
      VALUES (${id}, ${origin_city_id}, ${destination_city_id},
              ${distance_km ?? null}, ${estimated_duration_minutes ?? null}, true)
      RETURNING id
    `) as unknown as { id: string }[];
    return NextResponse.json({ ok: true, route: rows[0] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate")) {
      return NextResponse.json({ error: "Route id already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
