"use client";

import { useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
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
 * Lightbox uses the library's built-in horizontal slide animation,
 * tuned to 180ms for a snappy feel. An earlier attempt to layer a
 * crossfade via render.slideContainer broke slide transitions (the
 * currentIndex state lagged behind the library's internal state,
 * leaving some slides permanently hidden). Reverted to defaults.
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
        onClick={({ index }) => setOpenAt(index)}
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
      />
    </>
  );
}
