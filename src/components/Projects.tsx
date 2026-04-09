import Image from "next/image";
import { site } from "@/content/site";

export function Projects() {
  return (
    <section id="work" className="w-full scroll-mt-24 pb-12 sm:pb-16">
      <div className="mx-auto w-full max-w-6xl">
        <div
          className="scroll-row flex gap-4 overflow-x-auto px-4 pb-2 sm:gap-5 sm:px-8"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {site.projects.map((project) => (
            <article
              key={project.title}
              className="group flex w-[260px] flex-shrink-0 flex-col gap-0 rounded-3xl bg-card p-3 transition-colors hover:bg-card-hover sm:w-[300px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-background/40">
                <Image
                  src={project.image}
                  alt={`${project.title} preview`}
                  fill
                  sizes="(min-width: 640px) 300px, 260px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-col gap-1 p-4 pt-5">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {project.title}
                </h3>
                <p className="text-sm text-muted">{project.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
