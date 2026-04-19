import Link from "next/link";
import { site } from "@/content/site";
import { SectionHeading } from "./SectionHeading";
import { PulsingDot } from "./PulsingDot";
import { Placeholder } from "./Placeholder";
import { CenterFocus } from "./CenterFocus";
import { getActiveProjects } from "@/lib/queries";

type DisplayProject = {
  key: string;
  title: string;
  role: string;
  description: string;
  image?: string;
  imageAlt: string;
  /** Internal case study URL if the project has body content on /projects/<slug>. */
  caseStudyHref?: string;
  /** External project site. Used as fallback when there's no case study. */
  externalHref?: string;
};

export async function ActiveProjects() {
  const sanityProjects = await getActiveProjects().catch(() => null);

  const projects: DisplayProject[] =
    sanityProjects && sanityProjects.length > 0
      ? sanityProjects.map((p) => ({
          key: p._id,
          title: p.name,
          role: p.activeRole ?? "",
          description: p.activeBlurb ?? "",
          image: p.gridImage,
          imageAlt: p.name,
          caseStudyHref: p.hasCaseStudy ? `/projects/${p.slug}` : undefined,
          externalHref: p.link,
        }))
      : site.activeProjects.map((p) => ({
          key: p.title,
          title: p.title,
          role: p.role,
          description: p.description,
          image: p.image,
          imageAlt: p.imageAlt,
          externalHref: p.href,
        }));

  return (
    <section className="mx-auto w-full max-w-[800px]">
      <SectionHeading>
        <PulsingDot />
        <span>recent / active projects</span>
      </SectionHeading>

      <div className="flex flex-col">
        {projects.map((p, i) => {
          const reverse = i % 2 === 1;
          const href = p.caseStudyHref ?? p.externalHref;
          const isInternal = !!p.caseStudyHref;

          const imageInner = p.image ? (
            <div className="metallic-border rounded-[16px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.imageAlt}
                className="aspect-[16/9] w-full rounded-[16px] object-cover shadow-[0_4px_40px_#cfc8c433]"
              />
            </div>
          ) : (
            <div className="metallic-border aspect-[16/9] w-full overflow-hidden rounded-[16px]">
              <Placeholder label={p.title} />
            </div>
          );

          const imageBlock = href ? (
            isInternal ? (
              <Link
                href={href}
                className="block transition-transform duration-300 hover:scale-[1.02]"
              >
                {imageInner}
              </Link>
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform duration-300 hover:scale-[1.02]"
              >
                {imageInner}
              </a>
            )
          ) : (
            imageInner
          );

          const titleInner = (
            <h5 className="font-display text-[2rem] leading-tight text-ink transition-opacity hover:opacity-70">
              {p.title}
            </h5>
          );

          const titleBlock = href ? (
            isInternal ? (
              <Link href={href}>{titleInner}</Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {titleInner}
              </a>
            )
          ) : (
            titleInner
          );

          const textBlock = (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {titleBlock}
                {p.role ? (
                  <div className="font-caption text-[12px] font-medium uppercase leading-4 tracking-[1.5px] text-muted">
                    {p.role}
                  </div>
                ) : null}
              </div>
              <p className="text-[0.95rem] leading-[1.6rem] text-ink">
                {p.description}
              </p>
            </div>
          );

          return (
            <CenterFocus key={p.key} minOpacity={0.25} falloff={0.55}>
              <div className="grid grid-cols-1 items-center gap-8 py-12 md:grid-cols-2">
                {reverse ? (
                  <>
                    <div className="order-1 md:order-2">{imageBlock}</div>
                    <div className="order-2 md:order-1">{textBlock}</div>
                  </>
                ) : (
                  <>
                    {imageBlock}
                    {textBlock}
                  </>
                )}
              </div>
            </CenterFocus>
          );
        })}
      </div>
    </section>
  );
}
