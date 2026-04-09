import { site } from "@/content/site";
import { SectionHeading } from "./SectionHeading";
import { PulsingDot } from "./PulsingDot";
import { Placeholder } from "./Placeholder";

export function ActiveProjects() {
  return (
    <section className="mx-auto w-full max-w-[800px] py-8">
      <SectionHeading>
        <PulsingDot />
        <span>recent / active projects</span>
      </SectionHeading>

      <div className="flex flex-col">
        {site.activeProjects.map((p) => {
          const imageBlock = (
            <a
              key={`${p.title}-img`}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform duration-200 hover:scale-[1.02]"
            >
              {p.image ? (
                // Real image support (none set yet).
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.imageAlt}
                  className="w-full rounded-[16px] object-cover shadow-[0_4px_40px_#cfc8c433]"
                />
              ) : (
                <Placeholder label={p.title} aspect="video" />
              )}
            </a>
          );

          const textBlock = (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h5 className="font-display text-[2rem] leading-tight text-ink">
                  {p.title}
                </h5>
                <div className="font-caption text-[12px] font-medium uppercase leading-4 tracking-[1.5px] text-muted">
                  {p.role}
                </div>
              </div>
              <p className="text-[0.9rem] leading-[1.5rem] text-ink">
                {p.description}
              </p>
            </div>
          );

          return (
            <div
              key={p.title}
              className="grid grid-cols-1 items-center gap-8 py-12 md:grid-cols-2"
            >
              {p.reverse ? (
                <>
                  <div className="order-1 md:order-2">{imageBlock}</div>
                  <div className="order-2 md:order-1">{textBlock}</div>
                </>
              ) : (
                <>
                  {imageBlock}
                  {textBlock}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
