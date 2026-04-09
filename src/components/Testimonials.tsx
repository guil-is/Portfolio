import Image from "next/image";
import { Section } from "./Section";
import { site } from "@/content/site";

export function Testimonials() {
  return (
    <Section id="testimonials" label="In their words">
      <div
        className="scroll-row -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-5 sm:px-0"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {site.testimonials.map((t, i) => (
          <figure
            key={i}
            className="flex w-[300px] flex-shrink-0 flex-col justify-between gap-8 rounded-3xl bg-card p-6 sm:w-[320px]"
            style={{ scrollSnapAlign: "start" }}
          >
            <blockquote className="text-[15px] leading-relaxed text-foreground/85">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {t.company}
              </span>
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-background">
                <Image
                  src={t.avatar}
                  alt={`${t.company} logo`}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
