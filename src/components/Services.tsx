import { Section } from "./Section";
import { site } from "@/content/site";

export function Services() {
  return (
    <Section id="services" eyebrow="What I do" title="Services">
      <ul className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {site.services.map((service) => (
          <li key={service.title} className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold tracking-tight">
              {service.title}
            </h3>
            <p className="text-base leading-relaxed text-muted">
              {service.description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
