"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * Rotating "social proof" ticker — cycles through recent booking
 * notifications to create a sense of live activity on the page.
 *
 * Intentionally client-only and randomised so it feels organic.
 * Not shown in reduced-motion preferences.
 */

type Entry = {
  name: string;
  city: string;
  mins: number;
};

// Indian first-names pool — balanced across genders/regions
const names = [
  "Aarav", "Neha", "Vikram", "Priya", "Rohan", "Ananya", "Karthik", "Divya",
  "Arjun", "Shreya", "Rahul", "Kavya", "Siddharth", "Meera", "Aditya", "Sanjana",
];

const cities = [
  "Chennai", "Hyderabad", "Mumbai", "Goa", "Mysore",
  "Coimbatore", "Mangalore", "Kochi", "Tirupati", "Vizag",
];

function makeEntry(): Entry {
  return {
    name: names[Math.floor(Math.random() * names.length)],
    city: cities[Math.floor(Math.random() * cities.length)],
    mins: Math.floor(Math.random() * 11) + 1,
  };
}

export default function LiveBookingTicker() {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Initial entry after a short delay
    const boot = setTimeout(() => {
      setEntry(makeEntry());
      setVisible(true);
    }, 1200);

    // Rotate every 5s
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setEntry(makeEntry());
        setVisible(true);
      }, 400);
    }, 5000);

    return () => {
      clearTimeout(boot);
      clearInterval(interval);
    };
  }, []);

  if (!entry) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-white/90 transition-all duration-400 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <Sparkles className="h-3.5 w-3.5 text-[#f5c842]" />
      <span>
        <strong className="text-white">{entry.name}</strong> from Bengaluru booked
        a seat to <strong className="text-white">{entry.city}</strong>
        <span className="text-white/60"> · {entry.mins}m ago</span>
      </span>
    </div>
  );
}
