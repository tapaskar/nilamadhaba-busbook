"use client";

import AdminPlaceholder from "@/components/AdminPlaceholder";
import { Bus } from "lucide-react";

export default function AdminFleetPage() {
  return (
    <AdminPlaceholder
      title="Fleet"
      description="Manage every vehicle in your fleet — registration, seat layouts, amenities, and live GPS status."
      icon={Bus}
      features={[
        "Add a new bus with custom seat layout (sleeper / seater / 2+1 / 2+2)",
        "Toggle a bus offline for maintenance — auto-removes it from search",
        "View AIS-140 GPS device status per vehicle",
        "Track odometer, last service date, and driver assignment",
        "Upload photos for the public listings",
      ]}
    />
  );
}
