"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  Clock,
  IndianRupee,
  Star,
  Timer,
  Search,
  Bus,
} from "lucide-react";
import TripCard from "@/components/TripCard";
import {
  getCityById,
  type TripSearchResult,
} from "@/lib/mock-data";
import { useBooking } from "@/lib/store";
import { formatPrice } from "@/lib/constants";

type SortOption = "departure" | "price_low" | "rating" | "duration";

const sortOptions: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: "departure", label: "Departure", icon: Clock },
  { value: "price_low", label: "Price", icon: IndianRupee },
  { value: "rating", label: "Rating", icon: Star },
  { value: "duration", label: "Duration", icon: Timer },
];

type BusFilter = "all" | "ac_sleeper" | "ac_seater" | "non_ac";

const filterChips: { value: BusFilter; label: string }[] = [
  { value: "all", label: "All Buses" },
  { value: "ac_sleeper", label: "AC Sleeper" },
  { value: "ac_seater", label: "AC Seater" },
  { value: "non_ac", label: "Non-AC" },
];

function formatSearchDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, dispatch } = useBooking();

  const fromId = searchParams.get("from") || "";
  const toId = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";

  const fromCity = getCityById(fromId);
  const toCity = getCityById(toId);

  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState<SortOption>("departure");
  const [filterBy, setFilterBy] = useState<BusFilter>("all");

  // Fetch trips from API (Supabase in live mode, mocks in demo mode)
  useEffect(() => {
    if (!fromId || !toId || !date) {
      setLoading(false);
      return;
    }
    const abort = new AbortController();
    setLoading(true);
    fetch(`/api/trips?from=${fromId}&to=${toId}&date=${date}`, {
      signal: abort.signal,
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        setTrips((data?.trips ?? []) as TripSearchResult[]);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("Trip search failed:", err);
          setTrips([]);
          setLoading(false);
        }
      });
    return () => abort.abort();
  }, [fromId, toId, date]);

  // Filter trips
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Filter
    if (filterBy === "ac_sleeper") {
      result = result.filter(
        (t) =>
          t.schedule.bus.bus_type === "sleeper" &&
          t.schedule.bus.amenities.includes("AC")
      );
    } else if (filterBy === "ac_seater") {
      result = result.filter(
        (t) =>
          t.schedule.bus.bus_type === "seater" &&
          t.schedule.bus.amenities.includes("AC")
      );
    } else if (filterBy === "non_ac") {
      result = result.filter(
        (t) => !t.schedule.bus.amenities.includes("AC")
      );
    }

    // Sort
    switch (sortBy) {
      case "departure":
        result.sort((a, b) =>
          a.schedule.departure_time.localeCompare(b.schedule.departure_time)
        );
        break;
      case "price_low":
        result.sort((a, b) => a.effective_price - b.effective_price);
        break;
      case "rating":
        result.sort((a, b) => b.avg_rating - a.avg_rating);
        break;
      case "duration":
        result.sort(
          (a, b) =>
            (a.schedule.route.estimated_duration_minutes || 0) -
            (b.schedule.route.estimated_duration_minutes || 0)
        );
        break;
    }

    return result;
  }, [trips, sortBy, filterBy]);

  // Seat selection for a specific trip
  const handleSeatClick = useCallback(
    (tripId: string, seatId: string) => {
      setSelectedSeats((prev) => {
        const current = prev[tripId] || [];
        if (current.includes(seatId)) {
          return { ...prev, [tripId]: current.filter((s) => s !== seatId) };
        }
        if (current.length >= 6) return prev;
        return { ...prev, [tripId]: [...current, seatId] };
      });
    },
    []
  );

  // Continue to booking
  function handleContinue(trip: TripSearchResult) {
    const seats = selectedSeats[trip.schedule.id] || [];
    if (seats.length === 0) return;

    // Set search params in store
    dispatch({
      type: "SET_SEARCH",
      payload: { from: fromId, to: toId, date },
    });

    // Set selected trip
    dispatch({ type: "SET_TRIP", payload: trip });

    // Set selected seats
    for (const seatId of seats) {
      dispatch({ type: "SELECT_SEAT", payload: seatId });
    }

    // Set default boarding and dropping points
    if (trip.boarding_points.length > 0) {
      dispatch({ type: "SET_BOARDING", payload: trip.boarding_points[0] });
    }
    if (trip.dropping_points.length > 0) {
      dispatch({ type: "SET_DROPPING", payload: trip.dropping_points[0] });
    }

    dispatch({ type: "SET_BOOKING_STATE", payload: "review" });

    router.push("/booking");
  }

  // Calculate total price for a trip's selected seats
  function getTotalPrice(trip: TripSearchResult): number {
    const seats = selectedSeats[trip.schedule.id] || [];
    let total = 0;
    for (const seatId of seats) {
      const seatInfo = trip.schedule.bus.seat_layout.decks
        .flatMap((d) => d.seats)
        .find((s) => s.id === seatId);
      if (seatInfo && seatInfo.price_tier === "sleeper" && trip.effective_sleeper_price) {
        total += trip.effective_sleeper_price;
      } else {
        total += trip.effective_price;
      }
    }
    return total;
  }

  // Currently selected trip's seat count
  const activeTrip = expandedTripId
    ? trips.find((t) => t.schedule.id === expandedTripId)
    : null;
  const activeSeats = activeTrip
    ? selectedSeats[activeTrip.schedule.id] || []
    : [];

  if (!fromId || !toId || !date) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Search for buses
        </h2>
        <p className="text-gray-500 mb-6">
          Please go back and enter your travel details to find buses.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Search Summary Bar ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-base">
              <span className="font-bold text-gray-900">
                {fromCity?.name || fromId}
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="font-bold text-gray-900">
                {toCity?.name || toId}
              </span>
              <span className="text-gray-300 mx-1">|</span>
              <span className="text-gray-500">{formatSearchDate(date)}</span>
              {!loading && (
                <>
                  <span className="text-gray-300 mx-1">|</span>
                  <span className="text-gray-500">
                    {filteredTrips.length} bus{filteredTrips.length !== 1 ? "es" : ""} found
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Modify Search
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Sort & Filter ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
              Sort by
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {sortOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortBy(opt.value)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      sortBy === opt.value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-1.5 flex-wrap">
            {filterChips.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setFilterBy(chip.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  filterBy === chip.value
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-16 bg-gray-200 rounded" />
                      <div className="flex-1 h-1 bg-gray-200 rounded" />
                      <div className="h-6 w-16 bg-gray-200 rounded" />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <div className="h-5 w-24 bg-gray-100 rounded-full" />
                      <div className="h-5 w-20 bg-gray-100 rounded-full" />
                      <div className="h-5 w-16 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                  <div className="shrink-0 text-right space-y-2">
                    <div className="h-5 w-12 bg-gray-200 rounded ml-auto" />
                    <div className="h-7 w-16 bg-gray-200 rounded ml-auto" />
                    <div className="h-4 w-20 bg-gray-100 rounded ml-auto" />
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 flex justify-between">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-8 w-28 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Trip List ── */}
        {!loading && filteredTrips.length > 0 && (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.schedule.id}
                trip={trip.schedule}
                isExpanded={expandedTripId === trip.schedule.id}
                onToggle={() =>
                  setExpandedTripId(
                    expandedTripId === trip.schedule.id
                      ? null
                      : trip.schedule.id
                  )
                }
                onSelectSeat={(seatId) =>
                  handleSeatClick(trip.schedule.id, seatId)
                }
                selectedSeats={selectedSeats[trip.schedule.id] || []}
                bookedSeats={trip.booked_seats}
              />
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && filteredTrips.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 px-6 text-center">
            <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No buses found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {trips.length > 0
                ? "No buses match your current filters. Try adjusting your filter selection."
                : "No buses on this route for the selected date. Try a different date or route."}
            </p>
            {trips.length > 0 ? (
              <button
                type="button"
                onClick={() => setFilterBy("all")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
              >
                Show All Buses
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Modify Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Sticky Continue Bar ── */}
      {activeTrip && activeSeats.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {activeSeats.length} seat{activeSeats.length !== 1 ? "s" : ""}{" "}
                  selected
                </p>
                <p className="text-xs text-gray-400">
                  {activeSeats.join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(getTotalPrice(activeTrip))}
                </p>
                <button
                  type="button"
                  onClick={() => handleContinue(activeTrip)}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading search results...</p>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
