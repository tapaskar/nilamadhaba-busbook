/**
 * Unified data access layer.
 *
 * If SUPABASE env vars are set, uses Supabase (real backend).
 * If not, falls back to mock-data (demo mode).
 *
 * Server-side only — uses service-role client so it can bypass RLS
 * for read-heavy search queries and seat availability lookups.
 */

import { createClient } from "@supabase/supabase-js";
import type {
  City,
  Route,
  Bus,
  Schedule,
  ScheduleWithDetails,
} from "./types";
import * as mock from "./mock-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Returns true when a real Supabase connection is configured.
export function isLiveMode(): boolean {
  return !!(SUPABASE_URL && SERVICE_KEY);
}

// Lazily-constructed admin client (null in demo mode).
// Typed loosely — we use the Database types at the call-site via casts
// when needed. This avoids friction with Supabase's recursive TS inference.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sb: any = null;
function sb() {
  if (!isLiveMode()) return null;
  if (!_sb) {
    _sb = createClient(SUPABASE_URL!, SERVICE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return _sb;
}

// ─── Cities ────────────────────────────────────────────────────────────────

export async function getAllCities(): Promise<City[]> {
  const client = sb();
  if (!client) return mock.cities;
  const { data, error } = await client
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) {
    console.error("[data] getAllCities failed, falling back to mock:", error.message);
    return mock.cities;
  }
  return (data ?? []) as City[];
}

// ─── Routes ────────────────────────────────────────────────────────────────

export async function getActiveRoutes(): Promise<Route[]> {
  const client = sb();
  if (!client) return mock.routes;
  const { data, error } = await client
    .from("routes")
    .select("*")
    .eq("is_active", true);
  if (error) return mock.routes;
  return (data ?? []) as Route[];
}

// ─── Schedules with full details (route + cities + bus) ────────────────────

export async function getSchedulesForRoute(
  fromCityId: string,
  toCityId: string,
  dayOfWeek: number,
): Promise<ScheduleWithDetails[]> {
  const client = sb();

  if (!client) {
    // Rebuild from mocks
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
          s.days_of_week.includes(dayOfWeek),
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

  // Live: single query with joined relations
  const { data, error } = await client
    .from("schedules")
    .select(`
      *,
      route:routes!inner (
        *,
        origin_city:cities!routes_origin_city_id_fkey (*),
        destination_city:cities!routes_destination_city_id_fkey (*)
      ),
      bus:buses!inner (*)
    `)
    .eq("is_active", true)
    .eq("route.origin_city_id", fromCityId)
    .eq("route.destination_city_id", toCityId)
    .contains("days_of_week", [dayOfWeek]);

  if (error) {
    console.error("[data] getSchedulesForRoute failed:", error.message);
    return [];
  }

  return (data ?? []) as unknown as ScheduleWithDetails[];
}

// ─── Single schedule by id (for booking page) ──────────────────────────────

export async function getScheduleById(
  scheduleId: string,
): Promise<ScheduleWithDetails | null> {
  const client = sb();

  if (!client) {
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

  const { data, error } = await client
    .from("schedules")
    .select(`
      *,
      route:routes!inner (
        *,
        origin_city:cities!routes_origin_city_id_fkey (*),
        destination_city:cities!routes_destination_city_id_fkey (*)
      ),
      bus:buses!inner (*)
    `)
    .eq("id", scheduleId)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as ScheduleWithDetails;
}

// ─── Seat availability ─────────────────────────────────────────────────────

export async function getBookedSeats(
  scheduleId: string,
  travelDate: string,
): Promise<string[]> {
  const client = sb();
  if (!client) {
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

  const { data, error } = await client.rpc("get_booked_seats", {
    p_schedule_id: scheduleId,
    p_travel_date: travelDate,
  });

  if (error) {
    console.error("[data] get_booked_seats RPC failed:", error.message);
    return [];
  }
  return (data ?? []) as string[];
}

export async function getLockedSeats(
  scheduleId: string,
  travelDate: string,
  userId: string,
): Promise<string[]> {
  const client = sb();
  if (!client) return [];
  const { data, error } = await client.rpc("get_locked_seats", {
    p_schedule_id: scheduleId,
    p_travel_date: travelDate,
    p_user_id: userId,
  });
  if (error) return [];
  return (data ?? []) as string[];
}

// ─── Seat lock ─────────────────────────────────────────────────────────────

export async function lockSeat(
  scheduleId: string,
  travelDate: string,
  seatNumber: string,
  userId: string,
): Promise<boolean> {
  const client = sb();
  if (!client) return true; // demo mode: always succeeds
  const { data, error } = await client.rpc("lock_seat", {
    p_schedule_id: scheduleId,
    p_travel_date: travelDate,
    p_seat_number: seatNumber,
    p_user_id: userId,
  });
  if (error) {
    console.error("[data] lock_seat failed:", error.message);
    return false;
  }
  return data === true;
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
  const client = sb();
  if (!client) {
    // Demo mode: synthesize a booking id
    const id = `RDX${1000 + Math.floor(Math.random() * 9000)}`;
    return { id };
  }

  const { data, error } = await client.rpc("create_booking", {
    p_user_id: input.userId,
    p_schedule_id: input.scheduleId,
    p_travel_date: input.travelDate,
    p_total_amount: input.totalAmount,
    p_payment_id: input.paymentId,
    p_contact_email: input.contactEmail,
    p_contact_phone: input.contactPhone,
    p_passengers: input.passengers,
  });

  if (error) {
    console.error("[data] create_booking failed:", error.message);
    if (error.message?.includes("SEAT_ALREADY_BOOKED")) {
      return { error: "One or more selected seats are no longer available." };
    }
    return { error: error.message };
  }

  return { id: data as string };
}

// ─── Fetch a single booking by id (with passengers + schedule) ─────────────

export async function getBookingById(
  bookingId: string,
  userId?: string,
): Promise<{
  booking: import("./types").Booking;
  passengers: import("./types").BookingPassenger[];
  schedule: ScheduleWithDetails;
} | null> {
  const client = sb();
  if (!client) return null;

  let query = client.from("bookings").select("*").eq("id", bookingId);
  if (userId) query = query.eq("user_id", userId);
  const { data: booking, error } = await query.maybeSingle();
  if (error || !booking) return null;

  const [{ data: passengers }, schedule] = await Promise.all([
    client
      .from("booking_passengers")
      .select("*")
      .eq("booking_id", bookingId),
    getScheduleById(booking.schedule_id),
  ]);

  if (!schedule) return null;
  return {
    booking: booking as import("./types").Booking,
    passengers: (passengers ?? []) as import("./types").BookingPassenger[],
    schedule,
  };
}

// ─── User's bookings list ──────────────────────────────────────────────────

export async function getBookingsForUser(
  userId: string,
): Promise<import("./types").Booking[]> {
  const client = sb();
  if (!client) return [];
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("booked_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as import("./types").Booking[];
}
