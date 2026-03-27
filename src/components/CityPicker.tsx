"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Search, X } from "lucide-react";
import type { City } from "@/lib/types";

interface CityPickerProps {
  label: string;
  value: string;
  onChange: (cityId: string, cityName: string) => void;
  cities: City[];
}

const POPULAR_LIMIT = 6;

export default function CityPicker({
  label,
  value,
  onChange,
  cities,
}: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCities = useMemo(
    () => cities.filter((c) => c.is_active),
    [cities]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return activeCities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
    );
  }, [query, activeCities]);

  const popular = useMemo(
    () => activeCities.slice(0, POPULAR_LIMIT),
    [activeCities]
  );

  const displayList = query.trim() ? filtered : popular;
  const showPopularLabel = !query.trim() && displayList.length > 0;

  function selectCity(city: City) {
    onChange(city.id, city.name);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`
          flex items-center gap-2 w-full rounded-xl border-2 px-3 py-2.5 text-left transition-colors
          ${open ? "border-primary bg-primary-light" : "border-gray-200 bg-white hover:border-gray-300"}
        `}
      >
        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
        <span
          className={`text-sm font-medium truncate ${
            value ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {value || `Select ${label.toLowerCase()} city`}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-40 left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city..."
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* City list */}
          <div className="max-h-60 overflow-y-auto">
            {showPopularLabel && (
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Popular Cities
              </p>
            )}

            {displayList.length === 0 && (
              <p className="px-3 py-6 text-sm text-gray-400 text-center">
                No cities found
              </p>
            )}

            {displayList.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => selectCity(city)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left hover:bg-primary-light transition-colors"
              >
                <MapPin className="h-4 w-4 text-gray-300 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {city.name}
                  </p>
                  <p className="text-xs text-gray-400">{city.state}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
