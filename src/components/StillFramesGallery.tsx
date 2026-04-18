"use client";

import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type Frame = {
  src: string;
  width: number;
  height: number;
  alt?: string;
};

/**
 * Justified-row gallery with a fullscreen lightbox. Images fill each
 * row fully (no orphan gaps on the last row — widths are distributed
 * proportional to aspect ratio so rows balance out).
 *
 * Lightbox transitions: the library translates slides horizontally
 * during prev/next; we layer opacity on top via render.slideContainer
 * so the incoming slide fades in while the outgoing fades out —
 * tracked via a React state current-index that updates on view.
 *
 * Requires image dimensions, resolved via GROQ:
 *   stillFrames[] { ..., "url": asset->url,
 *     "width": asset->metadata.dimensions.width,
 *     "height": asset->metadata.dimensions.height }
 */
export function StillFramesGallery({
  frames,
  alt,
}: {
  frames: Frame[];
  alt: string;
}) {
  const [openAt, setOpenAt] = useState<number>(-1);
  // Track the currently visible slide index so we can gate opacity
  // in render.slideContainer. Kept in sync via the `on.view` callback.
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  if (frames.length === 0) return null;

  const photos = frames.map((f, i) => ({
    src: f.src,
    width: f.width,
    height: f.height,
    alt: f.alt ?? `${alt} still frame ${i + 1}`,
  }));

  return (
    <>
      <RowsPhotoAlbum
        photos={photos}
        targetRowHeight={260}
        spacing={12}
        onClick={({ index }) => {
          setCurrentIndex(index);
          setOpenAt(index);
        }}
        render={{
          image: (props, { photo }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...props}
              src={photo.src}
              alt={photo.alt ?? ""}
              loading="lazy"
              className="cursor-zoom-in rounded-[12px] object-cover"
            />
          ),
        }}
      />
      <Lightbox
        open={openAt >= 0}
        close={() => setOpenAt(-1)}
        slides={photos}
        index={openAt < 0 ? 0 : openAt}
        controller={{ closeOnBackdropClick: true }}
        animation={{ fade: 150, swipe: 180, navigation: 180 }}
        carousel={{ finite: false, preload: 2 }}
        on={{ view: ({ index }) => setCurrentIndex(index) }}
        render={{
          slideContainer: ({ slide, children }) => {
            const s = slide as SlideImage;
            const isCurrent =
              s.src === photos[currentIndex]?.src;
            return (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isCurrent ? 1 : 0,
                  transition: "opacity 180ms ease-out",
                }}
              >
                {children}
              </div>
            );
          },
        }}
      />
    </>
  );
}
