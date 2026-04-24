"use client";

import Image from "next/image";
import { ArrowRight, Clock, Calendar } from "lucide-react";

/**
 * Rich destination postcard — full-bleed city photograph, dark bottom
 * gradient for text legibility, gold-accent price chip, hover zoom.
 *
 * Photos are licensed-free from Unsplash; credits tracked in the theme
 * config so we can render an attribution footer later if needed.
 */

type CityTheme = {
  /** Remote Unsplash URL (Next.js Image optimises + serves a responsive srcset) */
  image: string;
  /** Alt text describing what's in the photo */
  alt: string;
  /** Photographer — Unsplash license doesn't require credit but we track it */
  credit: string;
  /** Primary accent for gold-on-photo contrast */
  accent: string;
};

const cityThemes: Record<string, CityTheme> = {
  Chennai: {
    image:
      "https://images.unsplash.com/photo-1724992609079-75164f1ba2dd?auto=format&fit=crop&w=800&q=75",
    alt: "Aerial view of Marina Beach, Chennai at sunset",
    credit: "Karthick Gislen",
    accent: "#f5c842",
  },
  Hyderabad: {
    image:
      "https://images.unsplash.com/photo-1741545979534-02f59c742730?auto=format&fit=crop&w=800&q=75",
    alt: "The iconic Charminar monument, Hyderabad",
    credit: "Sunny",
    accent: "#f5c842",
  },
  Mumbai: {
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=75",
    alt: "Gateway of India at dusk, Mumbai",
    credit: "Sarang Pande",
    accent: "#f5c842",
  },
  Goa: {
    image:
      "https://images.unsplash.com/photo-1695453463057-aa5d48d9e3d4?auto=format&fit=crop&w=800&q=75",
    alt: "Tropical beach with swaying palm trees in Goa",
    credit: "Chirayu Sharma",
    accent: "#fde68a",
  },
  Mysore: {
    image:
      "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?auto=format&fit=crop&w=800&q=75",
    alt: "Red-domed Mysore Palace at dusk",
    credit: "Ninan John",
    accent: "#f5c842",
  },
  Bengaluru: {
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=75",
    alt: "Bengaluru cityscape at night",
    credit: "Satyaprakash Kumawat",
    accent: "#f5c842",
  },
};

// Fallback for cities without photography — gradient-only tile
const fallback: CityTheme = {
  image: "",
  alt: "Intercity route",
  credit: "",
  accent: "#f5c842",
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
  const theme = cityThemes[toCityName] ?? fallback;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl text-left shadow-lg shadow-gray-900/10 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/25 hover:-translate-y-1 bg-[#1a1a2e]"
      aria-label={`Book bus from ${fromCityName} to ${toCityName}`}
    >
      {/* Photo layer with slow zoom on hover */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {theme.image ? (
          <Image
            src={theme.image}
            alt={theme.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a8f] via-[#2a52be] to-[#1a1a2e]" />
        )}

        {/* Dark top gradient — readable "Route" tag */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

        {/* Bottom-weighted dark gradient — readable route + price */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Top-right gold glow — intensifies on hover */}
        <div
          className="absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
          style={{ backgroundColor: theme.accent }}
        />
      </div>

      {/* Top tag — Route label */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#1a1a2e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f5c842] animate-pulse" />
          Route
        </span>
      </div>

      {/* Top-right badge — daily frequency */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white px-2.5 py-1 text-[10px] font-bold">
          <Calendar className="h-2.5 w-2.5" />
          {frequency}
        </span>
      </div>

      {/* Bottom content — overlaid on photo */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-white mb-1.5">
              <span className="text-base font-semibold opacity-90 truncate">
                {fromCityName}
              </span>
              <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform shrink-0" />
              <span className="text-xl font-extrabold tracking-tight drop-shadow-sm truncate">
                {toCityName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white/80 text-xs">
              <Clock className="h-3 w-3" />
              {duration}
            </div>
          </div>

          {/* Price chip */}
          <div className="shrink-0 flex flex-col items-end">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              From
            </span>
            <span
              className="text-2xl font-extrabold leading-none drop-shadow-md"
              style={{ color: theme.accent }}
            >
              {price}
            </span>
          </div>
        </div>
      </div>

      {/* Hover underline — gold progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transition-transform duration-500 origin-left scale-x-0 group-hover:scale-x-100"
        style={{ backgroundColor: theme.accent }}
      />
    </button>
  );
}
