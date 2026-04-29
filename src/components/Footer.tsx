"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bus,
  Mail,
  Phone,
  MapPin,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useT } from "@/lib/i18n";

// Inline brand glyphs — lucide-react v1 doesn't export these,
// and brand marks are better as their own SVG paths anyway.
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a2.998 2.998 0 0 0-2.11-2.12C19.506 3.56 12 3.56 12 3.56s-7.506 0-9.388.506a2.998 2.998 0 0 0-2.11 2.12C0 8.068 0 12 0 12s0 3.932.502 5.814a2.998 2.998 0 0 0 2.11 2.12C4.494 20.44 12 20.44 12 20.44s7.506 0 9.388-.506a2.998 2.998 0 0 0 2.11-2.12C24 15.932 24 12 24 12s0-3.932-.502-5.814zM9.6 15.6V8.4L15.8 12z" />
    </svg>
  );
}
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.063 24 12.073z" />
    </svg>
  );
}
function AppleGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
function PlayStoreGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <defs>
        <linearGradient id="gp-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e2ff" />
          <stop offset="100%" stopColor="#00c2a8" />
        </linearGradient>
        <linearGradient id="gp-b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffce3d" />
          <stop offset="100%" stopColor="#ff9500" />
        </linearGradient>
        <linearGradient id="gp-c" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff5656" />
          <stop offset="100%" stopColor="#d40000" />
        </linearGradient>
        <linearGradient id="gp-d" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3eb8ff" />
          <stop offset="100%" stopColor="#2a52be" />
        </linearGradient>
      </defs>
      <path fill="url(#gp-a)" d="M3.6 2.4c-.3.3-.5.8-.5 1.4v16.4c0 .6.2 1.1.5 1.4l9.4-9.6-9.4-9.6z" />
      <path fill="url(#gp-b)" d="M16.4 15.3l3.4-1.9c.9-.5 1.3-1.4.8-2.1-.3-.4-.5-.6-.8-.8l-3.4-1.9L13 12l3.4 3.3z" />
      <path fill="url(#gp-c)" d="M4.5 21.4l8.5-9.4 3.4 3.3L5.6 21.9c-.4.2-.8.1-1.1-.5z" />
      <path fill="url(#gp-d)" d="M4.5 2.6l8.5 9.4 3.4-3.3L5.6 2.1c-.4-.2-.8-.1-1.1.5z" />
    </svg>
  );
}

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/corporate", label: "For Business" },
  { href: "/contact", label: "Contact" },
  { href: "/careers", label: "Careers" },
];
const supportLinks = [
  { href: "/help", label: "Help Centre" },
  { href: "/my-trips", label: "Cancel Ticket" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];
const destinations = [
  { href: "/search?from=city-blr&to=city-chn", label: "Bengaluru → Chennai" },
  { href: "/search?from=city-blr&to=city-hyd", label: "Bengaluru → Hyderabad" },
  { href: "/search?from=city-blr&to=city-goa", label: "Bengaluru → Goa" },
  { href: "/search?from=city-mum&to=city-goa", label: "Mumbai → Goa" },
  { href: "/search?from=city-blr&to=city-mys", label: "Bengaluru → Mysore" },
];

// Payment method "logos" — text badges, zero external dependencies
const paymentMethods = [
  { name: "UPI",          bg: "#0f766e" },
  { name: "Visa",         bg: "#1a1a6c" },
  { name: "Mastercard",   bg: "#eb001b" },
  { name: "RuPay",        bg: "#097839" },
  { name: "PhonePe",      bg: "#5f259f" },
  { name: "GPay",         bg: "#ffffff", textColor: "#1a1a2e" },
];

export default function Footer() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || submitting) return;
    setSubmitting(true);
    // Brief simulated round-trip so the spinner reads as a real network
    // call. Wire to a real /api/subscribe endpoint when the backend lands.
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  }

  return (
    <footer className="relative bg-[#1a1a2e] text-gray-400 mt-0 overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-[#1a3a8f]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/3 h-64 w-64 rounded-full bg-[#f5c842]/5 blur-3xl pointer-events-none" />

      {/* ── Newsletter band ── */}
      <div className="relative border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {t("footer.newsletterHeading")}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t("footer.newsletterSubtitle")}
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.emailPlaceholder")}
                aria-label="Email address"
                disabled={submitting}
                className="flex-1 lg:w-72 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[#f5c842] focus:ring-2 focus:ring-[#f5c842]/20 outline-none transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting || subscribed}
                aria-busy={submitting}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#f5c842] hover:bg-[#fde68a] text-[#1a1a2e] px-5 py-3 text-sm font-bold transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("footer.subscribing")}
                  </>
                ) : subscribed ? (
                  <>
                    <Shield className="h-4 w-4" />
                    {t("footer.subscribed")}
                  </>
                ) : (
                  <>
                    {t("footer.subscribe")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand column (spans 2 on mobile, 1 on desktop) */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-[#1a3a8f] to-[#2a52be] shadow-lg">
                <Bus className="h-5 w-5 text-[#f5c842]" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                NilaMadhaba
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-5">
              {t("footer.tagline")}
            </p>

            {/* Contact */}
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#f5c842] shrink-0" />
                <a href="tel:18001234567" className="hover:text-white transition-colors">
                  1800-123-4567
                </a>
                <span className="text-xs text-gray-600">· 24×7</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#f5c842] shrink-0" />
                <a href="mailto:support@nilamadhaba.com" className="hover:text-white transition-colors">
                  support@nilamadhaba.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#f5c842] shrink-0" />
                <span>Bengaluru, Karnataka</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-2 mt-5">
              {[
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: TwitterIcon,   label: "X / Twitter" },
                { Icon: YoutubeIcon,   label: "YouTube" },
                { Icon: FacebookIcon,  label: "Facebook" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-[#f5c842] hover:text-[#1a1a2e] hover:border-[#f5c842] transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t("footer.company")}
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t("footer.support")}
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular routes */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t("footer.popularRoutes")}
            </h4>
            <ul className="space-y-2.5">
              {destinations.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Trust + Download strip ── */}
        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment methods */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              {t("footer.securePayments")}
            </p>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((p) => (
                <span
                  key={p.name}
                  className="inline-flex items-center justify-center h-9 px-3 rounded-lg text-xs font-black tracking-tight shadow-sm"
                  style={{
                    backgroundColor: p.bg,
                    color: p.textColor ?? "#ffffff",
                  }}
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          {/* Download apps */}
          <div className="md:text-right">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              {t("footer.bookOnGo")}
            </p>
            <div className="flex md:justify-end gap-2">
              <a
                href="#"
                aria-label="Download on the App Store"
                className="flex items-center gap-2 rounded-xl bg-black hover:bg-gray-900 px-3.5 py-2 border border-white/10 transition-colors"
              >
                <AppleGlyph className="h-5 w-5 text-white" />
                <span className="text-[10px] text-white/70">App Store</span>
              </a>
              <a
                href="#"
                aria-label="Get it on Google Play"
                className="flex items-center gap-2 rounded-xl bg-black hover:bg-gray-900 px-3.5 py-2 border border-white/10 transition-colors"
              >
                <PlayStoreGlyph className="h-5 w-5" />
                <span className="text-[10px] text-white/70">Google Play</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Legal bar ── */}
      <div className="relative border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} NilaMadhaba Travels Pvt. Ltd. {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-emerald-500" />
              PCI-DSS compliant
            </span>
            <span>·</span>
            <span>ISO 9001:2015</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
