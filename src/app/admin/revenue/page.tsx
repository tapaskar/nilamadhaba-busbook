"use client";

import AdminPlaceholder from "@/components/AdminPlaceholder";
import { IndianRupee } from "lucide-react";

export default function AdminRevenuePage() {
  return (
    <AdminPlaceholder
      title="Revenue"
      description="Deep-dive into your revenue performance with cohort, route, and time-of-day breakdowns."
      icon={IndianRupee}
      features={[
        "Daily / weekly / monthly revenue trend with year-over-year comparison",
        "Per-route P&L: ticket revenue, refunds, fuel cost, crew wages",
        "Add-on attachment rates: insurance, meals, seat upgrades",
        "GST report ready to hand to your accountant",
        "Export CSV / Excel / Tally-compatible JSON",
      ]}
    />
  );
}
