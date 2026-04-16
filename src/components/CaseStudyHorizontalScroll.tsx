"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  /** The half-width first slide — case study title, problem, stat, quote, relevance. */
  info: ReactNode;
  /** Image URLs for the subsequent full-width slides. */
  images: string[];
  /** Alt text base — "Clawbank" → "Clawbank 1", "Clawbank 2", … */
  alt: string;
};

// Scroll-hijacked horizontal case study — desktop only (md+).
//
// Layout of the track:
//   | info 50vw | image 100vw | image 100vw | … |
//
// When the section enters the viewport, it locks as sticky top-0
// h-screen. Continued vertical scroll drives a horizontal translateX
// on the track so the user moves sideways through the case study:
// info slides off, each image slide moves in and out. Once the last
// image is fully in view, the section unlocks and normal vertical
// scroll resumes.
//
// Mobile renders nothing — the odyssey page shows a stacked version
// (info above, scroll-snap gallery below) for narrow viewports.
export function CaseStudyHorizontalScroll({ info, images, alt }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const slideCount = Math.max(images.length, 1);

  // Track width = 50vw (info) + slideCount × 100vw (images).
  // Horizontal scroll distance = track − viewport = slideCount × 100 − 50 (vw).
  const horizontalScrollVw = slideCount * 100 - 50;

  // Section outer height: 100vh lock duration + horizontalScrollVw of
  // scroll, treated 1:1 (1vh vertical scroll = 1vw horizontal travel).
  const sectionHeightVh = 100 + horizontalScrollVw;

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!section || !sticky || !track) return;

    const mql = matchMedia("(min-width: 768px)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    let rafId = 0;
    let active = mql.matches && !reducedMotion.matches;

    const update = () => {
      rafId = 0;
      if (!active) {
        track.style.transform = "";
        sticky.style.opacity = "1";
        return;
      }
      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const scrolled = -rect.top;
      const scrollable = rect.height - viewportH;
      const progress =
        scrollable > 0 ? Math.max(0, Math.min(1, scrolled / scrollable)) : 0;
      const translateVw = horizontalScrollVw * progress;
      track.style.transform = `translate3d(-${translateVw}vw, 0, 0)`;

      // Soft fade driven by the section's position relative to the
      // viewport. Entry: fade in as the section rises into view from
      // below (rect.top going from viewportH → 0). Exit: fade out as
      // the section leaves above (rect.bottom going from viewportH → 0).
      // During the lock (rect.top ≤ 0 and rect.bottom ≥ viewportH) the
      // fade stays at 1.
      let fadeOpacity = 1;
      if (rect.top > 0) {
        fadeOpacity = Math.max(0, 1 - rect.top / viewportH);
      } else if (rect.bottom < viewportH) {
        fadeOpacity = Math.max(0, rect.bottom / viewportH);
      }
      sticky.style.opacity = fadeOpacity.toFixed(3);
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
  }, [horizontalScrollVw]);

  return (
    <section
      ref={sectionRef}
      className="relative hidden md:block"
      style={{ height: `${sectionHeightVh}vh` }}
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen overflow-hidden"
        style={{ willChange: "opacity" }}
      >
        <div
          ref={trackRef}
          className="flex h-full w-max items-center"
          style={{ willChange: "transform" }}
        >
          {/* Info slide — 50vw wide. Left padding is calculated so the
              info content's left edge aligns with the SectionLabel
              above it (centered max-w-[1200px] container + px-10). */}
          <div
            className="flex h-full w-[50vw] shrink-0 items-center pr-[5vw]"
            style={{
              paddingLeft:
                "calc(max((100vw - 1200px) / 2, 0px) + 2.5rem)",
            }}
          >
            <div className="w-full max-w-[520px]">{info}</div>
          </div>

          {/* Image slides — 100vw each, with 5vw internal padding so the
              image visual is ~90vw centered in each slide. */}
          {images.length === 0 ? (
            <PlaceholderSlide alt={alt} />
          ) : (
            images.map((src, i) => (
              <div
                key={src}
                className="flex h-full w-screen shrink-0 items-center px-[5vw] py-[10vh]"
              >
                <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
                  <Image
                    src={src}
                    alt={`${alt} ${i + 1}`}
                    fill
                    sizes="90vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function PlaceholderSlide({ alt }: { alt: string }) {
  return (
    <div className="flex h-full w-screen shrink-0 items-center px-[5vw] py-[10vh]">
      <div className="flex h-full w-full items-center justify-center rounded-[16px] border border-dashed border-rule bg-card/30">
        <p className="font-caption text-[13px] font-medium uppercase tracking-[2px] text-muted">
          {alt} images coming
        </p>
      </div>
    </div>
  );
}
