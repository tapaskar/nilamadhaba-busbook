"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Crown,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";

type CustomerRow = {
  contact_email: string;
  contact_phone: string;
  bookings: number;
  lifetime_spend: number | string; // bigint comes through as string sometimes
  last_booking: string;
  confirmed: number;
  cancelled: number;
};

function formatINR(paise: number | string): string {
  const n = typeof paise === "string" ? parseInt(paise, 10) : paise;
  return "\u20B9" + Math.round(n / 100).toLocaleString("en-IN");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function tier(spendPaise: number): { label: string; color: string } {
  const r = spendPaise / 100;
  if (r >= 50_000) return { label: "VIP",      color: "bg-[#f5c842] text-[#1a1a2e]" };
  if (r >= 20_000) return { label: "Gold",     color: "bg-amber-100 text-amber-700" };
  if (r >= 5_000)  return { label: "Silver",   color: "bg-gray-200 text-gray-700"   };
  return                  { label: "Bronze",   color: "bg-orange-100 text-orange-700" };
}

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function load(q = query) {
    setLoading(true);
    setError(null);
    try {
      const url = q.trim() ? `/api/admin/customers?q=${encodeURIComponent(q)}` : "/api/admin/customers";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load");
      } else {
        setRows(data.customers);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aggregate stats from current view
  const stats = useMemo(() => {
    const total = rows.length;
    const totalRevenue = rows.reduce((s, r) => s + (typeof r.lifetime_spend === "string" ? parseInt(r.lifetime_spend, 10) : r.lifetime_spend), 0);
    const repeat = rows.filter((r) => r.bookings > 1).length;
    return { total, totalRevenue, repeat };
  }, [rows]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Tile label="Customers" value={stats.total.toLocaleString("en-IN")} accent="#1a3a8f" />
        <Tile label="Repeat customers" value={stats.repeat.toLocaleString("en-IN")} accent="#f5c842" />
        <Tile label="Total revenue" value={formatINR(stats.totalRevenue)} accent="#16a34a" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              All Customers
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Aggregated by email + phone. Top 200 shown, sorted by lifetime spend.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                load();
              }}
              className="relative flex-1 sm:w-72"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search email or phone..."
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-1.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
            </form>
            <button
              type="button"
              onClick={() => load()}
              title="Refresh"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:text-[#1a3a8f] hover:border-[#1a3a8f]/30 hover:bg-[#e8edf8]/50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 flex items-center gap-2 text-red-600 text-sm bg-red-50/50 border-b border-red-100">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                {["Customer", "Phone", "Bookings", "Lifetime Spend", "Tier", "Last Booking"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    {query.trim()
                      ? "No customers match your search."
                      : "No bookings yet — your first customer's details will land here."}
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const spend = typeof r.lifetime_spend === "string" ? parseInt(r.lifetime_spend, 10) : r.lifetime_spend;
                const t = tier(spend);
                return (
                  <tr key={`${r.contact_email}-${r.contact_phone}`} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#e8edf8] text-[#1a3a8f] text-xs font-bold shrink-0">
                          {r.contact_email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 text-gray-300 shrink-0" />
                            {r.contact_email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600 font-mono">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-300" />
                        {r.contact_phone}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <span className="font-bold text-gray-900">{r.bookings}</span>
                      <span className="text-xs text-gray-400 ml-1">
                        ({r.confirmed} ✓ {r.cancelled > 0 && `· ${r.cancelled} ✗`})
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-[#1a3a8f]">
                      {formatINR(spend)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${t.color}`}>
                        {t.label === "VIP" && <Crown className="h-3 w-3" />}
                        {t.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {formatDate(r.last_booking)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}
