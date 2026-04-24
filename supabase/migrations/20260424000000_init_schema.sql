-- ============================================================
-- NilaMadhaba Bus Booking Platform — Initial Schema
-- ============================================================
-- Tables, indexes, RLS policies, RPC functions.
-- Run via:  supabase db push
-- Or paste into:  SQL Editor → New Query → Run
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PROFILES
--    1-to-1 with auth.users. Auto-created on signup via trigger.
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  email       text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- Auto-insert a profile row whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
--    Repeating schedule template (e.g., every Mon/Wed/Fri 9pm BLR→CHN).
-- ============================================================
create table if not exists public.schedules (
  id              text primary key,
  route_id        text not null references public.routes(id),
  bus_id          text not null references public.buses(id),
  departure_time  time not null,
  arrival_time    time not null,
  base_price      integer not null,   -- in paise
  sleeper_price   integer,             -- in paise
  days_of_week    integer[] not null default '{0,1,2,3,4,5,6}',
  is_active       boolean not null default true,
  valid_from      date not null default current_date,
  valid_until     date
);

create index if not exists idx_schedules_route_active on public.schedules(route_id) where is_active = true;
create index if not exists idx_schedules_bus on public.schedules(bus_id);

-- ============================================================
-- 6. SCHEDULE_INSTANCES
--    Overrides for specific dates (e.g., cancelled, custom price).
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
  user_id               uuid not null references public.profiles(id) on delete restrict,
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
-- 9. SEAT_LOCKS
--    Short-lived (10 min) exclusive holds during checkout.
-- ============================================================
create table if not exists public.seat_locks (
  id           text primary key default gen_random_uuid()::text,
  schedule_id  text not null references public.schedules(id),
  travel_date  date not null,
  seat_number  text not null,
  user_id      uuid not null references public.profiles(id),
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
  user_id      uuid not null references public.profiles(id),
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
security definer
set search_path = public
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
  p_user_id uuid
) returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(seat_number), '{}')
  from public.seat_locks
  where schedule_id = p_schedule_id
    and travel_date = p_travel_date
    and user_id <> p_user_id
    and expires_at > now();
$$;

-- Cleanup expired locks (call periodically via cron)
create or replace function public.cleanup_expired_locks()
returns integer
language plpgsql
security definer
set search_path = public
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

-- Lock a seat for a user (returns true on success, false if already locked)
create or replace function public.lock_seat(
  p_schedule_id text,
  p_travel_date date,
  p_seat_number text,
  p_user_id uuid
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Clear expired lock on this seat first
  delete from public.seat_locks
  where schedule_id = p_schedule_id
    and travel_date = p_travel_date
    and seat_number = p_seat_number
    and expires_at < now();

  -- Check if seat is already booked
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

  -- Try to acquire the lock; if another user already holds it, no-op
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

-- Atomic booking creation: verifies seats are free, creates booking + passengers,
-- releases the caller's locks on those seats.
create or replace function public.create_booking(
  p_user_id        uuid,
  p_schedule_id    text,
  p_travel_date    date,
  p_total_amount   integer,
  p_payment_id     text,
  p_contact_email  text,
  p_contact_phone  text,
  p_passengers     jsonb
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_id text;
  v_passenger jsonb;
  v_seat_numbers text[];
begin
  -- Extract all seat numbers from passenger payload
  select array_agg(p->>'seat_number')
    into v_seat_numbers
    from jsonb_array_elements(p_passengers) p;

  -- Make sure none of these are already booked
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

  -- Insert booking
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

  -- Insert passengers
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

  -- Release this user's locks on these seats
  delete from public.seat_locks
  where schedule_id = p_schedule_id
    and travel_date = p_travel_date
    and seat_number = any(v_seat_numbers)
    and user_id = p_user_id;

  return v_booking_id;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.cities              enable row level security;
alter table public.routes              enable row level security;
alter table public.buses               enable row level security;
alter table public.schedules           enable row level security;
alter table public.schedule_instances  enable row level security;
alter table public.bookings            enable row level security;
alter table public.booking_passengers  enable row level security;
alter table public.seat_locks          enable row level security;
alter table public.reviews             enable row level security;

-- ── Public-read reference data ──
drop policy if exists "cities_public_read"     on public.cities;
drop policy if exists "routes_public_read"     on public.routes;
drop policy if exists "buses_public_read"      on public.buses;
drop policy if exists "schedules_public_read"  on public.schedules;
drop policy if exists "instances_public_read"  on public.schedule_instances;
drop policy if exists "reviews_public_read"    on public.reviews;

create policy "cities_public_read"     on public.cities              for select using (true);
create policy "routes_public_read"     on public.routes              for select using (true);
create policy "buses_public_read"      on public.buses               for select using (true);
create policy "schedules_public_read"  on public.schedules           for select using (true);
create policy "instances_public_read"  on public.schedule_instances  for select using (true);
create policy "reviews_public_read"    on public.reviews             for select using (true);

-- ── Profiles ──
drop policy if exists "profiles_self_read"    on public.profiles;
drop policy if exists "profiles_self_update"  on public.profiles;
create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = id);
create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id);

-- ── Bookings: users see & manage their own ──
drop policy if exists "bookings_self_read"    on public.bookings;
drop policy if exists "bookings_self_insert"  on public.bookings;
drop policy if exists "bookings_self_update"  on public.bookings;
create policy "bookings_self_read"
  on public.bookings for select
  using (auth.uid() = user_id);
create policy "bookings_self_insert"
  on public.bookings for insert
  with check (auth.uid() = user_id);
create policy "bookings_self_update"
  on public.bookings for update
  using (auth.uid() = user_id);

-- ── Passengers: through parent booking ──
drop policy if exists "passengers_self_read"    on public.booking_passengers;
drop policy if exists "passengers_self_insert"  on public.booking_passengers;
create policy "passengers_self_read"
  on public.booking_passengers for select
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and b.user_id = auth.uid()
  ));
create policy "passengers_self_insert"
  on public.booking_passengers for insert
  with check (exists (
    select 1 from public.bookings b
    where b.id = booking_id and b.user_id = auth.uid()
  ));

-- ── Seat Locks: users can only see/create/delete their own ──
drop policy if exists "locks_self_read"    on public.seat_locks;
drop policy if exists "locks_self_insert"  on public.seat_locks;
drop policy if exists "locks_self_delete"  on public.seat_locks;
create policy "locks_self_read"
  on public.seat_locks for select
  using (auth.uid() = user_id);
create policy "locks_self_insert"
  on public.seat_locks for insert
  with check (auth.uid() = user_id);
create policy "locks_self_delete"
  on public.seat_locks for delete
  using (auth.uid() = user_id);

-- ── Reviews: self-write, public-read already granted above ──
drop policy if exists "reviews_self_insert"  on public.reviews;
create policy "reviews_self_insert"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Done.
-- ============================================================
