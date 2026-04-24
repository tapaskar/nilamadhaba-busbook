# NilaMadhaba — Backend Setup Guide (Neon + Vercel)

Go from **demo mode** (in-memory data) to a fully functional backend on
**Neon Postgres** in about 10 minutes.

Neon has a genuinely generous free tier:
- 0.5 GB storage
- 10 projects per account
- Auto-suspend when idle (so you don't burn CPU hours)
- Unlimited branches for dev/staging

The recommended path is to install Neon through the **Vercel Marketplace** —
the `DATABASE_URL` env var is auto-provisioned for you.

---

## 1. Install Neon via Vercel Marketplace

1. Open your project in the [Vercel dashboard](https://vercel.com/dashboard).
2. Go to **Storage** (left sidebar) → **Create Database** → **Neon**.
3. Pick a region close to your users (e.g. `Asia Pacific (Mumbai)`).
4. Click **Continue** → **Connect** to your Vercel project.

Vercel automatically sets these env vars on your project (for both
Preview and Production):

- `DATABASE_URL` (pooled — what the app uses)
- `DATABASE_URL_UNPOOLED`
- `PGHOST`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`
- `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, ...

Only `DATABASE_URL` is required by this app.

---

## 2. Apply the schema

1. In the Vercel Storage tab, click the Neon integration → **Open Console**.
   (Or go to [console.neon.tech](https://console.neon.tech) directly.)
2. Open the **SQL Editor**.
3. Paste the contents of `db/migrations/001_init.sql` from this repo.
4. Click **Run**.

You should see `CREATE TABLE`, `CREATE INDEX`, and `CREATE FUNCTION`
messages. That creates 10 tables + 5 RPC functions:

| Table | Purpose |
|---|---|
| `profiles` | User directory (FK target for bookings). Has a `guest-user` row pre-inserted. |
| `cities` / `routes` | Geography |
| `buses` | Fleet with JSON seat layouts |
| `schedules` / `schedule_instances` | Recurring departures + date-specific overrides |
| `bookings` / `booking_passengers` | The booking ledger |
| `seat_locks` | 10-minute exclusive holds during checkout |
| `reviews` | Post-trip ratings |

Plus 5 RPCs: `get_booked_seats`, `get_locked_seats`, `lock_seat`,
**`create_booking`** (atomic), `cleanup_expired_locks`.

---

## 3. Pull DATABASE_URL locally

```bash
vercel env pull .env.local
```

This writes `DATABASE_URL=...` (among others) into `.env.local`.

---

## 4. Seed the database

```bash
node --env-file=.env.local scripts/seed.mjs
```

Expected output:
```
→ Seeding ep-xxx-xxx.ap-southeast-1.aws.neon.tech

→ cities       … ✓ 12
→ routes       … ✓ 12
→ buses        … ✓ 8
→ schedules    … ✓ 18

✓ Seed complete.
```

The script is idempotent — safe to re-run.

---

## 5. Test it locally

```bash
npm run dev
```

Then:
```bash
curl http://localhost:3000/api/health
```

You should see:
```json
{
  "mode": "live",
  "ok": true,
  "counts": { "cities": 12, "routes": 12, "buses": 8, "schedules": 18, "bookings": 0 }
}
```

Now try the full flow at http://localhost:3000 — search → pick a bus →
pick a seat → pay. Then go to Neon → SQL Editor:

```sql
SELECT id, schedule_id, travel_date, total_amount, booked_at
FROM bookings
ORDER BY booked_at DESC
LIMIT 5;
```

Your booking should be there, with matching rows in `booking_passengers`.

---

## 6. Deploy

Since Vercel already set the env vars when you installed the Neon
integration, just redeploy:

```bash
npx vercel --prod
```

Verify at `https://<your-app>.vercel.app/api/health` — should return
`"mode": "live"`.

---

## Appendix — API Reference

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

Every endpoint auto-falls back to mock data when `DATABASE_URL` is not set.

---

## Appendix — Adding auth later

The current code falls back to `userId = 'guest-user'` for bookings. To
attribute bookings to real users, add any Next.js-compatible auth and
pass the signed-in user's id in the booking POST body:

```ts
// client (after sign-in)
fetch("/api/bookings", {
  method: "POST",
  body: JSON.stringify({
    userId: session.user.id,   // ← pass through
    scheduleId, travelDate, totalAmount, /* ... */
  }),
});
```

Recommended providers:
- [Clerk](https://clerk.com) — free tier for 10k MAU, Vercel-native
- [Auth.js](https://authjs.dev) — open source, any OAuth provider
- [WorkOS AuthKit](https://workos.com/authkit) — free for 1M MAU

The `create_booking` RPC automatically creates a `profiles` row for any
new user id it sees, so no extra wiring is needed on the Postgres side.
