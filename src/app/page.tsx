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
  Bus,
  Wifi,
  Zap,
  Coffee,
  Wind,
  SlidersHorizontal,
  Bell,
  Download,
  Apple,
  Play,
  CheckCircle2,
} from "lucide-react";
import CityPicker from "@/components/CityPicker";
import DatePicker from "@/components/DatePicker";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import LiveBookingTicker from "@/components/LiveBookingTicker";
import DestinationCard from "@/components/DestinationCard";
import Testimonials from "@/components/Testimonials";
import { cities } from "@/lib/mock-data";
import { formatPrice, formatDuration } from "@/lib/constants";

const popularRoutes = [
  { from: "city-blr", to: "city-chn", fromName: "Bengaluru", toName: "Chennai",   price: 69900,  duration: 360, frequency: "40+ daily" },
  { from: "city-blr", to: "city-hyd", fromName: "Bengaluru", toName: "Hyderabad", price: 59900,  duration: 510, frequency: "25+ daily" },
  { from: "city-blr", to: "city-goa", fromName: "Bengaluru", toName: "Goa",       price: 64900,  duration: 600, frequency: "20+ daily" },
  { from: "city-mum", to: "city-goa", fromName: "Mumbai",    toName: "Goa",       price: 129900, duration: 540, frequency: "30+ daily" },
  { from: "city-blr", to: "city-mys", fromName: "Bengaluru", toName: "Mysore",    price: 39900,  duration: 180, frequency: "50+ daily" },
  { from: "city-chn", to: "city-hyd", fromName: "Chennai",   toName: "Hyderabad", price: 84900,  duration: 540, frequency: "15+ daily" },
];

const features = [
  { icon: Clock,       title: "On-Time Guarantee",  description: "95% on-time across all routes. Cash back if we're more than 45 minutes late." },
  { icon: ShieldCheck, title: "Free Cancellation",  description: "100% refund up to 12 hours before departure. Instant credit to your wallet." },
  { icon: MapPinned,   title: "Live GPS Tracking",  description: "Watch your bus move in real time. Share the live link with family." },
  { icon: Sparkles,    title: "Premium Comfort",    description: "Volvo & Scania coaches — AC, blankets, charging ports, reading lights." },
];

const amenities = [
  { icon: Wind,   label: "AC Sleeper" },
  { icon: Wifi,   label: "Wi-Fi" },
  { icon: Zap,    label: "Charging Port" },
  { icon: Coffee, label: "Snacks" },
  { icon: Bell,   label: "Wake-up Call" },
  { icon: Bus,    label: "Live Track" },
];

const steps = [
  { num: "01", title: "Pick your route",    desc: "From Bengaluru to Chennai at 9 PM? Tap a postcard below." },
  { num: "02", title: "Choose your seat",   desc: "See the bus layout in one tap — window, aisle, ladies-only." },
  { num: "03", title: "Pay & board",        desc: "UPI in 2 taps. E-ticket arrives on WhatsApp instantly." },
];

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    <div className="overflow-x-hidden">
      {/* ═════════════════════════ HERO ═════════════════════════ */}
      <section className="relative bg-mesh-navy text-white overflow-hidden">
        {/* Animated gold orb */}
        <div className="absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-[#f5c842]/10 blur-3xl animate-float-orb pointer-events-none" />
        {/* Animated blue orb */}
        <div className="absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-[#2a52be]/25 blur-3xl animate-float-slow pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-40 sm:pt-20 sm:pb-48">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live social proof */}
            <div className="mb-6 min-h-[32px] flex items-center justify-center">
              <LiveBookingTicker />
            </div>

            <h1 className="text-[2.5rem] sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02]">
              Travel in Comfort,
              <br />
              <span className="text-gold-gradient">Arrive in Style</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
              Premium intercity bus travel across India. Volvo &amp; Scania coaches,
              live tracking, and an on-time guarantee — or your money back.
            </p>

            {/* Trust badges */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-[#f5c842] stroke-[#f5c842]" />
                <strong className="text-white">4.8</strong> Rated
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>
                <strong className="text-white">2.4M+</strong> Travellers
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>
                <strong className="text-white">500+</strong> Daily trips
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                On-time guarantee
              </span>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ height: "60px" }}
        >
          <path
            fill="#f8f9fc"
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1350,60 1440,40 L1440,80 L0,80 Z"
          />
        </svg>
      </section>

      {/* ═════════════════════════ SEARCH CARD ═════════════════════════ */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 -mt-24 sm:-mt-32 z-20">
        <div className="rounded-3xl bg-white shadow-2xl shadow-[#1a1a2e]/20 border border-white/80 p-5 sm:p-7 ring-1 ring-[#1a3a8f]/5">
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

            <button
              type="button"
              onClick={swapCities}
              className="shrink-0 mb-0.5 flex items-center justify-center h-11 w-11 rounded-full border-2 border-gray-200 bg-white text-gray-400 hover:border-[#1a3a8f] hover:text-[#1a3a8f] hover:bg-[#e8edf8] hover:rotate-180 transition-all duration-500 active:scale-90"
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

          <div className="mt-5">
            <DatePicker value={date} onChange={setDate} />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!fromCity || !toCity}
            className="mt-5 w-full relative flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white shadow-xl shadow-[#1a3a8f]/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #1a3a8f 0%, #2a52be 100%)",
            }}
          >
            {/* Gold shimmer */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-shimmer pointer-events-none" />
            <Search className="relative h-5 w-5" />
            <span className="relative">Search Buses</span>
            <ArrowRight className="relative h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Inline trust strip */}
          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              256-bit SSL
            </span>
            <span>•</span>
            <span>Zero booking fees</span>
            <span>•</span>
            <span className="text-[#1a3a8f] font-semibold">Instant refunds</span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════ ANIMATED STATS ═════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-28">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Happy travellers",   value: 2400000, suffix: "+", format: "short" as const, icon: "👥", accent: "#1a3a8f" },
            { label: "Daily trips",        value: 500,     suffix: "+", format: "plain" as const, icon: "🚌", accent: "#2a52be" },
            { label: "Cities connected",   value: 48,      suffix: "",  format: "plain" as const, icon: "📍", accent: "#f5c842" },
            { label: "On-time performance", value: 95,     suffix: "%", format: "plain" as const, icon: "⏱️", accent: "#1a3a8f" },
          ].map((s, i) => (
            <ScrollReveal
              key={s.label}
              delay={(i + 1) as 1 | 2 | 3 | 4}
              className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div
                className="absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-20"
                style={{ backgroundColor: s.accent }}
              />
              <div className="relative">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p
                  className="text-2xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ color: s.accent }}
                >
                  <AnimatedCounter
                    value={s.value}
                    suffix={s.suffix}
                    format={s.format}
                  />
                </p>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium">
                  {s.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═════════════════════════ HOW IT WORKS ═════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8edf8] text-[#1a3a8f] px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-4">
            <SlidersHorizontal className="h-3 w-3" />
            How it works
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Three taps from here to there
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            No account required. No hidden fees. No surprise stopovers.
          </p>
        </ScrollReveal>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[68px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#1a3a8f]/20 to-transparent" />

          {steps.map((step, idx) => (
            <ScrollReveal
              key={step.num}
              delay={(idx + 1) as 1 | 2 | 3}
              className="relative"
            >
              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] shadow-xl shadow-[#1a3a8f]/30">
                    <span className="text-3xl font-extrabold text-[#f5c842]">
                      {step.num}
                    </span>
                  </div>
                  {/* Gold glow ring on last step */}
                  {idx === 2 && (
                    <span className="absolute inset-0 rounded-2xl ring-4 ring-[#f5c842]/30 animate-pulse-glow" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═════════════════════════ POPULAR ROUTES — rich cards ═════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
        <ScrollReveal className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8edf8] text-[#1a3a8f] px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-4">
              <MapPinned className="h-3 w-3" />
              Popular routes
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Where are you headed?
            </h2>
            <p className="mt-2 text-gray-500 max-w-xl">
              Most loved routes across South &amp; West India — each runs multiple times a day.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/search?from=city-blr&to=city-chn&date=${date}`)}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a3a8f] hover:gap-2.5 transition-all"
          >
            See all routes
            <ArrowRight className="h-4 w-4" />
          </button>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {popularRoutes.map((route, i) => (
            <ScrollReveal
              key={`${route.from}-${route.to}`}
              delay={((i % 3) + 1) as 1 | 2 | 3}
            >
              <DestinationCard
                fromCityName={route.fromName}
                toCityName={route.toName}
                duration={formatDuration(route.duration)}
                frequency={route.frequency}
                price={formatPrice(route.price)}
                onClick={() => handleRouteClick(route.from, route.to)}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═════════════════════════ INSIDE THE BUS ═════════════════════════ */}
      <section className="relative mt-24 sm:mt-32 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-mesh-navy" />
        <div className="absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-[#f5c842]/15 blur-3xl animate-float-orb pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 h-96 w-96 rounded-full bg-[#2a52be]/20 blur-3xl animate-float-slow pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#f5c842] mb-4">
                <Sparkles className="h-3 w-3" />
                Inside every NilaMadhaba bus
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                Your seat on the
                <br />
                <span className="text-gold-gradient">most comfortable</span>
                <br />
                ride in India.
              </h2>
              <p className="mt-5 text-lg text-white/75 max-w-lg leading-relaxed">
                Volvo B11R &amp; Scania Multi-Axle coaches. Every bus gets a
                48-point safety &amp; hygiene check before each departure.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
                {amenities.map((a, i) => (
                  <ScrollReveal
                    key={a.label}
                    delay={(((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
                    className="flex items-center gap-2.5 rounded-xl glass px-3.5 py-2.5"
                  >
                    <a.icon className="h-4 w-4 text-[#f5c842] shrink-0" />
                    <span className="text-sm font-medium">{a.label}</span>
                  </ScrollReveal>
                ))}
              </div>
            </ScrollReveal>

            {/* Visual — stylised bus-interior card */}
            <ScrollReveal delay={2} className="relative">
              <div className="relative rounded-3xl p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md shadow-2xl">
                {/* Mock seat-map visual */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-[#f5c842] font-bold uppercase tracking-wider">
                      NilaMadhaba
                    </p>
                    <p className="text-xl font-extrabold">Volvo B11R AC Sleeper</p>
                    <p className="text-sm text-white/60 mt-0.5">KA-01-AB-1234</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 text-xs font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    On route
                  </div>
                </div>

                {/* Seat grid */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const booked = [1, 5, 6, 9, 14, 18, 22].includes(i);
                    const selected = i === 11;
                    const ladies = i === 23;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                          booked
                            ? "bg-white/10 text-white/30"
                            : selected
                              ? "bg-[#f5c842] text-[#1a1a2e] scale-110 shadow-lg shadow-[#f5c842]/50"
                              : ladies
                                ? "bg-pink-400/20 text-pink-200 border border-pink-400/30"
                                : "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                        }`}
                      >
                        {String.fromCharCode(65 + Math.floor(i / 4))}
                        {(i % 4) + 1}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-white/10 text-xs">
                  {[
                    { color: "bg-emerald-500/30 border-emerald-400/40", label: "Available" },
                    { color: "bg-[#f5c842]", label: "Selected" },
                    { color: "bg-white/20", label: "Booked" },
                    { color: "bg-pink-400/20 border-pink-400/40", label: "Ladies" },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1.5 text-white/70">
                      <span className={`h-3 w-3 rounded ${l.color} border`} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating badge — rating */}
              <div className="absolute -top-4 -right-4 rounded-2xl bg-[#f5c842] text-[#1a1a2e] px-4 py-3 shadow-2xl rotate-3 animate-float-slow">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xl font-extrabold">4.8</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider">50k reviews</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═════════════════════════ WHY NILAMADHABA ═════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8edf8] text-[#1a3a8f] px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-4">
            <Star className="h-3 w-3 fill-[#f5c842] stroke-[#f5c842]" />
            Why travellers choose us
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Built for the way India travels
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            The reliability of an airline, the value of a bus ticket.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal
                key={feature.title}
                delay={(i + 1) as 1 | 2 | 3 | 4}
                className="group relative rounded-3xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#1a3a8f]/20 transition-all duration-500 overflow-hidden"
              >
                {/* Gold corner accent */}
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#f5c842]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-[#e8edf8] to-[#c7d2fe] mb-5 group-hover:from-[#1a3a8f] group-hover:to-[#1a1a2e] transition-all duration-500">
                    <Icon className="h-6 w-6 text-[#1a3a8f] group-hover:text-[#f5c842] transition-colors duration-500" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ═════════════════════════ TESTIMONIALS ═════════════════════════ */}
      <Testimonials />

      {/* ═════════════════════════ CTA — APP DOWNLOAD ═════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32 mb-16">
        <ScrollReveal className="relative overflow-hidden rounded-[2rem] bg-mesh-navy text-white px-6 py-12 sm:px-12 sm:py-16 shadow-2xl">
          {/* Decorative orbs */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#f5c842]/20 blur-3xl animate-float-orb pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[#2a52be]/30 blur-3xl animate-float-slow pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#f5c842] mb-4">
                <Download className="h-3 w-3" />
                Get the app
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
                Book faster on the
                <br />
                <span className="text-gold-gradient">NilaMadhaba app.</span>
              </h2>
              <p className="mt-4 text-lg text-white/75 max-w-lg">
                One-tap rebook · offline boarding pass · push notifications when
                your bus is 5 km away.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-2xl bg-black hover:bg-gray-900 px-5 py-3 border border-white/10 transition-colors"
                >
                  <Apple className="h-7 w-7 text-white" />
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 leading-none">
                      Download on the
                    </p>
                    <p className="text-base font-bold text-white leading-tight">
                      App Store
                    </p>
                  </div>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-2xl bg-black hover:bg-gray-900 px-5 py-3 border border-white/10 transition-colors"
                >
                  <Play className="h-6 w-6 text-white fill-white" />
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 leading-none">GET IT ON</p>
                    <p className="text-base font-bold text-white leading-tight">
                      Google Play
                    </p>
                  </div>
                </a>
              </div>

              <p className="mt-5 text-xs text-white/50">
                ★ 4.9 on both stores · 500k+ downloads
              </p>
            </div>

            {/* Phone mockup */}
            <div className="relative hidden lg:flex justify-center items-center">
              <div
                className="relative w-72 h-[480px] rounded-[2.5rem] bg-gradient-to-br from-[#1a1a2e] to-[#0b0b1a] p-3 shadow-2xl shadow-black/50 border border-white/10"
                style={{ transform: "perspective(1000px) rotateY(-8deg) rotateX(5deg)" }}
              >
                <div className="w-full h-full rounded-[2rem] bg-[#f8f9fc] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[10px] font-bold text-gray-900">
                    <span>9:41</span>
                    <span>●●● 5G</span>
                  </div>
                  {/* Mock app content */}
                  <div className="px-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] flex items-center justify-center">
                        <Bus className="h-4 w-4 text-[#f5c842]" />
                      </div>
                      <span className="font-extrabold text-[#1a3a8f] text-sm">
                        NilaMadhaba
                      </span>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-[#1a3a8f] to-[#2a52be] p-4 text-white mb-3 shadow-lg">
                      <p className="text-[9px] uppercase tracking-wider opacity-70 mb-1">
                        Upcoming trip
                      </p>
                      <p className="text-base font-bold">Bengaluru → Chennai</p>
                      <p className="text-[11px] opacity-80 mt-1">Tonight · 9:00 PM</p>
                      <div className="mt-3 flex items-center gap-1 text-[10px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Boarding in 2h 14m</span>
                      </div>
                    </div>

                    {["Chennai", "Hyderabad", "Goa"].map((city, i) => (
                      <div
                        key={city}
                        className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5 mb-2 bg-white"
                      >
                        <div>
                          <p className="text-[11px] font-bold text-gray-900">
                            BLR → {city}
                          </p>
                          <p className="text-[9px] text-gray-400">
                            {20 + i * 5}+ daily
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-[#1a3a8f]">
                          ₹{699 - i * 50}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-24 rounded-full bg-gray-900/30" />
                </div>
              </div>

              {/* Floating icon */}
              <div className="absolute -top-2 -right-4 rounded-2xl bg-[#f5c842] text-[#1a1a2e] px-3 py-2 shadow-2xl rotate-6 animate-float-slow">
                <Bell className="h-4 w-4 inline mr-1" />
                <span className="text-xs font-bold">Bus nearby!</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
