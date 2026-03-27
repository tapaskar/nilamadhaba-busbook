"use client";

import { useMemo } from "react";
import {
  Clock,
  Star,
  Wifi,
  Zap,
  Droplets,
  Tv,
  Armchair,
  ChevronDown,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import type { ScheduleWithDetails } from "@/lib/types";
import SeatMap from "./SeatMap";

interface TripCardProps {
  trip: ScheduleWithDetails;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectSeat: (seatId: string) => void;
  selectedSeats: string[];
  bookedSeats: string[];
}

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi,
  charging: Zap,
  water: Droplets,
  entertainment: Tv,
  recliner: Armchair,
};

function formatTime(time: string): string {
  // time is HH:MM:SS or HH:MM
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "--";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : ""}`.trim();
}

function formatPrice(paise: number): string {
  return `\u20B9${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

function busTypeLabel(type: string): string {
  switch (type) {
    case "sleeper":
      return "Sleeper";
    case "semi_sleeper":
      return "Semi Sleeper";
    default:
      return "Seater";
  }
}

export default function TripCard({
  trip,
  isExpanded,
  onToggle,
  onSelectSeat,
  selectedSeats,
  bookedSeats,
}: TripCardProps) {
  const duration = trip.route.estimated_duration_minutes;
  const availableSeats = useMemo(
    () => trip.bus.total_seats - (trip.booked_seat_count ?? 0),
    [trip.bus.total_seats, trip.booked_seat_count]
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Main row */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Times & route */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {formatTime(trip.departure_time)}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {trip.route.origin_city.name}
                </p>
              </div>

              <div className="flex flex-col items-center flex-1 px-2">
                <span className="text-xs text-gray-400 mb-0.5">
                  {formatDuration(duration)}
                </span>
                <div className="w-full flex items-center">
                  <div className="h-0.5 flex-1 bg-gray-300 rounded" />
                  <div className="h-2 w-2 rounded-full bg-primary mx-1" />
                  <div className="h-0.5 flex-1 bg-gray-300 rounded" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {formatTime(trip.arrival_time)}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {trip.route.destination_city.name}
                </p>
              </div>
            </div>

            {/* Bus info line */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                {trip.bus.name}
              </span>
              <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                {busTypeLabel(trip.bus.bus_type)}
              </span>
              {trip.bus.amenities.slice(0, 4).map((amenity) => {
                const Icon = amenityIcons[amenity.toLowerCase()];
                return Icon ? (
                  <span
                    key={amenity}
                    title={amenity}
                    className="inline-flex items-center rounded-full bg-gray-50 p-1 text-gray-500"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span
                    key={amenity}
                    className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                  >
                    {amenity}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Rating, price, seats */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
            {/* Rating */}
            {trip.avg_rating !== undefined && trip.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-0.5 rounded-md bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">
                  <Star className="h-3 w-3 fill-current" />
                  {trip.avg_rating.toFixed(1)}
                </span>
                {trip.review_count !== undefined && (
                  <span className="text-xs text-gray-400">
                    ({trip.review_count})
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(trip.base_price)}
            </p>

            {/* Available seats */}
            <span
              className={`text-xs font-semibold ${
                availableSeats <= 5
                  ? "text-primary"
                  : availableSeats <= 15
                    ? "text-amber-600"
                    : "text-green-600"
              }`}
            >
              {availableSeats} seat{availableSeats !== 1 ? "s" : ""} left
            </span>
          </div>
        </div>

        {/* On-time + expand row */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              On-time
            </span>
            {trip.route.distance_km && (
              <span className="text-xs text-gray-400">
                {trip.route.distance_km} km
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-light transition-colors"
          >
            {isExpanded ? "Hide" : "Select Seats"}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded section */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5 space-y-5">
          {/* Boarding / Dropping points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-green-600" />
                Boarding Point
              </h4>
              <p className="text-sm text-gray-600">
                {trip.route.origin_city.name} Bus Stand
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatTime(trip.departure_time)}
              </p>
            </div>
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                Dropping Point
              </h4>
              <p className="text-sm text-gray-600">
                {trip.route.destination_city.name} Bus Stand
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatTime(trip.arrival_time)}
              </p>
            </div>
          </div>

          {/* Seat map */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Select Seats
            </h4>
            <SeatMap
              layout={trip.bus.seat_layout}
              bookedSeats={bookedSeats}
              selectedSeats={selectedSeats}
              onSeatClick={onSelectSeat}
            />
          </div>

          {/* Price summary when seats selected */}
          {selectedSeats.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm text-gray-500">
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""} selected
                </p>
                <p className="text-xs text-gray-400">
                  {selectedSeats.join(", ")}
                </p>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(trip.base_price * selectedSeats.length)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
