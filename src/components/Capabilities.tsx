import { Section } from "./Section";
import { site } from "@/content/site";

export function Capabilities() {
  return (
    <Section id="capabilities" label="Capabilities">
      <ul className="flex flex-wrap gap-2.5">
        {site.capabilities.map((cap) => (
          <li key={cap}>
            <span className="inline-flex items-center rounded-full border border-border/80 bg-card px-4 py-2 text-sm text-foreground/90">
              {cap}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
