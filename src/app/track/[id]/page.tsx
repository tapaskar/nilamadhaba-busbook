"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  AlertTriangle,
  Share2,
  Wifi,
  ArrowRight,
  Bus,
  CheckCircle2,
} from "lucide-react";

/**
 * Simulated live bus tracking page.
 *
 * In production this would subscribe to MQTT/SSE from AIS-140 devices on the
 * bus. For demo, we animate the progress along a stylised route polyline
 * based on wall-clock time since a fixed departure, cycling every 10 minutes.
 *
 * The design intentionally mirrors what real users see on Ola/Uber:
 *   - Live pulsing bus marker
 *   - ETA counting down
 *   - Next stop + distance
 *   - Panic SOS button + driver contact
 *   - Share live location CTA
 */

// Stylised 8-stop path for the BLR → CHN corridor
const stops: { name: string; kmFromStart: number; isBoarding?: boolean; isDrop?: boolean }[] = [
  { name: "Bengaluru (Silk Board)", kmFromStart: 0,   isBoarding: true },
  { name: "Electronic City",        kmFromStart: 20 },
  { name: "Hosur",                  kmFromStart: 45 },
  { name: "Krishnagiri",            kmFromStart: 100 },
  { name: "Vellore",                kmFromStart: 215 },
  { name: "Kanchipuram",            kmFromStart: 290 },
  { name: "Poonamallee",            kmFromStart: 330 },
  { name: "Chennai (Koyambedu)",    kmFromStart: 350, isDrop: true },
];

const TOTAL_KM = 350;
const TOTAL_MINS = 360; // 6 hours
const CYCLE_MS = 10 * 60 * 1000; // simulated journey completes every 10 mins of wall time

function formatMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
}

export default function TrackBusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Anchor progress to a stable epoch so the same user gets consistent
    // progress if they refresh. Cycles every CYCLE_MS.
    const tick = () => {
      setElapsedMs(Date.now() % CYCLE_MS);
      setNow(new Date());
    };
    tick();
    const i = setInterval(tick, 2000);
    return () => clearInterval(i);
  }, []);

  const progress = elapsedMs / CYCLE_MS; // 0..1
  const currentKm = progress * TOTAL_KM;
  const minsElapsed = Math.floor(progress * TOTAL_MINS);
  const minsRemaining = TOTAL_MINS - minsElapsed;
  const speedKmph = 60 + Math.sin(elapsedMs / 20000) * 10; // 50..70

  // Find closest next stop
  const nextStop =
    stops.find((s) => s.kmFromStart > currentKm) ?? stops[stops.length - 1];
  const passedStops = stops.filter((s) => s.kmFromStart <= currentKm).length;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a3a8f] to-[#1a1a2e] text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-1 text-xs font-bold mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE · En route
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Tracking #{id}
              </h1>
              <p className="text-sm text-white/70 mt-1">
                NilaMadhaba Volvo B11R · KA-01-AB-1234
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const url = `https://busbook-seven.vercel.app/track/${id}`;
                if (navigator.share) {
                  navigator.share({ title: `Live bus tracking #${id}`, url });
                } else {
                  navigator.clipboard?.writeText(url);
                  alert("Link copied — share it with family");
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>

          {/* Live stats grid */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">ETA</p>
              <p className="text-xl font-extrabold mt-0.5">{formatMins(minsRemaining)}</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Speed</p>
              <p className="text-xl font-extrabold mt-0.5">
                {Math.round(speedKmph)}{" "}
                <span className="text-xs font-medium text-white/60">kmph</span>
              </p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Distance</p>
              <p className="text-xl font-extrabold mt-0.5">
                {Math.round(currentKm)}
                <span className="text-xs font-medium text-white/60">/{TOTAL_KM} km</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Simulated route polyline */}
        <div className="relative rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Navigation className="h-3.5 w-3.5" />
            Route progress
          </p>

          {/* Progress bar */}
          <div className="relative h-2 rounded-full bg-gray-100 overflow-hidden mb-1">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#1a3a8f] to-[#f5c842] transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
            {/* Animated pulse dot at current position */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[left] duration-1000 ease-linear"
              style={{ left: `${progress * 100}%` }}
              aria-hidden="true"
            >
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#f5c842] opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f5c842] border-2 border-[#1a3a8f] shadow-md" />
              </span>
            </div>
          </div>

          {/* Stops list */}
          <div className="relative mt-6 space-y-3">
            {stops.map((s, idx) => {
              const passed = s.kmFromStart <= currentKm;
              const isNext = s === nextStop;
              return (
                <div
                  key={s.name}
                  className={`flex items-center gap-3 transition-all ${
                    passed && !isNext ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-7 w-7 rounded-full shrink-0 transition-all ${
                      isNext
                        ? "bg-[#f5c842] text-[#1a1a2e] ring-4 ring-[#f5c842]/30 animate-pulse"
                        : passed
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {passed && !isNext ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isNext ? (
                      <Bus className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        isNext
                          ? "font-extrabold text-[#1a3a8f]"
                          : passed
                            ? "font-medium text-gray-600 line-through decoration-1"
                            : "font-medium text-gray-700"
                      }`}
                    >
                      {s.name}
                      {s.isBoarding && (
                        <span className="ml-1.5 inline-flex items-center rounded bg-green-100 text-green-700 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                          Board
                        </span>
                      )}
                      {s.isDrop && (
                        <span className="ml-1.5 inline-flex items-center rounded bg-[#1a3a8f]/10 text-[#1a3a8f] px-1.5 py-0.5 text-[9px] font-bold uppercase">
                          Drop
                        </span>
                      )}
                    </p>
                    {isNext && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Next stop ·{" "}
                        {Math.max(0, Math.round(s.kmFromStart - currentKm))} km away
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium shrink-0">
                    {s.kmFromStart} km
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-[10px] text-gray-400 text-center">
            Last update {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} ·{" "}
            {passedStops}/{stops.length} stops completed · GPS AIS-140
          </p>
        </div>

        {/* Contact + SOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="tel:18001234567"
            className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-[#e8edf8] text-[#1a3a8f]">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Call support</p>
              <p className="text-xs text-gray-500">1800-123-4567 · 24×7</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300" />
          </a>

          <button
            type="button"
            onClick={() => alert("SOS sent. Our safety team will call you within 60 seconds.")}
            className="flex items-center gap-3 rounded-2xl bg-white border-2 border-red-200 p-4 shadow-sm hover:shadow-md hover:border-red-300 transition-all"
          >
            <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-red-50 text-red-600 animate-pulse">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-red-700">Emergency SOS</p>
              <p className="text-xs text-red-500">Alert safety team now</p>
            </div>
          </button>
        </div>

        {/* Reassurance strip */}
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500 text-white shrink-0">
            <Wifi className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900">
              Bus connected · signal strong
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Your live location refreshes every 30 seconds. Share the link above with family — no app install needed.
            </p>
          </div>
        </div>

        <Link
          href="/my-trips"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a3a8f] hover:underline"
        >
          ← Back to My Trips
        </Link>
      </div>
    </div>
  );
}
