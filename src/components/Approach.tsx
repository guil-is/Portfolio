import { Section } from "./Section";
import { site } from "@/content/site";

export function Approach() {
  return (
    <Section id="approach" label="Approach">
      <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {site.approach.map((item, i) => (
          <li key={item.title} className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold text-foreground">
                {item.title}
              </span>{" "}
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
