import type { Metadata } from "next";
import { site } from "@/content/site";
import { clients as localClients } from "@/content/clients";
import { getAllClients, type SanityClient } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: `Clients & Partners | ${site.name}`,
  description:
    "Companies and organizations I've partnered with as a fractional design partner.",
};

// Group clients alphabetically by first character
function groupByLetter(
  items: { name: string; description: string; href?: string }[],
) {
  const sorted = [...items].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );

  const groups: Map<
    string,
    { name: string; description: string; href?: string }[]
  > = new Map();
  for (const item of sorted) {
    const first = item.name[0].toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : "#";
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(item);
  }

  return Array.from(groups.entries()).map(([letter, items]) => ({
    letter,
    items,
  }));
}

// Fetch from Sanity, fall back to local TS data if empty/error
async function getClients() {
  try {
    const sanityClients = await getAllClients();
    if (sanityClients && sanityClients.length > 0) {
      return sanityClients.map((c: SanityClient) => ({
        name: c.name,
        description: c.description,
        href: c.href,
      }));
    }
  } catch {
    // Sanity unreachable — use local fallback
  }
  return localClients;
}

export default async function ClientsPage() {
  const clients = await getClients();
  const grouped = groupByLetter(clients);

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PageHeader />
      <main className="px-6 md:px-10">
        <section className="mx-auto w-full max-w-[800px] pb-10 pt-12 md:pt-20">
          <h1 className="font-display text-[3rem] font-bold leading-[1.1] text-ink md:text-[4.5rem]">
            Clients
          </h1>
        </section>

        <section className="mx-auto w-full max-w-[800px] pb-24">
          <div className="flex flex-col">
            {grouped.map(({ letter, items }) => (
              <div key={letter}>
                {items.map((client, i) => (
                  <div
                    key={client.name}
                    className="grid grid-cols-[40px_1fr] items-baseline border-b border-rule-soft py-4 md:grid-cols-[60px_1fr]"
                  >
                    <div className="font-caption text-[13px] font-medium text-muted">
                      {i === 0 ? letter : ""}
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {client.href ? (
                        <a
                          href={client.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display text-[1rem] font-bold text-ink transition-colors hover:text-accent md:text-[1.1rem]"
                        >
                          {client.name}
                        </a>
                      ) : (
                        <span className="font-display text-[1rem] font-bold text-ink md:text-[1.1rem]">
                          {client.name}
                        </span>
                      )}
                      <span className="text-[0.9rem] text-muted">
                        {client.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <footer className="pb-12 text-center">
          <p className="font-caption text-[11px] uppercase tracking-[2px] text-muted">
            &copy; Copyright {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </>
  );
}
