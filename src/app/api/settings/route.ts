/**
 * GET /api/settings
 *
 * Returns the public-safe subset of app_settings needed by the
 * consumer site (booking page, trip cards, footer, support hub).
 * Admin-only secrets stay locked behind /api/admin/settings.
 *
 * Cached briefly so the booking page doesn't hammer the DB.
 */

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Whitelist of keys exposed publicly. Anything not in this list never
// leaves the server (e.g. don't put SMS gateway tokens here).
const PUBLIC_KEYS = [
  "support_phone",
  "support_email",
  "support_whatsapp",
  "support_hours",
  "booking_window_days",
  "cancel_free_hours",
  "gst_pct",
  "loyalty_discount_pct",
  "convenience_fee_paise",
  "insurance_per_seat_paise",
  "meal_veg_paise",
  "meal_nonveg_paise",
  "seat_upgrade_paise",
  "refund_12h_pct",
  "refund_6h_pct",
  "refund_2h_pct",
  "insurance_coverage_label",
  "insurance_partner_label",
] as const;

// Built-in defaults — used when the row is missing OR the DB isn't
// configured (demo mode). Keeps the UI consistent.
const DEFAULTS: Record<string, string> = {
  support_phone:             "1800-123-4567",
  support_email:             "support@nilamadhaba.com",
  support_whatsapp:          "919876543210",
  support_hours:             "24×7",
  booking_window_days:       "60",
  cancel_free_hours:         "12",
  gst_pct:                   "5",
  loyalty_discount_pct:      "5",
  convenience_fee_paise:     "0",
  insurance_per_seat_paise:  "4900",
  meal_veg_paise:            "9900",
  meal_nonveg_paise:         "12900",
  seat_upgrade_paise:        "5000",
  refund_12h_pct:            "100",
  refund_6h_pct:             "75",
  refund_2h_pct:             "50",
  insurance_coverage_label:  "₹2 lakh",
  insurance_partner_label:   "ICICI Lombard",
};

export async function GET() {
  const db = sql();
  const out: Record<string, string> = { ...DEFAULTS };

  if (db) {
    try {
      const rows = (await db`
        SELECT key, value FROM app_settings
        WHERE key = ANY(${PUBLIC_KEYS as readonly string[]})
      `) as unknown as { key: string; value: string }[];
      for (const r of rows) {
        if (r.value !== null && r.value !== undefined) out[r.key] = r.value;
      }
    } catch {
      /* fall through to defaults */
    }
  }

  return NextResponse.json({ settings: out });
}
