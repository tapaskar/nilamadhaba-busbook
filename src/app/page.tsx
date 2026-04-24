"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Search,
  Clock,
  ShieldCheck,
  MapPinned,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Bus,
} from "lucide-react";
import CityPicker from "@/components/CityPicker";
import DatePicker from "@/components/DatePicker";
import { cities } from "@/lib/mock-data";
import { formatPrice, formatDuration } from "@/lib/constants";

const popularRoutes = [
  {
    from: "city-blr",
    to: "city-chn",
    fromName: "Bengaluru",
    toName: "Chennai",
    price: 69900,
    duration: 360,
    frequency: "40+ daily",
  },
  {
    from: "city-blr",
    to: "city-hyd",
    fromName: "Bengaluru",
    toName: "Hyderabad",
    price: 59900,
    duration: 510,
    frequency: "25+ daily",
  },
  {
    from: "city-blr",
    to: "city-goa",
    fromName: "Bengaluru",
    toName: "Goa",
    price: 64900,
    duration: 600,
    frequency: "20+ daily",
  },
  {
    from: "city-mum",
    to: "city-goa",
    fromName: "Mumbai",
    toName: "Goa",
    price: 129900,
    duration: 540,
    frequency: "30+ daily",
  },
  {
    from: "city-blr",
    to: "city-mys",
    fromName: "Bengaluru",
    toName: "Mysore",
    price: 39900,
    duration: 180,
    frequency: "50+ daily",
  },
  {
    from: "city-chn",
    to: "city-hyd",
    fromName: "Chennai",
    toName: "Hyderabad",
    price: 84900,
    duration: 540,
    frequency: "15+ daily",
  },
];

const features = [
  {
    icon: Clock,
    title: "On-Time Guarantee",
    description: "95% on-time performance across all routes with real-time updates.",
  },
  {
    icon: ShieldCheck,
    title: "Free Cancellation",
    description: "Full refund up to 24 hours before departure. No questions asked.",
  },
  {
    icon: MapPinned,
    title: "Live Tracking",
    description: "Track your bus in real-time. Share ETA with family and friends.",
  },
  {
    icon: Sparkles,
    title: "Premium Comfort",
    description: "Volvo & Scania buses with AC, blankets, charging points, and WiFi.",
  },
];

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HomePage() {
  const router = useRouter();
  const [fromCity, setFromCity] = useState("");
  const [fromCityName, setFromCityName] = useState("");
  const [toCity, setToCity] = useState("");
  const [toCityName, setToCityName] = useState("");
  const [date, setDate] = useState(getTodayStr());

  function swapCities() {
    setFromCity(toCity);
    setFromCityName(toCityName);
    setToCity(fromCity);
    setToCityName(fromCityName);
  }

  function handleSearch() {
    if (!fromCity || !toCity || !date) return;
    router.push(`/search?from=${fromCity}&to=${toCity}&date=${date}`);
  }

  function handleRouteClick(from: string, to: string) {
    router.push(`/search?from=${from}&to=${to}&date=${date}`);
  }

  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a3a8f] via-[#1e3d95] to-[#1a1a2e] text-white">
        {/* Subtle pattern layer */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 40%, rgba(245,200,66,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(42,82,190,0.35) 0%, transparent 50%)",
            }}
          />
        </div>

        {/* Gold glow orb */}
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#f5c842]/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-32 sm:pt-20 sm:pb-40">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-white/90 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f5c842] animate-pulse" />
              Trusted by 2M+ travellers across India
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Travel in Comfort,
              <br />
              <span className="bg-gradient-to-r from-[#f5c842] to-[#fde68a] bg-clip-text text-transparent">
                Arrive in Style
              </span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/75 max-w-2xl mx-auto">
              Premium intercity bus travel across India. Volvo &amp; Scania
              coaches with AC, live tracking, and guaranteed on-time arrivals.
            </p>
          </div>
        </div>
      </section>

      {/* ── Search Box (overlaid on hero) ── */}
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 -mt-20 sm:-mt-24 z-10">
        <div className="rounded-2xl bg-white shadow-2xl shadow-gray-900/10 border border-gray-100 p-5 sm:p-7">
          {/* City pickers row */}
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <CityPicker
                label="From"
                value={fromCityName}
                onChange={(id, name) => {
                  setFromCity(id);
                  setFromCityName(name);
                }}
                cities={cities}
              />
            </div>

            {/* Swap button */}
            <button
              type="button"
              onClick={swapCities}
              className="shrink-0 mb-0.5 flex items-center justify-center h-10 w-10 rounded-full border-2 border-gray-200 bg-white text-gray-400 hover:border-primary hover:text-primary hover:bg-primary-light transition-all duration-200 active:scale-90"
              aria-label="Swap cities"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            <div className="flex-1 min-w-0">
              <CityPicker
                label="To"
                value={toCityName}
                onChange={(id, name) => {
                  setToCity(id);
                  setToCityName(name);
                }}
                cities={cities}
              />
            </div>
          </div>

          {/* Date picker */}
          <div className="mt-5">
            <DatePicker value={date} onChange={setDate} />
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={!fromCity || !toCity}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
          >
            <Search className="h-5 w-5" />
            Search Buses
          </button>
        </div>
      </div>

      {/* ── Popular Routes ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Popular Routes
          </h2>
          <p className="mt-2 text-gray-500">
            Most booked bus routes across South India
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularRoutes.map((route) => (
            <button
              key={`${route.from}-${route.to}`}
              type="button"
              onClick={() => handleRouteClick(route.from, route.to)}
              className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              {/* Route */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-gray-900">
                  {route.fromName}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-base font-bold text-gray-900">
                  {route.toName}
                </span>
              </div>

              {/* Details */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(route.duration)}
                </span>
                <span>{route.frequency}</span>
              </div>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-xs text-gray-400">Starting from</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(route.price)}
                </span>
              </div>

              {/* Hover arrow */}
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Why NilaMadhaba ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Why NilaMadhaba?
          </h2>
          <p className="mt-2 text-gray-500">
            Trusted by millions of travelers across India
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-[#1a3a8f]/20 transition-all duration-300"
              >
                <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-[#e8edf8] mb-4 group-hover:bg-[#1a3a8f] transition-colors">
                  <Icon className="h-6 w-6 text-[#1a3a8f] group-hover:text-[#f5c842] transition-colors" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="mt-20 sm:mt-24 mb-16 bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
            <div className="flex items-center gap-3">
              <Bus className="h-7 w-7 text-primary" />
              <div>
                <p className="text-2xl font-extrabold text-gray-900">500+</p>
                <p className="text-sm text-gray-500">Daily Trips</p>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-gray-200" />

            <div className="flex items-center gap-3">
              <Star className="h-7 w-7 text-amber-500" />
              <div>
                <p className="text-2xl font-extrabold text-gray-900">4.6</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-gray-200" />

            <div className="flex items-center gap-3">
              <Users className="h-7 w-7 text-green-600" />
              <div>
                <p className="text-2xl font-extrabold text-gray-900">2M+</p>
                <p className="text-sm text-gray-500">Happy Travelers</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
