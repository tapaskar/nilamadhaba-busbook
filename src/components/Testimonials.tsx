"use client";

import { Star, Quote } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { useT } from "@/lib/i18n";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Product Designer, Bengaluru",
    avatar: "PS",
    avatarBg: "linear-gradient(135deg, #1a3a8f, #2a52be)",
    rating: 5,
    quote:
      "Booked the 10 PM Volvo to Chennai. Clean sleeper, polite captain, landed exactly at 4 AM. The live tracking let my dad know when to leave home.",
    route: "Bengaluru → Chennai",
    date: "2 weeks ago",
  },
  {
    name: "Arjun Menon",
    role: "Engineering Manager, Kochi",
    avatar: "AM",
    avatarBg: "linear-gradient(135deg, #0d9488, #0f766e)",
    rating: 5,
    quote:
      "Zero-surprise pricing. The AC was actually cold (first time ever on an intercity bus), and charging ports actually worked. This is what bus travel should be.",
    route: "Bengaluru → Kochi",
    date: "1 month ago",
  },
  {
    name: "Neha Reddy",
    role: "Final-year student, Hyderabad",
    avatar: "NR",
    avatarBg: "linear-gradient(135deg, #7c3aed, #5b21b6)",
    rating: 5,
    quote:
      "Solo-travelled to Goa with my friends. The ladies-only seat option, CCTV, and SOS button made my parents relax for once. Will book every trip here.",
    route: "Hyderabad → Goa",
    date: "3 weeks ago",
  },
];

export default function Testimonials() {
  const t = useT();
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
      <ScrollReveal className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#e8edf8] text-[#1a3a8f] px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-4">
          <Star className="h-3 w-3 fill-[#f5c842] stroke-[#f5c842]" />
          {t("testimonials.badge")}
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          {t("testimonials.heading")}
        </h2>
        <p className="mt-3 text-gray-500 max-w-xl mx-auto">
          {t("testimonials.subtitle")}
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <ScrollReveal
            key={t.name}
            delay={(idx + 1) as 1 | 2 | 3}
            className="relative"
          >
            <div className="h-full rounded-3xl bg-white border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
              {/* Quote mark */}
              <Quote className="h-8 w-8 text-[#f5c842] mb-4" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < t.rating
                        ? "fill-[#f5c842] stroke-[#f5c842]"
                        : "stroke-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6 text-[15px]">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div
                  className="flex items-center justify-center h-11 w-11 rounded-full text-white font-bold text-sm shadow-md shrink-0"
                  style={{ background: t.avatarBg }}
                >
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500 truncate">{t.role}</p>
                </div>
              </div>

              {/* Route + date */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-[#1a3a8f] font-semibold">
                  {t.route}
                </span>
                <span className="text-gray-400">{t.date}</span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
