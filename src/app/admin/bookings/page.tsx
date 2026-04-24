"use client";

import { useEffect, useState } from "react";
import { Ticket, Search, RefreshCw, AlertCircle } from "lucide-react";

type BookingRow = {
  id: string;
  user_id: string;
  schedule_id: string;
  travel_date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_amount: number;
  payment_status: string;
  contact_email: string;
  contact_phone: string;
  booked_at: string;
  origin_city: string;
  destination_city: string;
  bus_name: string;
  departure_time: string;
};

const statusBadge: Record<BookingRow["status"], string> = {
  pending:   "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-gray-100 text-gray-600",
};

function formatINR(paise: number): string {
  return "\u20B9" + Math.round(paise / 100).toLocaleString("en-IN");
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load bookings");
      } else {
        setRows(data.bookings);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = query.trim()
    ? rows.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.contact_email.toLowerCase().includes(q) ||
          r.contact_phone.toLowerCase().includes(q) ||
          r.origin_city.toLowerCase().includes(q) ||
          r.destination_city.toLowerCase().includes(q)
        );
      })
    : rows;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-gray-400" />
              All Bookings
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading
                ? "Loading…"
                : `${filtered.length} of ${rows.length} bookings`}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, email, phone, city…"
                className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-1.5 text-sm focus:border-[#1a3a8f] focus:ring-2 focus:ring-[#1a3a8f]/20 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={load}
              title="Refresh"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:text-[#1a3a8f] hover:border-[#1a3a8f]/30 hover:bg-[#e8edf8]/50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 flex items-center justify-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                {["Booking ID", "Route", "Travel Date", "Bus", "Customer", "Amount", "Status", "Booked"].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    {rows.length === 0
                      ? "No bookings yet — make one on the public site to see it here."
                      : "No bookings match your search."}
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-900">
                    {r.id.slice(0, 8)}…
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-900 font-medium">
                    {r.origin_city} → {r.destination_city}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {r.travel_date}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">
                    {r.bus_name.replace("NilaMadhaba ", "")}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-gray-900 truncate max-w-[180px]">
                      {r.contact_email}
                    </p>
                    <p className="text-xs text-gray-500">{r.contact_phone}</p>
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-gray-900">
                    {formatINR(r.total_amount)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold capitalize ${statusBadge[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {formatDateTime(r.booked_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
