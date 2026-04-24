# NilaMadhaba — Premium Bus Booking Platform

Frictionless intercity bus booking for a single-brand operator.

**Live demo:** https://busbook-seven.vercel.app
**Stack:** Next.js 15 · Tailwind v4 · Neon Postgres · Vercel · React 19

---

## Features

- 3-tap booking flow: search → select seat → pay
- Interactive seat maps for AC Sleeper, AC Seater, Premium Sleeper, Non-AC Sleeper
- Dynamic pricing (occupancy-based + weekend surcharge)
- Live GPS tracking placeholder, boarding/dropping points per city
- My Trips with cancel + refund computation (tiered by time-before-departure)
- Admin dashboard with revenue charts, live trips, recent bookings
- AI support chatbot ("Nila Assist") + WhatsApp direct chat
- Royal Blue & Gold brand identity

## Architecture

```
Next.js App Router (SSR + API routes)
        ↓
  /api/trips, /api/seats, /api/bookings, /api/health, /api/admin/stats
        ↓
  src/lib/data.ts  ← unified adapter: Neon (live) or mocks (demo)
        ↓
  Neon Postgres (tables + RPC functions for atomic bookings)
```

The app **auto-detects** whether `DATABASE_URL` is set:

- **Live mode**: real persistence via Neon, atomic seat locks + bookings via Postgres RPCs
- **Demo mode** (no env): in-memory mocks, same UI, no persistence

## Quick start

### Demo mode (no backend needed)

```bash
npm install
npm run dev
```

Fully functional with mock data at http://localhost:3000.

### Live mode (with Neon)

Follow [SETUP.md](./SETUP.md) — takes ~10 minutes:

1. Install Neon from Vercel Marketplace (Storage → Create Database → Neon)
2. Run `db/migrations/001_init.sql` in the Neon SQL Editor
3. `vercel env pull .env.local`
4. `node --env-file=.env.local scripts/seed.mjs`
5. `vercel --prod`

## Project structure

```
src/
  app/
    api/          REST endpoints (trips, seats, bookings, admin, health)
    admin/        Admin dashboard
    booking/      Review & pay page
    confirmation/ Post-payment ticket view
    my-trips/     User's booking history
    search/       Results + seat map
  components/
    Header, Footer, CityPicker, DatePicker, SeatMap, TripCard
    SupportBot.tsx     — AI chatbot widget
    WhatsAppChat.tsx   — WhatsApp floating widget
  lib/
    data.ts       — unified Neon/mock data adapter
    db.ts         — Neon SQL tag-function (lazy singleton)
    mock-data.ts  — demo-mode fallback data
    store.ts      — React Context + reducer for booking state
    types.ts      — Domain types (mirrors DB schema)

db/
  migrations/
    001_init.sql  — tables, indexes, RPC functions

scripts/
  seed.mjs        — seed cities, routes, buses, schedules into Neon

SETUP.md          — step-by-step backend setup (Neon + Vercel)
SYSTEM_DESIGN.md  — original architecture doc
```

## Environment variables

| Var | Scope | Required |
|---|---|---|
| `DATABASE_URL` | server-only | for live mode (auto-set by Vercel ⇄ Neon integration) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | public | optional (default: demo) |

## Why Neon

- **Free tier is genuinely usable**: 0.5 GB, 10 projects, auto-suspend when idle
- **Zero-config on Vercel**: Marketplace integration auto-sets `DATABASE_URL`
- **Pure Postgres**: any SQL you know works, including `pgcrypto`, `uuid`, JSONB, array types
- **Serverless driver**: `@neondatabase/serverless` works in Edge + Node without connection pooling headaches
- **Branching**: clone production DB into dev/preview environments in seconds

## License

MIT.
