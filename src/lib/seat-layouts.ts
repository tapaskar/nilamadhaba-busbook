/**
 * Preset seat layouts — admin picks one when creating a new bus so they
 * don't have to hand-craft JSON. Each preset mirrors what mock-data.ts
 * uses for the seeded fleet.
 */

import type { SeatLayout, Seat } from "./types";

function sleeper21(rows: number): SeatLayout {
  const makeDeck = (deckPrefix: "L" | "U"): Seat[] => {
    const seats: Seat[] = [];
    for (let row = 0; row < rows; row++) {
      seats.push({ id: `${deckPrefix}-L${row + 1}`,  label: `${deckPrefix}L${row + 1}`,  row, col: 0, rowSpan: 1, colSpan: 1, type: "sleeper", price_tier: deckPrefix === "U" ? "base" : "sleeper", ladies_only: row === rows - 1 });
      seats.push({ id: `${deckPrefix}-L${row + 1}A`, label: `${deckPrefix}L${row + 1}A`, row, col: 1, rowSpan: 1, colSpan: 1, type: "sleeper", price_tier: deckPrefix === "U" ? "base" : "sleeper", ladies_only: row === rows - 1 });
      seats.push({ id: `${deckPrefix}-R${row + 1}`,  label: `${deckPrefix}R${row + 1}`,  row, col: 3, rowSpan: 1, colSpan: 1, type: "sleeper", price_tier: deckPrefix === "U" ? "base" : "sleeper", ladies_only: false });
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

function seater22(rows: number): SeatLayout {
  const seats: Seat[] = [];
  for (let row = 0; row < rows; row++) {
    seats.push({ id: `S-${row + 1}A`, label: `${row + 1}A`, row, col: 0, rowSpan: 1, colSpan: 1, type: "seater", price_tier: "base", ladies_only: false });
    seats.push({ id: `S-${row + 1}B`, label: `${row + 1}B`, row, col: 1, rowSpan: 1, colSpan: 1, type: "seater", price_tier: "base", ladies_only: false });
    seats.push({ id: `S-${row + 1}C`, label: `${row + 1}C`, row, col: 3, rowSpan: 1, colSpan: 1, type: "seater", price_tier: "base", ladies_only: false });
    seats.push({ id: `S-${row + 1}D`, label: `${row + 1}D`, row, col: 4, rowSpan: 1, colSpan: 1, type: "seater", price_tier: "base", ladies_only: row === rows - 1 });
  }
  return { version: 1, decks: [{ name: "Main Deck", rows, cols: 5, seats }] };
}

export type LayoutPreset = {
  id: string;
  label: string;
  description: string;
  totalSeats: number;
  bus_type: "seater" | "sleeper" | "semi_sleeper";
  build: () => SeatLayout;
};

export const layoutPresets: LayoutPreset[] = [
  {
    id: "ac-sleeper-48",
    label: "AC Sleeper · 2+1 · 48 berths",
    description: "Standard Volvo B11R layout. 8 rows × 2 decks, 3 berths per row.",
    totalSeats: 48,
    bus_type: "sleeper",
    build: () => sleeper21(8),
  },
  {
    id: "ac-sleeper-premium-36",
    label: "Premium AC Sleeper · 2+1 · 36 berths",
    description: "Scania premium with extra legroom. 6 rows × 2 decks.",
    totalSeats: 36,
    bus_type: "sleeper",
    build: () => sleeper21(6),
  },
  {
    id: "non-ac-sleeper-60",
    label: "Non-AC Sleeper · 2+1 · 60 berths",
    description: "Budget sleeper — 10 rows × 2 decks.",
    totalSeats: 60,
    bus_type: "sleeper",
    build: () => sleeper21(10),
  },
  {
    id: "ac-seater-48",
    label: "AC Seater · 2+2 · 48 seats",
    description: "Single-deck Volvo 9600 coach. 12 rows, 4 seats per row.",
    totalSeats: 48,
    bus_type: "seater",
    build: () => seater22(12),
  },
];

export function findLayout(id: string): LayoutPreset | undefined {
  return layoutPresets.find((p) => p.id === id);
}
