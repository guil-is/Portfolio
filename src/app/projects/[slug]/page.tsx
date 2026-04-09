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
import { FadeIn } from "@/components/FadeIn";
import { ProjectSideTitle } from "@/components/ProjectSideTitle";

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
  const prev =
    pastProjects[(index - 1 + pastProjects.length) % pastProjects.length];
  const next = pastProjects[(index + 1) % pastProjects.length];

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <ProjectSideTitle title={project.name} client={project.client} />

      <main className="page-fade-in px-6 md:px-10">
        <PageHeader
          left={
            <div className="flex min-w-0 items-center gap-2 font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
              <Link href="/" className="hover:text-ink">
                guil
              </Link>
              <span>&gt;</span>
              <Link href="/#work" className="hover:text-ink">
                work
              </Link>
              <span>&gt;</span>
              <span className="truncate text-ink">{project.name}</span>
            </div>
          }
        />

        {/* Title */}
        <section className="mx-auto w-full max-w-[960px] pb-10 pt-10 md:pt-16">
          <h1 className="intro-rise font-display text-[2.2rem] font-bold leading-tight text-ink md:text-[3rem]">
            {project.name}
          </h1>
        </section>

        {/* Hero media */}
        <FadeIn>
          <section className="mx-auto w-full max-w-[960px] pb-10">
            {project.heroVideo ? (
              <VideoEmbed url={project.heroVideo} title={project.name} />
            ) : (
              <div className="relative aspect-[16/9] max-h-[960px] w-full overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
                <Image
                  src={project.mainImage || project.gridImage}
                  alt={project.name}
                  fill
                  sizes="(min-width: 768px) 960px, 100vw"
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}
          </section>
        </FadeIn>

        {/* Meta grid — item-bordered style: top border + 20px padding-top */}
        <FadeIn>
          <section className="mx-auto w-full max-w-[960px] pb-16">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0">
              <MetaBlock label="Client" value={project.client} first />
              <MetaBlock label="Services" value={project.services} />
              <div className="flex flex-col gap-3 border-t border-rule-soft pt-5 md:border-l md:pl-10">
                <h6 className="text-[10px] font-semibold uppercase leading-[22px] tracking-[1px] text-ink/35">
                  Link
                </h6>
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-caption text-[12px] font-semibold uppercase tracking-[1px] text-ink transition-colors hover:text-accent"
                  >
                    visit live website
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </a>
                ) : (
                  <span className="font-caption text-[12px] uppercase text-muted">
                    —
                  </span>
                )}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Project summary — large left-aligned display text, bordered section */}
        <FadeIn>
          <section className="border-y border-[#ebebeb] py-[70px] dark:border-rule">
            <div className="mx-auto w-full max-w-[960px]">
              <p className="max-w-[720px] font-display text-[1.75rem] font-bold leading-[1.35] text-ink md:text-[2.375rem] md:leading-[1.25]">
                {project.summary}
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Project details article — rendered as rich HTML from the CSV
            Project Details field. Uses .project-article styles in
            globals.css to approximate the Webflow article typography. */}
        {project.projectDetails && (
          <FadeIn>
            <section className="py-16">
              <div
                className="project-article"
                dangerouslySetInnerHTML={{ __html: project.projectDetails }}
              />
            </section>
          </FadeIn>
        )}

        {/* Feature image + caption rows (currently only Octopus has these). */}
        {project.features && project.features.length > 0 && (
          <section className="mx-auto w-full max-w-[1200px] py-16">
            <div className="flex flex-col gap-20">
              {project.features.map((feat, i) => (
                <FadeIn key={i}>
                  <div
                    className={`flex flex-col items-center gap-6 md:flex-row ${
                      i % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {feat.image && (
                      <div className="relative w-full max-w-[700px] overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
                        <Image
                          src={feat.image}
                          alt={feat.caption ?? `${project.name} feature ${i + 1}`}
                          width={1600}
                          height={1200}
                          sizes="(min-width: 768px) 700px, 100vw"
                          unoptimized
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    )}
                    {feat.caption && (
                      <p className="max-w-[400px] text-[0.95rem] leading-[1.6rem] text-body">
                        {feat.caption}
                      </p>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* Still-frames gallery (if available) */}
        {project.stillFrames && project.stillFrames.length > 0 && (
          <FadeIn>
            <section className="mx-auto w-full max-w-[1200px] py-16">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.stillFrames.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]"
                  >
                    <Image
                      src={src}
                      alt={`${project.name} still frame ${i + 1}`}
                      fill
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {/* Prev/Next — bordered item-navigation style, 80px padding */}
        <section className="mx-auto w-full max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <ProjectNavCard project={prev} direction="prev" />
            <ProjectNavCard
              project={next}
              direction="next"
              borderLeft
            />
          </div>
          <div className="flex justify-center py-12">
            <Link
              href="/#work"
              className="font-caption text-[12px] font-medium uppercase tracking-[1px] text-muted transition-colors hover:text-ink"
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

function MetaBlock({
  label,
  value,
  first,
}: {
  label: string;
  value: string;
  first?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 border-t border-rule-soft pt-5 ${
        first ? "" : "md:border-l md:pl-10"
      }`}
    >
      <h6 className="text-[10px] font-semibold uppercase leading-[22px] tracking-[1px] text-ink/35">
        {label}
      </h6>
      <p className="font-caption text-[12px] font-semibold uppercase tracking-[1px] text-ink">
        {value || "—"}
      </p>
    </div>
  );
}

function ProjectNavCard({
  project,
  direction,
  borderLeft,
}: {
  project: (typeof pastProjects)[number];
  direction: "prev" | "next";
  borderLeft?: boolean;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group flex flex-col gap-5 border-y border-rule-soft px-6 py-16 md:px-20 md:py-20 ${
        borderLeft ? "md:border-l" : ""
      } ${direction === "next" ? "md:text-right" : ""}`}
    >
      <span className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {direction === "prev" ? "← previous" : "next →"}
      </span>
      <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
        <Image
          src={project.gridImage}
          alt={project.name}
          fill
          sizes="(min-width: 768px) 600px, 100vw"
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-[1.75rem] font-bold leading-tight text-ink transition-colors group-hover:text-accent md:text-[2rem]">
          {project.name}
        </h3>
        <span className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {project.client}
        </span>
      </div>
    </Link>
  );
}
