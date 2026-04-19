import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { ClientLogos } from "@/components/ClientLogos";
import { ActiveProjects } from "@/components/ActiveProjects";
import { Expertise } from "@/components/Expertise";
import { PastWork } from "@/components/PastWork";
import { Testimonials } from "@/components/Testimonials";
import { CtaFooter } from "@/components/CtaFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSiteSettings } from "@/lib/queries";
import { site } from "@/content/site";
import { dummyTestimonials } from "@/content/testimonials";

/**
 * Staging mirror of the home page, used to preview in-progress
 * sections (e.g. testimonials) before promoting them to /. Not linked
 * from anywhere on the site; robots explicitly excluded.
 */
export const metadata: Metadata = {
  title: "Preview · Guil Maueler",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export const revalidate = 60;

export default async function HomePreview() {
  const settings = await getSiteSettings().catch(() => null);

  const headline = settings?.headline || site.introHeading;
  const bio = settings?.bio?.length ? settings.bio : site.hero.bio;
  const bioClosing = settings?.bioClosing || site.hero.bioClosing;
  const ctaLabel = settings?.ctaLabel || site.hero.cta.label;
  const ctaHref = settings?.ctaHref || site.hero.cta.href;
  const bottomHeading = settings?.bottomCtaHeading || site.bottomCta.heading;
  const bottomSub = settings?.bottomCtaSub || site.bottomCta.sub;

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <main className="page-fade-in px-6 pt-16 md:px-8 md:pt-24">
        <Hero
          headline={headline}
          bio={bio}
          bioClosing={bioClosing}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
        />
        <ClientLogos />
        <ActiveProjects />
        <Expertise />
        <Testimonials testimonials={dummyTestimonials} />
        <PastWork />
        <CtaFooter heading={bottomHeading} sub={bottomSub} />
      </main>
    </>
  );
}
