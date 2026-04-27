"use client";

import { useEffect, useState } from "react";

/**
 * Public site settings (fare policy, support contacts, etc.).
 *
 * One fetch is shared across the whole client — all components calling
 * useSiteSettings() get the same in-flight promise the first time, then
 * the resolved value forever. No re-fetches per render.
 */

export type SiteSettings = {
  support_phone:             string;
  support_email:             string;
  support_whatsapp:          string;
  support_hours:             string;
  booking_window_days:       number;
  cancel_free_hours:         number;
  gst_pct:                   number;
  loyalty_discount_pct:      number;
  convenience_fee_paise:     number;
  insurance_per_seat_paise:  number;
  meal_veg_paise:            number;
  meal_nonveg_paise:         number;
  seat_upgrade_paise:        number;
  refund_12h_pct:            number;
  refund_6h_pct:             number;
  refund_2h_pct:             number;
  insurance_coverage_label:  string;
  insurance_partner_label:   string;
};

const DEFAULTS: SiteSettings = {
  support_phone:             "1800-123-4567",
  support_email:             "support@nilamadhaba.com",
  support_whatsapp:          "919876543210",
  support_hours:             "24×7",
  booking_window_days:       60,
  cancel_free_hours:         12,
  gst_pct:                   5,
  loyalty_discount_pct:      5,
  convenience_fee_paise:     0,
  insurance_per_seat_paise:  4900,
  meal_veg_paise:            9900,
  meal_nonveg_paise:         12900,
  seat_upgrade_paise:        5000,
  refund_12h_pct:            100,
  refund_6h_pct:             75,
  refund_2h_pct:             50,
  insurance_coverage_label:  "₹2 lakh",
  insurance_partner_label:   "ICICI Lombard",
};

let _cache: SiteSettings | null = null;
let _inFlight: Promise<SiteSettings> | null = null;

function num(v: unknown, d: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function str(v: unknown, d: string) {
  return typeof v === "string" && v.length > 0 ? v : d;
}

function fetchOnce(): Promise<SiteSettings> {
  if (_cache) return Promise.resolve(_cache);
  if (_inFlight) return _inFlight;
  _inFlight = fetch("/api/settings", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => {
      const s = (d?.settings ?? {}) as Record<string, string>;
      const merged: SiteSettings = {
        support_phone:             str(s.support_phone,             DEFAULTS.support_phone),
        support_email:             str(s.support_email,             DEFAULTS.support_email),
        support_whatsapp:          str(s.support_whatsapp,          DEFAULTS.support_whatsapp),
        support_hours:             str(s.support_hours,             DEFAULTS.support_hours),
        booking_window_days:       num(s.booking_window_days,       DEFAULTS.booking_window_days),
        cancel_free_hours:         num(s.cancel_free_hours,         DEFAULTS.cancel_free_hours),
        gst_pct:                   num(s.gst_pct,                   DEFAULTS.gst_pct),
        loyalty_discount_pct:      num(s.loyalty_discount_pct,      DEFAULTS.loyalty_discount_pct),
        convenience_fee_paise:     num(s.convenience_fee_paise,     DEFAULTS.convenience_fee_paise),
        insurance_per_seat_paise:  num(s.insurance_per_seat_paise,  DEFAULTS.insurance_per_seat_paise),
        meal_veg_paise:            num(s.meal_veg_paise,            DEFAULTS.meal_veg_paise),
        meal_nonveg_paise:         num(s.meal_nonveg_paise,         DEFAULTS.meal_nonveg_paise),
        seat_upgrade_paise:        num(s.seat_upgrade_paise,        DEFAULTS.seat_upgrade_paise),
        refund_12h_pct:            num(s.refund_12h_pct,            DEFAULTS.refund_12h_pct),
        refund_6h_pct:             num(s.refund_6h_pct,             DEFAULTS.refund_6h_pct),
        refund_2h_pct:             num(s.refund_2h_pct,             DEFAULTS.refund_2h_pct),
        insurance_coverage_label:  str(s.insurance_coverage_label,  DEFAULTS.insurance_coverage_label),
        insurance_partner_label:   str(s.insurance_partner_label,   DEFAULTS.insurance_partner_label),
      };
      _cache = merged;
      return merged;
    })
    .catch(() => {
      _cache = DEFAULTS;
      return DEFAULTS;
    });
  return _inFlight;
}

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(_cache ?? DEFAULTS);

  useEffect(() => {
    let mounted = true;
    fetchOnce().then((s) => {
      if (mounted) setSettings(s);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}
