import { Hero } from "@/components/Hero";
import { ClientLogos } from "@/components/ClientLogos";
import { ActiveProjects } from "@/components/ActiveProjects";
import { Expertise } from "@/components/Expertise";
import { PastWork } from "@/components/PastWork";
import { Testimonials } from "@/components/Testimonials";
import { CtaFooter } from "@/components/CtaFooter";
import { PageHeader } from "@/components/PageHeader";
import {
  flattenTestimonial,
  getAllProjects,
  getAllTestimonials,
  getFeaturedClients,
  getSiteSettings,
} from "@/lib/queries";
import { site } from "@/content/site";
import { siteTestimonials } from "@/content/testimonials";

// Re-fetch from Sanity every 60 seconds so Studio edits go live
// without a full redeploy.
export const revalidate = 60;

export default async function Home() {
  const settings = await getSiteSettings().catch(() => null);
  const sanityTestimonials = await getAllTestimonials().catch(() => []);
  const testimonials = sanityTestimonials.length
    ? sanityTestimonials.map(flattenTestimonial)
    : siteTestimonials;

  const sanityProjects = await getAllProjects().catch(() => []);
  const hoverImages = sanityProjects
    .filter((p) => !!p.gridImage)
    .map((p) => ({ src: p.gridImage!, alt: p.name }));

  // Marquee: Sanity-featured clients with an uploaded logo override the
  // static site.ts entry of the same name and append after it otherwise,
  // so the marquee keeps working while logos migrate to the CMS.
  const featuredClients = await getFeaturedClients().catch(() => []);
  const sanityLogos = featuredClients
    .filter((c) => !!c.logoUrl)
    .map((c) => ({ name: c.name, src: c.logoUrl! }));
  const bySanityName = (name: string) =>
    sanityLogos.find((s) => s.name.toLowerCase() === name.toLowerCase());
  const marqueeLogos = [
    ...site.trustedBy.logos.map((l) => bySanityName(l.name) ?? l),
    ...sanityLogos.filter(
      (s) =>
        !site.trustedBy.logos.some(
          (l) => l.name.toLowerCase() === s.name.toLowerCase(),
        ),
    ),
  ];

  // Merge Sanity settings over local defaults
  const headline = settings?.headline || site.introHeading;
  const bio = settings?.bio?.length ? settings.bio : site.hero.bio;
  const bioClosing = settings?.bioClosing || site.hero.bioClosing;
  const ctaLabel = settings?.ctaLabel || site.hero.cta.label;
  const ctaHref = settings?.ctaHref || site.hero.cta.href;
  const bottomHeading = settings?.bottomCtaHeading || site.bottomCta.heading;
  const bottomSub = settings?.bottomCtaSub || site.bottomCta.sub;

  return (
    <>
      <PageHeader />
      <main className="page-fade-in px-6 pt-4 md:px-8 md:pt-8">
        <Hero
          headline={headline}
          bio={bio}
          bioClosing={bioClosing}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          hoverImages={hoverImages}
        />
        <ClientLogos logos={marqueeLogos} />
        <ActiveProjects />
        <Expertise />
        <Testimonials testimonials={testimonials} />
        <PastWork />
        <CtaFooter heading={bottomHeading} sub={bottomSub} />
      </main>
    </>
  );
}
