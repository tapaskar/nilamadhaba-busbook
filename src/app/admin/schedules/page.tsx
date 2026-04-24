"use client";

import AdminPlaceholder from "@/components/AdminPlaceholder";
import { Calendar } from "lucide-react";

export default function AdminSchedulesPage() {
  return (
    <AdminPlaceholder
      title="Schedules"
      description="Create, edit, and manage recurring departure schedules across all your routes."
      icon={Calendar}
      features={[
        "Create new recurring schedules (route + bus + departure time + days of week)",
        "Toggle individual departures on/off without losing history",
        "Override price for specific dates (festive surge, off-season discounts)",
        "Cancel a one-off instance and auto-refund all impacted bookings",
        "See conflict warnings when a bus is double-booked",
      ]}
    />
  );
}
