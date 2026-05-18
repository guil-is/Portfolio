"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { site } from "@/content/site";
import { CtaButton } from "./CtaButton";
import { SocialIconsRow } from "./SocialIconsRow";
import { Placeholder } from "./Placeholder";

type HoverImage = { src: string; alt: string };

type HeroProps = {
  headline?: string;
  bio?: readonly string[] | string[];
  bioClosing?: string;
  ctaLabel?: string;
  ctaHref?: string;
  hoverImages?: HoverImage[];
};

const SWAP_THRESHOLD_PX = 80;

export function Hero({
  headline = site.introHeading,
  bio = site.hero.bio,
  bioClosing = site.hero.bioClosing,
  ctaLabel = site.hero.cta.label,
  ctaHref = site.hero.cta.href,
  hoverImages = [],
}: HeroProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lastSwapPos = useRef<{ x: number; y: number } | null>(null);

  function pickNextIndex(current: number | null): number {
    if (hoverImages.length <= 1) return 0;
    let next: number;
    do {
      next = Math.floor(Math.random() * hoverImages.length);
    } while (next === current);
    return next;
  }

  function onPointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || hoverImages.length === 0) return;
    lastSwapPos.current = { x: e.clientX, y: e.clientY };
    setActiveIndex(pickNextIndex(null));
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (
      e.pointerType !== "mouse" ||
      hoverImages.length === 0 ||
      !lastSwapPos.current
    ) {
      return;
    }
    const dx = e.clientX - lastSwapPos.current.x;
    const dy = e.clientY - lastSwapPos.current.y;
    if (Math.hypot(dx, dy) >= SWAP_THRESHOLD_PX) {
      lastSwapPos.current = { x: e.clientX, y: e.clientY };
      setActiveIndex((cur) => pickNextIndex(cur));
    }
  }

  function onPointerLeave() {
    lastSwapPos.current = null;
    setActiveIndex(null);
  }

  return (
    <section className="mx-auto w-full max-w-[800px] pb-[30px] pt-0">
      <h1 className="intro-rise max-w-[800px] font-display text-[1.75rem] font-bold leading-[1.3] text-ink md:text-[2.2rem] md:leading-[3rem]">
        {headline}
      </h1>

      <div className="grid grid-cols-1 items-stretch gap-10 pt-10 md:grid-cols-2 md:pt-12">
        <div className="metallic-border relative aspect-square w-full rounded-[16px] md:aspect-auto md:h-full md:min-h-[400px]">
          <div
            className="absolute inset-0 overflow-hidden rounded-[16px]"
            onPointerEnter={onPointerEnter}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
          >
          {site.hero.portrait ? (
            <Image
              src={site.hero.portrait}
              alt={site.hero.portraitAlt}
              fill
              sizes="(min-width: 768px) 400px, 100vw"
              priority
              className="object-cover object-[center_25%]"
            />
          ) : (
            <Placeholder label="GM" aspect="fill" />
          )}
          {hoverImages.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.src}
              src={img.src}
              alt=""
              aria-hidden
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover object-center motion-safe:transition-opacity motion-safe:duration-200 ${
                activeIndex === i ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {bio.map((p, i) => (
            <p key={i} className="text-[0.95rem] leading-[1.6rem] text-ink">
              {p}
            </p>
          ))}
          <p className="text-[0.95rem] font-bold leading-[1.6rem] text-ink">
            {bioClosing}
          </p>

          <SocialIconsRow socials={site.heroSocials} className="mt-2" />

          <div className="mt-2">
            <CtaButton href={ctaHref} label={ctaLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
