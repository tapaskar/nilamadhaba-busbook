# NilaMadhaba — Premium Bus Booking Platform

Frictionless intercity bus booking for a single-brand operator.

**Live demo:** https://busbook-seven.vercel.app
**Stack:** Next.js 15 · Tailwind v4 · Supabase (Postgres + Auth) · Vercel · React 19

---

## Features

- 3-tap booking flow: search → select seat → pay
- Interactive seat maps for AC Sleeper, AC Seater, Premium Sleeper, Non-AC Sleeper
- Dynamic pricing (occupancy-based + weekend surcharge)
- Live GPS tracking placeholder, boarding/dropping points per city
- My Trips with cancel + refund computation
- Admin dashboard with revenue charts, live trips, recent bookings
- AI support chatbot ("Nila Assist") + WhatsApp direct chat
- Royal Blue & Gold brand identity

## Architecture

```
Next.js App Router (SSR + API routes)
        ↓
  /api/trips, /api/seats, /api/bookings, /api/health, /api/admin/stats
        ↓
  src/lib/data.ts  ← unified adapter: Supabase (live) or mocks (demo)
        ↓
  Supabase Postgres (tables + RLS + RPC functions)
```

The app **auto-detects** whether Supabase env vars are present.
- **Live mode** (env vars set): real writes via Supabase, RLS enforced, RPCs for atomic bookings.
- **Demo mode** (no env): in-memory mocks. Same UI, no persistence.

## Quick start

### Demo mode (no backend needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — fully functional with mock data.

### Live mode (with Supabase)

Follow the [SETUP.md](./SETUP.md) guide — takes ~10 minutes end-to-end:

1. Create a Supabase project at https://database.new
2. Run the migration in `supabase/migrations/`
3. Copy API keys to `.env.local`
4. `node --env-file=.env.local scripts/seed.mjs`
5. `vercel env add ...` for each key
6. `vercel --prod`

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
    data.ts       — unified Supabase/mock data adapter
    mock-data.ts  — demo-mode fallback data
    store.ts      — React Context + reducer for booking state
    types.ts      — Database + domain types
    supabase/     — server, client, admin helpers

supabase/
  migrations/     — SQL schema + RLS + RPCs

scripts/
  seed.mjs        — seed cities, routes, buses, schedules

SETUP.md          — detailed backend setup guide
SYSTEM_DESIGN.md  — original architecture doc
```

## Environment variables

| Var | Scope | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | for live mode |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | for live mode |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | for live mode |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | public | optional (default: demo) |

## License

MIT.
