"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Props = {
  images: string[];
  alt: string;
  /**
   * Extra vertical scroll per slide. 1 = one viewport height per slide.
   * Lower = faster horizontal scroll, higher = slower. Default 0.9.
   */
  scrollPerSlide?: number;
};

// Horizontal scroll-hijack slider. The section is tall (scrollPerSlide *
// numSlides viewport-heights). The horizontal track is sticky at the top
// of the viewport while the user scrolls through the section. Vertical
// scroll progress drives a CSS transform translateX on the track, so the
// slider advances sideways. Once the track reaches its end, vertical
// scroll resumes normally for the next section below.
//
// On mobile (<md), falls back to a native horizontal scroll-snap gallery
// (same pattern as ImageGallery) because scroll-hijacking on touch
// devices is awkward and fights the OS gestures.
export function HorizontalSlider({
  images,
  alt,
  scrollPerSlide = 0.9,
}: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = Math.max(images.length, 1);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // Disable hijack on narrow viewports — let native horizontal scroll
    // work on mobile.
    const mql = matchMedia("(min-width: 768px)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    let rafId = 0;
    let active = mql.matches && !reducedMotion.matches;

    const update = () => {
      rafId = 0;
      if (!active) {
        track.style.transform = "";
        return;
      }
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const scrolled = -rect.top;
      const scrollable = rect.height - viewportH;
      const progress =
        scrollable > 0 ? Math.max(0, Math.min(1, scrolled / scrollable)) : 0;
      // Track width is count * viewport-width. We need to translate
      // so that after full progress the last slide's right edge sits at
      // the viewport's right edge: translateX(-(count - 1) * 100vw).
      const translateVw = (count - 1) * 100 * progress;
      track.style.transform = `translate3d(-${translateVw}vw, 0, 0)`;
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    const onBreakpointChange = () => {
      active = mql.matches && !reducedMotion.matches;
      schedule();
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    mql.addEventListener("change", onBreakpointChange);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mql.removeEventListener("change", onBreakpointChange);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [count]);

  // Mobile: simple native horizontal scroll-snap, no hijack.
  const mobileSlider = (
    <div className="scroll-row -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:hidden">
      {images.length === 0
        ? Array.from({ length: 4 }).map((_, i) => (
            <Slide key={`m-empty-${i}`} label={`${alt} ${i + 1}`} />
          ))
        : images.map((src, i) => (
            <Slide key={src} src={src} alt={`${alt} ${i + 1}`} />
          ))}
    </div>
  );

  return (
    <>
      {mobileSlider}

      {/* Desktop: scroll-hijacked horizontal track */}
      <section
        ref={containerRef}
        className="relative hidden md:block"
        style={{ height: `${scrollPerSlide * count * 100}vh` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            ref={trackRef}
            className="flex h-full w-max items-center"
            style={{ willChange: "transform" }}
          >
            {images.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <DesktopSlide
                    key={`d-empty-${i}`}
                    label={`${alt} ${i + 1}`}
                  />
                ))
              : images.map((src, i) => (
                  <DesktopSlide key={src} src={src} alt={`${alt} ${i + 1}`} />
                ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ---- Mobile slide ---------------------------------------------------
function Slide({
  src,
  alt,
  label,
}: {
  src?: string;
  alt?: string;
  label?: string;
}) {
  if (src && alt) {
    return (
      <div className="relative aspect-[16/9] w-[85%] shrink-0 snap-start overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="85vw"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div className="flex aspect-[16/9] w-[85%] shrink-0 snap-start items-center justify-center rounded-[16px] border border-dashed border-rule bg-card/30">
      <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
    </div>
  );
}

// ---- Desktop slide --------------------------------------------------
function DesktopSlide({
  src,
  alt,
  label,
}: {
  src?: string;
  alt?: string;
  label?: string;
}) {
  if (src && alt) {
    return (
      <div className="relative h-[75vh] w-screen shrink-0 px-[5vw]">
        <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="h-[75vh] w-screen shrink-0 px-[5vw]">
      <div className="flex h-full w-full items-center justify-center rounded-[16px] border border-dashed border-rule bg-card/30">
        <p className="font-caption text-[13px] font-medium uppercase tracking-[2px] text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}
