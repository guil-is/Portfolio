import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { pastProjects } from "@/content/projects";
import { PageHeader } from "@/components/PageHeader";
import { CtaFooter } from "@/components/CtaFooter";
import { FadeIn } from "@/components/FadeIn";
import { ProjectSideTitle } from "@/components/ProjectSideTitle";
import { SectionHeading } from "@/components/SectionHeading";
import { CaseFigure } from "@/components/CaseFigure";
import { img } from "./media";

// Bespoke case study for the Thrive product design work (Aug 2025 to
// Feb 2026). Static sibling of the dynamic /projects/[slug] route — it
// shadows the slug "thrive-product" and is intentionally NOT in Sanity,
// the homepage grid, or the sitemap. Unlisted: live at the URL only.
// To list it later: flip robots to index, add a minimal Sanity project
// doc (name, slug "thrive-product", grid thumbnail) for the grid card.

const pageTitle = `Thrive Protocol — Product Design | ${site.name}`;
const shareDescription =
  "Product design for a capital allocation platform. Design Lead, Aug 2025 to Feb 2026.";
const shareImage = "/projects/thrive-product/og.png";

export const metadata: Metadata = {
  title: pageTitle,
  description:
    "Product design for Thrive, a capital allocation platform. Structured intake, verification flows, and a decision layer that turns dense on-chain and off-chain data into decisions non-experts can act on.",
  // Unlisted for now — remove when the page goes into the work index.
  robots: { index: false, follow: false },
  openGraph: {
    title: pageTitle,
    description: shareDescription,
    type: "article",
    url: "https://guil.is/projects/thrive-product",
    images: [{ url: shareImage, width: 2400, height: 1350 }],
  },
  // Without this the page inherits the root layout's generic twitter
  // card, and scrapers that prefer twitter:image show the wrong image.
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: shareDescription,
    creator: "@guil_is",
    images: [shareImage],
  },
};

const brandProject = pastProjects.find((p) => p.slug === "thrive");

// Cover: the same hero gif the brand case study uses as its main image.
const coverImage =
  brandProject?.mainImage ??
  "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc8c76563ae4fa076fec0_home%20page.gif";

export default function ThriveProductPage() {
  return (
    <>
      <ProjectSideTitle title="Thrive Protocol" client="Product Design" />

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
                Thrive Protocol
              </span>
            </div>
          }
        />

        <main className="px-6 md:px-10">
          {/* Hero media — same treatment as /projects/[slug] */}
          <FadeIn>
            <section className="mx-auto w-full max-w-[960px] pb-10 pt-10">
              <div className="relative aspect-[16/9] max-h-[960px] w-full overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
                <Image
                  src={coverImage}
                  alt="The Thrive home page"
                  fill
                  sizes="(min-width: 768px) 960px, 100vw"
                  unoptimized
                  className="object-cover"
                />
              </div>
            </section>
          </FadeIn>

          {/* Info row — summary full width, role / scope / period in a
              band underneath */}
          <FadeIn>
            <section className="mx-auto w-full max-w-[960px] border-t border-[#ebebeb] py-14 dark:border-rule md:py-20">
              <p className="font-display text-[1.75rem] font-bold leading-[1.3] text-ink md:text-[2.125rem] md:leading-[1.25]">
                Thrive Protocol: Product design for a capital allocation
                platform.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-8 border-t border-[#ebebeb] pt-10 dark:border-rule md:mt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)_minmax(0,1fr)] md:gap-12 md:pt-12">
                <MetaBlock label="Role">
                  <span className="font-display text-[1rem] text-ink">
                    Design Lead
                  </span>
                </MetaBlock>
                <MetaBlock label="Scope">
                  <ScopeTags
                    tags={[
                      "Product design",
                      "Information architecture",
                      "Design systems",
                      "Verification flows",
                    ]}
                  />
                </MetaBlock>
                <MetaBlock label="Period">
                  <span className="font-display text-[1rem] text-ink">
                    Aug 2025 to Feb 2026
                  </span>
                </MetaBlock>
              </div>
            </section>
          </FadeIn>

          {/* 1. Context */}
          <CaseSection number="01" title="Context">
            {/* TODO copy */}
            <Copy>
              Thrive is a capital allocation and intelligence platform for
              investors and founders. It surfaces on-chain signals and human
              reviews so funders can make decisions backed by evidence. The
              concept narrative was Proof of Value.
            </Copy>
            {/* TODO copy */}
            <Copy>
              I owned product and brand design end to end. This page covers
              the product work. The{" "}
              <Link
                href="/projects/thrive"
                className="text-accent underline underline-offset-4 hover:opacity-70"
              >
                brand case study
              </Link>{" "}
              covers the rest.
            </Copy>
            <CaseFigure
              maxWidth={640}
              items={[
                img(
                  "01-context-participants.png",
                  "The consensus loop: Builders create impact, Guardians verify it, Ecosystems fund it",
                ),
              ]}
              caption="Builders create impact. Guardians verify it. Ecosystems fund it."
            />
            <CaseFigure
              items={[
                img(
                  "01-context-powerscore.png",
                  "How the Power Score works: power signals feed the Thrive algorithm, out comes the score",
                ),
              ]}
            />
            <CaseFigure
              items={[
                img(
                  "01-context-hero.png",
                  "The Thrive Power List: builders get verified, Guardians validate, ecosystems fund",
                ),
              ]}
            />
            <CaseFigure
              items={[
                img(
                  "01-context-powerlist.png",
                  "The Power List: verified ecosystem projects ranked by score for investors",
                ),
              ]}
              caption="The Power List itself. Verified projects, ranked, ready to invest in."
            />
            <CaseFigure
              items={[
                img(
                  "01-context-dashboard.png",
                  "A program dashboard: daily applications, approvals and funds paid out at a glance",
                ),
              ]}
              caption="The program side. Every action is visible, including who approved what and when."
            />
          </CaseSection>

          {/* 2. The problem */}
          <CaseSection number="02" title="The problem">
            {/* TODO copy */}
            <Copy>Three things made this hard.</Copy>
            {/* TODO copy */}
            <ul className="mx-auto max-w-[720px] list-disc space-y-3 pl-6 text-[18px] leading-[1.75]">
              <li>
                The data is dense and mixed. On-chain metrics can be verified.
                Off-chain claims cannot.
              </li>
              <li>
                The people making the decisions are not analysts. They need
                conclusions, not raw tables.
              </li>
              <li>
                Projects submit their own evidence. They have every incentive
                to inflate it.
              </li>
            </ul>
          </CaseSection>

          {/* 3. Structured intake */}
          <CaseSection number="03" title="Structured intake">
            {/* TODO copy */}
            <Copy>
              Scoring only works if evidence arrives in a shape we can score.
              I mapped the pipeline end to end. Data connects at the source,
              Guardians and agents verify it, intelligence turns it into
              scores, and the output is ready for a decision. Every
              submission maps to four signal categories: Capital Efficiency,
              Team Credibility, Revenue Quality, and Traction Velocity.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "03-intake-pipeline.png",
                  "The verification pipeline: connect data, verify, intelligence, decision-ready outputs",
                ),
              ]}
              caption="From raw data to decision-ready. Founders control who sees their data and at what level of detail."
            />
          </CaseSection>

          {/* 4. Missing data */}
          <CaseSection number="04" title="Missing data">
            {/* TODO copy */}
            <Copy>
              A submission is rarely complete on the first pass. The platform
              tells a project exactly what is missing, what each item is
              worth, and how to fix it, without a human sending emails.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "04-missing-data-overview.png",
                  "The Verification Hub: verification progress and the biggest confidence boosts available",
                ),
              ]}
            />
            <CaseFigure
              items={[
                img(
                  "04-missing-data-actions.png",
                  "Top actions a project can take to improve its score",
                ),
              ]}
              caption="Each gap becomes a concrete next step: connect an API, send a document for review, verify a profile."
            />
            {/* TODO copy */}
            <Copy>
              Gaps a project cannot fill become research tasks. Guardians pick
              them up, follow written steps, and file the missing signal. No
              chasing, no email threads.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "04-missing-data-research.png",
                  "A Guardian research task for a missing signal, with step by step instructions",
                ),
              ]}
            />
          </CaseSection>

          {/* 5. Verification and scoring */}
          <CaseSection number="05" title="Verification and scoring">
            {/* TODO copy */}
            <Copy>
              Guardians verify each claim against its proof. They are a
              vetted network of human experts and AI agents. Every signal has
              a 1 to 5 scale with a readable label, instructions for the
              reviewer, and the data required to back a score. A review walks
              the same steps every time, so two Guardians looking at the same
              project reach comparable results. Guardians earn Thrive points
              for the work, and points translate to tokens. Verifying impact
              carries financial upside.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "05-verify-states.jpg",
                  "A Guardian verifying a claim against its proof, with accept and reject states",
                ),
              ]}
            />
            <CaseFigure
              items={[
                img(
                  "05-verify-review.png",
                  "A review step: traction and validation evidence laid out against the reviewer instructions",
                ),
              ]}
              caption="Dense evidence, one step at a time. The reviewer sees the instructions and the data side by side."
            />
          </CaseSection>

          {/* 6. The decision layer */}
          <CaseSection number="06" title="The decision layer">
            {/* TODO copy */}
            <Copy>
              This is where an investor or reviewer makes a call. The
              Verification Terminal compresses a project into score, coverage
              and confidence, with the full report one click away. I mapped
              every approve and reject path before drawing screens.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "06-decision-terminal.png",
                  "The Verification Terminal: a project summary in deal flow with score, coverage and confidence",
                ),
              ]}
              caption="The Verification Terminal, mid build in Lovable."
            />
            <CaseFigure
              items={[
                img(
                  "06-decision-flows.png",
                  "The full approval and rejection flow for applications, mapped screen by screen",
                ),
              ]}
              caption="Approve and reject paths mapped screen by screen before any UI was final."
            />
          </CaseSection>

          {/* 7. Thrive Agent */}
          <CaseSection number="07" title="Thrive Agent">
            {/* TODO copy */}
            <Copy>
              The same discipline, turned toward founders. Thrive Agent locks
              a goal, pulls real data from the tools a company already runs,
              and challenges its own recommendations against that data before
              showing them. Claims that fail the check get dropped, visibly.
            </Copy>
            <CaseFigure
              slideshow
              items={[
                img(
                  "07-agent-clarify.png",
                  "Agent step one: clarify the business goal",
                ),
                img(
                  "07-agent-connect.png",
                  "Agent step two: connect real data sources",
                ),
                img(
                  "07-agent-verify.png",
                  "Agent step three: recommendations challenged against the data",
                ),
              ]}
              caption="Clarify, connect, verify. Every recommendation traces back to a data source."
            />
          </CaseSection>

          {/* 8. Systems work */}
          <CaseSection number="08" title="Systems work">
            {/* TODO copy */}
            <Copy>
              I restructured the app&apos;s information architecture, starting
              from the full project lifecycle: application, review,
              contracts, milestones, payment. I also built the design
              system: components, states, and the typography scale.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "08-systems-lifecycle.png",
                  "The full project lifecycle, mapped state by state",
                ),
              ]}
              caption="The lifecycle map behind the IA restructure. Every state a project can be in, and every way out of it."
            />
            <CaseFigure
              items={[
                img(
                  "08-systems-components.png",
                  "Button components across variants, sizes and states",
                ),
              ]}
            />
            <CaseFigure
              items={[
                img(
                  "08-systems-typography.png",
                  "The typography scale for desktop and mobile",
                ),
              ]}
            />
          </CaseSection>

          {/* 9. Shipping */}
          <CaseSection number="09" title="Shipping">
            {/* TODO copy */}
            <Copy>
              I shipped production interfaces directly with Lovable. That cut
              the design to build loop from weeks to days. Decisions were
              tested in the real product, not in mockups. The Verification
              Terminal above still carries the build bar.
            </Copy>
          </CaseSection>

          {/* Footer: link back to the brand case study */}
          <FadeIn>
            <section className="mx-auto mt-24 w-full max-w-[960px]">
              {/* TODO copy */}
              <p className="mx-auto max-w-[720px] text-center text-[16px] text-muted">
                Thrive was also a brand project.
              </p>
              {brandProject ? (
                <Link
                  href="/projects/thrive"
                  className="group mx-auto mt-8 flex max-w-[560px] flex-col gap-5 border-y border-rule-soft py-12 text-center"
                >
                  <span className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                    next →
                  </span>
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-card shadow-card">
                    <Image
                      src={brandProject.gridImage}
                      alt={brandProject.name}
                      fill
                      sizes="(min-width: 768px) 560px, 100vw"
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-[1.75rem] font-bold leading-tight text-ink transition-colors group-hover:text-accent">
                      {brandProject.name}
                    </h3>
                    <span className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                      The brand case study
                    </span>
                  </div>
                </Link>
              ) : null}
              <div className="flex justify-center py-12">
                <Link
                  href="/#work"
                  className="font-caption text-[12px] font-medium uppercase tracking-[1px] text-muted transition-colors hover:text-ink"
                >
                  ← back to portfolio
                </Link>
              </div>
            </section>
          </FadeIn>

          <CtaFooter />
        </main>
      </div>
    </>
  );
}

function CaseSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <FadeIn>
      <section className="mx-auto w-full max-w-[960px] pt-16 md:pt-20">
        <SectionHeading className="!max-w-none">
          <span className="text-muted">{number}</span>
          {title}
        </SectionHeading>
        <div className="mt-8 flex flex-col gap-0">{children}</div>
      </section>
    </FadeIn>
  );
}

function Copy({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto mb-6 w-full max-w-[720px] text-[18px] leading-[1.75] text-body">
      {children}
    </p>
  );
}

function MetaBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h6 className="text-[10px] font-semibold uppercase leading-none tracking-[1px] text-ink/35">
        {label}
      </h6>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ScopeTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full border border-rule-soft px-3 py-1 font-caption text-[11px] font-medium uppercase tracking-[1px] text-ink"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
