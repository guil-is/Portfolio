import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./FadeIn";
import { pastProjects } from "@/content/projects";

export function PastWork() {
  return (
    <section id="work" className="mx-auto w-full max-w-[800px]">
      <SectionHeading>Past work</SectionHeading>

      <FadeIn>
        <div className="grid grid-cols-1 gap-8 py-16 md:grid-cols-2">
          {pastProjects.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="group flex flex-col gap-3"
            >
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
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
