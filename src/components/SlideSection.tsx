"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /**
   * Total vertical scroll distance as a multiple of viewport height.
   * 1.5 = section is 150vh tall. Higher = slide stays visible longer
   * between fades. Default 1.5.
   */
  scrollHeight?: number;
  className?: string;
};

// Full-screen slide with scroll-driven fade in/out. The section itself
// is taller than the viewport; its inner content uses position:sticky to
// stay centered while the scroll advances. Opacity is driven by the
// section's scroll progress:
//
//   0.00 → 0.20  fade in   (opacity 0 → 1)
//   0.20 → 0.80  hold      (opacity 1)
//   0.80 → 1.00  fade out  (opacity 1 → 0)
//
// Creates a pitch-deck feel where each section has its own stage, with
// a brief empty moment between slides.
export function SlideSection({
  children,
  scrollHeight = 1.5,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      inner.style.opacity = "1";
      return;
    }

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const containerH = rect.height;
      const scrolled = -rect.top;
      const scrollable = containerH - viewportH;
      const progress =
        scrollable > 0 ? Math.max(0, Math.min(1, scrolled / scrollable)) : 0.5;

      let opacity = 1;
      if (progress < 0.2) opacity = progress / 0.2;
      else if (progress > 0.8) opacity = (1 - progress) / 0.2;

      inner.style.opacity = opacity.toFixed(3);
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: `${scrollHeight * 100}vh` }}
    >
      <div
        ref={innerRef}
        className="sticky top-0 flex min-h-screen items-center justify-center px-6 md:px-10"
        style={{ willChange: "opacity" }}
      >
        <div className="w-full">{children}</div>
      </div>
    </section>
  );
}
