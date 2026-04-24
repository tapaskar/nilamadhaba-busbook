"use client";

import type { SeatLayout, Seat } from "@/lib/types";
import { CircleDot } from "lucide-react";
import { useT } from "@/lib/i18n";

interface SeatMapProps {
  layout: SeatLayout;
  bookedSeats: string[];
  selectedSeats: string[];
  onSeatClick: (seatId: string) => void;
  maxSelectable?: number;
}

type VisualStatus = "available" | "selected" | "booked" | "ladies_only";

const statusStyles: Record<VisualStatus, string> = {
  available:
    "bg-seat-available/15 border-seat-available text-seat-available hover:bg-seat-available/30 cursor-pointer",
  selected:
    "bg-seat-selected border-seat-selected text-white cursor-pointer ring-2 ring-seat-selected/40",
  booked:
    "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60",
  ladies_only:
    "bg-seat-ladies/15 border-seat-ladies text-seat-ladies hover:bg-seat-ladies/30 cursor-pointer",
};

// Legend — label is a translation key rather than a literal string;
// resolved via useT() inside the render.
const legendItems: { status: VisualStatus; key: string }[] = [
  { status: "available",   key: "seat.available" },
  { status: "selected",    key: "seat.selected"  },
  { status: "booked",      key: "seat.booked"    },
  { status: "ladies_only", key: "seat.ladies"    },
];

function getSeatStatus(
  seat: Seat,
  bookedSeats: string[],
  selectedSeats: string[]
): VisualStatus {
  if (bookedSeats.includes(seat.id)) return "booked";
  if (selectedSeats.includes(seat.id)) return "selected";
  if (seat.ladies_only) return "ladies_only";
  return "available";
}

export default function SeatMap({
  layout,
  bookedSeats,
  selectedSeats,
  onSeatClick,
  maxSelectable = 6,
}: SeatMapProps) {
  const t = useT();
  const handleClick = (seat: Seat) => {
    const status = getSeatStatus(seat, bookedSeats, selectedSeats);
    if (status === "booked") return;
    if (
      status === "available" || status === "ladies_only"
        ? selectedSeats.length >= maxSelectable
        : false
    ) {
      return;
    }
    onSeatClick(seat.id);
  };

  return (
    <div className="space-y-4">
      {/* Prominent seat legend — pinned at the top so it's seen before scanning seats */}
      <div className="rounded-xl bg-[#e8edf8]/60 border border-[#1a3a8f]/10 px-4 py-3">
        <p className="text-[10px] font-bold text-[#1a3a8f] uppercase tracking-wider mb-2">
          {t("seat.colourGuide")}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {legendItems.map(({ status, key }) => (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className={`inline-block h-5 w-5 rounded-md border-2 ${statusStyles[status]}`}
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-gray-700">{t(key)}</span>
            </div>
          ))}
        </div>
      </div>

      {layout.decks.map((deck) => {
        // Build a grid from seats
        const grid: (Seat | null)[][] = Array.from(
          { length: deck.rows },
          () => Array.from({ length: deck.cols }, () => null)
        );
        // Track cells occupied by rowSpan/colSpan
        const occupied = new Set<string>();

        deck.seats.forEach((seat) => {
          for (let r = seat.row; r < seat.row + seat.rowSpan; r++) {
            for (let c = seat.col; c < seat.col + seat.colSpan; c++) {
              occupied.add(`${r}-${c}`);
            }
          }
          if (grid[seat.row]) {
            grid[seat.row][seat.col] = seat;
          }
        });

        return (
          <div key={deck.name} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {deck.name === "Lower Deck"
                ? t("seat.lowerDeck")
                : deck.name === "Upper Deck"
                  ? t("seat.upperDeck")
                  : deck.name === "Main Deck"
                    ? t("seat.mainDeck")
                    : deck.name}
            </h4>

            {/* Steering icon */}
            <div className="flex justify-end mb-2 pr-1">
              <div className="flex items-center gap-1 text-gray-400">
                <CircleDot className="h-5 w-5" />
                <span className="text-[10px] font-medium uppercase">{t("seat.driver")}</span>
              </div>
            </div>

            {/* Seat grid */}
            <div
              className="grid gap-1.5 mx-auto w-fit"
              style={{
                gridTemplateColumns: `repeat(${deck.cols}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, rowIdx) =>
                row.map((seat, colIdx) => {
                  const key = `${rowIdx}-${colIdx}`;

                  // Skip cells occupied by a multi-span seat (but not the origin cell)
                  if (!seat && occupied.has(key)) {
                    return null;
                  }

                  // Empty gap
                  if (!seat) {
                    return <div key={key} className="w-10 h-10 sm:w-12 sm:h-12" />;
                  }

                  const status = getSeatStatus(seat, bookedSeats, selectedSeats);

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => handleClick(seat)}
                      disabled={status === "booked"}
                      title={`${seat.label} - ${seat.type}${seat.ladies_only ? " (Ladies)" : ""}`}
                      className={`
                        relative flex items-center justify-center rounded-lg border-2 text-xs font-bold
                        transition-all duration-150
                        ${statusStyles[status]}
                        ${seat.colSpan > 1 ? "w-[calc(theme(spacing.10)*2+theme(spacing.1.5))] sm:w-[calc(theme(spacing.12)*2+theme(spacing.1.5))]" : "w-10 sm:w-12"}
                        ${seat.rowSpan > 1 ? "h-[calc(theme(spacing.10)*2+theme(spacing.1.5))] sm:h-[calc(theme(spacing.12)*2+theme(spacing.1.5))]" : "h-10 sm:h-12"}
                      `}
                      style={{
                        gridColumn:
                          seat.colSpan > 1
                            ? `${colIdx + 1} / span ${seat.colSpan}`
                            : undefined,
                        gridRow:
                          seat.rowSpan > 1
                            ? `${rowIdx + 1} / span ${seat.rowSpan}`
                            : undefined,
                      }}
                    >
                      {seat.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {selectedSeats.length > 0 && (
        <p className="text-xs text-gray-500">
          {selectedSeats.length} of {maxSelectable} seats selected
        </p>
      )}
    </div>
  );
}
