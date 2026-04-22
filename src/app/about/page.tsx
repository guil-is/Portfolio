import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { PageHeader } from "@/components/PageHeader";
import { CtaFooter } from "@/components/CtaFooter";
import { Placeholder } from "@/components/Placeholder";
import { SiteNav } from "@/components/SiteNav";
import { HowWeWork } from "@/components/HowWeWork";

export const metadata: Metadata = {
  title: site.about.metaTitle,
  description: site.about.description,
};

export default function AboutPage() {
  const { hero, expertise, extendedLink, whyIDoThis } = site.about;

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <SiteNav />
      </div>
      <PageHeader />
      <main className="px-6 md:px-8">

        <section className="mx-auto w-full max-w-[800px] py-12 md:py-16">
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_291px]">
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-[2rem] leading-tight text-ink md:text-[2.4rem]">
                {hero.heading}
              </h1>
              {hero.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-display text-[1.25rem] leading-[1.9rem] text-ink/85"
                >
                  {p}
                </p>
              ))}
            </div>

            <div className="md:pt-2">
              <Placeholder label="GM" aspect="square" />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[800px] border-t border-rule py-16">
          <h2 className="font-display text-[2rem] leading-tight text-ink">
            {whyIDoThis.heading}
          </h2>
          <div className="flex flex-col gap-6 pt-8">
            {whyIDoThis.paragraphs.map((p, i) => (
              <p
                key={i}
                className="font-display text-[1.25rem] leading-[1.9rem] text-ink/85"
              >
                {p}
              </p>
            ))}
          </div>
        </section>

        <HowWeWork />

        <section className="mx-auto w-full max-w-[800px] border-t border-rule py-16">
          <h2 className="font-display text-[2rem] leading-tight text-ink">
            Expertise
          </h2>
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 pt-10 md:grid-cols-3">
            {expertise.map((e) => (
              <div key={e.title} className="flex flex-col gap-3">
                <h6 className="font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink">
                  {e.title}
                </h6>
                <p className="text-[0.9rem] leading-[1.5rem] text-ink">
                  {e.description}
                  {"linkLabel" in e && e.linkLabel && e.linkHref ? (
                    <>
                      {" "}
                      <a
                        href={e.linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-accent hover:underline"
                      >
                        {e.linkLabel}
                      </a>
                      .
                    </>
                  ) : null}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href={extendedLink.href}
              className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted hover:text-ink"
            >
              → {extendedLink.label}
            </Link>
          </div>
        </section>

        <CtaFooter />
      </main>
    </>
  );
}
