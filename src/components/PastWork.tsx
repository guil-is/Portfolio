import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./SectionHeading";
import { CenterFocus } from "./CenterFocus";
import { pastProjects, type PastProject } from "@/content/projects";

// Group projects into fixed-size pairs so each row of 2 cards can share
// a single CenterFocus wrapper and fade/scale as a single visual unit
// based on its own vertical distance from the viewport center.
function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function PastWork() {
  const rows = chunk(pastProjects, 2);

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
        <Image
          src={p.gridImage}
          alt={p.name}
          fill
          sizes="(min-width: 768px) 400px, 100vw"
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <h5 className="font-display text-xl leading-tight text-ink">
          {p.name}
        </h5>
        <div className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
          {p.services || p.client}
        </div>
      </div>
    </Link>
  );
}
