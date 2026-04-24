/**
 * GET /api/trips?from=city-blr&to=city-chn&date=2026-05-01
 *
 * Returns schedules running from→to on the given date, enriched with
 * route, bus, origin/destination city, and a snapshot of booked seats.
 *
 * Works in both live (Supabase) and demo (mock-data) mode.
 */

import { NextResponse } from "next/server";
import { getSchedulesForRoute, getBookedSeats, isLiveMode } from "@/lib/data";
import * as mock from "@/lib/mock-data";
import type { ScheduleWithDetails } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function seededRng(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return (h % 10000) / 10000;
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  if (!from || !to || !date) {
    return NextResponse.json(
      { error: "Missing required params: from, to, date" },
      { status: 400 },
    );
  }

  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const schedules = await getSchedulesForRoute(from, to, dayOfWeek);

  const enriched = await Promise.all(
    schedules.map(async (sch: ScheduleWithDetails) => {
      const bookedSeats = await getBookedSeats(sch.id, date);
      const totalSeats = sch.bus.total_seats;
      const availableSeats = totalSeats - bookedSeats.length;
      const rng = seededRng(`${sch.id}-${date}`);

      // Dynamic pricing based on current occupancy
      const fillRatio = bookedSeats.length / totalSeats;
      let mult = 1;
      if (fillRatio > 0.7) mult = 1.3;
      else if (fillRatio > 0.5) mult = 1.15;
      else if (fillRatio > 0.3) mult = 1.05;
      if ([0, 5, 6].includes(dayOfWeek)) mult *= 1.1;

      return {
        schedule: sch,
        travel_date: date,
        available_seats: availableSeats,
        booked_seats: bookedSeats,
        effective_price: Math.round(sch.base_price * mult),
        effective_sleeper_price: sch.sleeper_price
          ? Math.round(sch.sleeper_price * mult)
          : null,
        avg_rating: Math.round((3.5 + rng() * 1.5) * 10) / 10,
        review_count: Math.floor(50 + rng() * 450),
        boarding_points: mock.getBoardingPointsForCity(from),
        dropping_points: mock.getDroppingPointsForCity(to),
      };
    }),
  );

  enriched.sort((a, b) =>
    a.schedule.departure_time.localeCompare(b.schedule.departure_time),
  );

  return NextResponse.json({
    trips: enriched,
    mode: isLiveMode() ? "live" : "demo",
  });
}
