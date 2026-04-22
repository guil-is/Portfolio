import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Users,
  Zap,
  Video,
  Hammer,
  LayoutGrid,
  Compass,
  ChevronDown,
  ArrowUpRight,
  Play,
  type LucideIcon,
} from "lucide-react";
import { PasswordGate } from "@/components/PasswordGate";
import { SiteNav } from "@/components/SiteNav";
import { CtaButton } from "@/components/CtaButton";
import { CenterFocus } from "@/components/CenterFocus";
import { CaseStudyHorizontalScroll } from "@/components/CaseStudyHorizontalScroll";
import { VisitTracker } from "@/components/VisitTracker";
import { getGalleryImages } from "@/lib/gallery";
import {
  getAllProposalSlugs,
  getProposal,
} from "@/content/proposals";
import type {
  Body,
  CaseStudyData,
  Proposal,
  Tier,
} from "@/content/proposals/types";

// ---------------------------------------------------------------------
// Unified text styles — keep to these 4, nothing else, so the page
// reads calmly. If you need emphasis, change content — not style.
//
//   H1    font-display text-[3rem] md:text-[4rem] font-bold leading-[1.05]
//   H2    font-display text-[2rem] md:text-[2.75rem] font-bold leading-tight
//   Label font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted
//   Body  text-[1rem] leading-[1.7rem] text-ink
// ---------------------------------------------------------------------
//
// Layout: continuous-scroll pitch deck. Header is always visible at
// the top. Each subsequent section is wrapped in <CenterFocus> so it
// fades/scales based on distance from the viewport center — smooth,
// real-time crossfades between sections instead of hard slide breaks.

// Next.js 16: route params arrive as a Promise.
type RouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllProposalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RouteProps) {
  const { slug } = await params;
  const proposal = getProposal(slug);
  if (!proposal) return {};
  return {
    title: proposal.metadata?.title ?? `${proposal.clientName} | Guil Maueler`,
    description: proposal.metadata?.description ?? "Private proposal page",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
  };
}

export default async function ProposalPage({ params }: RouteProps) {
  const { slug } = await params;
  const proposal = getProposal(slug);
  if (!proposal) notFound();

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <SiteNav />
      </div>

      <PasswordGate password={proposal.password} storageKey={`for-${proposal.slug}-unlocked`}>
        <VisitTracker slug={proposal.slug} />
        <main className="page-fade-in pb-40">
          <Header proposal={proposal} />

          {proposal.caseStudies.map((cs) => (
            <CaseStudy
              key={cs.title}
              data={cs}
              clientName={proposal.clientName}
            />
          ))}

          <HowIWork />
          <Engagement data={proposal.engagement} />
          <NextStep data={proposal.nextStep} />
        </main>
      </PasswordGate>
    </>
  );
}

// ---------------------------------------------------------------------
// Header — fills 90vh, content vertically centered.
// ---------------------------------------------------------------------
function Header({ proposal }: { proposal: Proposal }) {
  const eyebrow = proposal.hero.eyebrow ?? "A proposal from Guil Maueler";
  return (
    <section className="relative flex min-h-[90vh] flex-col px-6 md:px-10">
      {/* Top meta line */}
      <div className="mx-auto mt-10 flex w-full max-w-[960px] flex-wrap items-center justify-between gap-3 border-b border-rule pb-3 md:mt-12">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {proposal.preparedFor}
        </p>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {proposal.date}
        </p>
      </div>

      {/* Centered hero content */}
      <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col justify-center py-16">
        <p className="mb-4 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted md:mb-6">
          {eyebrow}
        </p>
        <h1 className="intro-rise mt-16 font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:mt-24 md:text-[4rem]">
          {proposal.hero.title}
        </h1>

        <p className="mt-10 max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
          {proposal.hero.blurb}
        </p>

        {proposal.hero.loomUrl ? (
          <div className="mt-10">
            <CtaButton
              href={proposal.hero.loomUrl}
              label={proposal.hero.loomLabel ?? "Watch the walkthrough"}
              icon={Play}
            />
          </div>
        ) : null}
      </div>

      {/* Scroll hint */}
      <div className="flex justify-center pb-10 text-muted">
        <ChevronDown
          className="scroll-hint h-5 w-5"
          strokeWidth={1.25}
          aria-hidden
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// SectionLabel — soft top divider + small all-caps caption.
// ---------------------------------------------------------------------
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mb-12 w-full max-w-[1120px] border-t border-rule-soft pt-5 md:mb-16">
      <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
        {children}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------
// Case study — desktop scroll-hijack + mobile stacked.
// ---------------------------------------------------------------------
function CaseStudy({
  data,
  clientName,
}: {
  data: CaseStudyData;
  clientName: string;
}) {
  const images = getGalleryImages(data.galleryFolder);
  const info = (
    <CaseStudyInfo data={data} clientName={clientName} />
  );

  return (
    <>
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-10">
        <SectionLabel>{data.sectionLabel}</SectionLabel>
      </div>

      {/* Mobile: stacked info, then native horizontal scroll-snap gallery */}
      <section className="px-6 pb-16 md:hidden">
        {info}
        <div className="-mx-6 mt-12">
          <MobileGallery
            images={images}
            alt={data.title}
            mediaLinks={data.mediaLinks}
          />
        </div>
      </section>

      {/* Desktop: scroll-hijacked horizontal track */}
      <CaseStudyHorizontalScroll
        info={info}
        images={images}
        alt={data.title}
        mediaLinks={data.mediaLinks}
      />
    </>
  );
}

function Paragraphs({ body }: { body: Body }) {
  const paras = Array.isArray(body) ? body : [body];
  return (
    <div className="flex flex-col gap-4">
      {paras.map((p, i) => (
        <p key={i} className="text-[1rem] leading-[1.7rem] text-ink">
          {p}
        </p>
      ))}
    </div>
  );
}

function LabeledBlock({
  label,
  body,
  withDivider = false,
}: {
  label: string;
  body: Body;
  withDivider?: boolean;
}) {
  return (
    <div
      className={
        withDivider ? "mt-2 border-t border-rule-soft pt-6" : undefined
      }
    >
      <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      <div className="mt-3">
        <Paragraphs body={body} />
      </div>
    </div>
  );
}

function CaseStudyInfo({
  data,
  clientName,
}: {
  data: CaseStudyData;
  clientName: string;
}) {
  return (
    <div className="flex flex-col gap-7">
      <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {data.meta}
      </p>
      <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
        {data.url ? (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 transition-colors hover:text-muted"
          >
            {data.title}
            <ArrowUpRight className="h-6 w-6 md:h-7 md:w-7" strokeWidth={2} />
          </a>
        ) : (
          data.title
        )}
      </h2>
      <Paragraphs body={data.problem} />

      {data.whatIShipped ? (
        <LabeledBlock
          label="What I shipped"
          body={data.whatIShipped}
          withDivider
        />
      ) : null}

      {data.whatIDid ? (
        <LabeledBlock label="What I did" body={data.whatIDid} />
      ) : null}

      {data.whatChanged ? (
        <LabeledBlock label="What changed" body={data.whatChanged} />
      ) : null}

      {data.stat ? (
        <div>
          <p className="font-display text-[1.25rem] font-bold leading-tight text-ink md:text-[1.5rem]">
            {data.stat}
          </p>
          {data.statLabel ? (
            <p className="mt-2 text-[0.85rem] leading-[1.4rem] text-muted">
              {data.statLabel}
            </p>
          ) : null}
        </div>
      ) : null}

      <LabeledBlock
        label={`Why it matters for ${clientName}`}
        body={data.relevance}
        withDivider
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// MobileGallery — mobile-only scroll-snap gallery.
// ---------------------------------------------------------------------
function MobileGallery({
  images,
  alt,
  mediaLinks,
}: {
  images: string[];
  alt: string;
  mediaLinks?: Record<string, string>;
}) {
  if (images.length === 0) {
    return (
      <div className="px-6">
        <div className="flex aspect-[16/9] w-full items-center justify-center rounded-[16px] border border-dashed border-rule bg-card/30">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {alt} images coming
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-row flex snap-x snap-mandatory overflow-x-auto pb-2">
      {images.map((src, i) => {
        const basename = src.split("/").pop() ?? src;
        const href = mediaLinks?.[basename];
        const frameClass =
          "relative aspect-[16/9] block w-full overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433] dark:shadow-none";
        const inner = /\.(mp4|webm|mov)$/i.test(src) ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
            aria-label={`${alt} ${i + 1}`}
          />
        ) : (
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            sizes="100vw"
            className="object-cover"
          />
        );
        return (
          <div key={src} className="w-screen shrink-0 snap-center px-4">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={frameClass}
              >
                {inner}
              </a>
            ) : (
              <div className={frameClass}>{inner}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// How I work — static across all proposals.
// ---------------------------------------------------------------------
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  zap: Zap,
  video: Video,
  hammer: Hammer,
  grid: LayoutGrid,
  compass: Compass,
};

const howItems = [
  {
    icon: "users",
    title: "Shared ownership",
    body: "Whether I work independently or integrate with your team, everyone comes along.",
  },
  {
    icon: "zap",
    title: "I work fast",
    body: "Quick iteration allows us to zoom through explorations until something feels right.",
  },
  {
    icon: "video",
    title: "Show and tell",
    body: "I frequently share work in progress via screen recordings with voice over.",
  },
  {
    icon: "hammer",
    title: "Bias for action",
    body: "I prefer tangible artifacts over lengthy documents that go ignored.",
  },
  {
    icon: "grid",
    title: "I work in systems",
    body: "I create reusable components whether it's a feature or a design system.",
  },
  {
    icon: "compass",
    title: "Design is thinking",
    body: "I explore divergent solutions. The more the merrier.",
  },
];

function HowIWork() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pb-20 md:px-10 md:pb-28">
      <SectionLabel>My approach</SectionLabel>

      <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
        {howItems.map((item) => {
          const Icon = iconMap[item.icon] ?? Compass;
          return (
            <CenterFocus
              key={item.title}
              minOpacity={0.2}
              falloff={0.5}
              minScale={0.97}
            >
              <div className="flex flex-col gap-3 py-8">
                <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
                <h6 className="font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink">
                  {item.title}
                </h6>
                <p className="text-[0.95rem] leading-[1.6rem] text-ink">
                  {item.body}
                </p>
              </div>
            </CenterFocus>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Engagement — proposal-specific tier cards.
// ---------------------------------------------------------------------
function Engagement({ data }: { data: Proposal["engagement"] }) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Engagement</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus
          minOpacity={0.15}
          falloff={0.55}
          minScale={0.99}
          disableBelowMd
        >
          <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
            {data.heading}
          </h2>
          <p className="mt-5 max-w-[620px] text-[0.9rem] leading-[1.5rem] text-muted">
            {data.subheading}
          </p>
        </CenterFocus>

        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2">
          {data.tiers.map((tier) => (
            <CenterFocus
              key={tier.label}
              minOpacity={0.15}
              falloff={0.5}
              minScale={0.98}
              disableBelowMd
            >
              <TierCard tier={tier} />
            </CenterFocus>
          ))}
        </div>

        <CenterFocus
          minOpacity={0.15}
          falloff={0.55}
          minScale={0.99}
          disableBelowMd
        >
          <p className="mt-10 max-w-[620px] text-[0.9rem] leading-[1.5rem] text-muted">
            {data.footnote}
          </p>
        </CenterFocus>
      </div>
    </section>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div className="flex flex-col gap-8 rounded-[16px] border border-rule bg-transparent p-8">
      <div>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {tier.label}
        </p>
        <p className="mt-4 font-display text-[2rem] font-bold leading-none text-ink md:text-[2.5rem]">
          {tier.price}
          <span className="font-caption text-[13px] font-medium uppercase tracking-[1.5px] text-muted">
            {" "}
            / month
          </span>
        </p>
        <p className="mt-3 text-[0.9rem] leading-[1.5rem] text-muted">
          {tier.cadence}
        </p>
        {tier.priceNote ? (
          <p className="mt-2 text-[0.85rem] leading-[1.4rem] text-muted">
            {tier.priceNote}
          </p>
        ) : null}
      </div>

      <p className="border-t border-rule-soft pt-6 text-[0.95rem] leading-[1.6rem] text-ink">
        {tier.body}
      </p>

      <p className="mt-auto font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {tier.response}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------
// Next step — proposal-specific closer.
// ---------------------------------------------------------------------
function NextStep({ data }: { data: Proposal["nextStep"] }) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Next step</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus minOpacity={0.15} falloff={0.55} minScale={0.99}>
          <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
            {data.heading}
          </h2>
          <p className="mt-6 max-w-[620px] text-[1rem] leading-[1.7rem] text-ink">
            {data.body}
          </p>
        </CenterFocus>

        <CenterFocus minOpacity={0.15} falloff={0.5} minScale={0.98}>
          <div className="mt-10">
            <CtaButton href={data.ctaHref} label={data.ctaLabel} />
          </div>
        </CenterFocus>

        <CenterFocus minOpacity={0.15} falloff={0.5} minScale={0.99}>
          <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-rule-soft pt-10">
            <a
              href="https://guil.is"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink transition-colors hover:text-muted"
            >
              <ArrowUpRight
                className="h-4 w-4 transition-transform group-hover:-rotate-45"
                strokeWidth={1.75}
              />
              See my full portfolio
            </a>
          </div>

          <p className="mt-20 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            guil.is
          </p>
        </CenterFocus>
      </div>
    </section>
  );
}
