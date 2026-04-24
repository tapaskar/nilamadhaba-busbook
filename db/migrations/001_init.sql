-- ============================================================
-- NilaMadhaba Bus Booking Platform — Initial Schema (Neon)
-- ============================================================
-- Plain Postgres — no Supabase-specific auth/RLS features.
-- Paste into Neon SQL Editor → Run. Or:
--   psql "$DATABASE_URL" -f db/migrations/001_init.sql
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PROFILES
--    Optional user table. The app works fine without auth
--    (falls back to 'guest-user'). If you wire up Clerk / Auth.js,
--    insert rows here on first sign-in.
-- ============================================================
create table if not exists public.profiles (
  id          text primary key,                 -- external auth provider user id
  full_name   text,
  phone       text,
  email       text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- Lazy-insert a guest-user row so bookings can FK-reference it
-- even without authentication wired up.
insert into public.profiles (id, full_name, role)
  values ('guest-user', 'Guest', 'user')
  on conflict (id) do nothing;

-- ============================================================
-- 2. CITIES
-- ============================================================
create table if not exists public.cities (
  id          text primary key,
  name        text not null,
  state       text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_cities_active on public.cities(is_active) where is_active = true;

-- ============================================================
-- 3. ROUTES
-- ============================================================
create table if not exists public.routes (
  id                           text primary key,
  origin_city_id               text not null references public.cities(id),
  destination_city_id          text not null references public.cities(id),
  distance_km                  integer,
  estimated_duration_minutes   integer,
  is_active                    boolean not null default true,
  check (origin_city_id <> destination_city_id)
);

create index if not exists idx_routes_origin_dest on public.routes(origin_city_id, destination_city_id);
create index if not exists idx_routes_active on public.routes(is_active) where is_active = true;

-- ============================================================
-- 4. BUSES
-- ============================================================
create table if not exists public.buses (
  id                   text primary key,
  name                 text not null,
  registration_number  text not null unique,
  bus_type             text not null check (bus_type in ('seater', 'sleeper', 'semi_sleeper')),
  total_seats          integer not null,
  seat_layout          jsonb not null,
  amenities            text[] not null default '{}',
  photos               text[] not null default '{}',
  is_active            boolean not null default true
);

create index if not exists idx_buses_active on public.buses(is_active) where is_active = true;

-- ============================================================
-- 5. SCHEDULES
-- ============================================================
create table if not exists public.schedules (
  id              text primary key,
  route_id        text not null references public.routes(id),
  bus_id          text not null references public.buses(id),
  departure_time  time not null,
  arrival_time    time not null,
  base_price      integer not null,
  sleeper_price   integer,
  days_of_week    integer[] not null default '{0,1,2,3,4,5,6}',
  is_active       boolean not null default true,
  valid_from      date not null default current_date,
  valid_until     date
);

create index if not exists idx_schedules_route_active on public.schedules(route_id) where is_active = true;
create index if not exists idx_schedules_bus on public.schedules(bus_id);

-- ============================================================
-- 6. SCHEDULE_INSTANCES
-- ============================================================
create table if not exists public.schedule_instances (
  id                text primary key default gen_random_uuid()::text,
  schedule_id       text not null references public.schedules(id) on delete cascade,
  travel_date       date not null,
  status            text not null default 'active' check (status in ('active', 'cancelled')),
  price_override    integer,
  unique (schedule_id, travel_date)
);

create index if not exists idx_schedule_instances_date on public.schedule_instances(travel_date);

-- ============================================================
-- 7. BOOKINGS
-- ============================================================
create table if not exists public.bookings (
  id                    text primary key default gen_random_uuid()::text,
  user_id               text not null references public.profiles(id) on delete restrict,
  schedule_id           text not null references public.schedules(id),
  travel_date           date not null,
  status                text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  total_amount          integer not null,
  refund_amount         integer,
  payment_id            text,
  payment_status        text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded', 'partially_refunded')),
  contact_email         text not null,
  contact_phone         text not null,
  booked_at             timestamptz not null default now(),
  cancelled_at          timestamptz,
  cancellation_reason   text
);

create index if not exists idx_bookings_user on public.bookings(user_id, booked_at desc);
create index if not exists idx_bookings_schedule_date on public.bookings(schedule_id, travel_date);
create index if not exists idx_bookings_status on public.bookings(status);

-- ============================================================
-- 8. BOOKING_PASSENGERS
-- ============================================================
create table if not exists public.booking_passengers (
  id           text primary key default gen_random_uuid()::text,
  booking_id   text not null references public.bookings(id) on delete cascade,
  seat_number  text not null,
  name         text not null,
  age          integer not null,
  gender       text not null check (gender in ('male', 'female', 'other')),
  is_primary   boolean not null default false,
  unique (booking_id, seat_number)
);

create index if not exists idx_booking_passengers_booking on public.booking_passengers(booking_id);

-- ============================================================
-- 9. SEAT_LOCKS — 10-minute exclusive holds during checkout
-- ============================================================
create table if not exists public.seat_locks (
  id           text primary key default gen_random_uuid()::text,
  schedule_id  text not null references public.schedules(id),
  travel_date  date not null,
  seat_number  text not null,
  user_id      text not null,
  locked_at    timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '10 minutes'),
  unique (schedule_id, travel_date, seat_number)
);

create index if not exists idx_seat_locks_expires on public.seat_locks(expires_at);
create index if not exists idx_seat_locks_user on public.seat_locks(user_id);

-- ============================================================
-- 10. REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id           text primary key default gen_random_uuid()::text,
  booking_id   text not null unique references public.bookings(id) on delete cascade,
  user_id      text not null,
  schedule_id  text not null references public.schedules(id),
  rating       integer not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_reviews_schedule on public.reviews(schedule_id);

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- Booked seats for a schedule on a date
create or replace function public.get_booked_seats(
  p_schedule_id text,
  p_travel_date date
) returns text[]
language sql
stable
as $$
  select coalesce(array_agg(distinct bp.seat_number), '{}')
  from public.booking_passengers bp
  join public.bookings b on b.id = bp.booking_id
  where b.schedule_id = p_schedule_id
    and b.travel_date = p_travel_date
    and b.status in ('pending', 'confirmed', 'completed');
$$;

-- Currently-locked seats by OTHER users (exclude the caller's own locks)
create or replace function public.get_locked_seats(
  p_schedule_id text,
  p_travel_date date,
  p_user_id text
) returns text[]
language sql
stable
as $$
  select coalesce(array_agg(seat_number), '{}')
  from public.seat_locks
  where schedule_id = p_schedule_id
    and travel_date = p_travel_date
    and user_id <> p_user_id
    and expires_at > now();
$$;

-- Cleanup expired locks
create or replace function public.cleanup_expired_locks()
returns integer
language plpgsql
as $$
declare
  deleted_count integer;
begin
  delete from public.seat_locks
  where expires_at < now()
  returning 1 into deleted_count;
  return coalesce(deleted_count, 0);
end;
$$;

-- Lock a seat for a user (returns true on success, false if unavailable)
create or replace function public.lock_seat(
  p_schedule_id text,
  p_travel_date date,
  p_seat_number text,
  p_user_id text
) returns boolean
language plpgsql
as $$
begin
  delete from public.seat_locks
  where schedule_id = p_schedule_id
    and travel_date = p_travel_date
    and seat_number = p_seat_number
    and expires_at < now();

  if exists (
    select 1 from public.booking_passengers bp
    join public.bookings b on b.id = bp.booking_id
    where b.schedule_id = p_schedule_id
      and b.travel_date = p_travel_date
      and bp.seat_number = p_seat_number
      and b.status in ('pending', 'confirmed', 'completed')
  ) then
    return false;
  end if;

  insert into public.seat_locks (schedule_id, travel_date, seat_number, user_id)
  values (p_schedule_id, p_travel_date, p_seat_number, p_user_id)
  on conflict (schedule_id, travel_date, seat_number) do update
    set user_id    = excluded.user_id,
        locked_at  = now(),
        expires_at = now() + interval '10 minutes'
    where public.seat_locks.user_id = excluded.user_id;

  return true;
end;
$$;

-- Atomic booking creation
create or replace function public.create_booking(
  p_user_id        text,
  p_schedule_id    text,
  p_travel_date    date,
  p_total_amount   integer,
  p_payment_id     text,
  p_contact_email  text,
  p_contact_phone  text,
  p_passengers     jsonb
) returns text
language plpgsql
as $$
declare
  v_booking_id text;
  v_passenger jsonb;
  v_seat_numbers text[];
begin
  -- Make sure the profile row exists (for guest flows)
  insert into public.profiles (id, full_name, role)
    values (p_user_id, p_contact_email, 'user')
    on conflict (id) do nothing;

  select array_agg(p->>'seat_number')
    into v_seat_numbers
    from jsonb_array_elements(p_passengers) p;

  if exists (
    select 1
    from public.booking_passengers bp
    join public.bookings b on b.id = bp.booking_id
    where b.schedule_id = p_schedule_id
      and b.travel_date = p_travel_date
      and bp.seat_number = any(v_seat_numbers)
      and b.status in ('pending', 'confirmed', 'completed')
  ) then
    raise exception 'SEAT_ALREADY_BOOKED' using errcode = 'P0001';
  end if;

  insert into public.bookings (
    user_id, schedule_id, travel_date, status,
    total_amount, payment_id, payment_status,
    contact_email, contact_phone
  ) values (
    p_user_id, p_schedule_id, p_travel_date, 'confirmed',
    p_total_amount, p_payment_id,
    case when p_payment_id is null then 'pending' else 'paid' end,
    p_contact_email, p_contact_phone
  )
  returning id into v_booking_id;

  for v_passenger in select * from jsonb_array_elements(p_passengers)
  loop
    insert into public.booking_passengers (
      booking_id, seat_number, name, age, gender, is_primary
    ) values (
      v_booking_id,
      v_passenger->>'seat_number',
      v_passenger->>'name',
      (v_passenger->>'age')::integer,
      v_passenger->>'gender',
      coalesce((v_passenger->>'is_primary')::boolean, false)
    );
  end loop;

  delete from public.seat_locks
  where schedule_id = p_schedule_id
    and travel_date = p_travel_date
    and seat_number = any(v_seat_numbers)
    and user_id = p_user_id;

  return v_booking_id;
end;
$$;

-- ============================================================
-- Done. Run 001_seed.sql or `node scripts/seed.mjs` to load data.
-- ============================================================
