"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  /** Delay in ms before the element becomes visible. */
  delay?: number;
};

// Detect IntersectionObserver support without triggering a setState in
// an effect (which React 19's lint rule flags). Unsupported → initial
// state is already visible.
const hasIntersectionObserver =
  typeof globalThis !== "undefined" && "IntersectionObserver" in globalThis;

// Wraps children in a div that starts at reduced opacity + translateY,
// then fades/slides into place when it enters the viewport OR when the
// user has already scrolled past its position (handles client-side
// navigation where elements can spawn above the viewport).
export function FadeIn({ children, className = "", delay = 0 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!hasIntersectionObserver);

  useEffect(() => {
    if (!hasIntersectionObserver) return;
    const el = ref.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const reveal = () => {
      if (delay > 0) {
        timeoutId = setTimeout(() => setVisible(true), delay);
      } else {
        setVisible(true);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Trigger on any intersection, OR if the element has already
          // been scrolled past (top above viewport) — handles SPA nav
          // where sections mount above the current scroll position.
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            reveal();
            observer.unobserve(entry.target);
            return;
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px 10% 0px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`fade-in-on-scroll ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
