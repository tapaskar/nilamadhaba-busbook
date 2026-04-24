#!/usr/bin/env node
/**
 * Seed a Neon Postgres database with cities, routes, buses, schedules.
 *
 * Prerequisites:
 *   - DATABASE_URL  (pooled connection string — see Neon console)
 *   - Migration applied  (db/migrations/001_init.sql)
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed.mjs
 * or:
 *   DATABASE_URL=postgres://... node scripts/seed.mjs
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    "✗ Missing DATABASE_URL env var.\n" +
      "  Get it from the Neon console → Connection string, then:\n" +
      "    node --env-file=.env.local scripts/seed.mjs",
  );
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// ─── Data definitions (mirrors src/lib/mock-data.ts) ──────────────────────

const cities = [
  { id: "city-blr", name: "Bengaluru", state: "Karnataka" },
  { id: "city-chn", name: "Chennai", state: "Tamil Nadu" },
  { id: "city-hyd", name: "Hyderabad", state: "Telangana" },
  { id: "city-mum", name: "Mumbai", state: "Maharashtra" },
  { id: "city-pne", name: "Pune", state: "Maharashtra" },
  { id: "city-goa", name: "Goa", state: "Goa" },
  { id: "city-mys", name: "Mysore", state: "Karnataka" },
  { id: "city-cbe", name: "Coimbatore", state: "Tamil Nadu" },
  { id: "city-vtz", name: "Vizag", state: "Andhra Pradesh" },
  { id: "city-mlr", name: "Mangalore", state: "Karnataka" },
  { id: "city-kch", name: "Kochi", state: "Kerala" },
  { id: "city-tpt", name: "Tirupati", state: "Andhra Pradesh" },
].map((c) => ({ ...c, is_active: true }));

const routes = [
  { id: "route-blr-chn", origin_city_id: "city-blr", destination_city_id: "city-chn", distance_km: 350, estimated_duration_minutes: 360 },
  { id: "route-blr-hyd", origin_city_id: "city-blr", destination_city_id: "city-hyd", distance_km: 570, estimated_duration_minutes: 510 },
  { id: "route-blr-mum", origin_city_id: "city-blr", destination_city_id: "city-mum", distance_km: 980, estimated_duration_minutes: 900 },
  { id: "route-blr-goa", origin_city_id: "city-blr", destination_city_id: "city-goa", distance_km: 560, estimated_duration_minutes: 600 },
  { id: "route-chn-hyd", origin_city_id: "city-chn", destination_city_id: "city-hyd", distance_km: 630, estimated_duration_minutes: 540 },
  { id: "route-mum-goa", origin_city_id: "city-mum", destination_city_id: "city-goa", distance_km: 590, estimated_duration_minutes: 540 },
  { id: "route-blr-mys", origin_city_id: "city-blr", destination_city_id: "city-mys", distance_km: 150, estimated_duration_minutes: 180 },
  { id: "route-blr-cbe", origin_city_id: "city-blr", destination_city_id: "city-cbe", distance_km: 365, estimated_duration_minutes: 420 },
  { id: "route-blr-mlr", origin_city_id: "city-blr", destination_city_id: "city-mlr", distance_km: 350, estimated_duration_minutes: 390 },
  { id: "route-hyd-vtz", origin_city_id: "city-hyd", destination_city_id: "city-vtz", distance_km: 620, estimated_duration_minutes: 720 },
  { id: "route-chn-cbe", origin_city_id: "city-chn", destination_city_id: "city-cbe", distance_km: 500, estimated_duration_minutes: 480 },
  { id: "route-blr-kch", origin_city_id: "city-blr", destination_city_id: "city-kch", distance_km: 555, estimated_duration_minutes: 600 },
].map((r) => ({ ...r, is_active: true }));

// ─── Seat layout generators (must match mock-data.ts) ────────────────────

function sleeperLayout21(rows, prefix = "L") {
  const makeDeck = (deckPrefix) => {
    const seats = [];
    for (let row = 0; row < rows; row++) {
      seats.push({ id: `${deckPrefix}-L${row + 1}`, label: `${deckPrefix}L${row + 1}`, row, col: 0, rowSpan: 1, colSpan: 1, type: "sleeper", price_tier: deckPrefix === "U" ? "base" : "sleeper", ladies_only: row === rows - 1 });
      seats.push({ id: `${deckPrefix}-L${row + 1}A`, label: `${deckPrefix}L${row + 1}A`, row, col: 1, rowSpan: 1, colSpan: 1, type: "sleeper", price_tier: deckPrefix === "U" ? "base" : "sleeper", ladies_only: row === rows - 1 });
      seats.push({ id: `${deckPrefix}-R${row + 1}`, label: `${deckPrefix}R${row + 1}`, row, col: 3, rowSpan: 1, colSpan: 1, type: "sleeper", price_tier: deckPrefix === "U" ? "base" : "sleeper", ladies_only: false });
    }
    return seats;
  };
  return {
    version: 1,
    decks: [
      { name: "Lower Deck", rows, cols: 4, seats: makeDeck("L") },
      { name: "Upper Deck", rows, cols: 4, seats: makeDeck("U") },
    ],
  };
}

function seaterLayout22() {
  const seats = [];
  for (let row = 0; row < 12; row++) {
    seats.push({ id: `S-${row + 1}A`, label: `${row + 1}A`, row, col: 0, rowSpan: 1, colSpan: 1, type: "seater", price_tier: "base", ladies_only: false });
    seats.push({ id: `S-${row + 1}B`, label: `${row + 1}B`, row, col: 1, rowSpan: 1, colSpan: 1, type: "seater", price_tier: "base", ladies_only: false });
    seats.push({ id: `S-${row + 1}C`, label: `${row + 1}C`, row, col: 3, rowSpan: 1, colSpan: 1, type: "seater", price_tier: "base", ladies_only: false });
    seats.push({ id: `S-${row + 1}D`, label: `${row + 1}D`, row, col: 4, rowSpan: 1, colSpan: 1, type: "seater", price_tier: "base", ladies_only: row === 11 });
  }
  return { version: 1, decks: [{ name: "Main Deck", rows: 12, cols: 5, seats }] };
}

const acSleeper = sleeperLayout21(8);
const premiumSleeper = sleeperLayout21(6);
const nonACSleeper = sleeperLayout21(10);
const acSeater = seaterLayout22();

const count = (l) => l.decks.reduce((s, d) => s + d.seats.length, 0);

const buses = [
  { id: "bus-volvo-sleeper-1", name: "NilaMadhaba Volvo B11R AC Sleeper", registration_number: "KA-01-AB-1234", bus_type: "sleeper", seat_layout: acSleeper, amenities: ["AC", "Charging Point", "Blanket", "Water Bottle", "Reading Light", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"] },
  { id: "bus-volvo-sleeper-2", name: "NilaMadhaba Volvo B11R AC Sleeper", registration_number: "KA-01-CD-5678", bus_type: "sleeper", seat_layout: acSleeper, amenities: ["AC", "Charging Point", "Blanket", "Water Bottle", "Reading Light", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"] },
  { id: "bus-volvo-seater-1", name: "NilaMadhaba Volvo 9600 AC Seater", registration_number: "KA-01-EF-9012", bus_type: "seater", seat_layout: acSeater, amenities: ["AC", "Charging Point", "Water Bottle", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"] },
  { id: "bus-volvo-seater-2", name: "NilaMadhaba Volvo 9600 AC Seater", registration_number: "KA-01-GH-3456", bus_type: "seater", seat_layout: acSeater, amenities: ["AC", "Charging Point", "Water Bottle", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"] },
  { id: "bus-nonac-sleeper-1", name: "NilaMadhaba Non-AC Sleeper", registration_number: "KA-02-IJ-7890", bus_type: "sleeper", seat_layout: nonACSleeper, amenities: ["Charging Point", "Water Bottle", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"] },
  { id: "bus-nonac-sleeper-2", name: "NilaMadhaba Non-AC Sleeper", registration_number: "KA-02-KL-1122", bus_type: "sleeper", seat_layout: nonACSleeper, amenities: ["Charging Point", "Water Bottle", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"] },
  { id: "bus-scania-premium-1", name: "NilaMadhaba Scania Premium AC Sleeper", registration_number: "KA-01-MN-3344", bus_type: "sleeper", seat_layout: premiumSleeper, amenities: ["AC", "WiFi", "Charging Point", "Blanket", "Water Bottle", "Reading Light", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"] },
  { id: "bus-scania-premium-2", name: "NilaMadhaba Scania Premium AC Sleeper", registration_number: "KA-01-OP-5566", bus_type: "sleeper", seat_layout: premiumSleeper, amenities: ["AC", "WiFi", "Charging Point", "Blanket", "Water Bottle", "Reading Light", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"] },
].map((b) => ({ ...b, total_seats: count(b.seat_layout), photos: [], is_active: true }));

const allDays = [0, 1, 2, 3, 4, 5, 6];

const schedules = [
  // BLR -> CHN
  { id: "sch-blr-chn-2100", route_id: "route-blr-chn", bus_id: "bus-volvo-sleeper-1", departure_time: "21:00", arrival_time: "03:00", base_price: 89900, sleeper_price: 109900 },
  { id: "sch-blr-chn-2200", route_id: "route-blr-chn", bus_id: "bus-volvo-seater-1", departure_time: "22:00", arrival_time: "04:00", base_price: 69900, sleeper_price: null },
  { id: "sch-blr-chn-2230", route_id: "route-blr-chn", bus_id: "bus-scania-premium-1", departure_time: "22:30", arrival_time: "04:30", base_price: 119900, sleeper_price: 149900 },
  { id: "sch-blr-chn-2300", route_id: "route-blr-chn", bus_id: "bus-nonac-sleeper-1", departure_time: "23:00", arrival_time: "05:30", base_price: 49900, sleeper_price: 59900 },
  // BLR -> HYD
  { id: "sch-blr-hyd-2000", route_id: "route-blr-hyd", bus_id: "bus-volvo-sleeper-2", departure_time: "20:00", arrival_time: "04:30", base_price: 99900, sleeper_price: 119900 },
  { id: "sch-blr-hyd-2130", route_id: "route-blr-hyd", bus_id: "bus-scania-premium-2", departure_time: "21:30", arrival_time: "05:30", base_price: 139900, sleeper_price: 169900 },
  { id: "sch-blr-hyd-2300", route_id: "route-blr-hyd", bus_id: "bus-nonac-sleeper-2", departure_time: "23:00", arrival_time: "08:00", base_price: 59900, sleeper_price: 69900 },
  // BLR -> MUM
  { id: "sch-blr-mum-1800", route_id: "route-blr-mum", bus_id: "bus-volvo-sleeper-1", departure_time: "18:00", arrival_time: "09:00", base_price: 149900, sleeper_price: 179900 },
  { id: "sch-blr-mum-2000", route_id: "route-blr-mum", bus_id: "bus-scania-premium-1", departure_time: "20:00", arrival_time: "11:00", base_price: 189900, sleeper_price: 229900 },
  // BLR -> GOA
  { id: "sch-blr-goa-1900", route_id: "route-blr-goa", bus_id: "bus-volvo-sleeper-2", departure_time: "19:00", arrival_time: "05:00", base_price: 109900, sleeper_price: 129900 },
  { id: "sch-blr-goa-2130", route_id: "route-blr-goa", bus_id: "bus-nonac-sleeper-1", departure_time: "21:30", arrival_time: "07:30", base_price: 64900, sleeper_price: 74900 },
  // CHN -> HYD
  { id: "sch-chn-hyd-2000", route_id: "route-chn-hyd", bus_id: "bus-volvo-seater-2", departure_time: "20:00", arrival_time: "05:00", base_price: 84900, sleeper_price: null },
  { id: "sch-chn-hyd-2200", route_id: "route-chn-hyd", bus_id: "bus-volvo-sleeper-1", departure_time: "22:00", arrival_time: "07:00", base_price: 109900, sleeper_price: 129900 },
  // MUM -> GOA
  { id: "sch-mum-goa-1900", route_id: "route-mum-goa", bus_id: "bus-scania-premium-2", departure_time: "19:00", arrival_time: "04:00", base_price: 129900, sleeper_price: 159900 },
  // BLR -> MYS
  { id: "sch-blr-mys-0700", route_id: "route-blr-mys", bus_id: "bus-volvo-seater-1", departure_time: "07:00", arrival_time: "10:00", base_price: 39900, sleeper_price: null },
  { id: "sch-blr-mys-1400", route_id: "route-blr-mys", bus_id: "bus-volvo-seater-2", departure_time: "14:00", arrival_time: "17:00", base_price: 39900, sleeper_price: null },
  // BLR -> CBE
  { id: "sch-blr-cbe-2100", route_id: "route-blr-cbe", bus_id: "bus-volvo-sleeper-2", departure_time: "21:00", arrival_time: "04:00", base_price: 79900, sleeper_price: 99900 },
  // BLR -> KCH
  { id: "sch-blr-kch-2000", route_id: "route-blr-kch", bus_id: "bus-scania-premium-1", departure_time: "20:00", arrival_time: "06:00", base_price: 129900, sleeper_price: 159900 },
].map((s) => ({
  ...s,
  days_of_week: allDays,
  is_active: true,
  valid_from: "2024-01-01",
  valid_until: null,
}));

// ─── Seed execution ─────────────────────────────────────────────────────

async function upsertCities() {
  process.stdout.write(`→ cities       … `);
  for (const c of cities) {
    await sql`
      INSERT INTO cities (id, name, state, is_active)
      VALUES (${c.id}, ${c.name}, ${c.state}, ${c.is_active})
      ON CONFLICT (id) DO UPDATE
        SET name = excluded.name,
            state = excluded.state,
            is_active = excluded.is_active
    `;
  }
  console.log(`✓ ${cities.length}`);
}

async function upsertRoutes() {
  process.stdout.write(`→ routes       … `);
  for (const r of routes) {
    await sql`
      INSERT INTO routes (id, origin_city_id, destination_city_id,
                          distance_km, estimated_duration_minutes, is_active)
      VALUES (${r.id}, ${r.origin_city_id}, ${r.destination_city_id},
              ${r.distance_km}, ${r.estimated_duration_minutes}, ${r.is_active})
      ON CONFLICT (id) DO UPDATE
        SET origin_city_id = excluded.origin_city_id,
            destination_city_id = excluded.destination_city_id,
            distance_km = excluded.distance_km,
            estimated_duration_minutes = excluded.estimated_duration_minutes,
            is_active = excluded.is_active
    `;
  }
  console.log(`✓ ${routes.length}`);
}

async function upsertBuses() {
  process.stdout.write(`→ buses        … `);
  for (const b of buses) {
    await sql`
      INSERT INTO buses (id, name, registration_number, bus_type,
                         total_seats, seat_layout, amenities, photos, is_active)
      VALUES (${b.id}, ${b.name}, ${b.registration_number}, ${b.bus_type},
              ${b.total_seats}, ${JSON.stringify(b.seat_layout)}::jsonb,
              ${b.amenities}, ${b.photos}, ${b.is_active})
      ON CONFLICT (id) DO UPDATE
        SET name = excluded.name,
            registration_number = excluded.registration_number,
            bus_type = excluded.bus_type,
            total_seats = excluded.total_seats,
            seat_layout = excluded.seat_layout,
            amenities = excluded.amenities,
            photos = excluded.photos,
            is_active = excluded.is_active
    `;
  }
  console.log(`✓ ${buses.length}`);
}

async function upsertSchedules() {
  process.stdout.write(`→ schedules    … `);
  for (const s of schedules) {
    await sql`
      INSERT INTO schedules (id, route_id, bus_id, departure_time, arrival_time,
                             base_price, sleeper_price, days_of_week,
                             is_active, valid_from, valid_until)
      VALUES (${s.id}, ${s.route_id}, ${s.bus_id}, ${s.departure_time}, ${s.arrival_time},
              ${s.base_price}, ${s.sleeper_price}, ${s.days_of_week},
              ${s.is_active}, ${s.valid_from}, ${s.valid_until})
      ON CONFLICT (id) DO UPDATE
        SET route_id = excluded.route_id,
            bus_id = excluded.bus_id,
            departure_time = excluded.departure_time,
            arrival_time = excluded.arrival_time,
            base_price = excluded.base_price,
            sleeper_price = excluded.sleeper_price,
            days_of_week = excluded.days_of_week,
            is_active = excluded.is_active,
            valid_from = excluded.valid_from,
            valid_until = excluded.valid_until
    `;
  }
  console.log(`✓ ${schedules.length}`);
}

async function main() {
  const host = DATABASE_URL.match(/@([^/]+)/)?.[1] || "(neon)";
  console.log(`→ Seeding ${host}\n`);

  await upsertCities();
  await upsertRoutes();
  await upsertBuses();
  await upsertSchedules();

  console.log(`\n✓ Seed complete.`);
  console.log(
    `  ${cities.length} cities · ${routes.length} routes · ${buses.length} buses · ${schedules.length} schedules`,
  );
}

main().catch((e) => {
  console.error(`\n✗ Seed failed:`, e.message || e);
  process.exit(1);
});
