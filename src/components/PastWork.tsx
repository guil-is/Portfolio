import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./SectionHeading";
import { CenterFocus } from "./CenterFocus";
import { pastProjects, type PastProject } from "@/content/projects";
import { getAllProjects } from "@/lib/queries";

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function getProjects(): Promise<PastProject[]> {
  try {
    const sanity = await getAllProjects();
    if (sanity && sanity.length > 0) {
      // Merge Sanity metadata with local TS data for images
      // (Sanity doesn't have image URLs yet — they're still local).
      // Skip projects that are currently featured in 'Recent / Active'
      // so they don't appear twice on the homepage.
      const localBySlug = new Map(pastProjects.map((p) => [p.slug, p]));
      return sanity
        .filter((p) => !p.isActiveProject)
        .map((p) => {
          const local = localBySlug.get(p.slug);
          return {
            name: p.name,
            slug: p.slug,
            client: p.client,
            services: p.services,
            summary: p.summary,
            gridImage: local?.gridImage ?? p.gridImage ?? "",
            heroVideo: p.heroVideo,
            link: p.link,
            featured: p.featured,
          };
        });
    }
  } catch {
    // fallback
  }
  return [...pastProjects];
}

export async function PastWork() {
  const projects = await getProjects();
  // Filter out projects without a grid image for the homepage grid
  const withImages = projects.filter((p) => p.gridImage);
  const rows = chunk(withImages, 2);

  return (
    <section id="work" className="mx-auto w-full max-w-[800px]">
      <SectionHeading>Past work</SectionHeading>

      <div className="flex flex-col gap-8 py-16">
        {rows.map((row, rowIndex) => (
          <CenterFocus
            key={rowIndex}
            minOpacity={0.25}
            falloff={0.55}
            minScale={0.97}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {row.map((p) => (
                <PastWorkCard key={p.slug} project={p} />
              ))}
            </div>
          </CenterFocus>
        ))}
      </div>
    </section>
  );
}

function PastWorkCard({ project: p }: { project: PastProject }) {
  return (
    <Link href={`/projects/${p.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
        {p.gridImage ? (
          <Image
            src={p.gridImage}
            alt={p.name}
            fill
            sizes="(min-width: 768px) 400px, 100vw"
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <h5 className="font-display text-xl leading-tight text-ink">
          {p.name}
        </h5>
        <div className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
          {p.client}
        </div>
      </div>
    </Link>
  );
}
