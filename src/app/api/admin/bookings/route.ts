/**
 * GET /api/admin/bookings
 * Returns the most recent bookings for the admin dashboard list view.
 * Requires an active admin session.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, getAdminFromToken } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const store = await cookies();
  const me = await getAdminFromToken(store.get(SESSION_COOKIE)?.value);
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "100"), 500);

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  const rows = await db`
    SELECT b.id, b.user_id, b.schedule_id, b.travel_date, b.status,
           b.total_amount, b.payment_status, b.contact_email, b.contact_phone,
           b.booked_at,
           o.name AS origin_city, d.name AS destination_city,
           bus.name AS bus_name, s.departure_time
    FROM bookings b
    JOIN schedules s ON s.id = b.schedule_id
    JOIN routes r    ON r.id = s.route_id
    JOIN cities o    ON o.id = r.origin_city_id
    JOIN cities d    ON d.id = r.destination_city_id
    JOIN buses bus   ON bus.id = s.bus_id
    ORDER BY b.booked_at DESC
    LIMIT ${limit}
  `;

  return NextResponse.json({ bookings: rows });
}
