"use client";

import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

export type MarqueeLogo = { name: string; src: string; href?: string };

/** Auto-scroll speed. Roughly matches the old 30s CSS loop. */
const SPEED_PX_S = 40;

// Infinite looping marquee of client logos, driven by scrollLeft instead
// of a CSS transform so the strip is a real scroll container: hovering
// (or touching) pauses the auto-scroll and the visitor can explore
// sideways — trackpad swipe, shift+wheel, or mouse drag — at their own
// pace. The logo list is tripled and the scroll position wraps by one
// third (identical content), so the loop never shows a seam. Each logo
// links to the client's site in a new tab.
//
// The homepage passes a Sanity-merged logo list (featured clients with
// an uploaded logo override/extend the static site.ts list); with no
// prop it falls back to site.trustedBy.logos.
export function ClientLogos({ logos: logosProp }: { logos?: MarqueeLogo[] }) {
  const { label, viewAllHref, viewAllLabel } = site.trustedBy;
  const logos: readonly MarqueeLogo[] = logosProp?.length
    ? logosProp
    : site.trustedBy.logos;

  // Triple the list so the wrap-by-a-third trick has room on both sides
  const tripled = [...logos, ...logos, ...logos];

  const trackRef = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const touching = useRef(false);
  const drag = useRef<{ startX: number; startScroll: number; moved: number } | null>(null);
  const lastDragMoved = useRef(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const third = () => el.scrollWidth / 3;
    // Start in the middle copy so there's room to scroll both ways.
    el.scrollLeft = third();

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let last = performance.now();
    // Sub-pixel accumulator: scrollLeft floors small increments away in
    // some browsers, which would stall the crawl entirely.
    let carry = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const auto =
        !reduced && !hovering.current && !touching.current && !drag.current;
      if (auto) {
        carry += SPEED_PX_S * dt;
        const whole = Math.trunc(carry);
        if (whole) {
          el.scrollLeft += whole;
          carry -= whole;
        }
      }

      // Seamless wrap: content repeats every third, so a jump of exactly
      // one third is invisible. Keep the position in the middle band.
      // Skipped mid-drag — it would break the pointer math.
      if (!drag.current) {
        const t = third();
        if (t > 0) {
          if (el.scrollLeft < 0.5 * t) el.scrollLeft += t;
          else if (el.scrollLeft > 1.5 * t) el.scrollLeft -= t;
        }
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const onEnter = () => {
      hovering.current = true;
    };
    const onLeave = () => {
      hovering.current = false;
    };
    // Touch scrolls natively; just hold the auto-scroll while exploring,
    // resuming shortly after the finger lifts.
    let touchTimer = 0;
    const onTouchStart = () => {
      window.clearTimeout(touchTimer);
      touching.current = true;
    };
    const onTouchEnd = () => {
      touchTimer = window.setTimeout(() => {
        touching.current = false;
      }, 1500);
    };

    // Mouse drag-to-scroll (touch already scrolls natively).
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      lastDragMoved.current = 0;
      drag.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: 0 };
    };
    const onPointerMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      d.moved = Math.max(d.moved, Math.abs(dx));
      el.scrollLeft = d.startScroll - dx;
    };
    const onPointerUp = () => {
      if (!drag.current) return;
      // Remembered so the click handler can tell a drag from a click.
      lastDragMoved.current = drag.current.moved;
      drag.current = null;
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(touchTimer);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // A drag that ends on a logo would otherwise fire its link.
  function suppressClickAfterDrag(e: ReactMouseEvent) {
    if (lastDragMoved.current > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <section className="mx-auto w-full max-w-[800px] py-10">
      <div className="mb-6 flex items-center justify-between">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
          {label}
        </p>
        <Link
          href={viewAllHref}
          className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted transition-colors hover:text-ink"
        >
          {viewAllLabel}
        </Link>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent" />

        <div
          ref={trackRef}
          onClickCapture={suppressClickAfterDrag}
          className="cursor-grab select-none overflow-x-auto active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max items-center gap-0">
            {tripled.map((logo, i) => {
              const img = (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={240}
                  height={80}
                  draggable={false}
                  className="h-16 w-auto object-contain opacity-40 transition-opacity duration-300 hover:opacity-70 dark:brightness-0 dark:invert md:h-20"
                  unoptimized
                />
              );
              return (
                <div
                  key={`${logo.name}-${i}`}
                  className="flex h-20 shrink-0 items-center"
                >
                  {logo.href ? (
                    <a
                      href={logo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${logo.name} website`}
                      draggable={false}
                    >
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
