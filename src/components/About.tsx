import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { site } from "@/content/site";

export function About() {
  return (
    <section
      id="about"
      className="w-full scroll-mt-24 px-4 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[200px_1fr] md:gap-10">
          <div className="flex items-start">
            <div className="relative aspect-square w-40 overflow-hidden rounded-2xl bg-card md:w-full">
              <Image
                src={site.about.photo}
                alt={`${site.name} portrait`}
                fill
                sizes="(min-width: 768px) 200px, 160px"
                className="object-cover grayscale"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="max-w-xl text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
              {site.about.headline}
            </h2>
            <div className="max-w-xl space-y-4 text-base leading-relaxed text-foreground/80">
              {site.about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <ul className="space-y-2 pl-0">
                {site.about.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-foreground/80"
                  >
                    <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-foreground/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href={site.about.learnMoreHref}
              className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
            >
              Learn more
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
