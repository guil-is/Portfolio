"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Opacity at max distance from viewport center (0–1). Default 0.25. */
  minOpacity?: number;
  /** Distance (as fraction of viewport height) at which opacity hits min. */
  falloff?: number;
  /** Minimum scale at max distance. Default 0.96 — subtle shrink off-center. */
  minScale?: number;
  /** If true, disables the effect below the md breakpoint (<768px). */
  disableBelowMd?: boolean;
  className?: string;
};

// Continuous scroll-focus opacity ramp. Wraps content in a div whose
// opacity is driven by the element's distance from the viewport vertical
// center. Centered → opacity 1; at the edges → minOpacity.
//
// Matches the Webflow scroll interaction where only the currently-focused
// project card is fully visible and neighbours fade toward 0.25.
export function CenterFocus({
  children,
  minOpacity = 0.25,
  falloff = 0.55,
  minScale = 0.96,
  disableBelowMd = false,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion — skip the listener entirely.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const mql = disableBelowMd ? matchMedia("(min-width: 768px)") : null;
    let active = !mql || mql.matches;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      if (!active) {
        el.style.opacity = "1";
        el.style.transform = "none";
        return;
      }
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const elCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportH / 2;
      const distance = Math.abs(elCenter - viewportCenter);
      const normalized = Math.min(distance / (viewportH * falloff), 1);
      const opacity = 1 - normalized * (1 - minOpacity);
      const scale = 1 - normalized * (1 - minScale);
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `scale(${scale.toFixed(4)})`;
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    const onBreakpointChange = () => {
      active = !mql || mql.matches;
      schedule();
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    mql?.addEventListener("change", onBreakpointChange);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mql?.removeEventListener("change", onBreakpointChange);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [minOpacity, falloff, minScale, disableBelowMd]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: "opacity 280ms ease-out, transform 280ms ease-out",
        willChange: "opacity, transform",
        transformOrigin: "center",
      }}
    >
      {children}
    </div>
  );
}
