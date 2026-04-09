"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  /** Intersection threshold (0–1). Higher = triggers later. */
  threshold?: number;
  /** Root margin to pre-trigger as element approaches. */
  rootMargin?: string;
  /** Delay in ms before the element becomes visible. */
  delay?: number;
  /** If true, element stays visible once revealed. Default: true. */
  once?: boolean;
};

// Wraps children in a div that starts at reduced opacity + translateY,
// then fades/slides into place when it enters the viewport. Plays the
// same role as Webflow's scroll-triggered `.content-grid-b` opacity
// ramp but without the GSAP dependency.
// Detect IntersectionObserver support without triggering a setState in
// an effect (which React 19's lint rule flags). Unsupported → initial
// state is already visible.
const hasIntersectionObserver =
  typeof globalThis !== "undefined" && "IntersectionObserver" in globalThis;

export function FadeIn({
  children,
  className = "",
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  delay = 0,
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!hasIntersectionObserver);

  useEffect(() => {
    if (!hasIntersectionObserver) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              const t = setTimeout(() => setVisible(true), delay);
              if (once) observer.unobserve(entry.target);
              return () => clearTimeout(t);
            }
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, delay, once]);

  return (
    <div
      ref={ref}
      className={`fade-in-on-scroll ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
