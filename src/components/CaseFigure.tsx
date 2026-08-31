"use client";

import { useState } from "react";
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
};

/**
 * Case-study figure row: 1 item renders full width, 2 or 3 items render
 * as a responsive grid (stacked on mobile). Items whose file exists in
 * /public render via next/image and open in the shared lightbox; missing
 * items render a dashed placeholder card showing the expected filename,
 * so layout can be reviewed before all exports are done.
 */
export function CaseFigure({ items, caption, className = "" }: Props) {
  const [openAt, setOpenAt] = useState(-1);

  const loaded = items.filter(
    (i): i is CaseFigureItem & { src: string } => !!i.src,
  );
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

  return (
    <figure className={`my-10 w-full ${className}`}>
      <div className={`grid grid-cols-1 gap-4 md:gap-6 ${cols}`}>
        {items.map((item) =>
          item.src ? (
            <button
              key={item.file}
              type="button"
              aria-label={`View ${item.alt} full screen`}
              onClick={() =>
                setOpenAt(loaded.findIndex((l) => l.file === item.file))
              }
              className="cursor-zoom-in overflow-hidden rounded-[16px] bg-card shadow-card"
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
