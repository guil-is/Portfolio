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
import { ProjectArticle } from "@/components/ProjectArticle";
import { StillFramesGallery } from "@/components/StillFramesGallery";
import {
  getAllProjectSlugs,
  getProjectBySlug,
  getAllProjects,
} from "@/lib/queries";

export const revalidate = 60;

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const slugs = await getAllProjectSlugs();
    if (slugs && slugs.length > 0) {
      return slugs.map((slug: string) => ({ slug }));
    }
  } catch {
    // fallback
  }
  return pastProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sanityProject = await getProjectBySlug(slug).catch(() => null);
  const localProject = pastProjects.find((p) => p.slug === slug);
  const project = sanityProject ?? localProject;
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.name} | ${site.name}`,
    description: project.summary,
  };
}

// Get all projects for prev/next navigation, with Sanity fallback
async function getProjectList() {
  const localBySlug = new Map(
    pastProjects.map((p) => [p.slug, p]),
  );
  try {
    const sanity = await getAllProjects();
    if (sanity && sanity.length > 0) {
      return sanity.map((p) => {
        const local = localBySlug.get(p.slug);
        return {
          name: p.name,
          slug: p.slug,
          client: p.client,
          gridImage: local?.gridImage ?? p.gridImage ?? "",
        };
      });
    }
  } catch {
    // fallback
  }
  return pastProjects.map((p) => ({
    name: p.name,
    slug: p.slug,
    client: p.client,
    gridImage: p.gridImage,
  }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  // Try Sanity first for metadata, fall back to TS
  const sanityProject = await getProjectBySlug(slug).catch(() => null);
  const localProject = pastProjects.find((p) => p.slug === slug);

  if (!sanityProject && !localProject) notFound();

  // Merge: Sanity for editable fields, local TS for rich content
  // (projectDetails HTML, stillFrames, features) that aren't in Sanity yet
  const project = {
    ...localProject,
    name: sanityProject?.name ?? localProject?.name ?? "",
    slug: sanityProject?.slug ?? localProject?.slug ?? slug,
    client: sanityProject?.client ?? localProject?.client ?? "",
    services: sanityProject?.services ?? localProject?.services ?? "",
    summary: sanityProject?.summary ?? localProject?.summary ?? "",
    heroVideo: sanityProject?.heroVideo ?? localProject?.heroVideo,
    link: sanityProject?.link ?? localProject?.link,
    gridImage: localProject?.gridImage ?? sanityProject?.gridImage ?? "",
    mainImage: localProject?.mainImage ?? sanityProject?.mainImage,
    projectDetails: localProject?.projectDetails,
    stillFrames: localProject?.stillFrames,
    features: localProject?.features,
  };

  // Get full project list for prev/next
  const allProjects = await getProjectList();
  const index = allProjects.findIndex((p) => p.slug === slug);
  const prev =
    allProjects[(index - 1 + allProjects.length) % allProjects.length];
  const next = allProjects[(index + 1) % allProjects.length];

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <ProjectSideTitle title={project.name} client={project.client} />

      <div className="page-fade-in">
        <PageHeader
          maxWidth={960}
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
              <span className="truncate font-bold text-ink">
                {project.name}
              </span>
            </div>
          }
        />

        <main className="px-6 md:px-10">
          {/* Hero media */}
          <FadeIn>
            <section className="mx-auto w-full max-w-[960px] pb-10 pt-10">
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
            <div className="mx-auto w-full max-w-[960px] px-6 md:px-10">
              <p className="mx-auto max-w-[720px] font-display text-[1.75rem] font-bold leading-[1.35] text-ink md:text-[2.375rem] md:leading-[1.25]">
                {project.summary}
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Project details article. Prefer Sanity's Portable Text
            body (editable in Studio, can include image + videoEmbed
            blocks). Fall back to the legacy HTML body from the local
            TS file for any project that hasn't been migrated yet. */}
        {sanityProject?.projectDetails &&
        sanityProject.projectDetails.length > 0 ? (
          <FadeIn>
            <section className="py-16">
              <ProjectArticle blocks={sanityProject.projectDetails} />
            </section>
          </FadeIn>
        ) : project.projectDetails ? (
          <FadeIn>
            <section className="py-16">
              <div
                className="project-article"
                dangerouslySetInnerHTML={{ __html: project.projectDetails }}
              />
            </section>
          </FadeIn>
        ) : null}

        {/* Still-frames gallery. Uses Sanity's stillFrames with
            resolved asset URLs + dimensions (needed for the
            justified-rows layout). Falls back to the local TS file's
            string URLs using a default aspect ratio when dimensions
            aren't available.
            NOTE: the legacy `features` array from local TS used to
            render here as its own section. That caused duplicates for
            projects whose features were migrated into projectDetails
            (they now render once inside the article, via the appended
            image blocks). Removed. */}
        {(() => {
          type SrcFrame = { src: string; width: number; height: number };
          const sanityFrames: SrcFrame[] = (sanityProject?.stillFrames ?? [])
            .filter((f) => !!f.url)
            .map((f) => ({
              src: f.url as string,
              width: f.width ?? 1600,
              height: f.height ?? 900,
            }));
          const localFrames: SrcFrame[] =
            sanityFrames.length > 0
              ? []
              : (project.stillFrames ?? []).map((src) => ({
                  src,
                  width: 1600,
                  height: 900,
                }));
          const frames =
            sanityFrames.length > 0 ? sanityFrames : localFrames;
          if (frames.length === 0) return null;
          return (
            <FadeIn>
              <section className="mx-auto w-full max-w-[1200px] px-6 py-16 md:px-10">
                <StillFramesGallery
                  frames={frames}
                  alt={project.name}
                />
              </section>
            </FadeIn>
          );
        })()}

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
      </div>
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
  project: { name: string; slug: string; client: string; gridImage: string };
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
