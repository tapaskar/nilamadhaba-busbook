"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Counts up from 0 to `value` when scrolled into view.
 * Supports number formatting via `format` prop.
 *
 *   <AnimatedCounter value={2400000} suffix="+" format="inr" />  → "₹24 Lakh+"
 *   <AnimatedCounter value={95} suffix="%" />                    → "95%"
 *   <AnimatedCounter value={500} suffix="+" />                   → "500+"
 */
export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1800,
  format = "plain",
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  format?: "plain" | "inr" | "short";
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  const formatted = formatNumber(display, format);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

function formatNumber(n: number, format: "plain" | "inr" | "short"): string {
  if (format === "inr") {
    // Indian numbering: 1,00,000 style
    return new Intl.NumberFormat("en-IN").format(n);
  }
  if (format === "short") {
    if (n >= 10_000_000) return (n / 10_000_000).toFixed(1).replace(/\.0$/, "") + " Cr";
    if (n >= 100_000) return (n / 100_000).toFixed(1).replace(/\.0$/, "") + " L";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return n.toLocaleString("en-IN");
}
