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

      <CenterFocus minOpacity={0.35} falloff={0.6}>
        <div className="flex flex-col gap-12 py-16">
          <p className="max-w-[600px] text-[1.1rem] leading-[1.7rem] text-ink">
            {intro}
          </p>

          <div className="grid grid-cols-1 gap-x-20 gap-y-10 md:grid-cols-2">
            {items.map((e) => {
              const Icon = iconMap[e.icon] ?? Map;
              return (
                <div key={e.title} className="flex flex-col gap-3">
                  <Icon className="h-6 w-6 text-ink" strokeWidth={1.75} />
                  <h6 className="font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink">
                    {e.title}
                  </h6>
                  <p className="text-[0.95rem] leading-[1.6rem] text-ink">
                    {e.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CenterFocus>
    </section>
  );
}
