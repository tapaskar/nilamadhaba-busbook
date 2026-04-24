"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  MapPin,
  Clock,
  Bus,
  User,
  Mail,
  Phone,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  ShieldCheck,
  Loader2,
  ChevronDown,
  Tag,
  Info,
} from "lucide-react";
import { useBooking, type PassengerDetail } from "@/lib/store";
import { formatPrice, formatTime, formatDuration } from "@/lib/constants";

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking", icon: Building2, desc: "All major banks" },
  { id: "wallet", label: "Wallet", icon: Wallet, desc: "Paytm, Amazon Pay" },
];

export default function BookingPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const { selectedTrip, selectedSeats, boardingStop, droppingStop } = state;

  const [passengers, setPassengers] = useState<PassengerDetail[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [isPaying, setIsPaying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if no trip/seats selected
  useEffect(() => {
    if (!selectedTrip || selectedSeats.length === 0) {
      router.push("/");
    }
  }, [selectedTrip, selectedSeats, router]);

  // Initialize passenger forms from selected seats
  useEffect(() => {
    if (selectedSeats.length > 0 && passengers.length === 0) {
      setPassengers(
        selectedSeats.map((seatId, i) => ({
          seatNumber: seatId,
          name: "",
          age: 0,
          gender: "male" as const,
          isPrimary: i === 0,
        }))
      );
    }
  }, [selectedSeats, passengers.length]);

  if (!selectedTrip || selectedSeats.length === 0) {
    return null;
  }

  const trip = selectedTrip;
  const schedule = trip.schedule;
  const bus = schedule.bus;
  const route = schedule.route;
  const duration = route.estimated_duration_minutes ?? 0;

  // Find seat label from seat id
  function getSeatLabel(seatId: string): string {
    for (const deck of bus.seat_layout.decks) {
      const seat = deck.seats.find((s) => s.id === seatId);
      if (seat) return seat.label;
    }
    return seatId;
  }

  // Calculate pricing
  function getSeatPrice(seatId: string): number {
    for (const deck of bus.seat_layout.decks) {
      const seat = deck.seats.find((s) => s.id === seatId);
      if (seat && seat.price_tier === "sleeper" && trip.effective_sleeper_price) {
        return trip.effective_sleeper_price;
      }
    }
    return trip.effective_price;
  }

  const seatPrices = selectedSeats.map((id) => ({ id, price: getSeatPrice(id), label: getSeatLabel(id) }));
  const baseFare = seatPrices.reduce((sum, s) => sum + s.price, 0);
  const loyaltyDiscount = Math.round(baseFare * 0.05);
  const afterDiscount = baseFare - loyaltyDiscount;
  const gst = Math.round(afterDiscount * 0.05);
  const grandTotal = afterDiscount + gst;

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    passengers.forEach((p, i) => {
      if (!p.name.trim()) newErrors[`name-${i}`] = "Name is required";
      if (!p.age || p.age < 1 || p.age > 120) newErrors[`age-${i}`] = "Valid age required";
    });
    if (!contactEmail.trim() || !/\S+@\S+\.\S+/.test(contactEmail))
      newErrors.email = "Valid email required";
    if (!contactPhone.trim() || contactPhone.replace(/\D/g, "").length < 10)
      newErrors.phone = "Valid phone required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function updatePassenger(index: number, field: keyof PassengerDetail, value: string | number | boolean) {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }

  async function handlePay() {
    if (!validate()) return;
    setIsPaying(true);

    // Dispatch passengers to store
    dispatch({ type: "SET_PASSENGERS", payload: passengers });

    // Compute total (mirror of reducer logic, but we need it before POST)
    let totalAmount = 0;
    for (const p of passengers) {
      const seatInfo = bus.seat_layout.decks
        .flatMap((d) => d.seats)
        .find((s) => s.id === p.seatNumber);
      if (
        seatInfo?.price_tier === "sleeper" &&
        trip.effective_sleeper_price
      ) {
        totalAmount += trip.effective_sleeper_price;
      } else {
        totalAmount += trip.effective_price;
      }
    }

    // POST to the bookings API — works in both live (Supabase) and demo mode
    let serverBookingId: string | null = null;
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: schedule.id,
          travelDate: trip.travel_date,
          totalAmount,
          contactEmail,
          contactPhone,
          passengers: passengers.map((p) => ({
            seat_number: p.seatNumber,
            name: p.name,
            age: Number(p.age),
            gender: p.gender,
            is_primary: p.isPrimary,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error || "Payment failed. Please try again." });
        setIsPaying(false);
        return;
      }
      serverBookingId = data.id as string;
    } catch (e) {
      console.error("Booking POST failed:", e);
      // Continue with mock booking id in case of network failure (demo-safe)
    }

    // Confirm booking locally
    dispatch({
      type: "CONFIRM_BOOKING",
      payload: { contactEmail, contactPhone, serverBookingId },
    });

    setIsPaying(false);
  }

  // After CONFIRM_BOOKING, the confirmedBooking will be set
  // We watch for it and navigate
  useEffect(() => {
    if (state.confirmedBooking && state.bookingState === "confirmed") {
      router.push(`/confirmation/${state.confirmedBooking.booking.id}`);
    }
  }, [state.confirmedBooking, state.bookingState, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Review & Pay</h1>
          <p className="text-sm text-gray-500 mt-1">Review your trip details and complete payment</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Trip Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-dark px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Trip Summary
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Route */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">From</p>
                <p className="text-lg font-bold text-gray-900">{route.origin_city.name}</p>
                <p className="text-sm font-semibold text-primary">{formatTime(schedule.departure_time)}</p>
                {boardingStop && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {boardingStop.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center px-4">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDuration(duration)}
                </div>
                <div className="w-24 h-px bg-gray-300 relative">
                  <ArrowRight className="h-4 w-4 text-gray-400 absolute -right-2 -top-2" />
                </div>
                <p className="text-xs text-gray-400 mt-1">{route.distance_km} km</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">To</p>
                <p className="text-lg font-bold text-gray-900">{route.destination_city.name}</p>
                <p className="text-sm font-semibold text-primary">{formatTime(schedule.arrival_time)}</p>
                {droppingStop && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 justify-end">
                    <MapPin className="h-3 w-3" /> {droppingStop.name}
                  </p>
                )}
              </div>
            </div>

            {/* Bus info + Seats */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                <Bus className="h-4 w-4 text-gray-400" />
                {bus.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 capitalize">
                {bus.bus_type.replace("_", " ")}
              </span>
              <span className="text-sm text-gray-500">{trip.travel_date}</span>
            </div>

            {/* Selected seats */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-sm text-gray-500">Seats:</span>
              {selectedSeats.map((seatId) => (
                <span
                  key={seatId}
                  className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200"
                >
                  {getSeatLabel(seatId)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              Passenger Details
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {passengers.map((passenger, idx) => (
              <div key={passenger.seatNumber} className="space-y-4">
                {idx > 0 && <div className="border-t border-gray-100" />}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Passenger {idx + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      Seat {getSeatLabel(passenger.seatNumber)}
                    </span>
                    {idx === 0 && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                        Primary
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                      placeholder="Enter name"
                      className={`w-full rounded-xl border ${errors[`name-${idx}`] ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"} px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                    />
                    {errors[`name-${idx}`] && (
                      <p className="text-xs text-red-500 mt-1">{errors[`name-${idx}`]}</p>
                    )}
                  </div>
                  {/* Age */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Age</label>
                    <input
                      type="number"
                      value={passenger.age || ""}
                      onChange={(e) => updatePassenger(idx, "age", parseInt(e.target.value) || 0)}
                      placeholder="Age"
                      min={1}
                      max={120}
                      className={`w-full rounded-xl border ${errors[`age-${idx}`] ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"} px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                    />
                    {errors[`age-${idx}`] && (
                      <p className="text-xs text-red-500 mt-1">{errors[`age-${idx}`]}</p>
                    )}
                  </div>
                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Gender</label>
                    <div className="flex items-center gap-3 pt-1.5">
                      {(["male", "female", "other"] as const).map((g) => (
                        <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${idx}`}
                            checked={passenger.gender === g}
                            onChange={() => updatePassenger(idx, "gender", g)}
                            className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 capitalize">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Contact info */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="email@example.com"
                      className={`w-full rounded-xl border ${errors.email ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"} pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full rounded-xl border ${errors.phone ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"} pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Breakdown + Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fare Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-400" />
                Fare Breakdown
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {seatPrices.map((sp) => (
                <div key={sp.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Seat {sp.label}</span>
                  <span className="text-gray-900 font-medium">{formatPrice(sp.price)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">Base Fare</span>
                <span className="text-gray-900 font-medium">{formatPrice(baseFare)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  Loyalty Discount (5%)
                </span>
                <span className="text-emerald-600 font-medium">-{formatPrice(loyaltyDiscount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">GST (5%)</span>
                <span className="text-gray-900 font-medium">{formatPrice(gst)}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(grandTotal)}</span>
              </div>

              {/* Free cancellation note */}
              <div className="mt-4 flex items-start gap-2 bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-700">
                  Free cancellation until 12 hours before departure. Full refund to original payment method.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-400" />
                Payment Method
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`w-full flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary-light"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-gray-900"}`}>
                        {pm.label}
                      </p>
                      <p className="text-xs text-gray-500">{pm.desc}</p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-primary" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <div className="pb-8">
          <button
            onClick={handlePay}
            disabled={isPaying}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl py-4 shadow-lg shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-3"
          >
            {isPaying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Pay {formatPrice(grandTotal)}
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <Info className="h-3 w-3" />
            Secured by 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}
