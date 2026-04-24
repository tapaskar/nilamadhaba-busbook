"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Bus,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Clock,
  Gauge,
  CheckCircle2,
  CalendarPlus,
  Ban,
  Bell,
  FileBarChart,
  ChevronRight,
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
import { schedules, routes, buses, cities } from "@/lib/mock-data";

// ── Mock chart data (until we wire real time-series) ────────────────────

const revenueChartData = [
  { day: "Mon", revenue: 385000 },
  { day: "Tue", revenue: 412000 },
  { day: "Wed", revenue: 367000 },
  { day: "Thu", revenue: 445000 },
  { day: "Fri", revenue: 498000 },
  { day: "Sat", revenue: 478000 },
  { day: "Sun", revenue: 423500 },
];

type TripStatus = "Scheduled" | "Boarding" | "In Transit" | "Completed";
const statusColors: Record<TripStatus, string> = {
  Scheduled:    "bg-blue-50 text-blue-600",
  Boarding:     "bg-amber-50 text-amber-600",
  "In Transit": "bg-emerald-50 text-emerald-600",
  Completed:    "bg-gray-100 text-gray-600",
};

const cityMap = Object.fromEntries(cities.map((c) => [c.id, c]));
const routeMap = Object.fromEntries(routes.map((r) => [r.id, r]));
const busMap = Object.fromEntries(buses.map((b) => [b.id, b]));

const liveTrips = [
  { route: `${cityMap[routeMap["route-blr-chn"].origin_city_id].name} → ${cityMap[routeMap["route-blr-chn"].destination_city_id].name}`, bus: busMap["bus-volvo-sleeper-1"].name.replace("NilaMadhaba ", ""), departure: "21:00", status: "Boarding" as TripStatus,    occupancy: 85, revenue: 38400 },
  { route: `${cityMap[routeMap["route-blr-hyd"].origin_city_id].name} → ${cityMap[routeMap["route-blr-hyd"].destination_city_id].name}`, bus: busMap["bus-volvo-sleeper-2"].name.replace("NilaMadhaba ", ""), departure: "20:00", status: "In Transit" as TripStatus, occupancy: 92, revenue: 45200 },
  { route: `${cityMap[routeMap["route-blr-mum"].origin_city_id].name} → ${cityMap[routeMap["route-blr-mum"].destination_city_id].name}`, bus: busMap["bus-scania-premium-1"].name.replace("NilaMadhaba ", ""), departure: "20:00", status: "Scheduled" as TripStatus,  occupancy: 67, revenue: 75600 },
  { route: `${cityMap[routeMap["route-blr-goa"].origin_city_id].name} → ${cityMap[routeMap["route-blr-goa"].destination_city_id].name}`, bus: busMap["bus-volvo-sleeper-2"].name.replace("NilaMadhaba ", ""), departure: "19:00", status: "In Transit" as TripStatus, occupancy: 78, revenue: 42100 },
  { route: `${cityMap[routeMap["route-mum-goa"].origin_city_id].name} → ${cityMap[routeMap["route-mum-goa"].destination_city_id].name}`, bus: busMap["bus-scania-premium-2"].name.replace("NilaMadhaba ", ""), departure: "19:00", status: "Completed" as TripStatus,  occupancy: 95, revenue: 61800 },
];

const quickActions = [
  { label: "Add Schedule",  icon: CalendarPlus, color: "bg-[#1a3a8f] text-white hover:bg-[#142d70]" },
  { label: "Block Seat",    icon: Ban,           color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  { label: "Send Alert",    icon: Bell,          color: "bg-[#e8edf8] text-[#1a3a8f] hover:bg-[#d4dcf2]" },
  { label: "View Reports",  icon: FileBarChart,  color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
];

// ── Live stats type ─────────────────────────────────────────────────────

type LiveStats = {
  today:      { bookings: number; revenue_paise: number };
  this_month: { bookings: number; revenue_paise: number };
  recent_bookings: { id: string; total_amount: number; contact_email: string; booked_at: string; status: string }[];
};

function formatINR(paise: number): string {
  return "\u20B9" + Math.round(paise / 100).toLocaleString("en-IN");
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value?: number; payload?: { day?: string } }[];
}) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
        <p className="text-xs font-medium text-gray-500">{payload[0]?.payload?.day}</p>
        <p className="text-sm font-bold text-gray-900">
          ₹{((payload[0]?.value ?? 0) / 1000).toFixed(0)}K
        </p>
      </div>
    );
  }
  return null;
}

// ── Stat card ──────────────────────────────────────────────────────────

function StatCard({
  title, value, trend, trendLabel, icon: Icon,
}: {
  title: string;
  value: string;
  trend: "up" | "down";
  trendLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-gray-100 p-2.5">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        }`}>
          {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trendLabel}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{title}</p>
    </div>
  );
}

// ── Page (just the content — chrome lives in layout.tsx) ───────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.stats) setStats(d.stats);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {stats && (
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 text-xs font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live data from Neon Postgres
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Today's Bookings" value={stats ? String(stats.today.bookings)             : "—"} trend="up" trendLabel="vs yesterday" icon={Calendar}      />
        <StatCard title="Today's Revenue"  value={stats ? formatINR(stats.today.revenue_paise)     : "—"} trend="up" trendLabel="vs yesterday" icon={IndianRupee}   />
        <StatCard title="Month Bookings"   value={stats ? String(stats.this_month.bookings)        : "—"} trend="up" trendLabel="month-to-date" icon={Gauge}        />
        <StatCard title="Month Revenue"    value={stats ? formatINR(stats.this_month.revenue_paise): "—"} trend="up" trendLabel="month-to-date" icon={CheckCircle2} />
      </div>

      {/* Revenue chart + Quick actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Revenue (Last 7 Days)</h2>
              <p className="text-sm text-gray-500">
                Total: ₹{(revenueChartData.reduce((s, d) => s + d.revenue, 0) / 100000).toFixed(1)}L
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} tickFormatter={(v: number) => `₹${v / 1000}K`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="revenue" fill="#1a3a8f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`flex flex-col items-center gap-2 rounded-xl p-4 text-sm font-medium transition-colors ${action.color}`}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-center text-xs leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active buses</span>
              <span className="font-medium text-gray-900">{buses.filter((b) => b.is_active).length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active schedules</span>
              <span className="font-medium text-gray-900">{schedules.filter((s) => s.is_active).length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Routes served</span>
              <span className="font-medium text-gray-900">{routes.filter((r) => r.is_active).length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Cities covered</span>
              <span className="font-medium text-gray-900">{cities.filter((c) => c.is_active).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live trips */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Live Trips</h2>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {liveTrips.length} trips today
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {["Route", "Bus", "Departure", "Status", "Occupancy", "Revenue"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {liveTrips.map((trip, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">{trip.route}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-600">{trip.bus}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {trip.departure}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[trip.status]}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${
                            trip.occupancy >= 80 ? "bg-emerald-500"
                              : trip.occupancy >= 60 ? "bg-amber-400"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${trip.occupancy}%` }}
                        />
                      </div>
                      <span className="text-gray-600">{trip.occupancy}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">
                    ₹{trip.revenue.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent bookings — real Neon data */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Bookings (Live)</h2>
          <Link
            href="/admin/bookings"
            className="flex items-center gap-1 text-xs font-medium text-[#1a3a8f] hover:underline"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {!stats?.recent_bookings?.length && (
            <p className="px-5 py-8 text-sm text-center text-gray-400">
              No bookings yet. Book a trip on the public site to see it here.
            </p>
          )}
          {stats?.recent_bookings?.slice(0, 8).map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8edf8] text-xs font-bold text-[#1a3a8f]">
                {b.contact_email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {b.contact_email}
                  </span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
                    {b.id.slice(0, 8)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Status: <span className="capitalize">{b.status}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatINR(b.total_amount)}</p>
                <p className="text-xs text-gray-400">{timeAgo(b.booked_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-6" />
    </>
  );
}
