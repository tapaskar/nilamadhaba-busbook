export const BUS_TYPES = [
  { value: "seater", label: "Seater" },
  { value: "sleeper", label: "Sleeper" },
  { value: "semi_sleeper", label: "Semi Sleeper" },
] as const;

export const AMENITIES = [
  "WiFi",
  "AC",
  "Charging Point",
  "Blanket",
  "Water Bottle",
  "Reading Light",
  "Track My Bus",
  "Emergency Exit",
  "CCTV",
  "Fire Extinguisher",
] as const;

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

export const MAX_SEATS_PER_BOOKING = 6;

export const SEAT_LOCK_DURATION_MINUTES = 10;

export const REFUND_TIERS = [
  { minHours: 24, percent: 90, label: "More than 24 hours before departure" },
  { minHours: 12, percent: 75, label: "12–24 hours before departure" },
  { minHours: 6, percent: 50, label: "6–12 hours before departure" },
  { minHours: 0, percent: 0, label: "Less than 6 hours before departure" },
] as const;

export function getRefundPercent(hoursBeforeDeparture: number): number {
  for (const tier of REFUND_TIERS) {
    if (hoursBeforeDeparture >= tier.minHours) {
      return tier.percent;
    }
  }
  return 0;
}

export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}
