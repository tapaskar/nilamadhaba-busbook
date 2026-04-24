"use client";

import { ArrowRight, Clock } from "lucide-react";

/**
 * Rich destination card — gradient background themed per city, decorative
 * SVG landmark silhouette, hover lift + gradient intensify.
 *
 * No external images — every visual is a gradient or inline SVG,
 * keeping the card fast and dependable.
 */

type Theme = {
  // Background gradient
  from: string;
  via?: string;
  to: string;
  // Accent colour (tag, price)
  accent: string;
  // Decorative element: either an emoji string OR an SVG path
  icon: string;
  // Text colour override
  textLight?: boolean;
};

const themes: Record<string, Theme> = {
  Chennai:    { from: "#0891b2", via: "#06b6d4", to: "#164e63", accent: "#f5c842", icon: "🌊", textLight: true },
  Hyderabad:  { from: "#7c3aed", via: "#5b21b6", to: "#1e1b4b", accent: "#f5c842", icon: "🕌", textLight: true },
  Mumbai:     { from: "#dc2626", via: "#991b1b", to: "#450a0a", accent: "#f5c842", icon: "🌆", textLight: true },
  Goa:        { from: "#f59e0b", via: "#ea580c", to: "#7c2d12", accent: "#fde68a", icon: "🌴", textLight: true },
  Mysore:     { from: "#16a34a", via: "#15803d", to: "#052e16", accent: "#f5c842", icon: "🏰", textLight: true },
  Coimbatore: { from: "#0284c7", via: "#0369a1", to: "#0c4a6e", accent: "#f5c842", icon: "⛰️", textLight: true },
  Kochi:      { from: "#0d9488", via: "#0f766e", to: "#134e4a", accent: "#f5c842", icon: "⛵", textLight: true },
  Mangalore:  { from: "#1e40af", via: "#1e3a8a", to: "#172554", accent: "#f5c842", icon: "🌅", textLight: true },
  Vizag:      { from: "#0e7490", via: "#155e75", to: "#164e63", accent: "#f5c842", icon: "🏖️", textLight: true },
  Tirupati:   { from: "#b91c1c", via: "#7f1d1d", to: "#1a1a2e", accent: "#f5c842", icon: "🛕", textLight: true },
};

const defaultTheme: Theme = {
  from: "#1a3a8f", via: "#2a52be", to: "#1a1a2e", accent: "#f5c842", icon: "🚌", textLight: true,
};

export default function DestinationCard({
  fromCityName,
  toCityName,
  duration,
  frequency,
  price,
  onClick,
}: {
  fromCityName: string;
  toCityName: string;
  duration: string;
  frequency: string;
  price: string;
  onClick: () => void;
}) {
  const theme = themes[toCityName] ?? defaultTheme;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl text-left shadow-lg shadow-gray-900/5 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/20 hover:-translate-y-1"
      aria-label={`Book bus from ${fromCityName} to ${toCityName}`}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.via} 50%, ${theme.to} 100%)`,
        }}
      />

      {/* Decorative orb (top-right) */}
      <div
        className="absolute -top-12 -right-12 h-48 w-48 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"
        style={{ backgroundColor: theme.accent }}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.15) 0%, transparent 50%)",
        }}
      />

      {/* Icon/emoji landmark */}
      <div className="absolute bottom-4 right-4 text-6xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 pointer-events-none select-none">
        {theme.icon}
      </div>

      {/* Content */}
      <div className="relative p-6 pb-8 min-h-[180px] flex flex-col justify-between">
        {/* Route header */}
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f5c842] animate-pulse" />
            Route
          </div>
          <div className="flex items-center gap-2 text-white">
            <span className="text-lg font-bold">{fromCityName}</span>
            <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-1 transition-transform" />
            <span className="text-lg font-bold tracking-tight">{toCityName}</span>
          </div>
        </div>

        {/* Details + price */}
        <div className="mt-5 flex items-end justify-between">
          <div className="flex flex-col gap-1 text-white/75 text-xs">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {duration}
            </span>
            <span>{frequency}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
              From
            </span>
            <span
              className="text-2xl font-extrabold leading-none"
              style={{ color: theme.accent }}
            >
              {price}
            </span>
          </div>
        </div>
      </div>

      {/* Hover reveal bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transition-transform duration-500 origin-left scale-x-0 group-hover:scale-x-100"
        style={{ backgroundColor: theme.accent }}
      />
    </button>
  );
}
