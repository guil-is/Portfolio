import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[85vh] items-center px-6 pt-16"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.18em] text-muted">
          {site.title}
        </p>
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          {site.name}.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          {site.tagline}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Get in touch
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#work"
            className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            See selected work
          </a>
        </div>
      </div>
    </section>
  );
}
