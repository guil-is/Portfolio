import { Map, Eye, PenTool, Users, type LucideIcon } from "lucide-react";
import { site } from "@/content/site";
import { SectionHeading } from "./SectionHeading";
import { CenterFocus } from "./CenterFocus";

const iconMap: Record<string, LucideIcon> = {
  map: Map,
  eye: Eye,
  pen: PenTool,
  users: Users,
};

export function Expertise() {
  const { heading, intro, items } = site.howIWork;

  return (
    <section id="about" className="mx-auto w-full max-w-[800px]">
      <SectionHeading>{heading}</SectionHeading>

      <div className="flex flex-col gap-6 py-16">
        <CenterFocus minOpacity={0.4} falloff={0.6} minScale={0.98}>
          <p className="max-w-[600px] text-[1.1rem] leading-[1.7rem] text-ink">
            {intro}
          </p>
        </CenterFocus>

        <div className="grid grid-cols-1 gap-x-20 gap-y-0 md:grid-cols-2">
          {items.map((e) => {
            const Icon = iconMap[e.icon] ?? Map;
            return (
              <CenterFocus
                key={e.title}
                minOpacity={0.2}
                falloff={0.5}
                minScale={0.97}
              >
                <div className="flex flex-col gap-3 py-8">
                  <Icon className="h-6 w-6 text-ink" strokeWidth={1.75} />
                  <h6 className="font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink">
                    {e.title}
                  </h6>
                  <p className="text-[0.95rem] leading-[1.6rem] text-ink">
                    {e.description}
                  </p>
                </div>
              </CenterFocus>
            );
          })}
        </div>
      </div>
    </section>
  );
}
