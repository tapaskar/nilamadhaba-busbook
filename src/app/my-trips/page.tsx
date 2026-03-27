"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Ticket,
  MapPin,
  Clock,
  Bus,
  ArrowRight,
  Users,
  Search,
  CalendarDays,
  AlertTriangle,
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useBooking, type ConfirmedBookingInfo } from "@/lib/store";
import { formatPrice, formatTime, formatDuration } from "@/lib/constants";

type TabType = "upcoming" | "completed" | "cancelled";

const tabs: { id: TabType; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function MyTripsPage() {
  const { state, dispatch } = useBooking();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const allBookings = state.myBookings;

  // Categorize bookings
  const today = new Date().toISOString().split("T")[0];

  function categorize(b: ConfirmedBookingInfo): TabType {
    if (b.booking.status === "cancelled") return "cancelled";
    if (b.booking.status === "completed") return "completed";
    // If travel date is in the past, treat as completed
    if (b.booking.travel_date < today) return "completed";
    return "upcoming";
  }

  const filteredBookings = allBookings.filter((b) => categorize(b) === activeTab);

  function handleCancel(bookingId: string) {
    dispatch({ type: "CANCEL_BOOKING", payload: bookingId });
    setCancelDialogId(null);
  }

  function getSeatLabel(seatId: string, busLayout: ConfirmedBookingInfo["trip"]["schedule"]["bus"]["seat_layout"]): string {
    for (const deck of busLayout.decks) {
      const seat = deck.seats.find((s) => s.id === seatId);
      if (seat) return seat.label;
    }
    return seatId;
  }

  function getStatusBadge(b: ConfirmedBookingInfo) {
    const cat = categorize(b);
    switch (cat) {
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
    }
  }

  const tabCounts = {
    upcoming: allBookings.filter((b) => categorize(b) === "upcoming").length,
    completed: allBookings.filter((b) => categorize(b) === "completed").length,
    cancelled: allBookings.filter((b) => categorize(b) === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            My Trips
          </h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your bus bookings</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-6 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {tabCounts[tab.id] > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tabCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Booking cards */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              {activeTab === "upcoming" && <CalendarDays className="h-8 w-8 text-gray-300" />}
              {activeTab === "completed" && <CheckCircle2 className="h-8 w-8 text-gray-300" />}
              {activeTab === "cancelled" && <XCircle className="h-8 w-8 text-gray-300" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              No {activeTab} bookings
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {activeTab === "upcoming"
                ? "You don't have any upcoming trips. Search for your first trip!"
                : activeTab === "completed"
                ? "Your completed trips will appear here."
                : "No cancelled bookings to show."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
            >
              <Search className="h-4 w-4" />
              Search Trips
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((info) => {
              const { booking, passengers, trip, boardingStop, droppingStop } = info;
              const schedule = trip.schedule;
              const bus = schedule.bus;
              const route = schedule.route;
              const duration = route.estimated_duration_minutes ?? 0;
              const cat = categorize(info);

              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                    cat === "cancelled"
                      ? "border-red-100 opacity-75"
                      : "border-gray-100"
                  }`}
                >
                  {/* Top section */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Booking ID</p>
                        <p className="text-sm font-bold text-gray-900">{booking.id}</p>
                      </div>
                      {getStatusBadge(info)}
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1">
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          {route.origin_city.name}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatTime(schedule.departure_time)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <div className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDuration(duration)}
                        </div>
                        <div className="w-16 sm:w-24 h-px bg-gray-200 relative">
                          <ArrowRight className="h-3.5 w-3.5 text-gray-300 absolute -right-1.5 -top-1.5" />
                        </div>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          {route.destination_city.name}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatTime(schedule.arrival_time)}
                        </p>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
                        {booking.travel_date}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600 capitalize">
                        {bus.bus_type.replace("_", " ")}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
                        {bus.name}
                      </span>
                    </div>

                    {/* Passengers + Seats */}
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {passengers.map((p) => p.name).join(", ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs text-gray-500">Seats:</span>
                      {passengers.map((p) => (
                        <span
                          key={p.id}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200"
                        >
                          {getSeatLabel(p.seat_number, bus.seat_layout)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="border-t border-gray-100 bg-gray-50 px-5 sm:px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Amount Paid</p>
                      <p className="text-base font-bold text-gray-900">{formatPrice(booking.total_amount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {cat === "upcoming" && (
                        <button
                          onClick={() => setCancelDialogId(booking.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Booking
                        </button>
                      )}
                      <Link
                        href={`/confirmation/${booking.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                      >
                        View Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelDialogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setCancelDialogId(null)}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setCancelDialogId(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Booking?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to cancel this booking? Refund will be processed based on our cancellation policy.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setCancelDialogId(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => handleCancel(cancelDialogId)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
