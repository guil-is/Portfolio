import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { pastProjects } from "@/content/projects";
import { PageHeader } from "@/components/PageHeader";
import { CtaFooter } from "@/components/CtaFooter";
import { VideoEmbed } from "@/components/VideoEmbed";
import { ThemeToggle } from "@/components/ThemeToggle";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return pastProjects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const project = pastProjects.find((p) => p.slug === slug);
    if (!project) return { title: "Project not found" };
    return {
      title: `${project.name} \u2014 ${site.name}`,
      description: project.summary,
    };
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const index = pastProjects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = pastProjects[index];
  const prev = pastProjects[(index - 1 + pastProjects.length) % pastProjects.length];
  const next = pastProjects[(index + 1) % pastProjects.length];

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <main className="px-6 md:px-8">
        <PageHeader />

        {/* Breadcrumb + title */}
        <section className="mx-auto w-full max-w-[800px] pb-6 pt-8">
          <div className="flex items-center gap-2 font-caption text-[12px] uppercase tracking-[1.5px] text-muted">
            <Link href="/" className="hover:text-ink">
              guil
            </Link>
            <span>/</span>
            <Link href="/#work" className="hover:text-ink">
              work
            </Link>
            <span>/</span>
            <span className="text-ink">{project.name}</span>
          </div>
          <h1 className="mt-4 font-display text-[2.4rem] font-bold leading-tight text-ink md:text-[3rem]">
            {project.name}
          </h1>
        </section>

        {/* Hero media */}
        <section className="mx-auto w-full max-w-[800px] py-6">
          {project.heroVideo ? (
            <VideoEmbed url={project.heroVideo} title={project.name} />
          ) : (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
              <Image
                src={project.gridImage}
                alt={project.name}
                fill
                sizes="(min-width: 768px) 800px, 100vw"
                unoptimized
                className="object-cover"
              />
            </div>
          )}
        </section>

        {/* Meta grid */}
        <section className="mx-auto w-full max-w-[800px] border-t border-rule py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <MetaBlock label="Client" value={project.client} />
            <MetaBlock label="Services" value={project.services} />
            <div className="flex flex-col gap-2">
              <h6 className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
                Link
              </h6>
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[0.95rem] text-ink hover:text-accent"
                >
                  visit live website <span aria-hidden>→</span>
                </a>
              ) : (
                <span className="text-[0.95rem] text-muted">—</span>
              )}
            </div>
          </div>
        </section>

        {/* Project summary */}
        <section className="mx-auto w-full max-w-[800px] border-t border-rule py-16">
          <h2 className="font-caption mb-6 text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
            Project Summary
          </h2>
          <p className="font-display text-[1.5rem] leading-[2.2rem] text-ink md:text-[1.75rem] md:leading-[2.5rem]">
            {project.summary}
          </p>
        </section>

        {/* Prev/Next */}
        <section className="mx-auto w-full max-w-[800px] border-t border-rule py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <ProjectNavCard project={prev} direction="prev" />
            <ProjectNavCard project={next} direction="next" />
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              href="/#work"
              className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted hover:text-ink"
            >
              ← back to portfolio
            </Link>
          </div>
        </section>

        <CtaFooter />
      </main>
    </>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h6 className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </h6>
      <p className="text-[0.95rem] leading-[1.5rem] text-ink">{value || "—"}</p>
    </div>
  );
}

function ProjectNavCard({
  project,
  direction,
}: {
  project: (typeof pastProjects)[number];
  direction: "prev" | "next";
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group flex flex-col gap-3 ${
        direction === "next" ? "md:text-right" : ""
      }`}
    >
      <span className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
        {direction === "prev" ? "← previous" : "next →"}
      </span>
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433] ${
          direction === "next" ? "md:order-2" : ""
        }`}
      >
        <Image
          src={project.gridImage}
          alt={project.name}
          fill
          sizes="(min-width: 768px) 400px, 100vw"
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <h3 className="font-display text-[1.25rem] leading-tight text-ink">
        {project.name}
      </h3>
      <span className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
        {project.client}
      </span>
    </Link>
  );
}
