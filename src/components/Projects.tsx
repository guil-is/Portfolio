import Image from "next/image";
import { Section } from "./Section";
import { site } from "@/content/site";

export function Projects() {
  return (
    <Section id="work" eyebrow="Selected work" title="Projects">
      <div className="grid gap-10 sm:grid-cols-2">
        {site.projects.map((project) => (
          <article
            key={project.title}
            className="group flex flex-col gap-4"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card">
              <Image
                src={project.image}
                alt={`${project.title} preview`}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-semibold tracking-tight">
                {project.title}
              </h3>
              <span className="text-sm text-muted">{project.year}</span>
            </div>
            <p className="text-sm uppercase tracking-[0.12em] text-muted">
              {project.role}
            </p>
            <p className="text-base leading-relaxed text-foreground/80">
              {project.description}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
