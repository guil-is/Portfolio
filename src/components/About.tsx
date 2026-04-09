import { Section } from "./Section";
import { site } from "@/content/site";

export function About() {
  return (
    <Section id="about" eyebrow="About" title={`Hi, I\u2019m ${site.name.split(" ")[0]}.`}>
      <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-foreground/80">
        {site.about.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}
