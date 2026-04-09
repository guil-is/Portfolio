import { site } from "@/content/site";
import { SectionHeading } from "./SectionHeading";
import { PulsingDot } from "./PulsingDot";
import { Placeholder } from "./Placeholder";
import { CenterFocus } from "./CenterFocus";

export function ActiveProjects() {
  return (
    <section className="mx-auto w-full max-w-[800px]">
      <SectionHeading>
        <PulsingDot />
        <span>recent / active projects</span>
      </SectionHeading>

      <div className="flex flex-col">
        {site.activeProjects.map((p) => {
          const imageBlock = (
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform duration-300 hover:scale-[1.02]"
            >
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.imageAlt}
                  className="aspect-[16/9] w-full rounded-[16px] object-cover shadow-[0_4px_40px_#cfc8c433]"
                />
              ) : (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-[16px]">
                  <Placeholder label={p.title} />
                </div>
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
              <p className="text-[0.95rem] leading-[1.6rem] text-ink">
                {p.description}
              </p>
            </div>
          );

          return (
            <CenterFocus key={p.title} minOpacity={0.25} falloff={0.55}>
              <div className="grid grid-cols-1 items-center gap-8 py-12 md:grid-cols-2">
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
            </CenterFocus>
          );
        })}
      </div>
    </section>
  );
}
