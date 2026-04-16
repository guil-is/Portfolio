"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

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
//   | info 50vw | media slide | media slide | … |
//
// Each media slide is sized so the gap between adjacent visuals is
// one-third of the full breathing room the visual's cap leaves inside
// a 100vw column. Slide width =
//   ( 2 · visual_width + 100vw ) / 3
// which makes gap = (100vw − visual_width) / 3. The visual itself is
// 16:9, capped by 90vw on width and 80vh on height.
//
// Because slide widths depend on viewport (min() uses vw + vh), the
// scroll math reads the actual track width at runtime and the section
// height is set dynamically in a resize-aware effect.
//
// Mobile renders nothing — the odyssey page shows a stacked version
// (info above, scroll-snap gallery below) for narrow viewports.
export function CaseStudyHorizontalScroll({ info, images, alt }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const slideCount = Math.max(images.length, 1);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!section || !sticky || !track) return;

    const mql = matchMedia("(min-width: 768px)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    let rafId = 0;
    let active = mql.matches && !reducedMotion.matches;

    const setSectionHeight = () => {
      if (!active) {
        section.style.height = "";
        return;
      }
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;
      const scrollDistance = Math.max(0, track.scrollWidth - viewportW);
      section.style.height = `${viewportH + scrollDistance}px`;
    };

    const update = () => {
      rafId = 0;
      if (!active) {
        track.style.transform = "";
        sticky.style.opacity = "1";
        return;
      }
      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;
      const scrolled = -rect.top;
      const scrollable = rect.height - viewportH;
      const progress =
        scrollable > 0 ? Math.max(0, Math.min(1, scrolled / scrollable)) : 0;

      const scrollDistance = Math.max(0, track.scrollWidth - viewportW);
      const translatePx = scrollDistance * progress;
      track.style.transform = `translate3d(-${translatePx}px, 0, 0)`;

      // Per-slide horizontal fade. Each slide's opacity is driven by
      // how much of it is inside the viewport: fully visible → 1,
      // fully off-screen → 0.15. This gives a natural spotlight effect
      // on whichever slide is centered and dims the ones peeking at
      // the edges.
      const slides = track.children;
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i] as HTMLElement;
        const sr = slide.getBoundingClientRect();
        const overlapL = Math.max(sr.left, 0);
        const overlapR = Math.min(sr.right, viewportW);
        const visible = sr.width > 0
          ? Math.max(0, overlapR - overlapL) / sr.width
          : 0;
        slide.style.opacity = (0.15 + visible * 0.85).toFixed(3);
      }

      // Section-level entry/exit fade applied to the sticky container.
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

    const onResize = () => {
      setSectionHeight();
      schedule();
    };

    const onBreakpointChange = () => {
      active = mql.matches && !reducedMotion.matches;
      setSectionHeight();
      schedule();
    };

    setSectionHeight();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    mql.addEventListener("change", onBreakpointChange);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      mql.removeEventListener("change", onBreakpointChange);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [slideCount]);

  // Slide width formula: (2 × visual + 100vw) / 3 = visual + gap/3.
  const slideWidth =
    "calc((2 * min(90vw, 80vh * 16 / 9) + 100vw) / 3)";
  const visualWidth = "min(90vw, calc(80vh * 16 / 9))";

  return (
    <section ref={sectionRef} className="relative hidden md:block">
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

          {/* Media slides. The slide container is slightly wider than
              its 16:9 visual so the gap between two adjacent visuals
              is 1/3 of what a 100vw slide would produce. */}
          {images.length === 0 ? (
            <PlaceholderSlide
              alt={alt}
              slideWidth={slideWidth}
              visualWidth={visualWidth}
            />
          ) : (
            images.map((src, i) => (
              <div
                key={src}
                className="flex h-full shrink-0 items-center justify-center"
                style={{ width: slideWidth }}
              >
                <div
                  className="relative overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433] dark:shadow-none"
                  style={{
                    aspectRatio: "16 / 9",
                    width: visualWidth,
                  }}
                >
                  {isVideo(src) ? (
                    <video
                      src={src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                      aria-label={`${alt} ${i + 1}`}
                    />
                  ) : (
                    <Image
                      src={src}
                      alt={`${alt} ${i + 1}`}
                      fill
                      sizes="90vw"
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
            ))
          )}

          {/* Trailing spacer — extends the track so the last slide's
              visual centers horizontally in the viewport at max scroll
              instead of butting up against the right edge. */}
          <div
            className="shrink-0"
            style={{
              width: "calc((100vw - min(90vw, 80vh * 16 / 9)) / 3)",
            }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

function PlaceholderSlide({
  alt,
  slideWidth,
  visualWidth,
}: {
  alt: string;
  slideWidth: string;
  visualWidth: string;
}) {
  return (
    <div
      className="flex h-full shrink-0 items-center justify-center"
      style={{ width: slideWidth }}
    >
      <div
        className="flex items-center justify-center rounded-[16px] border border-dashed border-rule bg-card/30"
        style={{
          aspectRatio: "16 / 9",
          width: visualWidth,
        }}
      >
        <p className="font-caption text-[13px] font-medium uppercase tracking-[2px] text-muted">
          {alt} images coming
        </p>
      </div>
    </div>
  );
}
