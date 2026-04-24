"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  MapPin,
  Clock,
  Bus,
  ArrowRight,
  Users,
  QrCode,
  Navigation,
  Download,
  Share2,
  Search,
  Star,
  Gift,
  ChevronRight,
} from "lucide-react";
import { useBooking, type ConfirmedBookingInfo } from "@/lib/store";
import { formatPrice, formatTime, formatDuration } from "@/lib/constants";

export default function ConfirmationPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const { state } = useBooking();
  const [mounted, setMounted] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger animation after mount
    const timer = setTimeout(() => setShowCheck(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Find booking from confirmedBooking or myBookings
  let bookingInfo: ConfirmedBookingInfo | null = null;
  if (state.confirmedBooking?.booking.id === bookingId) {
    bookingInfo = state.confirmedBooking;
  } else {
    bookingInfo = state.myBookings.find((b) => b.booking.id === bookingId) ?? null;
  }

  if (!mounted) return null;

  if (!bookingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t find booking {bookingId}. It may have expired or the page was refreshed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
          >
            <Search className="h-4 w-4" />
            Search Trips
          </Link>
        </div>
      </div>
    );
  }

  const { booking, passengers, trip, boardingStop, droppingStop } = bookingInfo;
  const schedule = trip.schedule;
  const bus = schedule.bus;
  const route = schedule.route;
  const duration = route.estimated_duration_minutes ?? 0;

  function getSeatLabel(seatId: string): string {
    for (const deck of bus.seat_layout.decks) {
      const seat = deck.seats.find((s) => s.id === seatId);
      if (seat) return seat.label;
    }
    return seatId;
  }

  const loyaltyPoints = Math.floor(booking.total_amount / 10000) * 5 + 10;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.15),transparent)]" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center relative">
          {/* Animated checkmark */}
          <div
            className={`mx-auto mb-5 transition-all duration-700 ease-out ${
              showCheck
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50"
            }`}
          >
            <div className="relative inline-flex">
              <div
                className={`h-20 w-20 rounded-full bg-white/20 flex items-center justify-center transition-all duration-500 delay-200 ${
                  showCheck ? "scale-100" : "scale-0"
                }`}
              >
                <div
                  className={`h-16 w-16 rounded-full bg-white flex items-center justify-center transition-all duration-500 delay-400 ${
                    showCheck ? "scale-100" : "scale-0"
                  }`}
                >
                  <CheckCircle2
                    className={`h-10 w-10 text-emerald-500 transition-all duration-500 delay-500 ${
                      showCheck ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`}
                  />
                </div>
              </div>
              {/* Pulse ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-white/30 ${
                  showCheck ? "animate-ping" : ""
                }`}
                style={{ animationDuration: "2s", animationIterationCount: "2" }}
              />
            </div>
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-bold text-white mb-2 transition-all duration-500 delay-300 ${
              showCheck ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Booking Confirmed!
          </h1>
          <p
            className={`text-emerald-100 mb-4 transition-all duration-500 delay-500 ${
              showCheck ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Your tickets have been booked successfully
          </p>
          <div
            className={`inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-6 py-3 transition-all duration-500 delay-700 ${
              showCheck ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-emerald-100 text-sm">Booking ID</span>
            <span className="text-white text-xl font-bold tracking-wider">{booking.id}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 -mt-4 pb-10 space-y-5">
        {/* QR + Trip Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* QR Placeholder */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="h-32 w-32 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                  <QrCode className="h-10 w-10 text-gray-300" />
                  <span className="text-[10px] text-gray-400 mt-1.5 font-medium">SCAN TICKET</span>
                </div>
              </div>

              {/* Trip details */}
              <div className="flex-1 space-y-4">
                {/* Route */}
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{route.origin_city.name}</p>
                    <p className="text-sm font-semibold text-primary">{formatTime(schedule.departure_time)}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3">
                    <div className="h-px w-8 bg-gray-300" />
                    <div className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(duration)}
                    </div>
                    <div className="h-px w-8 bg-gray-300 relative">
                      <ArrowRight className="h-3.5 w-3.5 text-gray-400 absolute -right-1.5 -top-1.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{route.destination_city.name}</p>
                    <p className="text-sm font-semibold text-primary">{formatTime(schedule.arrival_time)}</p>
                  </div>
                </div>

                {/* Date + Bus */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
                    {booking.travel_date}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700 capitalize">
                    {bus.bus_type.replace("_", " ")}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
                    {bus.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider with tear effect */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-3 bg-gray-50 rounded-r-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-3 bg-gray-50 rounded-l-full" />
            <div className="border-t border-dashed border-gray-200 mx-6" />
          </div>

          {/* Passengers */}
          <div className="p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              Passengers ({passengers.length})
            </h3>
            <div className="space-y-2">
              {passengers.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{p.name}</span>
                      <span className="text-gray-400 ml-2 text-xs capitalize">
                        {p.gender}, {p.age}y
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    {getSeatLabel(p.seat_number)}
                  </span>
                </div>
              ))}
            </div>

            {/* Amount paid */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount Paid</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(booking.total_amount)}</span>
            </div>
          </div>

          {/* Boarding & Dropping */}
          <div className="bg-gray-50 border-t border-gray-100 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Boarding */}
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Boarding Point</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{boardingStop.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{boardingStop.landmark}</p>
                  <p className="text-xs text-primary font-semibold mt-1">
                    {formatTime(schedule.departure_time)}
                    {boardingStop.time_offset_minutes !== 0 && (
                      <span className="text-gray-400 font-normal">
                        {" "}({boardingStop.time_offset_minutes > 0 ? "+" : ""}{boardingStop.time_offset_minutes}m)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Dropping */}
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Dropping Point</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{droppingStop.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{droppingStop.landmark}</p>
                  <p className="text-xs text-primary font-semibold mt-1">
                    {formatTime(schedule.arrival_time)}
                    {droppingStop.time_offset_minutes !== 0 && (
                      <span className="text-gray-400 font-normal">
                        {" "}({droppingStop.time_offset_minutes > 0 ? "+" : ""}{droppingStop.time_offset_minutes}m)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMS confirmation banner */}
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-500 text-white shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-900">
              Ticket sent to your phone &amp; email
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              SMS delivered to {booking.contact_phone} · Email to{" "}
              <span className="font-medium">{booking.contact_email}</span> — show either at boarding, no internet needed.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href={`/track/${booking.id}`}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm hover:shadow-md hover:border-[#1a3a8f]/30 transition-all group"
          >
            <div className="relative">
              <Navigation className="h-5 w-5 text-[#1a3a8f] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-gray-700">Track Bus</span>
            <span className="text-[10px] text-emerald-600 font-semibold">LIVE</span>
          </Link>
          <button
            disabled
            className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 px-4 py-4 opacity-50 cursor-not-allowed shadow-sm"
          >
            <Download className="h-5 w-5 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Download</span>
            <span className="text-[10px] text-gray-400">Coming Soon</span>
          </button>
          <button
            disabled
            className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 px-4 py-4 opacity-50 cursor-not-allowed shadow-sm"
          >
            <Share2 className="h-5 w-5 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Share Trip</span>
            <span className="text-[10px] text-gray-400">Coming Soon</span>
          </button>
          <Link
            href="/"
            className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm hover:border-primary hover:bg-primary-light transition-all group"
          >
            <Search className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-xs font-medium text-gray-700 group-hover:text-primary transition-colors">
              Book Another
            </span>
            <span className="text-[10px] text-gray-400">New Trip</span>
          </Link>
        </div>

        {/* Loyalty Points Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">+{loyaltyPoints} NilaMadhaba Points Earned!</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Use your points for discounts on future bookings. Keep traveling to earn more!
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-amber-400 shrink-0" />
        </div>
      </div>
    </div>
  );
}
