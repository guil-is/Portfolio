"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import type { Testimonial } from "@/content/testimonials";

export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <section className="mx-auto w-full max-w-[800px]">
      <SectionHeading>What people say</SectionHeading>
      <div className="py-16">
        <TestimonialsSlider testimonials={testimonials} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------
function TestimonialsSlider({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft < scrollWidth - clientWidth - 4);
    // Which card is closest to the left edge of the viewport.
    const first = el.firstElementChild as HTMLElement | null;
    if (first) {
      const cardWidth = first.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(el).columnGap || "0");
      const step = cardWidth + gap;
      setActiveIndex(Math.round(scrollLeft / step));
    }
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  function scrollBy(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const cardWidth = first?.getBoundingClientRect().width ?? el.clientWidth;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    el.scrollBy({ left: (cardWidth + gap) * direction, behavior: "smooth" });
  }

  function scrollToIndex(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const cardWidth = first?.getBoundingClientRect().width ?? el.clientWidth;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    el.scrollTo({ left: (cardWidth + gap) * i, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={scrollerRef}
        className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Testimonial pages"
          className="flex items-center gap-2"
        >
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              role="tab"
              aria-label={`Show testimonial ${i + 1}`}
              aria-selected={i === activeIndex}
              onClick={() => scrollToIndex(i)}
              className={[
                "h-1.5 rounded-full transition-all",
                i === activeIndex
                  ? "w-6 bg-ink"
                  : "w-1.5 bg-rule hover:bg-muted",
              ].join(" ")}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ArrowButton
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            label="Previous"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </ArrowButton>
          <ArrowButton
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            label="Next"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </ArrowButton>
        </div>
      </div>
    </div>
  );
}

function ArrowButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-rule disabled:hover:bg-transparent disabled:hover:text-ink"
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { quote, name, role, project, projectHref, social, avatarUrl, initials } =
    testimonial;
  return (
    <article className="relative flex w-[calc(100%-1rem)] shrink-0 snap-start flex-col gap-6 rounded-[16px] border border-rule-soft bg-card/40 p-6 md:w-[calc((100%-3rem)/2)] md:p-7 lg:w-[calc((100%-3rem)/3)]">
      {social ? (
        <a
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} on ${social.platform}`}
          className="absolute right-5 top-5 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-card hover:text-ink"
        >
          {social.platform === "twitter" ? (
            <XLogo className="h-3 w-3" />
          ) : (
            <LinkedInLogo className="h-3.5 w-3.5" />
          )}
        </a>
      ) : null}

      <blockquote className="text-[0.95rem] leading-[1.65rem] text-ink">
        <span aria-hidden className="select-none text-muted">
          “
        </span>
        {quote}
        <span aria-hidden className="select-none text-muted">
          ”
        </span>
      </blockquote>

      <footer className="mt-auto flex items-center gap-3 border-t border-rule-soft pt-5">
        <Avatar avatarUrl={avatarUrl} name={name} initials={initials} />
        <div className="min-w-0">
          <p className="font-caption text-[13px] font-semibold text-ink">
            {name}
          </p>
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1px] text-muted">
            {role} ·{" "}
            {projectHref ? (
              <Link
                href={projectHref}
                className="underline-offset-2 hover:underline"
              >
                {project}
              </Link>
            ) : (
              <span>{project}</span>
            )}
          </p>
        </div>
      </footer>
    </article>
  );
}

// Inline minimal brand marks — lucide-react dropped Twitter and
// LinkedIn icons, so small in-house SVGs keep the dependency light.
function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function Avatar({
  avatarUrl,
  name,
  initials,
}: {
  avatarUrl?: string;
  name: string;
  initials: string;
}) {
  if (avatarUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={avatarUrl}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rule-soft bg-bg font-caption text-[11px] font-semibold uppercase tracking-[1px] text-muted"
      aria-hidden
    >
      {initials}
    </div>
  );
}
