"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

// Infinite seamless looping marquee of client logos, inspired by the
// reference screenshot. Duplicates the logo list 3× so the CSS
// animation can loop without a visible seam. Pure CSS animation,
// no JS scroll listener.
export function ClientLogos() {
  const { label, viewAllHref, viewAllLabel, logos } = site.trustedBy;

  // Triple the list so the animation can loop seamlessly
  const tripled = [...logos, ...logos, ...logos];

  return (
    <section className="mx-auto w-full max-w-[800px] py-10">
      <div className="mb-6 flex items-center justify-between">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
          {label}
        </p>
        <Link
          href={viewAllHref}
          className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
        >
          {viewAllLabel}
        </Link>
      </div>

      <div className="marquee-container relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent" />

        <div className="marquee-track flex w-max items-center gap-0">
          {tripled.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex h-20 shrink-0 items-center"
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={240}
                height={80}
                className="h-16 w-auto object-contain opacity-40 transition-opacity duration-300 hover:opacity-70 dark:brightness-0 dark:invert md:h-20"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
