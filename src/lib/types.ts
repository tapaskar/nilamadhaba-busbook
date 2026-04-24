// ── Domain types (rows + joined shapes) ──
//
// These mirror the Neon Postgres schema in db/migrations/001_init.sql.
// No ORM is used; rows are plain objects returned by @neondatabase/serverless.

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  state: string;
  is_active: boolean;
  created_at: string;
}

export interface Route {
  id: string;
  origin_city_id: string;
  destination_city_id: string;
  distance_km: number | null;
  estimated_duration_minutes: number | null;
  is_active: boolean;
}

export interface Bus {
  id: string;
  name: string;
  registration_number: string;
  bus_type: "seater" | "sleeper" | "semi_sleeper";
  total_seats: number;
  seat_layout: SeatLayout;
  amenities: string[];
  photos: string[];
  is_active: boolean;
}

export interface Schedule {
  id: string;
  route_id: string;
  bus_id: string;
  departure_time: string; // TIME
  arrival_time: string; // TIME
  base_price: number; // paise
  sleeper_price: number | null;
  days_of_week: number[]; // 0=Sun, 1=Mon...6=Sat
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
}

export interface ScheduleInstance {
  id: string;
  schedule_id: string;
  travel_date: string;
  status: "active" | "cancelled";
  price_override: number | null;
}

export interface Booking {
  id: string;
  user_id: string;
  schedule_id: string;
  travel_date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_amount: number;
  refund_amount: number | null;
  payment_id: string | null;
  payment_status: "pending" | "paid" | "refunded" | "partially_refunded";
  contact_email: string;
  contact_phone: string;
  booked_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
}

export interface BookingPassenger {
  id: string;
  booking_id: string;
  seat_number: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  is_primary: boolean;
}

export interface SeatLock {
  id: string;
  schedule_id: string;
  travel_date: string;
  seat_number: string;
  user_id: string;
  locked_at: string;
  expires_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  user_id: string;
  schedule_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// ── Seat Layout ──

export interface SeatLayout {
  version: 1;
  decks: Deck[];
}

export interface Deck {
  name: string;
  rows: number;
  cols: number;
  seats: Seat[];
}

export interface Seat {
  id: string;
  label: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  type: "seater" | "sleeper" | "semi_sleeper";
  price_tier: "base" | "sleeper";
  ladies_only: boolean;
}

// ── Input types ──

export interface PassengerInput {
  seat_number: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  is_primary: boolean;
}

// ── Joined / computed types ──

export interface ScheduleWithDetails extends Schedule {
  route: Route & {
    origin_city: City;
    destination_city: City;
  };
  bus: Bus;
  avg_rating?: number;
  review_count?: number;
  booked_seat_count?: number;
}

export type SeatStatus =
  | "available"
  | "selected"
  | "booked"
  | "locked"
  | "ladies_only";
