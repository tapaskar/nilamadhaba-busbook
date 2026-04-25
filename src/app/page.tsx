"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { useT } from "@/lib/i18n";
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

// Features, amenities, and steps use translation keys — resolved per-render below
const featureKeys = [
  { icon: Clock,       titleKey: "why.onTime",   descKey: "why.onTimeDesc"   },
  { icon: ShieldCheck, titleKey: "why.cancel",   descKey: "why.cancelDesc"   },
  { icon: MapPinned,   titleKey: "why.tracking", descKey: "why.trackingDesc" },
  { icon: Sparkles,    titleKey: "why.comfort",  descKey: "why.comfortDesc"  },
] as const;

const amenityKeys = [
  { icon: Wind,   key: "inside.amenityAC" },
  { icon: Wifi,   key: "inside.amenityWifi" },
  { icon: Zap,    key: "inside.amenityCharge" },
  { icon: Coffee, key: "inside.amenitySnack" },
  { icon: Bell,   key: "inside.amenityWake" },
  { icon: Bus,    key: "inside.amenityTrack" },
] as const;

const stepKeys = [
  { num: "01", titleKey: "howworks.step1Title", descKey: "howworks.step1Desc" },
  { num: "02", titleKey: "howworks.step2Title", descKey: "howworks.step2Desc" },
  { num: "03", titleKey: "howworks.step3Title", descKey: "howworks.step3Desc" },
] as const;

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type CmsSection = {
  id: string;
  type: string;
  position: number;
  settings: Record<string, unknown>;
  blocks: { id: string; type: string; settings: Record<string, unknown> }[];
};

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1756020897176-8c381b24d276?auto=format&fit=crop&w=1920&q=75";

export default function HomePage() {
  const router = useRouter();
  const t = useT();
  const [fromCity, setFromCity] = useState("");
  const [fromCityName, setFromCityName] = useState("");
  const [toCity, setToCity] = useState("");
  const [toCityName, setToCityName] = useState("");
  const [date, setDate] = useState(getTodayStr());

  // CMS-driven sections (hero image, offers carousel). Falls back to
  // defaults if the API errors or the database hasn't seeded sections.
  const [cmsSections, setCmsSections] = useState<CmsSection[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cms/page?slug=home", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (Array.isArray(d?.sections)) setCmsSections(d.sections);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const heroSection = cmsSections.find((s) => s.type === "hero");
  const offersSection = cmsSections.find((s) => s.type === "offers");

  // Hero settings — pull from CMS with fallback to defaults
  const heroImage = (heroSection?.settings.image_url as string | undefined) || DEFAULT_HERO_IMAGE;
  const cmsEyebrow = heroSection?.settings.eyebrow as string | undefined;
  const cmsTitle1 = heroSection?.settings.title_line1 as string | undefined;
  const cmsTitle2 = heroSection?.settings.title_line2 as string | undefined;
  const cmsSubtitle = heroSection?.settings.subtitle as string | undefined;
  const showTicker = heroSection?.settings.show_ticker !== false; // default true

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
      <section className="relative bg-[#1a1a2e] text-white overflow-hidden">
        {/* Background bus photograph */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            key={heroImage}
            src={heroImage}
            alt="NilaMadhaba luxury coach"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-45"
          />
          {/* Dark gradient overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/85 via-[#1a1a2e]/70 to-[#1a1a2e]" />
          {/* Royal blue right-side tint to match brand */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/60 via-transparent to-[#1a3a8f]/40" />
        </div>

        {/* Mesh gradient accent layer (on top of photo) */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(at 22% 15%, rgba(245, 200, 66, 0.18) 0px, transparent 50%), radial-gradient(at 78% 20%, rgba(42, 82, 190, 0.35) 0px, transparent 50%), radial-gradient(at 12% 82%, rgba(26, 58, 143, 0.5) 0px, transparent 50%)",
          }}
        />

        {/* Animated gold orb */}
        <div className="absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-[#f5c842]/10 blur-3xl animate-float-orb pointer-events-none" />
        {/* Animated blue orb */}
        <div className="absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-[#2a52be]/25 blur-3xl animate-float-slow pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
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
            {/* Live social proof — toggleable from CMS hero settings */}
            {showTicker && (
              <div className="mb-6 min-h-[32px] flex items-center justify-center">
                <LiveBookingTicker />
              </div>
            )}

            {cmsEyebrow && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f5c842] animate-pulse" />
                {cmsEyebrow}
              </div>
            )}

            <h1 className="text-[2.5rem] sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02]">
              {cmsTitle1 ?? t("hero.title1")}
              <br />
              <span className="text-gold-gradient">{cmsTitle2 ?? t("hero.title2")}</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
              {cmsSubtitle ?? t("hero.subtitle")}
            </p>

            {/* Trust badges */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-[#f5c842] stroke-[#f5c842]" />
                <strong className="text-white">4.8</strong> {t("hero.rated")}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>
                <strong className="text-white">2.4M+</strong> {t("hero.travellers")}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>
                <strong className="text-white">500+</strong> {t("hero.dailyTrips")}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {t("hero.onTime")}
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
                excludeCityId={toCity}
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
                excludeCityId={fromCity}
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
              {t("search.trustSsl")}
            </span>
            <span>•</span>
            <span>{t("search.trustFee")}</span>
            <span>•</span>
            <span className="text-[#1a3a8f] font-semibold">{t("search.trustRefund")}</span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════ OFFERS (CMS-driven) ═════════════════════════ */}
      {offersSection && offersSection.blocks.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-28">
          <ScrollReveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f5c842]/15 text-[#1a3a8f] px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="h-3 w-3 text-[#f5c842]" />
              {String(offersSection.settings.heading ?? "Today's offers")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {String(offersSection.settings.heading ?? "Today's offers")}
            </h2>
            {Boolean(offersSection.settings.subtitle) && (
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                {String(offersSection.settings.subtitle)}
              </p>
            )}
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offersSection.blocks.map((b, i) => {
              const s = b.settings as {
                title?: string;
                description?: string;
                image_url?: string;
                badge?: string;
                accent_color?: string;
                cta_label?: string;
                cta_url?: string;
              };
              const accent = s.accent_color || "#1a3a8f";
              return (
                <ScrollReveal
                  key={b.id}
                  delay={((i % 3) + 1) as 1 | 2 | 3}
                  className="group relative overflow-hidden rounded-3xl bg-[#1a1a2e] shadow-lg shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/25 hover:-translate-y-1 transition-all duration-500"
                >
                  {/* Image */}
                  {s.image_url && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={s.image_url}
                        alt={s.title ?? ""}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      {s.badge && (
                        <span
                          className="absolute top-4 left-4 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg"
                          style={{ backgroundColor: accent }}
                        >
                          {s.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    {s.title && (
                      <h3 className="text-lg font-extrabold tracking-tight mb-1">
                        {s.title}
                      </h3>
                    )}
                    {s.description && (
                      <p className="text-xs text-white/75 mb-3 line-clamp-2">
                        {s.description}
                      </p>
                    )}
                    {s.cta_label && s.cta_url && (
                      <a
                        href={s.cta_url}
                        className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1.5 transition-transform group-hover:translate-x-1"
                        style={{ backgroundColor: accent, color: "#fff" }}
                      >
                        {s.cta_label}
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* Hover accent bar */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 transition-transform duration-500 origin-left scale-x-0 group-hover:scale-x-100"
                    style={{ backgroundColor: accent }}
                  />
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ═════════════════════════ ANIMATED STATS ═════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-28">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: t("stats.travellers"),  value: 2400000, suffix: "+", format: "short" as const, icon: "👥", accent: "#1a3a8f" },
            { label: t("stats.dailyTrips"),  value: 500,     suffix: "+", format: "plain" as const, icon: "🚌", accent: "#2a52be" },
            { label: t("stats.cities"),      value: 48,      suffix: "",  format: "plain" as const, icon: "📍", accent: "#f5c842" },
            { label: t("stats.onTime"),      value: 95,      suffix: "%", format: "plain" as const, icon: "⏱️", accent: "#1a3a8f" },
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
            {t("howworks.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("howworks.heading")}
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            {t("howworks.subtitle")}
          </p>
        </ScrollReveal>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[68px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#1a3a8f]/20 to-transparent" />

          {stepKeys.map((step, idx) => (
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
                  {idx === 2 && (
                    <span className="absolute inset-0 rounded-2xl ring-4 ring-[#f5c842]/30 animate-pulse-glow" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  {t(step.descKey)}
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
              {t("routes.section")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {t("routes.heading")}
            </h2>
            <p className="mt-2 text-gray-500 max-w-xl">
              {t("routes.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/search?from=city-blr&to=city-chn&date=${date}`)}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a3a8f] hover:gap-2.5 transition-all"
          >
            {t("routes.seeAll")}
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
                {t("inside.badge")}
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                {t("inside.headingPre")}
                <br />
                <span className="text-gold-gradient">{t("inside.headingAccent")}</span>
                <br />
                {t("inside.headingPost")}
              </h2>
              <p className="mt-5 text-lg text-white/75 max-w-lg leading-relaxed">
                {t("inside.subtitle")}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
                {amenityKeys.map((a, i) => (
                  <ScrollReveal
                    key={a.key}
                    delay={(((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6)}
                    className="flex items-center gap-2.5 rounded-xl glass px-3.5 py-2.5"
                  >
                    <a.icon className="h-4 w-4 text-[#f5c842] shrink-0" />
                    <span className="text-sm font-medium">{t(a.key)}</span>
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
                    {t("inside.onRoute")}
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
                    { color: "bg-emerald-500/30 border-emerald-400/40", label: t("seat.available") },
                    { color: "bg-[#f5c842]",                             label: t("seat.selected")  },
                    { color: "bg-white/20",                              label: t("seat.booked")    },
                    { color: "bg-pink-400/20 border-pink-400/40",        label: t("seat.ladies")    },
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
            {t("why.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t("why.heading")}
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            {t("why.subtitle")}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureKeys.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal
                key={feature.titleKey}
                delay={(i + 1) as 1 | 2 | 3 | 4}
                className="group relative rounded-3xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#1a3a8f]/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#f5c842]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-[#e8edf8] to-[#c7d2fe] mb-5 group-hover:from-[#1a3a8f] group-hover:to-[#1a1a2e] transition-all duration-500">
                    <Icon className="h-6 w-6 text-[#1a3a8f] group-hover:text-[#f5c842] transition-colors duration-500" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ═════════════════════════ TESTIMONIALS ═════════════════════════ */}
      <Testimonials />

      {/* ═════════════════════════ LOYALTY PROGRAM ═════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
        <ScrollReveal className="relative rounded-3xl bg-gradient-to-br from-[#fde68a] via-[#f5c842] to-[#e0b02c] p-8 sm:p-12 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#1a3a8f]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/30 blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1a1a2e] text-[#f5c842] px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="h-3 w-3" />
                {t("loyalty.badge")}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a1a2e] tracking-tight leading-[1.05]">
                {t("loyalty.heading")}
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#1a1a2e]/80 max-w-lg">
                {t("loyalty.subtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] hover:bg-[#0b0b1a] text-[#f5c842] px-5 py-3 text-sm font-bold shadow-lg transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("loyalty.joinFree")}
                </a>
                <a
                  href="/help#loyalty"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/40 hover:bg-white/60 text-[#1a1a2e] px-5 py-3 text-sm font-bold transition-colors backdrop-blur-sm border border-[#1a1a2e]/10"
                >
                  {t("loyalty.howItWorks")}
                </a>
              </div>
            </div>

            {/* Tier showcase */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { tier: "Silver",   trips: "5+",  perk: "5% off",                 color: "#94a3b8" },
                { tier: "Gold",     trips: "15+", perk: "8% off + free meal",     color: "#fbbf24" },
                { tier: "Platinum", trips: "30+", perk: "10% + lounge access",    color: "#c084fc" },
                { tier: "Diamond",  trips: "60+", perk: "15% + free reschedule",  color: "#22d3ee" },
              ].map((tier) => (
                <div
                  key={tier.tier}
                  className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                    <span className="text-sm font-extrabold text-[#1a1a2e]">{tier.tier}</span>
                  </div>
                  <p className="text-xs text-[#1a1a2e]/70">{tier.trips} {t("loyalty.tripsLabel")} · {tier.perk}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

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
                {t("app.badge")}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
                {t("app.headingPre")}
                <br />
                <span className="text-gold-gradient">{t("app.headingAccent")}</span>
              </h2>
              <p className="mt-4 text-lg text-white/75 max-w-lg">
                {t("app.subtitle")}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-2xl bg-black hover:bg-gray-900 px-5 py-3 border border-white/10 transition-colors"
                >
                  <Apple className="h-7 w-7 text-white" />
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 leading-none">
                      {t("app.appStoreTag")}
                    </p>
                    <p className="text-base font-bold text-white leading-tight">
                      {t("app.appStore")}
                    </p>
                  </div>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-2xl bg-black hover:bg-gray-900 px-5 py-3 border border-white/10 transition-colors"
                >
                  <Play className="h-6 w-6 text-white fill-white" />
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 leading-none">{t("app.playStoreTag")}</p>
                    <p className="text-base font-bold text-white leading-tight">
                      {t("app.playStore")}
                    </p>
                  </div>
                </a>
              </div>

              <p className="mt-5 text-xs text-white/50">
                {t("app.ratings")}
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
