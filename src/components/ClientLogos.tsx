import { site } from "@/content/site";

// Horizontal strip of past client names. Uses text labels rather than
// image logos — works without any logo assets and still communicates
// credibility. Visually light, uppercase, evenly spaced.
export function ClientLogos() {
  return (
    <section className="mx-auto w-full max-w-[800px] py-12">
      <p className="mb-6 font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
        Selected clients
      </p>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {site.clients.map((name) => (
          <span
            key={name}
            className="font-display text-[1.1rem] font-bold text-ink/40 md:text-[1.25rem]"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
