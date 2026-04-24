# NilaMadhaba — Backend Setup Guide

This guide walks you through going from the **demo mode** (in-memory data) to a
fully functional backend on **Supabase + Vercel**.

**Total time: ~10 minutes.**

---

## 1. Create your Supabase project

1. Visit https://database.new
2. Sign in with GitHub (or your preferred provider)
3. Create a new project:
   - **Name**: `nilamadhaba-busbook`
   - **Database Password**: save this — you'll need it once
   - **Region**: choose the one closest to your users (e.g. `ap-south-1` for India)
4. Wait ~2 minutes for the project to finish provisioning.

---

## 2. Apply the schema

1. In the Supabase dashboard, go to **SQL Editor → New Query**.
2. Open `supabase/migrations/20260424000000_init_schema.sql` from this repo.
3. Copy the **entire file** into the SQL editor.
4. Click **Run**. You should see `Success. No rows returned` (tables, indexes, RLS, and RPC functions are all created).

The migration creates:

| Table | Purpose |
|---|---|
| `profiles` | Extended user info (auto-synced with `auth.users` via trigger) |
| `cities` | 12 operating cities |
| `routes` | 12 route combinations |
| `buses` | 8 buses with JSON seat layouts |
| `schedules` | 18 recurring departures |
| `schedule_instances` | Date-specific overrides (cancelled trips, price tweaks) |
| `bookings` | The booking ledger |
| `booking_passengers` | Per-seat passenger rows |
| `seat_locks` | 10-minute exclusive seat holds during checkout |
| `reviews` | Post-trip ratings |

Plus 5 RPC functions:

| Function | Purpose |
|---|---|
| `get_booked_seats` | All booked seats for a trip on a date |
| `get_locked_seats` | Seats held by *other* users during checkout |
| `lock_seat` | Acquire a 10-min exclusive lock |
| `create_booking` | Atomic booking + passenger creation |
| `cleanup_expired_locks` | Sweeper for stale locks |

RLS is enabled on every table with policies that let authenticated users see
only their own data (bookings, locks, passengers) while reference data
(cities, routes, buses, schedules, reviews) is publicly readable.

---

## 3. Get your API keys

1. In Supabase, go to **Settings → API**.
2. Copy these two values:
   - **Project URL** (e.g. `https://xxxxxxxxxxxx.supabase.co`)
   - **service_role** key (the long one under "Project API keys")

> ⚠️  The **service_role** key bypasses RLS. Treat it like a root password —
> never commit it or ship it to the browser.

---

## 4. Seed the database

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_from_settings>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

Then run:

```bash
node --env-file=.env.local scripts/seed.mjs
```

You should see:

```
→ cities        … ✓ 12
→ routes        … ✓ 12
→ buses         … ✓ 8
→ schedules     … ✓ 18

✓ Seed complete.
```

---

## 5. Test it locally

```bash
npm run dev
```

Then visit http://localhost:3000/api/health — you should see:

```json
{
  "mode": "live",
  "ok": true,
  "counts": { "cities": 12, "routes": 12, "buses": 8, "schedules": 18, "bookings": 0 }
}
```

Try the full flow: home → search → pick a bus → pick a seat → pay.
Check your Supabase dashboard → **Table Editor → bookings** — your booking
should be there, with matching rows in `booking_passengers`.

---

## 6. Deploy to Vercel

Add the env vars to Vercel (one-time):

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste each value when prompted
```

Or via the Vercel dashboard: **Project Settings → Environment Variables**.

Then redeploy:

```bash
vercel --prod
```

Verify at `https://<your-deployment>.vercel.app/api/health` that `mode: "live"`.

---

## Appendix: API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET`  | `/api/health` | Health check + row counts |
| `GET`  | `/api/trips?from=&to=&date=` | Search trips |
| `GET`  | `/api/seats?scheduleId=&date=` | Booked + locked seats |
| `POST` | `/api/seats/lock` | Acquire 10-min seat lock |
| `POST` | `/api/bookings` | Create a booking |
| `GET`  | `/api/bookings/[id]` | Fetch a booking with passengers |
| `POST` | `/api/bookings/[id]/cancel` | Cancel + compute refund |
| `GET`  | `/api/admin/stats` | Aggregate dashboard stats |

All endpoints gracefully degrade to mock data when Supabase env vars are
absent, so you can demo the UI without a backend.
