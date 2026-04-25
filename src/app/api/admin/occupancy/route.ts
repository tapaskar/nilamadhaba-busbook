/**
 * GET /api/admin/occupancy?scheduleId=X&date=YYYY-MM-DD
 *
 * Returns the per-seat booking detail for a given trip on a given date,
 * plus headline stats (booked / available / revenue).
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SeatRow = {
  seat_number: string;
  passenger_name: string;
  age: number;
  gender: string;
  total_amount: number;
  booking_id: string;
  contact_phone: string;
};

export async function GET(req: Request) {
  const g = await requireAdmin();
  if ("error" in g) return g.error;

  const url = new URL(req.url);
  const scheduleId = url.searchParams.get("scheduleId");
  const date = url.searchParams.get("date");
  if (!scheduleId || !date) {
    return NextResponse.json({ error: "scheduleId and date required" }, { status: 400 });
  }

  const db = sql();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  // Schedule + bus snapshot (so we know layout + total seats)
  const scheduleRows = (await db`
    SELECT s.id, s.departure_time, s.arrival_time, s.base_price, s.sleeper_price,
           b.id AS bus_id, b.name AS bus_name, b.registration_number,
           b.bus_type, b.total_seats, b.seat_layout,
           o.name AS origin_name, d.name AS destination_name
    FROM schedules s
    JOIN routes r ON r.id = s.route_id
    JOIN cities o ON o.id = r.origin_city_id
    JOIN cities d ON d.id = r.destination_city_id
    JOIN buses  b ON b.id = s.bus_id
    WHERE s.id = ${scheduleId}
    LIMIT 1
  `) as unknown as Array<{
    id: string;
    departure_time: string;
    arrival_time: string;
    base_price: number;
    sleeper_price: number | null;
    bus_id: string;
    bus_name: string;
    registration_number: string;
    bus_type: string;
    total_seats: number;
    seat_layout: unknown;
    origin_name: string;
    destination_name: string;
  }>;

  if (scheduleRows.length === 0) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }
  const schedule = scheduleRows[0];

  // Per-passenger detail for booked seats
  const seats = (await db`
    SELECT bp.seat_number, bp.name AS passenger_name, bp.age, bp.gender,
           b.total_amount, b.id AS booking_id, b.contact_phone, b.contact_email
    FROM booking_passengers bp
    JOIN bookings b ON b.id = bp.booking_id
    WHERE b.schedule_id = ${scheduleId}
      AND b.travel_date = ${date}
      AND b.status IN ('pending', 'confirmed', 'completed')
    ORDER BY bp.seat_number
  `) as unknown as SeatRow[];

  const bookedSeatNumbers = seats.map((s) => s.seat_number);
  const totalRevenue = seats.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const occupancy = schedule.total_seats > 0
    ? Math.round((bookedSeatNumbers.length / schedule.total_seats) * 100)
    : 0;

  return NextResponse.json({
    schedule,
    seats,
    booked_count: bookedSeatNumbers.length,
    available_count: schedule.total_seats - bookedSeatNumbers.length,
    occupancy_pct: occupancy,
    revenue_paise: totalRevenue,
  });
}
