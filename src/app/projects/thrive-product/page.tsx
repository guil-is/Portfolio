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

export const metadata: Metadata = {
  title: `Thrive — Product Design | ${site.name}`,
  description:
    "Product design for Thrive, a capital allocation platform. Structured intake, verification flows, and a decision layer that turns dense on-chain and off-chain data into decisions non-experts can act on.",
  // Unlisted for now — remove when the page goes into the work index.
  robots: { index: false, follow: false },
  openGraph: {
    title: `Thrive — Product Design | ${site.name}`,
    description:
      "Product design for a capital allocation platform. Design Lead, Aug 2025 to Feb 2026.",
    type: "article",
    // OG image slot — drop og.png (1200x630 or 1920x1080) into
    // /public/projects/thrive-product/ and it's picked up on deploy.
    images: [{ url: "/projects/thrive-product/og.png" }],
  },
};

const brandProject = pastProjects.find((p) => p.slug === "thrive");

export default function ThriveProductPage() {
  return (
    <>
      <ProjectSideTitle title="Thrive" client="Product Design" />

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
              <span className="truncate font-bold text-ink">Thrive</span>
            </div>
          }
        />

        <main className="px-6 md:px-10">
          {/* Header: title, subtitle, meta row */}
          <FadeIn>
            <section className="mx-auto w-full max-w-[960px] pt-14 md:pt-20">
              <h1 className="font-display text-[3rem] font-bold leading-none text-ink md:text-[4.5rem]">
                Thrive
              </h1>
              <p className="mt-6 max-w-[720px] font-display text-[1.5rem] font-bold leading-[1.3] text-ink md:text-[2rem] md:leading-[1.25]">
                Product design for a capital allocation platform.
              </p>
            </section>
          </FadeIn>

          <FadeIn>
            <section className="mx-auto mt-10 w-full max-w-[960px] border-y border-rule-soft py-2 md:mt-14">
              <div className="grid grid-cols-1 md:grid-cols-3 md:gap-8">
                <MetaRow label="Role">Design Lead</MetaRow>
                <MetaRow label="Period">Aug 2025 to Feb 2026</MetaRow>
                <MetaRow label="Scope">
                  Product design, information architecture, design systems,
                  verification flows
                </MetaRow>
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
              I owned product and brand design end to end. This page covers the
              product work. The{" "}
              <Link href="/projects/thrive" className="text-accent underline underline-offset-4 hover:opacity-70">
                brand case study
              </Link>{" "}
              covers the rest.
            </Copy>
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
                  "01-context-platform.png",
                  "The Verification Terminal: a project summary in deal flow with score, coverage and confidence",
                ),
              ]}
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
            <CaseFigure
              items={[
                img(
                  "02-problem-onchain-data.png",
                  "Dense on-chain metrics as they arrive",
                ),
                img(
                  "02-problem-offchain-claims.png",
                  "Off-chain claims submitted by a project",
                ),
              ]}
            />
          </CaseSection>

          {/* 3. Structured intake */}
          <CaseSection number="03" title="Structured intake">
            {/* TODO copy */}
            <Copy>
              Scoring only works if evidence arrives in a shape we can score.
              Projects submit against three signal categories: Product
              execution, On-chain transactions, and Team credibility. I mapped
              the flows before drawing screens, so every question the form
              asks earns its place.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "03-intake-research.png",
                  "A Guardian research task for a missing signal, with step by step instructions",
                ),
              ]}
            />
            <CaseFigure
              items={[
                img(
                  "03-intake-categories.png",
                  "The three signal categories a submission maps to",
                ),
              ]}
            />
          </CaseSection>

          {/* 4. Missing data — the section that matters most, given room */}
          <CaseSection number="04" title="Missing data">
            {/* TODO copy */}
            <Copy>
              A submission is rarely complete on the first pass. The platform
              tells a project exactly what is missing and how to fix it,
              without a human sending emails.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "04-missing-data-overview.png",
                  "The Verification Hub: verification progress and the biggest confidence boosts available",
                ),
              ]}
            />
            {/* TODO copy */}
            <Copy>
              I designed the flows for adding team members, linking smart
              contracts, and connecting a GitHub repository. Each one turns a
              vague rejection into a concrete next step the project can
              complete on its own.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "04-missing-data-team.png",
                  "Flow for adding a team member",
                ),
                img(
                  "04-missing-data-contracts.png",
                  "Flow for linking a smart contract",
                ),
                img(
                  "04-missing-data-github.png",
                  "Flow for connecting a GitHub repository",
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
            />
          </CaseSection>

          {/* 5. Verification and scoring */}
          <CaseSection number="05" title="Verification and scoring">
            {/* TODO copy */}
            <Copy>
              Guardians are the human reviewers. They verify each submission
              against a rubric. Every signal has a 1 to 5 scale with a
              readable label, instructions for the reviewer, and the data
              required to back a score. The rubric and the interface were
              designed together, so what reviewers see matches what they are
              asked to judge.
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
                  "05-rubric-example.png",
                  "Rubric for one signal with its 1 to 5 scale",
                ),
                img(
                  "05-rubric-ui.png",
                  "The scoring interface the rubric produced",
                ),
              ]}
              caption="One rubric, side by side with the UI it produced."
            />
          </CaseSection>

          {/* 6. The decision layer */}
          <CaseSection number="06" title="The decision layer">
            {/* TODO copy */}
            <Copy>
              This is where an investor or reviewer makes a call. Guardian
              Reviews collects verified projects into a shortlist. Approve and
              reject confirmations spell out what happens next. The Powerlist
              project detail holds the dense data behind one clear next
              action.
            </Copy>
            <CaseFigure
              items={[
                img("06-decision-reviews.png", "The Guardian Reviews shortlist"),
              ]}
            />
            <CaseFigure
              items={[
                img("06-decision-approve.png", "Approve confirmation dialog"),
                img("06-decision-reject.png", "Reject confirmation dialog"),
              ]}
            />
            <CaseFigure
              items={[
                img(
                  "06-decision-powerlist.png",
                  "The Powerlist: validated projects ranked by score with badges and 7 day movement",
                ),
              ]}
            />
          </CaseSection>

          {/* 7. Systems work */}
          <CaseSection number="07" title="Systems work">
            {/* TODO copy */}
            <Copy>
              I restructured the app&apos;s information architecture and
              contributed to the design system, including button and state
              components. This kept the new flows consistent with the rest of
              the product.
            </Copy>
            <CaseFigure
              items={[
                img(
                  "07-systems-components.png",
                  "Button components across variants, sizes and states",
                ),
              ]}
            />
            <CaseFigure
              items={[
                img(
                  "07-systems-typography.png",
                  "The typography scale for desktop and mobile",
                ),
              ]}
            />
          </CaseSection>

          {/* 8. Shipping */}
          <CaseSection number="08" title="Shipping">
            {/* TODO copy */}
            <Copy>
              I shipped production interfaces directly with Lovable. That cut
              the design to build loop from weeks to days. Decisions were
              tested in the real product, not in mockups.
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

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-start gap-4 border-b border-rule-soft py-4 last:border-b-0 md:block md:border-b-0 md:py-4">
      <h6 className="text-[10px] font-semibold uppercase leading-[22px] tracking-[1px] text-ink/35">
        {label}
      </h6>
      <div className="min-w-0 font-display text-[1rem] text-ink md:mt-1">
        {children}
      </div>
    </div>
  );
}
