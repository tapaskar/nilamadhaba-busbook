"use client";

import { useEffect, useRef, type ReactNode, type ElementType } from "react";

/**
 * Wraps children in a container that fades/slides up on viewport enter.
 *
 * Uses the `.reveal` + `.is-visible` CSS classes defined in globals.css.
 * One-shot: once visible, stays visible (won't re-animate on scroll).
 */
export default function ScrollReveal({
  as: Tag = "div",
  className = "",
  delay,
  children,
}: {
  as?: ElementType;
  className?: string;
  delay?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    // Mount-time: if the element is already in or above the current
    // viewport, reveal it immediately. Fixes the bug where elements
    // that scrolled past quickly (anchor link, fast wheel, refresh on
    // a deep-scrolled page) never get observed and stay at opacity 0.
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh) {
      el.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);

    // Belt-and-braces: if the element comes into view via a fast scroll
    // before the IntersectionObserver fires, a scroll listener catches
    // the bottom-of-viewport crossing.
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vp = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vp * 0.95) {
        el.classList.add("is-visible");
        window.removeEventListener("scroll", onScroll);
        io.disconnect();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const delayCls = delay ? ` delay-${delay}` : "";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement>}
      className={`reveal${delayCls} ${className}`}
    >
      {children}
    </Tag>
  );
}
