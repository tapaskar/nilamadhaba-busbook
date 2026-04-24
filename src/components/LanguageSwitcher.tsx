"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n, locales, type Locale } from "@/lib/i18n";

/**
 * Compact header language switcher.
 *
 * Trigger: globe icon + current locale's native label.
 * On click: dropdown with all available locales, checkmark on active.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function pick(l: Locale) {
    setLocale(l);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-[#1a3a8f] hover:border-[#1a3a8f]/30 hover:bg-[#e8edf8]/60 transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current.native}</span>
        <span className="sm:hidden uppercase">{current.code}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-chat-in">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Language
          </p>
          {locales.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => pick(l.code)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors ${
                l.code === locale
                  ? "bg-[#e8edf8]/60 text-[#1a3a8f] font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>
                <span className="block">{l.native}</span>
                <span className="block text-[10px] text-gray-400 font-normal">
                  {l.label}
                </span>
              </span>
              {l.code === locale && <Check className="h-4 w-4 text-[#1a3a8f]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
