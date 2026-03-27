import type {
  City,
  Route,
  Bus,
  Schedule,
  SeatLayout,
  Seat,
  Booking,
  BookingPassenger,
  ScheduleWithDetails,
} from "./types";

// ── Cities ──

export const cities: City[] = [
  { id: "city-blr", name: "Bengaluru", state: "Karnataka", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-chn", name: "Chennai", state: "Tamil Nadu", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-hyd", name: "Hyderabad", state: "Telangana", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-mum", name: "Mumbai", state: "Maharashtra", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-pne", name: "Pune", state: "Maharashtra", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-goa", name: "Goa", state: "Goa", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-mys", name: "Mysore", state: "Karnataka", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-cbe", name: "Coimbatore", state: "Tamil Nadu", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-vtz", name: "Vizag", state: "Andhra Pradesh", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-mlr", name: "Mangalore", state: "Karnataka", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-kch", name: "Kochi", state: "Kerala", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { id: "city-tpt", name: "Tirupati", state: "Andhra Pradesh", is_active: true, created_at: "2024-01-01T00:00:00Z" },
];

const cityMap = Object.fromEntries(cities.map((c) => [c.id, c]));

// ── Routes ──

export const routes: Route[] = [
  { id: "route-blr-chn", origin_city_id: "city-blr", destination_city_id: "city-chn", distance_km: 350, estimated_duration_minutes: 360, is_active: true },
  { id: "route-blr-hyd", origin_city_id: "city-blr", destination_city_id: "city-hyd", distance_km: 570, estimated_duration_minutes: 510, is_active: true },
  { id: "route-blr-mum", origin_city_id: "city-blr", destination_city_id: "city-mum", distance_km: 980, estimated_duration_minutes: 900, is_active: true },
  { id: "route-blr-goa", origin_city_id: "city-blr", destination_city_id: "city-goa", distance_km: 560, estimated_duration_minutes: 600, is_active: true },
  { id: "route-chn-hyd", origin_city_id: "city-chn", destination_city_id: "city-hyd", distance_km: 630, estimated_duration_minutes: 540, is_active: true },
  { id: "route-mum-goa", origin_city_id: "city-mum", destination_city_id: "city-goa", distance_km: 590, estimated_duration_minutes: 540, is_active: true },
  { id: "route-blr-mys", origin_city_id: "city-blr", destination_city_id: "city-mys", distance_km: 150, estimated_duration_minutes: 180, is_active: true },
  { id: "route-blr-cbe", origin_city_id: "city-blr", destination_city_id: "city-cbe", distance_km: 365, estimated_duration_minutes: 420, is_active: true },
  { id: "route-blr-mlr", origin_city_id: "city-blr", destination_city_id: "city-mlr", distance_km: 350, estimated_duration_minutes: 390, is_active: true },
  { id: "route-hyd-vtz", origin_city_id: "city-hyd", destination_city_id: "city-vtz", distance_km: 620, estimated_duration_minutes: 720, is_active: true },
  { id: "route-chn-cbe", origin_city_id: "city-chn", destination_city_id: "city-cbe", distance_km: 500, estimated_duration_minutes: 480, is_active: true },
  { id: "route-blr-kch", origin_city_id: "city-blr", destination_city_id: "city-kch", distance_km: 555, estimated_duration_minutes: 600, is_active: true },
];

// ── Seat Layouts ──

function makeSleeperLayout21(): SeatLayout {
  // 2+1 sleeper: lower and upper decks
  // Lower: 12 berths (8 rows, cols 0-1 are pairs, col 2 is single, aisle between)
  // Upper: 12 berths same arrangement
  const makeDeckSeats = (deckPrefix: string): Seat[] => {
    const seats: Seat[] = [];
    for (let row = 0; row < 8; row++) {
      // Left side: 2 berths side by side
      seats.push({
        id: `${deckPrefix}-L${row + 1}`,
        label: `${deckPrefix}L${row + 1}`,
        row,
        col: 0,
        rowSpan: 1,
        colSpan: 1,
        type: "sleeper",
        price_tier: deckPrefix === "U" ? "base" : "sleeper",
        ladies_only: row === 7,
      });
      seats.push({
        id: `${deckPrefix}-L${row + 1}A`,
        label: `${deckPrefix}L${row + 1}A`,
        row,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        type: "sleeper",
        price_tier: deckPrefix === "U" ? "base" : "sleeper",
        ladies_only: row === 7,
      });
      // Right side: 1 berth (after aisle at col 2, seat at col 3)
      seats.push({
        id: `${deckPrefix}-R${row + 1}`,
        label: `${deckPrefix}R${row + 1}`,
        row,
        col: 3,
        rowSpan: 1,
        colSpan: 1,
        type: "sleeper",
        price_tier: deckPrefix === "U" ? "base" : "sleeper",
        ladies_only: false,
      });
    }
    return seats;
  };

  return {
    version: 1,
    decks: [
      { name: "Lower Deck", rows: 8, cols: 4, seats: makeDeckSeats("L") },
      { name: "Upper Deck", rows: 8, cols: 4, seats: makeDeckSeats("U") },
    ],
  };
}

function makeSeaterLayout22(): SeatLayout {
  // 2+2 seater: single deck, 12 rows
  const seats: Seat[] = [];
  for (let row = 0; row < 12; row++) {
    // Left pair
    seats.push({
      id: `S-${row + 1}A`,
      label: `${row + 1}A`,
      row,
      col: 0,
      rowSpan: 1,
      colSpan: 1,
      type: "seater",
      price_tier: "base",
      ladies_only: false,
    });
    seats.push({
      id: `S-${row + 1}B`,
      label: `${row + 1}B`,
      row,
      col: 1,
      rowSpan: 1,
      colSpan: 1,
      type: "seater",
      price_tier: "base",
      ladies_only: false,
    });
    // Right pair (after aisle)
    seats.push({
      id: `S-${row + 1}C`,
      label: `${row + 1}C`,
      row,
      col: 3,
      rowSpan: 1,
      colSpan: 1,
      type: "seater",
      price_tier: "base",
      ladies_only: false,
    });
    seats.push({
      id: `S-${row + 1}D`,
      label: `${row + 1}D`,
      row,
      col: 4,
      rowSpan: 1,
      colSpan: 1,
      type: "seater",
      price_tier: "base",
      ladies_only: row === 11,
    });
  }
  return {
    version: 1,
    decks: [{ name: "Main Deck", rows: 12, cols: 5, seats }],
  };
}

function makePremiumSleeperLayout21(): SeatLayout {
  // Premium 2+1: fewer rows (6), more space
  const makeDeckSeats = (deckPrefix: string): Seat[] => {
    const seats: Seat[] = [];
    for (let row = 0; row < 6; row++) {
      seats.push({
        id: `${deckPrefix}-L${row + 1}`,
        label: `${deckPrefix}L${row + 1}`,
        row,
        col: 0,
        rowSpan: 1,
        colSpan: 1,
        type: "sleeper",
        price_tier: deckPrefix === "U" ? "base" : "sleeper",
        ladies_only: row === 5,
      });
      seats.push({
        id: `${deckPrefix}-L${row + 1}A`,
        label: `${deckPrefix}L${row + 1}A`,
        row,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        type: "sleeper",
        price_tier: deckPrefix === "U" ? "base" : "sleeper",
        ladies_only: row === 5,
      });
      seats.push({
        id: `${deckPrefix}-R${row + 1}`,
        label: `${deckPrefix}R${row + 1}`,
        row,
        col: 3,
        rowSpan: 1,
        colSpan: 1,
        type: "sleeper",
        price_tier: deckPrefix === "U" ? "base" : "sleeper",
        ladies_only: false,
      });
    }
    return seats;
  };

  return {
    version: 1,
    decks: [
      { name: "Lower Deck", rows: 6, cols: 4, seats: makeDeckSeats("L") },
      { name: "Upper Deck", rows: 6, cols: 4, seats: makeDeckSeats("U") },
    ],
  };
}

function makeNonACSleeperLayout21(): SeatLayout {
  // Same structure as AC sleeper but 10 rows for more capacity
  const makeDeckSeats = (deckPrefix: string): Seat[] => {
    const seats: Seat[] = [];
    for (let row = 0; row < 10; row++) {
      seats.push({
        id: `${deckPrefix}-L${row + 1}`,
        label: `${deckPrefix}L${row + 1}`,
        row,
        col: 0,
        rowSpan: 1,
        colSpan: 1,
        type: "sleeper",
        price_tier: deckPrefix === "U" ? "base" : "sleeper",
        ladies_only: row === 9,
      });
      seats.push({
        id: `${deckPrefix}-L${row + 1}A`,
        label: `${deckPrefix}L${row + 1}A`,
        row,
        col: 1,
        rowSpan: 1,
        colSpan: 1,
        type: "sleeper",
        price_tier: deckPrefix === "U" ? "base" : "sleeper",
        ladies_only: row === 9,
      });
      seats.push({
        id: `${deckPrefix}-R${row + 1}`,
        label: `${deckPrefix}R${row + 1}`,
        row,
        col: 3,
        rowSpan: 1,
        colSpan: 1,
        type: "sleeper",
        price_tier: deckPrefix === "U" ? "base" : "sleeper",
        ladies_only: false,
      });
    }
    return seats;
  };

  return {
    version: 1,
    decks: [
      { name: "Lower Deck", rows: 10, cols: 4, seats: makeDeckSeats("L") },
      { name: "Upper Deck", rows: 10, cols: 4, seats: makeDeckSeats("U") },
    ],
  };
}

// ── Buses ──

function countSeats(layout: SeatLayout): number {
  return layout.decks.reduce((sum, d) => sum + d.seats.length, 0);
}

const sleeperLayout = makeSleeperLayout21();
const seaterLayout = makeSeaterLayout22();
const premiumSleeperLayout = makePremiumSleeperLayout21();
const nonACSleeperLayout = makeNonACSleeperLayout21();

export const buses: Bus[] = [
  {
    id: "bus-volvo-sleeper-1",
    name: "NilaMadhaba Volvo B11R AC Sleeper",
    registration_number: "KA-01-AB-1234",
    bus_type: "sleeper",
    total_seats: countSeats(sleeperLayout),
    seat_layout: sleeperLayout,
    amenities: ["AC", "Charging Point", "Blanket", "Water Bottle", "Reading Light", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"],
    photos: [],
    is_active: true,
  },
  {
    id: "bus-volvo-sleeper-2",
    name: "NilaMadhaba Volvo B11R AC Sleeper",
    registration_number: "KA-01-CD-5678",
    bus_type: "sleeper",
    total_seats: countSeats(sleeperLayout),
    seat_layout: sleeperLayout,
    amenities: ["AC", "Charging Point", "Blanket", "Water Bottle", "Reading Light", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"],
    photos: [],
    is_active: true,
  },
  {
    id: "bus-volvo-seater-1",
    name: "NilaMadhaba Volvo 9600 AC Seater",
    registration_number: "KA-01-EF-9012",
    bus_type: "seater",
    total_seats: countSeats(seaterLayout),
    seat_layout: seaterLayout,
    amenities: ["AC", "Charging Point", "Water Bottle", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"],
    photos: [],
    is_active: true,
  },
  {
    id: "bus-volvo-seater-2",
    name: "NilaMadhaba Volvo 9600 AC Seater",
    registration_number: "KA-01-GH-3456",
    bus_type: "seater",
    total_seats: countSeats(seaterLayout),
    seat_layout: seaterLayout,
    amenities: ["AC", "Charging Point", "Water Bottle", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"],
    photos: [],
    is_active: true,
  },
  {
    id: "bus-nonac-sleeper-1",
    name: "NilaMadhaba Non-AC Sleeper",
    registration_number: "KA-02-IJ-7890",
    bus_type: "sleeper",
    total_seats: countSeats(nonACSleeperLayout),
    seat_layout: nonACSleeperLayout,
    amenities: ["Charging Point", "Water Bottle", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"],
    photos: [],
    is_active: true,
  },
  {
    id: "bus-nonac-sleeper-2",
    name: "NilaMadhaba Non-AC Sleeper",
    registration_number: "KA-02-KL-1122",
    bus_type: "sleeper",
    total_seats: countSeats(nonACSleeperLayout),
    seat_layout: nonACSleeperLayout,
    amenities: ["Charging Point", "Water Bottle", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"],
    photos: [],
    is_active: true,
  },
  {
    id: "bus-scania-premium-1",
    name: "NilaMadhaba Scania Premium AC Sleeper",
    registration_number: "KA-01-MN-3344",
    bus_type: "sleeper",
    total_seats: countSeats(premiumSleeperLayout),
    seat_layout: premiumSleeperLayout,
    amenities: ["AC", "WiFi", "Charging Point", "Blanket", "Water Bottle", "Reading Light", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"],
    photos: [],
    is_active: true,
  },
  {
    id: "bus-scania-premium-2",
    name: "NilaMadhaba Scania Premium AC Sleeper",
    registration_number: "KA-01-OP-5566",
    bus_type: "sleeper",
    total_seats: countSeats(premiumSleeperLayout),
    seat_layout: premiumSleeperLayout,
    amenities: ["AC", "WiFi", "Charging Point", "Blanket", "Water Bottle", "Reading Light", "Track My Bus", "CCTV", "Fire Extinguisher", "Emergency Exit"],
    photos: [],
    is_active: true,
  },
];

const busMap = Object.fromEntries(buses.map((b) => [b.id, b]));

// ── Schedules ──

const allDays = [0, 1, 2, 3, 4, 5, 6];

export const schedules: Schedule[] = [
  // BLR -> CHN (4 departures)
  { id: "sch-blr-chn-2100", route_id: "route-blr-chn", bus_id: "bus-volvo-sleeper-1", departure_time: "21:00", arrival_time: "03:00", base_price: 89900, sleeper_price: 109900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
  { id: "sch-blr-chn-2200", route_id: "route-blr-chn", bus_id: "bus-volvo-seater-1", departure_time: "22:00", arrival_time: "04:00", base_price: 69900, sleeper_price: null, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
  { id: "sch-blr-chn-2230", route_id: "route-blr-chn", bus_id: "bus-scania-premium-1", departure_time: "22:30", arrival_time: "04:30", base_price: 119900, sleeper_price: 149900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
  { id: "sch-blr-chn-2300", route_id: "route-blr-chn", bus_id: "bus-nonac-sleeper-1", departure_time: "23:00", arrival_time: "05:30", base_price: 49900, sleeper_price: 59900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },

  // BLR -> HYD (3 departures)
  { id: "sch-blr-hyd-2000", route_id: "route-blr-hyd", bus_id: "bus-volvo-sleeper-2", departure_time: "20:00", arrival_time: "04:30", base_price: 99900, sleeper_price: 119900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
  { id: "sch-blr-hyd-2130", route_id: "route-blr-hyd", bus_id: "bus-scania-premium-2", departure_time: "21:30", arrival_time: "05:30", base_price: 139900, sleeper_price: 169900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
  { id: "sch-blr-hyd-2300", route_id: "route-blr-hyd", bus_id: "bus-nonac-sleeper-2", departure_time: "23:00", arrival_time: "08:00", base_price: 59900, sleeper_price: 69900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },

  // BLR -> MUM (2 departures)
  { id: "sch-blr-mum-1800", route_id: "route-blr-mum", bus_id: "bus-volvo-sleeper-1", departure_time: "18:00", arrival_time: "09:00", base_price: 149900, sleeper_price: 179900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
  { id: "sch-blr-mum-2000", route_id: "route-blr-mum", bus_id: "bus-scania-premium-1", departure_time: "20:00", arrival_time: "11:00", base_price: 189900, sleeper_price: 229900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },

  // BLR -> GOA (2 departures)
  { id: "sch-blr-goa-1900", route_id: "route-blr-goa", bus_id: "bus-volvo-sleeper-2", departure_time: "19:00", arrival_time: "05:00", base_price: 109900, sleeper_price: 129900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
  { id: "sch-blr-goa-2130", route_id: "route-blr-goa", bus_id: "bus-nonac-sleeper-1", departure_time: "21:30", arrival_time: "07:30", base_price: 64900, sleeper_price: 74900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },

  // CHN -> HYD
  { id: "sch-chn-hyd-2000", route_id: "route-chn-hyd", bus_id: "bus-volvo-seater-2", departure_time: "20:00", arrival_time: "05:00", base_price: 84900, sleeper_price: null, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
  { id: "sch-chn-hyd-2200", route_id: "route-chn-hyd", bus_id: "bus-volvo-sleeper-1", departure_time: "22:00", arrival_time: "07:00", base_price: 109900, sleeper_price: 129900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },

  // MUM -> GOA
  { id: "sch-mum-goa-1900", route_id: "route-mum-goa", bus_id: "bus-scania-premium-2", departure_time: "19:00", arrival_time: "04:00", base_price: 129900, sleeper_price: 159900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },

  // BLR -> MYS (short route, daytime too)
  { id: "sch-blr-mys-0700", route_id: "route-blr-mys", bus_id: "bus-volvo-seater-1", departure_time: "07:00", arrival_time: "10:00", base_price: 39900, sleeper_price: null, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
  { id: "sch-blr-mys-1400", route_id: "route-blr-mys", bus_id: "bus-volvo-seater-2", departure_time: "14:00", arrival_time: "17:00", base_price: 39900, sleeper_price: null, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },

  // BLR -> COI
  { id: "sch-blr-cbe-2100", route_id: "route-blr-cbe", bus_id: "bus-volvo-sleeper-2", departure_time: "21:00", arrival_time: "04:00", base_price: 79900, sleeper_price: 99900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },

  // BLR -> KCH
  { id: "sch-blr-kch-2000", route_id: "route-blr-kch", bus_id: "bus-scania-premium-1", departure_time: "20:00", arrival_time: "06:00", base_price: 129900, sleeper_price: 159900, days_of_week: allDays, is_active: true, valid_from: "2024-01-01", valid_until: null },
];

const routeMap = Object.fromEntries(routes.map((r) => [r.id, r]));

// ── Boarding / Dropping Points ──

export interface StopPoint {
  id: string;
  city_id: string;
  name: string;
  landmark: string;
  time_offset_minutes: number; // offset from the base departure/arrival time
}

export const boardingPoints: StopPoint[] = [
  // Bengaluru
  { id: "bp-blr-silk", city_id: "city-blr", name: "Silk Board Signal", landmark: "Near Silk Board Flyover", time_offset_minutes: 0 },
  { id: "bp-blr-madi", city_id: "city-blr", name: "Madiwala", landmark: "Opposite to Madiwala Market", time_offset_minutes: 5 },
  { id: "bp-blr-ec", city_id: "city-blr", name: "Electronic City", landmark: "Infosys Gate 1", time_offset_minutes: 15 },
  { id: "bp-blr-mj", city_id: "city-blr", name: "Majestic", landmark: "Kempegowda Bus Station Platform 12", time_offset_minutes: -30 },

  // Chennai
  { id: "bp-chn-kym", city_id: "city-chn", name: "Koyambedu", landmark: "CMBT Bus Stand Gate 3", time_offset_minutes: 0 },
  { id: "bp-chn-guy", city_id: "city-chn", name: "Guindy", landmark: "Near Guindy Railway Station", time_offset_minutes: 10 },
  { id: "bp-chn-tam", city_id: "city-chn", name: "Tambaram", landmark: "Tambaram Bus Depot", time_offset_minutes: 20 },

  // Hyderabad
  { id: "bp-hyd-mgbs", city_id: "city-hyd", name: "MGBS", landmark: "Mahatma Gandhi Bus Station", time_offset_minutes: 0 },
  { id: "bp-hyd-amed", city_id: "city-hyd", name: "Ameerpet", landmark: "Near Ameerpet Metro Station", time_offset_minutes: 10 },
  { id: "bp-hyd-lb", city_id: "city-hyd", name: "LB Nagar", landmark: "LB Nagar X Roads", time_offset_minutes: -15 },
  { id: "bp-hyd-hitch", city_id: "city-hyd", name: "Hitec City", landmark: "Cyber Towers Signal", time_offset_minutes: 20 },

  // Mumbai
  { id: "bp-mum-bor", city_id: "city-mum", name: "Borivali", landmark: "Borivali Bus Depot", time_offset_minutes: 0 },
  { id: "bp-mum-ddr", city_id: "city-mum", name: "Dadar", landmark: "Dadar TT Circle", time_offset_minutes: 15 },
  { id: "bp-mum-vashi", city_id: "city-mum", name: "Vashi", landmark: "Vashi Bus Stand", time_offset_minutes: 25 },

  // Pune
  { id: "bp-pne-shv", city_id: "city-pne", name: "Shivajinagar", landmark: "Shivajinagar Bus Stand", time_offset_minutes: 0 },
  { id: "bp-pne-hgj", city_id: "city-pne", name: "Hinjewadi", landmark: "Phase 1 Chowk", time_offset_minutes: 15 },
  { id: "bp-pne-swg", city_id: "city-pne", name: "Swargate", landmark: "Swargate Bus Depot", time_offset_minutes: -10 },

  // Goa
  { id: "bp-goa-pan", city_id: "city-goa", name: "Panjim", landmark: "Kadamba Bus Stand", time_offset_minutes: 0 },
  { id: "bp-goa-mar", city_id: "city-goa", name: "Margao", landmark: "Margao Bus Stand", time_offset_minutes: 20 },
  { id: "bp-goa-map", city_id: "city-goa", name: "Mapusa", landmark: "Mapusa Bus Stand", time_offset_minutes: 15 },

  // Mysore
  { id: "bp-mys-sub", city_id: "city-mys", name: "Sub Urban Bus Stand", landmark: "Mysore Sub Urban Bus Stand", time_offset_minutes: 0 },
  { id: "bp-mys-inf", city_id: "city-mys", name: "Infosys Mysore", landmark: "Near Infosys Gate", time_offset_minutes: 10 },
  { id: "bp-mys-ring", city_id: "city-mys", name: "Ring Road", landmark: "Mysore Ring Road Junction", time_offset_minutes: -5 },

  // Coimbatore
  { id: "bp-cbe-ganp", city_id: "city-cbe", name: "Gandhipuram", landmark: "Town Bus Stand", time_offset_minutes: 0 },
  { id: "bp-cbe-ukd", city_id: "city-cbe", name: "Ukkadam", landmark: "Ukkadam Bus Stand", time_offset_minutes: 10 },
  { id: "bp-cbe-sin", city_id: "city-cbe", name: "Singanallur", landmark: "Singanallur Junction", time_offset_minutes: 15 },

  // Vizag
  { id: "bp-vtz-rnk", city_id: "city-vtz", name: "RTC Complex", landmark: "RTC Complex Bus Station", time_offset_minutes: 0 },
  { id: "bp-vtz-dwk", city_id: "city-vtz", name: "Dwaraka Nagar", landmark: "Near Dwaraka Bus Stop", time_offset_minutes: 10 },
  { id: "bp-vtz-gaj", city_id: "city-vtz", name: "Gajuwaka", landmark: "Gajuwaka Junction", time_offset_minutes: -15 },

  // Mangalore
  { id: "bp-mlr-ksrtc", city_id: "city-mlr", name: "KSRTC Bus Stand", landmark: "Mangalore KSRTC Stand", time_offset_minutes: 0 },
  { id: "bp-mlr-pmp", city_id: "city-mlr", name: "Pumpwell", landmark: "Pumpwell Circle", time_offset_minutes: 10 },

  // Kochi
  { id: "bp-kch-ern", city_id: "city-kch", name: "Ernakulam", landmark: "Ernakulam KSRTC Bus Stand", time_offset_minutes: 0 },
  { id: "bp-kch-aly", city_id: "city-kch", name: "Aluva", landmark: "Aluva Bus Stand", time_offset_minutes: 15 },
  { id: "bp-kch-edp", city_id: "city-kch", name: "Edappally", landmark: "Edappally Toll Junction", time_offset_minutes: 5 },

  // Tirupati
  { id: "bp-tpt-rly", city_id: "city-tpt", name: "Tirupati Railway Station", landmark: "Near Railway Station", time_offset_minutes: 0 },
  { id: "bp-tpt-alp", city_id: "city-tpt", name: "Alipiri", landmark: "Alipiri Toll Gate", time_offset_minutes: 10 },
];

// ── Helpers ──

export function getCityById(id: string): City | undefined {
  return cityMap[id];
}

export function getCitiesByIds(ids: string[]): City[] {
  return ids.map((id) => cityMap[id]).filter(Boolean);
}

export function getRouteById(id: string): Route | undefined {
  return routeMap[id];
}

export function getBusById(id: string): Bus | undefined {
  return busMap[id];
}

export function getBoardingPointsForCity(cityId: string): StopPoint[] {
  return boardingPoints.filter((bp) => bp.city_id === cityId);
}

export function getDroppingPointsForCity(cityId: string): StopPoint[] {
  return boardingPoints.filter((bp) => bp.city_id === cityId);
}

// ── Trip search ──

// Seeded pseudo-random for deterministic results per schedule+date
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return (hash % 10000) / 10000;
  };
}

export interface TripSearchResult {
  schedule: ScheduleWithDetails;
  travel_date: string;
  available_seats: number;
  booked_seats: string[];
  effective_price: number; // base price after dynamic pricing, in paise
  effective_sleeper_price: number | null;
  avg_rating: number;
  review_count: number;
  boarding_points: StopPoint[];
  dropping_points: StopPoint[];
}

export function getTripsForSearch(
  fromCityId: string,
  toCityId: string,
  date: string
): TripSearchResult[] {
  // Find matching routes
  const matchingRoutes = routes.filter(
    (r) =>
      r.origin_city_id === fromCityId &&
      r.destination_city_id === toCityId &&
      r.is_active
  );

  if (matchingRoutes.length === 0) return [];

  const dayOfWeek = new Date(date).getDay();

  const results: TripSearchResult[] = [];

  for (const route of matchingRoutes) {
    const routeSchedules = schedules.filter(
      (s) =>
        s.route_id === route.id &&
        s.is_active &&
        s.days_of_week.includes(dayOfWeek)
    );

    for (const schedule of routeSchedules) {
      const bus = busMap[schedule.bus_id];
      if (!bus || !bus.is_active) continue;

      const rng = seededRandom(`${schedule.id}-${date}`);

      // Generate deterministic booked seats
      const allSeatIds = bus.seat_layout.decks.flatMap((d) =>
        d.seats.map((s) => s.id)
      );
      const occupancyRate = 0.3 + rng() * 0.5; // 30-80% occupancy
      const numBooked = Math.floor(allSeatIds.length * occupancyRate);
      const shuffled = [...allSeatIds].sort(() => rng() - 0.5);
      const bookedSeats = shuffled.slice(0, numBooked);
      const availableSeats = bus.total_seats - numBooked;

      // Dynamic pricing: higher when fewer seats available
      const fillRatio = numBooked / bus.total_seats;
      let priceMultiplier = 1;
      if (fillRatio > 0.7) priceMultiplier = 1.3;
      else if (fillRatio > 0.5) priceMultiplier = 1.15;
      else if (fillRatio > 0.3) priceMultiplier = 1.05;

      // Weekend surcharge
      if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
        priceMultiplier *= 1.1;
      }

      const effectivePrice = Math.round(schedule.base_price * priceMultiplier);
      const effectiveSleeperPrice = schedule.sleeper_price
        ? Math.round(schedule.sleeper_price * priceMultiplier)
        : null;

      // Deterministic rating
      const avgRating = 3.5 + rng() * 1.5; // 3.5 to 5.0
      const reviewCount = Math.floor(50 + rng() * 450); // 50 to 500

      const originCity = cityMap[route.origin_city_id];
      const destinationCity = cityMap[route.destination_city_id];

      const tripResult: TripSearchResult = {
        schedule: {
          ...schedule,
          route: {
            ...route,
            origin_city: originCity,
            destination_city: destinationCity,
          },
          bus,
          avg_rating: Math.round(avgRating * 10) / 10,
          review_count: reviewCount,
          booked_seat_count: numBooked,
        },
        travel_date: date,
        available_seats: availableSeats,
        booked_seats: bookedSeats,
        effective_price: effectivePrice,
        effective_sleeper_price: effectiveSleeperPrice,
        avg_rating: Math.round(avgRating * 10) / 10,
        review_count: reviewCount,
        boarding_points: getBoardingPointsForCity(route.origin_city_id),
        dropping_points: getDroppingPointsForCity(route.destination_city_id),
      };

      results.push(tripResult);
    }
  }

  // Sort by departure time
  results.sort((a, b) =>
    a.schedule.departure_time.localeCompare(b.schedule.departure_time)
  );

  return results;
}

// ── Mock booking helpers ──

let bookingCounter = 1000;

export function generateBookingId(): string {
  bookingCounter++;
  return `RDX${bookingCounter}`;
}

export function generateMockPaymentId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createMockBooking(params: {
  userId: string;
  schedule: Schedule;
  travelDate: string;
  totalAmount: number;
  contactEmail: string;
  contactPhone: string;
  passengers: {
    seatNumber: string;
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    isPrimary: boolean;
  }[];
}): { booking: Booking; passengers: BookingPassenger[] } {
  const bookingId = generateBookingId();
  const paymentId = generateMockPaymentId();
  const now = new Date().toISOString();

  const booking: Booking = {
    id: bookingId,
    user_id: params.userId,
    schedule_id: params.schedule.id,
    travel_date: params.travelDate,
    status: "confirmed",
    total_amount: params.totalAmount,
    refund_amount: null,
    payment_id: paymentId,
    payment_status: "paid",
    contact_email: params.contactEmail,
    contact_phone: params.contactPhone,
    booked_at: now,
    cancelled_at: null,
    cancellation_reason: null,
  };

  const passengers: BookingPassenger[] = params.passengers.map((p, i) => ({
    id: `${bookingId}-p${i + 1}`,
    booking_id: bookingId,
    seat_number: p.seatNumber,
    name: p.name,
    age: p.age,
    gender: p.gender,
    is_primary: p.isPrimary,
  }));

  return { booking, passengers };
}
