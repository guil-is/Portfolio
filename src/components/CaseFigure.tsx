"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export type CaseFigureItem = {
  /** Expected filename inside /public/projects/thrive-product/. Shown in the placeholder. */
  file: string;
  alt: string;
  /** Resolved URL when the file exists on disk. Absent → placeholder renders. */
  src?: string;
  width?: number;
  height?: number;
};

type Props = {
  items: CaseFigureItem[];
  caption?: string;
  className?: string;
  /** Crossfade the items in place instead of a grid row. Auto-advances,
   * pauses on hover and while the lightbox is open. Falls back to the
   * grid when any item is missing from /public. */
  slideshow?: boolean;
  /** Cap the figure's width in px and center it. For diagrams that stay
   * legible smaller than the full 960px column. */
  maxWidth?: number;
};

const SLIDE_INTERVAL_MS = 4000;

/**
 * Case-study figure row: 1 item renders full width, 2 or 3 items render
 * as a responsive grid (stacked on mobile) — or a crossfade slideshow
 * with `slideshow`. Items whose file exists in /public render via
 * next/image and open in the shared lightbox; missing items render a
 * dashed placeholder card showing the expected filename, so layout can
 * be reviewed before all exports are done.
 */
export function CaseFigure({
  items,
  caption,
  className = "",
  slideshow = false,
  maxWidth,
}: Props) {
  const capStyle = maxWidth ? { maxWidth } : undefined;
  const [openAt, setOpenAt] = useState(-1);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const loaded = items.filter(
    (i): i is CaseFigureItem & { src: string } => !!i.src,
  );

  const asSlideshow = slideshow && loaded.length === items.length && items.length > 1;

  useEffect(() => {
    if (!asSlideshow || paused || openAt >= 0) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % loaded.length),
      SLIDE_INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [asSlideshow, paused, openAt, loaded.length]);
  const slides = loaded.map((i) => ({
    src: i.src,
    width: i.width,
    height: i.height,
    alt: i.alt,
  }));

  const cols =
    items.length >= 3
      ? "md:grid-cols-3"
      : items.length === 2
        ? "md:grid-cols-2"
        : "";

  if (asSlideshow) {
    const first = loaded[0];
    return (
      <figure className={`my-10 w-full ${className}`}>
        <div
          className="relative mx-auto w-full overflow-hidden rounded-[16px]"
          style={{
            aspectRatio: `${first.width ?? 16} / ${first.height ?? 9}`,
            ...capStyle,
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {loaded.map((item, i) => (
            <button
              key={item.file}
              type="button"
              aria-label={`View ${item.alt} full screen`}
              aria-hidden={i !== active}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setOpenAt(i)}
              className={`absolute inset-0 cursor-zoom-in transition-opacity duration-700 ease-in-out ${
                i === active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 768px) 960px, 100vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {loaded.map((item, i) => (
            <button
              key={item.file}
              type="button"
              aria-label={`Show slide ${i + 1}: ${item.alt}`}
              onClick={() => setActive(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === active ? "bg-ink" : "bg-rule hover:bg-muted"
              }`}
            />
          ))}
        </div>
        {caption ? (
          <figcaption className="mx-auto mt-3 max-w-[720px] text-center text-[14px] text-muted">
            {caption}
          </figcaption>
        ) : null}
        <Lightbox
          open={openAt >= 0}
          close={() => setOpenAt(-1)}
          slides={slides}
          index={openAt < 0 ? 0 : openAt}
          controller={{ closeOnBackdropClick: true }}
          animation={{ fade: 150, swipe: 180, navigation: 180 }}
          carousel={{ finite: slides.length <= 1 }}
        />
      </figure>
    );
  }

  return (
    <figure className={`my-10 w-full ${className}`}>
      <div
        className={`mx-auto grid w-full grid-cols-1 gap-4 md:gap-6 ${cols}`}
        style={capStyle}
      >
        {items.map((item) =>
          item.src ? (
            <button
              key={item.file}
              type="button"
              aria-label={`View ${item.alt} full screen`}
              onClick={() =>
                setOpenAt(loaded.findIndex((l) => l.file === item.file))
              }
              className="cursor-zoom-in overflow-hidden rounded-[16px]"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width ?? 1600}
                height={item.height ?? 900}
                sizes={
                  items.length > 1
                    ? "(min-width: 768px) 480px, 100vw"
                    : "(min-width: 768px) 960px, 100vw"
                }
                className="h-auto w-full"
              />
            </button>
          ) : (
            <div
              key={item.file}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-rule bg-card/30 p-6 text-center ${
                items.length === 1 ? "aspect-[16/9]" : "aspect-[4/3]"
              }`}
            >
              <span className="font-mono text-[12px] font-medium text-ink">
                {item.file}
              </span>
              <span className="font-caption text-[11px] uppercase tracking-[1px] text-muted">
                {item.alt}
              </span>
              <span className="font-caption text-[10px] text-faint">
                drop into /public/projects/thrive-product/
              </span>
            </div>
          ),
        )}
      </div>
      {caption ? (
        <figcaption className="mx-auto mt-3 max-w-[720px] text-center text-[14px] text-muted">
          {caption}
        </figcaption>
      ) : null}
      <Lightbox
        open={openAt >= 0}
        close={() => setOpenAt(-1)}
        slides={slides}
        index={openAt < 0 ? 0 : openAt}
        controller={{ closeOnBackdropClick: true }}
        animation={{ fade: 150, swipe: 180, navigation: 180 }}
        carousel={{ finite: slides.length <= 1 }}
      />
    </figure>
  );
}
