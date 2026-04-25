/**
 * GET /api/admin/revenue
 *   ?days=30                      — sliding-window length (default 30)
 *
 * Returns:
 *   - daily series (revenue + bookings per day) for the last N days
 *   - per-route aggregates over the same window
 *   - per-bus aggregates over the same window
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
  const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "30", 10), 1), 365);

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [daily, byRoute, byBus, totals] = await Promise.all([
    db`
      SELECT to_char(date_trunc('day', booked_at), 'YYYY-MM-DD') AS day,
             COUNT(*)::integer AS bookings,
             COALESCE(SUM(total_amount), 0)::bigint AS revenue
      FROM bookings
      WHERE booked_at >= ${since}::date
        AND status IN ('pending', 'confirmed', 'completed')
      GROUP BY day
      ORDER BY day ASC
    `,
    db`
      SELECT s.route_id,
             o.name AS origin, d.name AS destination,
             COUNT(*)::integer AS bookings,
             COALESCE(SUM(b.total_amount), 0)::bigint AS revenue,
             AVG(b.total_amount)::bigint AS avg_revenue
      FROM bookings b
      JOIN schedules s ON s.id = b.schedule_id
      JOIN routes r    ON r.id = s.route_id
      JOIN cities o    ON o.id = r.origin_city_id
      JOIN cities d    ON d.id = r.destination_city_id
      WHERE b.booked_at >= ${since}::date
        AND b.status IN ('pending', 'confirmed', 'completed')
      GROUP BY s.route_id, o.name, d.name
      ORDER BY revenue DESC
      LIMIT 15
    `,
    db`
      SELECT bus.id, bus.name, bus.registration_number,
             COUNT(*)::integer AS bookings,
             COALESCE(SUM(b.total_amount), 0)::bigint AS revenue,
             SUM(
               (SELECT COUNT(*) FROM booking_passengers bp WHERE bp.booking_id = b.id)
             )::integer AS seats_sold
      FROM bookings b
      JOIN schedules s ON s.id = b.schedule_id
      JOIN buses bus   ON bus.id = s.bus_id
      WHERE b.booked_at >= ${since}::date
        AND b.status IN ('pending', 'confirmed', 'completed')
      GROUP BY bus.id, bus.name, bus.registration_number
      ORDER BY revenue DESC
      LIMIT 15
    `,
    db`
      SELECT COUNT(*)::integer AS bookings,
             COALESCE(SUM(total_amount), 0)::bigint AS revenue,
             COUNT(DISTINCT contact_email)::integer AS unique_customers
      FROM bookings
      WHERE booked_at >= ${since}::date
        AND status IN ('pending', 'confirmed', 'completed')
    `,
  ]);

  return NextResponse.json({
    days,
    since,
    totals: (totals as unknown as Array<{ bookings: number; revenue: number; unique_customers: number }>)[0],
    daily,
    by_route: byRoute,
    by_bus: byBus,
  });
}
