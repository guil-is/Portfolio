import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { PageHeader } from "@/components/PageHeader";
import { CtaFooter } from "@/components/CtaFooter";
import { Placeholder } from "@/components/Placeholder";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: site.aboutExtended.metaTitle,
  description: site.aboutExtended.description,
};

export default function AboutExtendedPage() {
  const { hero, sections } = site.aboutExtended;

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <main className="px-6 md:px-8">
        <PageHeader />

        <section className="mx-auto w-full max-w-[800px] py-12 md:py-16">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_291px]">
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.4rem]">
                {hero.heading}
              </h1>
              <p className="font-display text-[1.25rem] leading-[1.9rem] text-ink/85">
                {hero.paragraph}
              </p>
            </div>
            <div className="md:pt-2">
              <Placeholder label="GM" aspect="square" />
            </div>
          </div>
        </section>

        {sections.map((section) => (
          <section
            key={section.heading}
            className="mx-auto w-full max-w-[800px] border-t border-rule py-16"
          >
            <h2 className="mb-6 font-display text-[1.75rem] font-bold leading-tight text-ink">
              {section.heading}
            </h2>
            <div className="flex flex-col gap-6">
              {section.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-display text-[1.15rem] leading-[1.85rem] text-ink/85"
                >
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section className="mx-auto w-full max-w-[800px] pb-12 pt-6">
          <Link
            href="/about"
            className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted hover:text-ink"
          >
            ← back to about
          </Link>
        </section>

        <CtaFooter />
      </main>
    </>
  );
}
