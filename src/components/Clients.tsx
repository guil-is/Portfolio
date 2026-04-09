import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Section } from "./Section";
import { site } from "@/content/site";

export function Clients() {
  const viewAll = (
    <a
      href="#work"
      className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
    >
      View all
      <ArrowRight className="h-3.5 w-3.5" />
    </a>
  );

  return (
    <Section id="clients" label="Clients" action={viewAll}>
      <ul className="flex flex-wrap items-center gap-x-10 gap-y-6 opacity-80">
        {site.clients.map((client) => (
          <li
            key={client.name}
            className="flex h-8 items-center"
            title={client.name}
          >
            <Image
              src={client.logo}
              alt={client.name}
              width={110}
              height={24}
              className="h-6 w-auto object-contain"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
