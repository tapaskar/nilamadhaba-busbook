/**
 * Unified data access layer.
 *
 * If DATABASE_URL is set → uses Neon Postgres (live).
 * Otherwise → falls back to in-memory mock data (demo mode).
 *
 * Keep this file the single entry point for reads/writes so UI + API
 * routes don't care which mode is active.
 */

import { sql, hasDatabase } from "./db";
import type {
  City,
  Route,
  Bus,
  Booking,
  BookingPassenger,
  ScheduleWithDetails,
} from "./types";
import * as mock from "./mock-data";

export function isLiveMode(): boolean {
  return hasDatabase();
}

// ─── Cities ────────────────────────────────────────────────────────────────

export async function getAllCities(): Promise<City[]> {
  const db = sql();
  if (!db) return mock.cities;
  try {
    const rows = await db`
      SELECT * FROM cities WHERE is_active = true ORDER BY name
    ` as unknown as City[];
    return rows;
  } catch (e) {
    console.error("[data] getAllCities failed:", e);
    return mock.cities;
  }
}

// ─── Routes ────────────────────────────────────────────────────────────────

export async function getActiveRoutes(): Promise<Route[]> {
  const db = sql();
  if (!db) return mock.routes;
  try {
    return (await db`
      SELECT * FROM routes WHERE is_active = true
    `) as unknown as Route[];
  } catch {
    return mock.routes;
  }
}

// ─── Schedules with full details (route + cities + bus) ────────────────────

type ScheduleJoinRow = {
  // schedule fields
  id: string;
  route_id: string;
  bus_id: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  sleeper_price: number | null;
  days_of_week: number[];
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  // joined
  route_origin_city_id: string;
  route_destination_city_id: string;
  route_distance_km: number | null;
  route_estimated_duration_minutes: number | null;
  route_is_active: boolean;
  origin_id: string;
  origin_name: string;
  origin_state: string;
  origin_is_active: boolean;
  origin_created_at: string;
  dest_id: string;
  dest_name: string;
  dest_state: string;
  dest_is_active: boolean;
  dest_created_at: string;
  bus_name: string;
  bus_registration_number: string;
  bus_type: "seater" | "sleeper" | "semi_sleeper";
  bus_total_seats: number;
  bus_seat_layout: Bus["seat_layout"];
  bus_amenities: string[];
  bus_photos: string[];
  bus_is_active: boolean;
};

function hydrateSchedule(r: ScheduleJoinRow): ScheduleWithDetails {
  return {
    id: r.id,
    route_id: r.route_id,
    bus_id: r.bus_id,
    departure_time: r.departure_time,
    arrival_time: r.arrival_time,
    base_price: r.base_price,
    sleeper_price: r.sleeper_price,
    days_of_week: r.days_of_week,
    is_active: r.is_active,
    valid_from: r.valid_from,
    valid_until: r.valid_until,
    route: {
      id: r.route_id,
      origin_city_id: r.route_origin_city_id,
      destination_city_id: r.route_destination_city_id,
      distance_km: r.route_distance_km,
      estimated_duration_minutes: r.route_estimated_duration_minutes,
      is_active: r.route_is_active,
      origin_city: {
        id: r.origin_id,
        name: r.origin_name,
        state: r.origin_state,
        is_active: r.origin_is_active,
        created_at: r.origin_created_at,
      },
      destination_city: {
        id: r.dest_id,
        name: r.dest_name,
        state: r.dest_state,
        is_active: r.dest_is_active,
        created_at: r.dest_created_at,
      },
    },
    bus: {
      id: r.bus_id,
      name: r.bus_name,
      registration_number: r.bus_registration_number,
      bus_type: r.bus_type,
      total_seats: r.bus_total_seats,
      seat_layout: r.bus_seat_layout,
      amenities: r.bus_amenities,
      photos: r.bus_photos,
      is_active: r.bus_is_active,
    },
  };
}

/**
 * Returns the IST date and "HH:MM:SS" time for the given moment.
 * Used to filter out schedules whose departure has already passed
 * when the user is searching for *today* in India.
 */
function nowInIST(): { date: string; time: string } {
  // Asia/Kolkata is UTC+5:30, no DST.
  const d = new Date();
  const ist = new Date(d.getTime() + (5 * 60 + 30) * 60 * 1000);
  const yyyy = ist.getUTCFullYear();
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(ist.getUTCDate()).padStart(2, "0");
  const hh = String(ist.getUTCHours()).padStart(2, "0");
  const mi = String(ist.getUTCMinutes()).padStart(2, "0");
  const ss = String(ist.getUTCSeconds()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}:${ss}` };
}

export async function getSchedulesForRoute(
  fromCityId: string,
  toCityId: string,
  dayOfWeek: number,
  /** YYYY-MM-DD travel date — used to skip already-departed buses on today */
  travelDate?: string,
): Promise<ScheduleWithDetails[]> {
  const db = sql();
  const ist = nowInIST();
  const isToday = travelDate === ist.date;

  if (!db) {
    const routes = mock.routes.filter(
      (r) =>
        r.origin_city_id === fromCityId &&
        r.destination_city_id === toCityId &&
        r.is_active,
    );
    const out: ScheduleWithDetails[] = [];
    for (const route of routes) {
      const origin = mock.getCityById(route.origin_city_id)!;
      const dest = mock.getCityById(route.destination_city_id)!;
      const scheds = mock.schedules.filter(
        (s) =>
          s.route_id === route.id &&
          s.is_active &&
          s.days_of_week.includes(dayOfWeek) &&
          (!isToday || s.departure_time > ist.time),
      );
      for (const sch of scheds) {
        const bus = mock.getBusById(sch.bus_id);
        if (!bus) continue;
        out.push({
          ...sch,
          route: { ...route, origin_city: origin, destination_city: dest },
          bus,
        });
      }
    }
    return out;
  }

  try {
    const rows = (await db`
      SELECT
        s.id, s.route_id, s.bus_id, s.departure_time, s.arrival_time,
        s.base_price, s.sleeper_price, s.days_of_week, s.is_active,
        s.valid_from, s.valid_until,
        r.origin_city_id       AS route_origin_city_id,
        r.destination_city_id  AS route_destination_city_id,
        r.distance_km          AS route_distance_km,
        r.estimated_duration_minutes AS route_estimated_duration_minutes,
        r.is_active            AS route_is_active,
        o.id AS origin_id, o.name AS origin_name, o.state AS origin_state,
        o.is_active AS origin_is_active, o.created_at AS origin_created_at,
        d.id AS dest_id, d.name AS dest_name, d.state AS dest_state,
        d.is_active AS dest_is_active, d.created_at AS dest_created_at,
        b.name AS bus_name, b.registration_number AS bus_registration_number,
        b.bus_type, b.total_seats AS bus_total_seats,
        b.seat_layout AS bus_seat_layout,
        b.amenities AS bus_amenities, b.photos AS bus_photos,
        b.is_active AS bus_is_active
      FROM schedules s
      JOIN routes r ON r.id = s.route_id
      JOIN cities o ON o.id = r.origin_city_id
      JOIN cities d ON d.id = r.destination_city_id
      JOIN buses  b ON b.id = s.bus_id
      WHERE s.is_active = true
        AND r.origin_city_id = ${fromCityId}
        AND r.destination_city_id = ${toCityId}
        AND ${dayOfWeek} = ANY(s.days_of_week)
        AND (NOT ${isToday}::boolean OR s.departure_time > ${ist.time}::time)
      ORDER BY s.departure_time
    `) as unknown as ScheduleJoinRow[];

    return rows.map(hydrateSchedule);
  } catch (e) {
    console.error("[data] getSchedulesForRoute failed:", e);
    return [];
  }
}

// ─── Single schedule by id (for booking page) ──────────────────────────────

export async function getScheduleById(
  scheduleId: string,
): Promise<ScheduleWithDetails | null> {
  const db = sql();

  if (!db) {
    const sch = mock.schedules.find((s) => s.id === scheduleId);
    if (!sch) return null;
    const route = mock.getRouteById(sch.route_id);
    if (!route) return null;
    const bus = mock.getBusById(sch.bus_id);
    if (!bus) return null;
    const origin = mock.getCityById(route.origin_city_id)!;
    const dest = mock.getCityById(route.destination_city_id)!;
    return {
      ...sch,
      route: { ...route, origin_city: origin, destination_city: dest },
      bus,
    };
  }

  try {
    const rows = (await db`
      SELECT
        s.id, s.route_id, s.bus_id, s.departure_time, s.arrival_time,
        s.base_price, s.sleeper_price, s.days_of_week, s.is_active,
        s.valid_from, s.valid_until,
        r.origin_city_id       AS route_origin_city_id,
        r.destination_city_id  AS route_destination_city_id,
        r.distance_km          AS route_distance_km,
        r.estimated_duration_minutes AS route_estimated_duration_minutes,
        r.is_active            AS route_is_active,
        o.id AS origin_id, o.name AS origin_name, o.state AS origin_state,
        o.is_active AS origin_is_active, o.created_at AS origin_created_at,
        d.id AS dest_id, d.name AS dest_name, d.state AS dest_state,
        d.is_active AS dest_is_active, d.created_at AS dest_created_at,
        b.name AS bus_name, b.registration_number AS bus_registration_number,
        b.bus_type, b.total_seats AS bus_total_seats,
        b.seat_layout AS bus_seat_layout,
        b.amenities AS bus_amenities, b.photos AS bus_photos,
        b.is_active AS bus_is_active
      FROM schedules s
      JOIN routes r ON r.id = s.route_id
      JOIN cities o ON o.id = r.origin_city_id
      JOIN cities d ON d.id = r.destination_city_id
      JOIN buses  b ON b.id = s.bus_id
      WHERE s.id = ${scheduleId}
      LIMIT 1
    `) as unknown as ScheduleJoinRow[];
    if (rows.length === 0) return null;
    return hydrateSchedule(rows[0]);
  } catch (e) {
    console.error("[data] getScheduleById failed:", e);
    return null;
  }
}

// ─── Seat availability ─────────────────────────────────────────────────────

export async function getBookedSeats(
  scheduleId: string,
  travelDate: string,
): Promise<string[]> {
  const db = sql();
  if (!db) {
    // Deterministic pseudo-random booked seats for demo mode
    const sch = mock.schedules.find((s) => s.id === scheduleId);
    if (!sch) return [];
    const bus = mock.getBusById(sch.bus_id);
    if (!bus) return [];
    const allSeatIds = bus.seat_layout.decks.flatMap((d) =>
      d.seats.map((s) => s.id),
    );
    const seed = `${scheduleId}-${travelDate}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    const rng = () => {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      return (hash % 10000) / 10000;
    };
    const occupancyRate = 0.3 + rng() * 0.5;
    const n = Math.floor(allSeatIds.length * occupancyRate);
    return [...allSeatIds].sort(() => rng() - 0.5).slice(0, n);
  }

  try {
    const rows = (await db`
      SELECT get_booked_seats(${scheduleId}, ${travelDate}::date) AS seats
    `) as unknown as { seats: string[] }[];
    return rows[0]?.seats ?? [];
  } catch (e) {
    console.error("[data] getBookedSeats failed:", e);
    return [];
  }
}

export async function getLockedSeats(
  scheduleId: string,
  travelDate: string,
  userId: string,
): Promise<string[]> {
  const db = sql();
  if (!db) return [];
  try {
    const rows = (await db`
      SELECT get_locked_seats(${scheduleId}, ${travelDate}::date, ${userId}) AS seats
    `) as unknown as { seats: string[] }[];
    return rows[0]?.seats ?? [];
  } catch (e) {
    console.error("[data] getLockedSeats failed:", e);
    return [];
  }
}

// ─── Seat lock ─────────────────────────────────────────────────────────────

export async function lockSeat(
  scheduleId: string,
  travelDate: string,
  seatNumber: string,
  userId: string,
): Promise<boolean> {
  const db = sql();
  if (!db) return true; // demo mode
  try {
    const rows = (await db`
      SELECT lock_seat(${scheduleId}, ${travelDate}::date, ${seatNumber}, ${userId}) AS locked
    `) as unknown as { locked: boolean }[];
    return rows[0]?.locked === true;
  } catch (e) {
    console.error("[data] lockSeat failed:", e);
    return false;
  }
}

// ─── Booking creation ──────────────────────────────────────────────────────

export type CreateBookingInput = {
  userId: string;
  scheduleId: string;
  travelDate: string;
  totalAmount: number;
  paymentId: string;
  contactEmail: string;
  contactPhone: string;
  passengers: {
    seat_number: string;
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    is_primary: boolean;
  }[];
};

export async function createBooking(
  input: CreateBookingInput,
): Promise<{ id: string } | { error: string }> {
  const db = sql();
  if (!db) {
    const id = `RDX${1000 + Math.floor(Math.random() * 9000)}`;
    return { id };
  }

  try {
    const rows = (await db`
      SELECT create_booking(
        ${input.userId},
        ${input.scheduleId},
        ${input.travelDate}::date,
        ${input.totalAmount}::integer,
        ${input.paymentId},
        ${input.contactEmail},
        ${input.contactPhone},
        ${JSON.stringify(input.passengers)}::jsonb
      ) AS id
    `) as unknown as { id: string }[];
    const id = rows[0]?.id;
    if (!id) return { error: "Booking creation returned no id" };
    return { id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[data] createBooking failed:", msg);
    if (msg.includes("SEAT_ALREADY_BOOKED")) {
      return { error: "One or more selected seats are no longer available." };
    }
    return { error: msg };
  }
}

// ─── Fetch a single booking (with passengers + schedule) ───────────────────

export async function getBookingById(
  bookingId: string,
  userId?: string,
): Promise<{
  booking: Booking;
  passengers: BookingPassenger[];
  schedule: ScheduleWithDetails;
} | null> {
  const db = sql();
  if (!db) return null;

  try {
    const bookingRows = userId
      ? ((await db`
          SELECT * FROM bookings WHERE id = ${bookingId} AND user_id = ${userId} LIMIT 1
        `) as unknown as Booking[])
      : ((await db`
          SELECT * FROM bookings WHERE id = ${bookingId} LIMIT 1
        `) as unknown as Booking[]);
    if (bookingRows.length === 0) return null;
    const booking = bookingRows[0];

    const [passengers, schedule] = await Promise.all([
      db`
        SELECT * FROM booking_passengers WHERE booking_id = ${bookingId}
      ` as unknown as Promise<BookingPassenger[]>,
      getScheduleById(booking.schedule_id),
    ]);

    if (!schedule) return null;
    return { booking, passengers, schedule };
  } catch (e) {
    console.error("[data] getBookingById failed:", e);
    return null;
  }
}

// ─── User's bookings list ──────────────────────────────────────────────────

export async function getBookingsForUser(userId: string): Promise<Booking[]> {
  const db = sql();
  if (!db) return [];
  try {
    return (await db`
      SELECT * FROM bookings
      WHERE user_id = ${userId}
      ORDER BY booked_at DESC
    `) as unknown as Booking[];
  } catch {
    return [];
  }
}

// ─── Cancel a booking + compute refund ─────────────────────────────────────

/**
 * Read refund-tier policy from app_settings (with sane fallbacks).
 * Returns the % of total to refund based on hours-to-departure.
 */
async function computeRefundPct(
  departureIso: string,
  db: ReturnType<typeof sql>,
): Promise<number> {
  const dep = new Date(departureIso).getTime();
  const now = Date.now();
  const hrs = (dep - now) / (1000 * 60 * 60);

  let p12 = 100, p6 = 75, p2 = 50;
  if (db) {
    try {
      const rows = (await db`
        SELECT key, value FROM app_settings
        WHERE key IN ('refund_12h_pct', 'refund_6h_pct', 'refund_2h_pct')
      `) as unknown as { key: string; value: string }[];
      for (const r of rows) {
        const n = Number(r.value);
        if (!Number.isFinite(n)) continue;
        if (r.key === "refund_12h_pct") p12 = n;
        else if (r.key === "refund_6h_pct") p6 = n;
        else if (r.key === "refund_2h_pct") p2 = n;
      }
    } catch {
      /* fall back to defaults */
    }
  }

  if (hrs >= 12) return p12;
  if (hrs >= 6)  return p6;
  if (hrs >= 2)  return p2;
  return 0;
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  reason?: string,
): Promise<
  { ok: true; refund_amount: number; refund_pct: number } | { error: string }
> {
  const db = sql();
  if (!db) {
    return { ok: true, refund_amount: 0, refund_pct: 100 };
  }

  try {
    const rows = (await db`
      SELECT b.id, b.total_amount, b.travel_date, b.payment_status,
             s.departure_time
      FROM bookings b
      JOIN schedules s ON s.id = b.schedule_id
      WHERE b.id = ${bookingId} AND b.user_id = ${userId}
      LIMIT 1
    `) as unknown as {
      id: string;
      total_amount: number;
      travel_date: string;
      payment_status: string;
      departure_time: string;
    }[];

    if (rows.length === 0) return { error: "Booking not found" };
    const b = rows[0];

    const departureIso = `${b.travel_date}T${b.departure_time}+05:30`;
    const pct = await computeRefundPct(departureIso, db);
    const refund = Math.round((b.total_amount * pct) / 100);
    const newPaymentStatus =
      refund === 0
        ? b.payment_status
        : pct === 100
          ? "refunded"
          : "partially_refunded";

    await db`
      UPDATE bookings
      SET status = 'cancelled',
          cancelled_at = now(),
          cancellation_reason = ${reason ?? null},
          refund_amount = ${refund},
          payment_status = ${newPaymentStatus}
      WHERE id = ${bookingId} AND user_id = ${userId}
    `;

    return { ok: true, refund_amount: refund, refund_pct: pct };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[data] cancelBooking failed:", msg);
    return { error: msg };
  }
}

// ─── Admin aggregates ──────────────────────────────────────────────────────

export async function getAdminStats(): Promise<{
  today: { bookings: number; revenue_paise: number };
  this_month: { bookings: number; revenue_paise: number };
  recent_bookings: Booking[];
} | null> {
  const db = sql();
  if (!db) return null;

  try {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const [todayRows, monthRows, recent] = await Promise.all([
      db`SELECT COUNT(*) AS n, COALESCE(SUM(total_amount), 0) AS rev
         FROM bookings WHERE booked_at >= ${`${todayIso}T00:00:00Z`}::timestamptz`,
      db`SELECT COUNT(*) AS n, COALESCE(SUM(total_amount), 0) AS rev
         FROM bookings WHERE booked_at >= ${`${monthStart}T00:00:00Z`}::timestamptz`,
      db`SELECT * FROM bookings ORDER BY booked_at DESC LIMIT 10`,
    ]);

    const t = (todayRows as unknown as { n: number; rev: number }[])[0];
    const m = (monthRows as unknown as { n: number; rev: number }[])[0];

    return {
      today: { bookings: Number(t.n), revenue_paise: Number(t.rev) },
      this_month: { bookings: Number(m.n), revenue_paise: Number(m.rev) },
      recent_bookings: recent as unknown as Booking[],
    };
  } catch (e) {
    console.error("[data] getAdminStats failed:", e);
    return null;
  }
}

// ─── Health probe ──────────────────────────────────────────────────────────

export async function getHealth(): Promise<{
  mode: "demo" | "live";
  ok: boolean;
  counts?: Record<string, number>;
  error?: string;
}> {
  const db = sql();
  if (!db) {
    return { mode: "demo", ok: true };
  }
  try {
    const rows = (await db`
      SELECT
        (SELECT COUNT(*) FROM cities)    AS cities,
        (SELECT COUNT(*) FROM routes)    AS routes,
        (SELECT COUNT(*) FROM buses)     AS buses,
        (SELECT COUNT(*) FROM schedules) AS schedules,
        (SELECT COUNT(*) FROM bookings)  AS bookings
    `) as unknown as Record<string, number>[];
    const c = rows[0];
    return {
      mode: "live",
      ok: true,
      counts: {
        cities: Number(c.cities),
        routes: Number(c.routes),
        buses: Number(c.buses),
        schedules: Number(c.schedules),
        bookings: Number(c.bookings),
      },
    };
  } catch (e) {
    return { mode: "live", ok: false, error: String(e) };
  }
}
