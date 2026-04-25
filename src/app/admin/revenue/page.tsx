"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee,
  Users,
  Ticket,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Daily = { day: string; bookings: number; revenue: number };
type RouteAgg = { route_id: string; origin: string; destination: string; bookings: number; revenue: number; avg_revenue: number };
type BusAgg = { id: string; name: string; registration_number: string; bookings: number; revenue: number; seats_sold: number };

type Payload = {
  days: number;
  since: string;
  totals: { bookings: number; revenue: number; unique_customers: number };
  daily: Daily[];
  by_route: RouteAgg[];
  by_bus: BusAgg[];
};

function formatINR(paise: number): string {
  return "\u20B9" + Math.round(paise / 100).toLocaleString("en-IN");
}

function formatINRCompact(paise: number): string {
  const r = Math.round(paise / 100);
  if (r >= 10_000_000) return "\u20B9" + (r / 10_000_000).toFixed(1) + "Cr";
  if (r >= 100_000)    return "\u20B9" + (r / 100_000).toFixed(1) + "L";
  if (r >= 1_000)      return "\u20B9" + (r / 1_000).toFixed(0) + "K";
  return "\u20B9" + r;
}

export default function AdminRevenuePage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/revenue?days=${days}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.totals) {
          // Number-cast the bigint-as-string values
          setData({
            ...d,
            totals: {
              ...d.totals,
              revenue: Number(d.totals.revenue),
            },
            daily: (d.daily as Daily[]).map((row) => ({ ...row, revenue: Number(row.revenue) })),
            by_route: (d.by_route as RouteAgg[]).map((r) => ({ ...r, revenue: Number(r.revenue), avg_revenue: Number(r.avg_revenue) })),
            by_bus: (d.by_bus as BusAgg[]).map((b) => ({ ...b, revenue: Number(b.revenue) })),
          });
        } else {
          setError(d?.error || "Failed to load");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm inline-flex">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                days === d
                  ? "bg-[#1a3a8f] text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Last {d} days
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        <Tile
          icon={IndianRupee}
          label="Revenue"
          value={data ? formatINRCompact(data.totals.revenue) : "—"}
          accent="#1a3a8f"
        />
        <Tile
          icon={Ticket}
          label="Bookings"
          value={data ? data.totals.bookings.toLocaleString("en-IN") : "—"}
          accent="#2a52be"
        />
        <Tile
          icon={Users}
          label="Unique customers"
          value={data ? data.totals.unique_customers.toLocaleString("en-IN") : "—"}
          accent="#f5c842"
        />
      </div>

      {/* Daily revenue chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            Revenue trend
          </h2>
        </div>
        <div className="h-72">
          {data && data.daily.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily} barSize={Math.max(8, 32 - days)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} interval={Math.floor(data.daily.length / 8) || 0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={(v: number) => formatINRCompact(v)} />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const p = payload[0].payload as Daily;
                      return (
                        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                          <p className="text-xs font-medium text-gray-500">{p.day}</p>
                          <p className="text-sm font-bold text-gray-900">{formatINR(Number(p.revenue))}</p>
                          <p className="text-[10px] text-gray-500">{p.bookings} bookings</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#1a3a8f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="h-full flex items-center justify-center text-sm text-gray-400">
              {loading ? "Loading…" : "No bookings in this window."}
            </p>
          )}
        </div>
      </div>

      {/* Top routes + Top buses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Top routes</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                {["Route", "Bookings", "Revenue"].map((h) => (
                  <th key={h} className="px-5 py-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(!data || data.by_route.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">
                    No data yet.
                  </td>
                </tr>
              )}
              {data?.by_route.map((r) => (
                <tr key={r.route_id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-2.5 text-sm font-medium text-gray-900">
                    {r.origin} → {r.destination}
                  </td>
                  <td className="px-5 py-2.5 text-xs text-gray-700">{r.bookings}</td>
                  <td className="px-5 py-2.5 text-sm font-bold text-[#1a3a8f]">{formatINR(Number(r.revenue))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Top buses</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                {["Bus", "Seats sold", "Revenue"].map((h) => (
                  <th key={h} className="px-5 py-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(!data || data.by_bus.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">
                    No data yet.
                  </td>
                </tr>
              )}
              {data?.by_bus.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-2.5">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {b.name.replace("NilaMadhaba ", "")}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400">{b.registration_number}</p>
                  </td>
                  <td className="px-5 py-2.5 text-xs text-gray-700">{b.seats_sold}</td>
                  <td className="px-5 py-2.5 text-sm font-bold text-[#1a3a8f]">{formatINR(Number(b.revenue))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="rounded-lg bg-gray-100 p-2">
          <Icon className="h-4 w-4 text-gray-600" />
        </div>
      </div>
      <p className="text-xl sm:text-3xl font-extrabold tracking-tight" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}
