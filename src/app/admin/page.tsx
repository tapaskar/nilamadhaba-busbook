"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Bus,
  Ticket,
  Users,
  IndianRupee,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  Gauge,
  CheckCircle2,
  CalendarPlus,
  Ban,
  Bell,
  FileBarChart,
  Menu,
  X,
  ChevronRight,
  LogOut,
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
import { formatTime } from "@/lib/constants";

// ── Sidebar nav items ──

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Schedules", icon: Calendar, active: false },
  { label: "Fleet", icon: Bus, active: false },
  { label: "Bookings", icon: Ticket, active: false },
  { label: "Customers", icon: Users, active: false },
  { label: "Revenue", icon: IndianRupee, active: false },
  { label: "Settings", icon: Settings, active: false },
];

// ── Mock data: Revenue chart (last 7 days) ──

const revenueChartData = [
  { day: "Mon", revenue: 385000 },
  { day: "Tue", revenue: 412000 },
  { day: "Wed", revenue: 367000 },
  { day: "Thu", revenue: 445000 },
  { day: "Fri", revenue: 498000 },
  { day: "Sat", revenue: 478000 },
  { day: "Sun", revenue: 423500 },
];

// ── Mock data: Live trips ──

type TripStatus = "Scheduled" | "Boarding" | "In Transit" | "Completed";

interface LiveTrip {
  route: string;
  bus: string;
  departure: string;
  status: TripStatus;
  occupancy: number;
  revenue: number;
}

const cityMap = Object.fromEntries(cities.map((c) => [c.id, c]));
const routeMap = Object.fromEntries(routes.map((r) => [r.id, r]));
const busMap = Object.fromEntries(buses.map((b) => [b.id, b]));

const liveTrips: LiveTrip[] = [
  {
    route: `${cityMap[routeMap["route-blr-chn"].origin_city_id].name} → ${cityMap[routeMap["route-blr-chn"].destination_city_id].name}`,
    bus: busMap["bus-volvo-sleeper-1"].registration_number,
    departure: formatTime(schedules.find((s) => s.id === "sch-blr-chn-2100")!.departure_time),
    status: "In Transit",
    occupancy: 88,
    revenue: 62500,
  },
  {
    route: `${cityMap[routeMap["route-blr-hyd"].origin_city_id].name} → ${cityMap[routeMap["route-blr-hyd"].destination_city_id].name}`,
    bus: busMap["bus-volvo-sleeper-2"].registration_number,
    departure: formatTime(schedules.find((s) => s.id === "sch-blr-hyd-2000")!.departure_time),
    status: "In Transit",
    occupancy: 75,
    revenue: 54200,
  },
  {
    route: `${cityMap[routeMap["route-blr-mum"].origin_city_id].name} → ${cityMap[routeMap["route-blr-mum"].destination_city_id].name}`,
    bus: busMap["bus-scania-premium-1"].registration_number,
    departure: formatTime(schedules.find((s) => s.id === "sch-blr-mum-2000")!.departure_time),
    status: "Boarding",
    occupancy: 62,
    revenue: 71800,
  },
  {
    route: `${cityMap[routeMap["route-blr-goa"].origin_city_id].name} → ${cityMap[routeMap["route-blr-goa"].destination_city_id].name}`,
    bus: busMap["bus-nonac-sleeper-1"].registration_number,
    departure: formatTime(schedules.find((s) => s.id === "sch-blr-goa-2130")!.departure_time),
    status: "Scheduled",
    occupancy: 45,
    revenue: 28700,
  },
  {
    route: `${cityMap[routeMap["route-mum-goa"].origin_city_id].name} → ${cityMap[routeMap["route-mum-goa"].destination_city_id].name}`,
    bus: busMap["bus-scania-premium-2"].registration_number,
    departure: formatTime(schedules.find((s) => s.id === "sch-mum-goa-1900")!.departure_time),
    status: "In Transit",
    occupancy: 92,
    revenue: 83400,
  },
  {
    route: `${cityMap[routeMap["route-blr-mys"].origin_city_id].name} → ${cityMap[routeMap["route-blr-mys"].destination_city_id].name}`,
    bus: busMap["bus-volvo-seater-1"].registration_number,
    departure: formatTime(schedules.find((s) => s.id === "sch-blr-mys-0700")!.departure_time),
    status: "Completed",
    occupancy: 96,
    revenue: 38200,
  },
  {
    route: `${cityMap[routeMap["route-chn-hyd"].origin_city_id].name} → ${cityMap[routeMap["route-chn-hyd"].destination_city_id].name}`,
    bus: busMap["bus-volvo-seater-2"].registration_number,
    departure: formatTime(schedules.find((s) => s.id === "sch-chn-hyd-2000")!.departure_time),
    status: "Boarding",
    occupancy: 70,
    revenue: 45600,
  },
  {
    route: `${cityMap[routeMap["route-blr-kch"].origin_city_id].name} → ${cityMap[routeMap["route-blr-kch"].destination_city_id].name}`,
    bus: busMap["bus-scania-premium-1"].registration_number,
    departure: formatTime(schedules.find((s) => s.id === "sch-blr-kch-2000")!.departure_time),
    status: "Scheduled",
    occupancy: 54,
    revenue: 52100,
  },
];

// ── Mock data: Recent bookings ──

interface RecentBooking {
  id: string;
  route: string;
  passenger: string;
  seats: number;
  amount: number;
  timeAgo: string;
}

const recentBookings: RecentBooking[] = [
  { id: "BK-7821", route: "Bengaluru → Chennai", passenger: "Rahul Sharma", seats: 2, amount: 2198, timeAgo: "2 min ago" },
  { id: "BK-7820", route: "Bengaluru → Hyderabad", passenger: "Priya Nair", seats: 1, amount: 1399, timeAgo: "5 min ago" },
  { id: "BK-7819", route: "Mumbai → Goa", passenger: "Amit Patel", seats: 3, amount: 4797, timeAgo: "8 min ago" },
  { id: "BK-7818", route: "Bengaluru → Mumbai", passenger: "Sneha Reddy", seats: 1, amount: 1899, timeAgo: "12 min ago" },
  { id: "BK-7817", route: "Chennai → Hyderabad", passenger: "Vikram Singh", seats: 2, amount: 2598, timeAgo: "18 min ago" },
  { id: "BK-7816", route: "Bengaluru → Goa", passenger: "Deepa Menon", seats: 2, amount: 2598, timeAgo: "22 min ago" },
  { id: "BK-7815", route: "Bengaluru → Mysore", passenger: "Karthik R", seats: 4, amount: 1596, timeAgo: "31 min ago" },
  { id: "BK-7814", route: "Bengaluru → Coimbatore", passenger: "Lakshmi Iyer", seats: 1, amount: 999, timeAgo: "38 min ago" },
  { id: "BK-7813", route: "Bengaluru → Kochi", passenger: "Arjun Das", seats: 2, amount: 3198, timeAgo: "45 min ago" },
  { id: "BK-7812", route: "Bengaluru → Chennai", passenger: "Meera Joshi", seats: 1, amount: 1199, timeAgo: "52 min ago" },
];

// ── Status badge color map ──

const statusColors: Record<TripStatus, string> = {
  Scheduled: "bg-blue-100 text-blue-700",
  Boarding: "bg-amber-100 text-amber-700",
  "In Transit": "bg-emerald-100 text-emerald-700",
  Completed: "bg-gray-100 text-gray-600",
};

// ── Quick actions ──

const quickActions = [
  { label: "Add Schedule", icon: CalendarPlus, color: "bg-primary text-white hover:bg-primary-dark" },
  { label: "Block Seats", icon: Ban, color: "bg-gray-800 text-white hover:bg-gray-900" },
  { label: "Send Notification", icon: Bell, color: "bg-secondary text-white hover:bg-secondary-dark" },
  { label: "View Reports", icon: FileBarChart, color: "bg-emerald-600 text-white hover:bg-emerald-700" },
];

// ── Custom tooltip for chart ──

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">
        ₹{(payload[0].value / 1000).toFixed(0)}K
      </p>
    </div>
  );
}

// ── Stat card ──

function StatCard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
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
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            trend === "up"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {trendLabel}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{title}</p>
    </div>
  );
}

// ── Main component ──

type LiveStats = {
  today: { bookings: number; revenue_paise: number };
  this_month: { bookings: number; revenue_paise: number };
  recent_bookings: { id: string; total_amount: number; contact_email: string; booked_at: string; status: string }[];
};

function formatINR(paise: number): string {
  return "\u20B9" + Math.round(paise / 100).toLocaleString("en-IN");
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ email: string; full_name: string | null } | null>(null);
  const [stats, setStats] = useState<LiveStats | null>(null);

  // Load admin profile + dashboard stats
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (!d?.admin) {
          router.replace("/admin/login");
        } else {
          setAdmin(d.admin);
        }
      })
      .catch(() => router.replace("/admin/login"));

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
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-5">
          <Bus className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-gray-900">BusBook</span>
          <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
            Admin
          </span>
          <button
            className="ml-auto rounded-md p-1 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="mt-4 space-y-0.5 px-3">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
          <button
            className="rounded-md p-1.5 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <span className="hidden text-sm text-gray-500 sm:block">
            Welcome back{admin?.full_name ? `, ${admin.full_name.split(" ")[0]}` : ""}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
              All systems operational
            </span>
            {admin && (
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[#1a3a8f] text-[#f5c842] text-xs font-bold">
                  {admin.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {admin.email}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Live data badge */}
          {stats && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 text-xs font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live data from Neon Postgres
            </div>
          )}

          {/* Stat cards — live values when available, otherwise placeholder */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Today's Bookings"
              value={stats ? String(stats.today.bookings) : "—"}
              trend="up"
              trendLabel="vs yesterday"
              icon={Calendar}
            />
            <StatCard
              title="Today's Revenue"
              value={stats ? formatINR(stats.today.revenue_paise) : "—"}
              trend="up"
              trendLabel="vs yesterday"
              icon={IndianRupee}
            />
            <StatCard
              title="Month Bookings"
              value={stats ? String(stats.this_month.bookings) : "—"}
              trend="up"
              trendLabel="month-to-date"
              icon={Gauge}
            />
            <StatCard
              title="Month Revenue"
              value={stats ? formatINR(stats.this_month.revenue_paise) : "—"}
              trend="up"
              trendLabel="month-to-date"
              icon={CheckCircle2}
            />
          </div>

          {/* Revenue chart + Quick actions */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Revenue chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Revenue (Last 7 Days)
                  </h2>
                  <p className="text-sm text-gray-500">
                    Total: ₹{(revenueChartData.reduce((s, d) => s + d.revenue, 0) / 100000).toFixed(1)}L
                  </p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={(v: number) => `₹${v / 1000}K`}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9fafb" }} />
                    <Bar dataKey="revenue" fill="#dc2626" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 text-sm font-medium transition-colors ${action.color}`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-center text-xs leading-tight">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Mini summary */}
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

          {/* Live trips table */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Live Trips
              </h2>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                {liveTrips.length} trips today
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Route
                    </th>
                    <th className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Bus
                    </th>
                    <th className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Departure
                    </th>
                    <th className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Occupancy
                    </th>
                    <th className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {liveTrips.map((trip, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">
                        {trip.route}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                        {trip.bus}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {trip.departure}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[trip.status]}`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${
                                trip.occupancy >= 80
                                  ? "bg-emerald-500"
                                  : trip.occupancy >= 60
                                    ? "bg-amber-400"
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

          {/* Recent bookings feed */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Recent Bookings
              </h2>
              <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                    {booking.passenger
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {booking.passenger}
                      </span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
                        {booking.id}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {booking.route} &middot; {booking.seats}{" "}
                      {booking.seats === 1 ? "seat" : "seats"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₹{booking.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-400">{booking.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom spacer */}
          <div className="h-6" />
        </main>
      </div>
    </div>
  );
}
