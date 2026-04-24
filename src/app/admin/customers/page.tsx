"use client";

import AdminPlaceholder from "@/components/AdminPlaceholder";
import { Users } from "lucide-react";

export default function AdminCustomersPage() {
  return (
    <AdminPlaceholder
      title="Customers"
      description="Search, segment, and engage with your traveller base."
      icon={Users}
      features={[
        "Search any traveller by phone, email, or booking ID",
        "View their full booking history, lifetime spend, and loyalty tier",
        "Send a manual SMS / WhatsApp / email from inside the dashboard",
        "Tag VIP travellers for priority support",
        "Export segment lists for marketing campaigns (Mailchimp / Sendinblue)",
      ]}
    />
  );
}
