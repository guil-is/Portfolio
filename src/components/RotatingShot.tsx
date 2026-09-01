"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Rapid-fire slideshow for a single gallery frame: cycles through a
 * set of shots with a hard cut (no transition). All images render
 * stacked so every frame is preloaded before its first appearance.
 * Fills its positioned parent, like a single next/image with `fill`.
 */
export function RotatingShot({
  srcs,
  alt,
  sizes,
  intervalMs = 2000,
}: {
  srcs: string[];
  alt: string;
  sizes: string;
  intervalMs?: number;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (srcs.length < 2) return;
    const id = setInterval(
      () => setCurrent((v) => (v + 1) % srcs.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [srcs.length, intervalMs]);

  return (
    <>
      {srcs.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`${alt} ${i + 1}`}
          fill
          sizes={sizes}
          unoptimized={/^https?:/i.test(src)}
          className="object-cover"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
    </>
  );
}
