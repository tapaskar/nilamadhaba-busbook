"use client";

import AdminPlaceholder from "@/components/AdminPlaceholder";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholder
      title="Settings"
      description="Configure brand, payments, notifications, and platform behaviour."
      icon={Settings}
      features={[
        "Brand: logo, contact details, social handles, support hours",
        "Payments: Razorpay / Stripe keys, refund policy windows",
        "Notifications: SMS gateway, WhatsApp Business number, email sender",
        "Pricing rules: dynamic-pricing curve, weekend / festival surcharges",
        "GST + invoice template configuration",
      ]}
    />
  );
}
