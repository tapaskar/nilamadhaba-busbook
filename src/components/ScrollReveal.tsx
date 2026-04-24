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
    return () => io.disconnect();
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
