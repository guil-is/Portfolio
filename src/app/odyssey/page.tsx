import Image from "next/image";
import {
  Users,
  Zap,
  Video,
  Hammer,
  LayoutGrid,
  Compass,
  ChevronDown,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CtaButton } from "@/components/CtaButton";
import { CenterFocus } from "@/components/CenterFocus";
import { CaseStudyHorizontalScroll } from "@/components/CaseStudyHorizontalScroll";
import { ShareButton } from "@/components/ShareButton";
import { getGalleryImages } from "@/lib/gallery";

const PASSWORD = "psilocybin";

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

export default function OdysseyPage() {
  const clawbankImages = getGalleryImages("odyssey/clawbank");
  const thriveImages = getGalleryImages("odyssey/thrive");

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <PasswordGate password={PASSWORD}>
        <main className="page-fade-in pb-40">
          <Header />

          <CaseStudy
            sectionLabel="Recent work · 01"
            meta="Fractional Design Partner · 10 hrs/week · Pre-launch"
            title="Clawbank"
            problem="A technically real product with no visual credibility. In crypto, perception precedes traction, they needed to look fundable before they could become fundable."
            whatIShipped="Full brand identity from scratch: mark, typography, color, and motion language. Landing page built to serve developers and investors simultaneously, zero to live in under two weeks. Design tokens into production CSS, structured for a team to scale from. Visual direction for product content: demo framing and video structure."
            images={clawbankImages}
            stat="$150K → $800K"
            statLabel="Market cap in 13 days · +433% · #5 trending on DexScreener"
            relevance="Same mechanism Odyssey needs: design legitimacy unlocks trust, trust unlocks momentum."
          />

          <CaseStudy
            sectionLabel="Recent work · 02"
            meta="Lead Designer · Brand, Design System & Product UI · 2025–2026"
            title="Thrive"
            problem="Strong idea, weak articulation. The brand leaned on buzzwords that meant nothing to outsiders, and inside the product, different modules felt like separate tools that happened to share a codebase."
            whatIDid={`Built a Brand Canvas from scratch, repositioned Thrive as "crypto's value layer," and pushed visual direction away from default crypto aesthetics. On the product side: audited and standardised UI across all key flows, overhauled the core product areas, and established a shared design system as a source of truth.`}
            whatChanged={`The team stopped asking "what are we building?" and started asking "how do we scale this?" The product started to feel like one system. New features could be built faster, with less rework.`}
            images={thriveImages}
            relevance="Brand and product simultaneously — which is exactly what Odyssey's next phase requires. New surfaces like the risk assessment tool and educational hub aren't just build tasks. They're positioning decisions."
          />

          <HowIWork />
          <Engagement />
          <NextStep />
        </main>
      </PasswordGate>
    </>
  );
}

// ---------------------------------------------------------------------
// Header — fills 90vh, content vertically centered, no scroll-linked
// fade (always visible on load). Subtle bouncing chevron at the bottom
// hints at the scroll-driven content below.
// ---------------------------------------------------------------------
function Header() {
  return (
    <section className="relative flex min-h-[90vh] flex-col px-6 md:px-10">
      {/* Top meta line */}
      <div className="mx-auto mt-10 flex w-full max-w-[960px] flex-wrap items-center justify-between gap-3 border-b border-rule pb-5 md:mt-12">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          Prepared for Nick DeNuzzo & Chris · Odyssey
        </p>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          April 2026
        </p>
      </div>

      {/* Centered hero content */}
      <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col justify-center py-16">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          A proposal from Guil Maueler
        </p>
        <h1 className="intro-rise mt-5 font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
          Design partner for Odyssey
        </h1>

        <p className="mt-10 max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
          You&rsquo;re not looking for an agency or a full-time hire. You need
          an embedded design partner who can work on-demand with Nick and
          Chris: someone fast enough to keep up with a product roadmap
          that&rsquo;s moving, and strategic enough to shape new surfaces, not
          just execute on them.
        </p>
        <p className="mt-5 max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
          The risk assessment tool, the prep courses, the educational hub.
          These aren&rsquo;t maintenance tasks. They&rsquo;re positioning
          decisions. That&rsquo;s where I work best.
        </p>
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
// SectionLabel — soft top divider + small all-caps caption, mirrors the
// homepage's SectionHeading pattern. Sits at the top of each major
// section to create rhythm and orientation.
// ---------------------------------------------------------------------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-12 w-full max-w-[1120px] border-t border-rule-soft pt-5 md:mb-16">
      <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
        {children}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------
// Case study — 2-column layout. Images left, info right.
// ---------------------------------------------------------------------
type CaseStudyProps = {
  sectionLabel: string;
  meta: string;
  title: string;
  problem: Body;
  whatIShipped?: Body;
  whatIDid?: Body;
  whatChanged?: Body;
  images: string[];
  stat?: string;
  statLabel?: string;
  relevance: Body;
};

function CaseStudy({
  sectionLabel,
  meta,
  title,
  problem,
  whatIShipped,
  whatIDid,
  whatChanged,
  images,
  stat,
  statLabel,
  relevance,
}: CaseStudyProps) {
  const info = (
    <CaseStudyInfo
      meta={meta}
      title={title}
      problem={problem}
      whatIShipped={whatIShipped}
      whatIDid={whatIDid}
      whatChanged={whatChanged}
      stat={stat}
      statLabel={statLabel}
      relevance={relevance}
    />
  );

  return (
    <>
      {/* Section label scrolls normally above the locked scroll section */}
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-10">
        <SectionLabel>{sectionLabel}</SectionLabel>
      </div>

      {/* Mobile: stacked info, then native horizontal scroll-snap gallery */}
      <section className="px-6 pb-16 md:hidden">
        {info}
        <div className="-mx-6 mt-12">
          <MobileGallery images={images} alt={title} />
        </div>
      </section>

      {/* Desktop: scroll-hijacked horizontal track. Info is the first
          (half-width) slide; images follow full-width. */}
      <CaseStudyHorizontalScroll info={info} images={images} alt={title} />
    </>
  );
}

// ---------------------------------------------------------------------
// CaseStudyInfo — shared content of the first (half-width) desktop
// slide and the top of the mobile stacked layout.
//
// Body-text fields accept string | string[]. Passing an array renders
// each element as its own paragraph with a small gap, for copy that
// benefits from paragraph breaks.
// ---------------------------------------------------------------------
type Body = string | string[];

type InfoProps = {
  meta: string;
  title: string;
  problem: Body;
  whatIShipped?: Body;
  whatIDid?: Body;
  whatChanged?: Body;
  stat?: string;
  statLabel?: string;
  relevance: Body;
};

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
  meta,
  title,
  problem,
  whatIShipped,
  whatIDid,
  whatChanged,
  stat,
  statLabel,
  relevance,
}: InfoProps) {
  return (
    <div className="flex flex-col gap-7">
      <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {meta}
      </p>
      <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
        {title}
      </h2>
      <Paragraphs body={problem} />

      {whatIShipped ? (
        <LabeledBlock label="What I shipped" body={whatIShipped} withDivider />
      ) : null}

      {whatIDid ? (
        <LabeledBlock label="What I did" body={whatIDid} />
      ) : null}

      {whatChanged ? (
        <LabeledBlock label="What changed" body={whatChanged} />
      ) : null}

      {stat ? (
        <div>
          <p className="font-display text-[1.25rem] font-bold leading-tight text-ink md:text-[1.5rem]">
            {stat}
          </p>
          {statLabel ? (
            <p className="mt-2 text-[0.85rem] leading-[1.4rem] text-muted">
              {statLabel}
            </p>
          ) : null}
        </div>
      ) : null}

      <LabeledBlock
        label="Why it matters for Odyssey"
        body={relevance}
        withDivider
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// MobileGallery — native horizontal scroll-snap gallery used under the
// stacked info block on narrow viewports (desktop uses the
// scroll-hijacked track instead).
// ---------------------------------------------------------------------
function MobileGallery({ images, alt }: { images: string[]; alt: string }) {
  if (images.length === 0) {
    return (
      <div className="px-6">
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[16px] border border-dashed border-rule bg-card/30">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {alt} images coming
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-row flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2">
      {images.map((src, i) => (
        <div
          key={src}
          className="relative aspect-[4/3] w-[85%] shrink-0 snap-start overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]"
        >
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            sizes="85vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// How I work — 6 items, homepage styling (small icon + caption label +
// body), 3-col on large screens, 2-col on md, stack on mobile. Each
// item fades independently via CenterFocus.
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
// Engagement — two starting points. Second card gets a subtle
// recommended treatment (stronger border + small pill badge).
// ---------------------------------------------------------------------
const tiers = [
  {
    label: "Start focused",
    price: "$4,800",
    cadence: "~10 hrs/week",
    body: "If you want to establish a working rhythm before moving to bigger product work. Site iterations, campaign assets, design QA, fast turnaround. You get embedded design thinking from day one, scoped to what's most immediately useful.",
    response: "Response time: 48 hours",
  },
  {
    label: "Start building",
    price: "$8,800",
    cadence: "~20 hrs/week",
    body: "If you are ready to move on new product surfaces immediately. The risk assessment tool, prep courses, and educational hub all need design thinking from the start. This scope includes dedicated design on new product initiatives and ownership of the design system as Odyssey scales.",
    response: "Response time: 24 hours",
  },
];

function Engagement() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Engagement</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus minOpacity={0} falloff={0.7} minScale={0.98}>
          <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
            Where do you want to start?
          </h2>
          <p className="mt-5 max-w-[620px] text-[0.9rem] leading-[1.5rem] text-muted">
            Two starting points depending on where Odyssey is right now. Both
            are month-to-month and can flex after the first month.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.label}
                className="flex flex-col gap-8 rounded-[16px] border border-rule bg-transparent p-8"
              >
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
                </div>

                <p className="border-t border-rule-soft pt-6 text-[0.95rem] leading-[1.6rem] text-ink">
                  {tier.body}
                </p>

                <p className="mt-auto font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                  {tier.response}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 max-w-[620px] text-[0.9rem] leading-[1.5rem] text-muted">
            Both options are month-to-month. Scope is reviewed after the first
            month and adjusted if needed. If you&rsquo;re unsure which fits,
            the first conversation will make it clear.
          </p>
        </CenterFocus>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Next step
// ---------------------------------------------------------------------
function NextStep() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Next step</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus minOpacity={0} falloff={0.7} minScale={0.98}>
          <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
            Ready to move?
          </h2>
          <p className="mt-6 max-w-[620px] text-[1rem] leading-[1.7rem] text-ink">
            Next step is a 30-minute call. I&rsquo;ll come with specific
            directions for the educational hub and the risk assessment UI,
            concrete, not vague. We agree on scope and I can be live within a
            week.
          </p>

          <div className="mt-10">
            <CtaButton href="mailto:guil@guil.is" label="Get in touch" />
          </div>

          {/* Secondary actions: share this proposal + link to full portfolio */}
          <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-rule-soft pt-10">
            <ShareButton />
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
