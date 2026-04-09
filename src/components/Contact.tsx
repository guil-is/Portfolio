import { ArrowUpRight } from "lucide-react";
import { Section } from "./Section";
import { site } from "@/content/site";

export function Contact() {
  return (
    <Section id="contact" eyebrow="Contact" title="Let\u2019s work together.">
      <div className="flex flex-col gap-10">
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Have a project in mind, or just want to say hello? The best way to
          reach me is over email.
        </p>

        <a
          href={`mailto:${site.email}`}
          className="inline-flex w-fit items-center gap-2 text-2xl font-semibold tracking-tight underline decoration-border underline-offset-8 transition-colors hover:decoration-foreground sm:text-3xl"
        >
          {site.email}
          <ArrowUpRight className="h-6 w-6" />
        </a>

        <ul className="flex flex-wrap gap-3">
          {site.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  social.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {social.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
