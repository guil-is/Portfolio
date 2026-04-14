import { site } from "@/content/site";
import { SectionHeading } from "./SectionHeading";
import { CenterFocus } from "./CenterFocus";

// Three-phase model of how Guil engages with clients, shown as a
// vertical stack of bordered rows below the "How I work" section on the
// homepage. Each phase fades/scales independently on scroll.
export function HowWeWork() {
  const { heading, intro, phases } = site.howWeWork;

  return (
    <section className="mx-auto w-full max-w-[800px]">
      <SectionHeading>{heading}</SectionHeading>

      <div className="flex flex-col gap-6 py-16">
        <CenterFocus minOpacity={0.4} falloff={0.6} minScale={0.98}>
          <p className="max-w-[600px] text-[0.95rem] leading-[1.6rem] text-ink">
            {intro}
          </p>
        </CenterFocus>

        <div className="mt-6 flex flex-col">
          {phases.map((phase) => (
            <CenterFocus
              key={phase.label}
              minOpacity={0.25}
              falloff={0.55}
              minScale={0.98}
            >
              <div className="grid grid-cols-[80px_1fr] items-start gap-6 border-t border-rule-soft py-10 md:grid-cols-[120px_1fr] md:gap-8">
                <div className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
                  {phase.label}
                </div>
                <div className="flex flex-col gap-3">
                  <h5 className="font-display text-[1.4rem] leading-tight text-ink md:text-[1.6rem]">
                    {phase.title}
                  </h5>
                  <p className="text-[0.95rem] leading-[1.6rem] text-ink">
                    {phase.description}
                  </p>
                </div>
              </div>
            </CenterFocus>
          ))}
        </div>
      </div>
    </section>
  );
}
