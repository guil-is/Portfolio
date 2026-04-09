import { Section } from "./Section";
import { site } from "@/content/site";

export function Testimonials() {
  return (
    <Section id="testimonials" eyebrow="Kind words" title="What people say">
      <div className="grid gap-8 sm:grid-cols-2">
        {site.testimonials.map((t, i) => (
          <figure
            key={i}
            className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8"
          >
            <blockquote className="text-lg leading-relaxed text-foreground/90">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="flex flex-col">
              <span className="text-sm font-semibold">{t.author}</span>
              <span className="text-sm text-muted">{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
