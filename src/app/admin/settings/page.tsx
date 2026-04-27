"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Settings,
  Phone,
  Mail,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Percent,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";

type FieldDef = {
  key: string;
  label: string;
  icon: typeof Phone;
  type: "tel" | "email" | "text" | "number";
  placeholder: string;
  help: string;
  /** Optional grouping label rendered as an h3 above the field */
  group?: string;
};

const FIELDS: FieldDef[] = [
  // ─── Support contacts ─────────────────────────
  { group: "Support contacts", key: "support_phone",       label: "Support phone",                       icon: Phone,        type: "tel",    placeholder: "1800-123-4567",       help: "Toll-free number shown in the support hub and footer." },
  { key: "support_email",                                  label: "Support email",                       icon: Mail,         type: "email",  placeholder: "support@nilamadhaba.com", help: "Reply-to address for SMS / email confirmations." },
  { key: "support_whatsapp",                               label: "WhatsApp number (no +, no spaces)",   icon: Phone,        type: "tel",    placeholder: "919876543210",        help: "Used by the WhatsApp deep-link in the support hub." },
  { key: "support_hours",                                  label: "Support hours",                       icon: Clock,        type: "text",   placeholder: "24×7",                help: 'e.g. "24×7" or "9 AM – 9 PM, Mon–Sat"' },

  // ─── Booking policy ────────────────────────────
  { group: "Booking policy",  key: "booking_window_days",  label: "Booking window (days)",               icon: Calendar,     type: "number", placeholder: "60",                  help: "How far in advance customers can book." },
  { key: "cancel_free_hours",                              label: "Free-cancellation window (hours)",    icon: Clock,        type: "number", placeholder: "12",                  help: "Refund 100% if cancelled at least this many hours before departure." },

  // ─── Tax + discount rates ─────────────────────
  { group: "Fare rates",      key: "gst_pct",              label: "GST (%)",                             icon: Percent,      type: "number", placeholder: "5",                   help: "Applied on top of base fare after loyalty discount." },
  { key: "loyalty_discount_pct",                           label: "Loyalty discount (%)",                icon: Percent,      type: "number", placeholder: "5",                   help: "Discount applied to every booking by default." },
  { key: "convenience_fee_paise",                          label: "Convenience fee (paise)",             icon: IndianRupee,  type: "number", placeholder: "0",                   help: "Set to 0 to show the booking flow's 'FREE' label." },

  // ─── Add-ons ───────────────────────────────────
  { group: "Add-on prices",   key: "insurance_per_seat_paise", label: "Trip insurance (paise / seat)",   icon: ShieldCheck,  type: "number", placeholder: "4900",                help: "Defaults to ₹49 per seat. e.g. 4900 = ₹49." },
  { key: "meal_veg_paise",                                 label: "Veg meal (paise / seat)",             icon: IndianRupee,  type: "number", placeholder: "9900",                help: "9900 = ₹99 per seat." },
  { key: "meal_nonveg_paise",                              label: "Non-veg meal (paise / seat)",         icon: IndianRupee,  type: "number", placeholder: "12900",               help: "12900 = ₹129 per seat." },
  { key: "seat_upgrade_paise",                             label: "Lower-berth upgrade (paise)",         icon: IndianRupee,  type: "number", placeholder: "5000",                help: "5000 = ₹50 nudge price shown when user picks an upper berth." },
  { key: "insurance_coverage_label",                       label: "Insurance coverage copy",             icon: ShieldCheck,  type: "text",   placeholder: "₹2 lakh",             help: "Free-text copy shown next to the insurance checkbox." },
  { key: "insurance_partner_label",                        label: "Insurance partner",                   icon: ShieldCheck,  type: "text",   placeholder: "ICICI Lombard",       help: "Provider name shown to the user." },

  // ─── Refund tiers ─────────────────────────────
  { group: "Refund tiers (% of total)", key: "refund_12h_pct", label: "Cancel 12+ hrs before",          icon: Percent,      type: "number", placeholder: "100",                 help: "Refund % when cancelled at least 12 hours ahead." },
  { key: "refund_6h_pct",                                  label: "Cancel 6–12 hrs before",              icon: Percent,      type: "number", placeholder: "75",                  help: "Refund % when cancelled 6–12 hours ahead." },
  { key: "refund_2h_pct",                                  label: "Cancel 2–6 hrs before",               icon: Percent,      type: "number", placeholder: "50",                  help: "Refund % when cancelled 2–6 hours ahead. Under 2 hours always = 0%." },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings) setValues(d.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setSuccess(`Saved ${data.updated} setting${data.updated !== 1 ? "s" : ""}.`);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-400" />
            Platform settings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            These values feed the public website (footer, support hub, refund
            timer) and are updated live without redeploy.
          </p>
        </div>

        <form onSubmit={save} className="p-6 space-y-5">
          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {FIELDS.map((f, idx) => {
              const Icon = f.icon;
              return (
                <Fragment key={f.key}>
                  {f.group && (
                    <h3
                      className={`sm:col-span-2 text-xs font-bold text-[#1a3a8f] uppercase tracking-wider ${
                        idx > 0 ? "mt-3" : ""
                      } pb-1.5 border-b border-gray-100`}
                    >
                      {f.group}
                    </h3>
                  )}
                  <div>
                    <label
                      htmlFor={f.key}
                      className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5"
                    >
                      {f.label}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id={f.key}
                        type={f.type}
                        value={values[f.key] ?? ""}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [f.key]: e.target.value }))
                        }
                        placeholder={f.placeholder}
                        disabled={loading}
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">{f.help}</p>
                  </div>
                </Fragment>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3a8f] hover:bg-[#142d70] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm font-bold shadow-lg shadow-[#1a3a8f]/20 transition-all"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
