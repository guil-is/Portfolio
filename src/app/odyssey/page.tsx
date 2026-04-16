import Image from "next/image";
import {
  Users,
  Zap,
  Video,
  Hammer,
  LayoutGrid,
  Compass,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CtaButton } from "@/components/CtaButton";
import { CenterFocus } from "@/components/CenterFocus";
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
            images={clawbankImages}
            stat="$150K → $800K"
            statLabel="Market cap in 13 days · +433% · #5 trending on DexScreener"
            quote="We wouldn't have launched if it weren't for you."
            relevance="Same mechanism Odyssey needs: design legitimacy unlocks trust, trust unlocks momentum."
          />

          <CaseStudy
            sectionLabel="Recent work · 02"
            meta="Full Rebrand · Web3 funding & intelligence platform"
            title="Thrive"
            problem="Make a VC-facing crypto platform feel credible to an audience conditioned to expect scams. Complex product, stigmatized category, small team."
            images={thriveImages}
            relevance="Same core challenge: take something the mainstream doesn't fully trust yet, and design it into something they do."
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

        <p className="mt-10 max-w-[640px] text-[1.05rem] leading-[1.75rem] text-ink md:text-[1.15rem]">
          You&rsquo;re not looking for an agency or a full-time hire. You need
          an embedded design partner who can work on-demand with Nick and
          Chris: someone fast enough to keep up with a product roadmap
          that&rsquo;s moving, and strategic enough to shape new surfaces, not
          just execute on them. The risk assessment tool, the prep courses,
          the educational hub. These aren&rsquo;t maintenance tasks.
          They&rsquo;re positioning decisions. That&rsquo;s where I work best.
        </p>
      </div>

      {/* Scroll hint */}
      <div className="flex flex-col items-center gap-3 pb-10 text-muted">
        <span className="font-caption text-[10px] font-medium uppercase tracking-[2px]">
          Scroll
        </span>
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
  problem: string;
  images: string[];
  stat?: string;
  statLabel?: string;
  quote?: string;
  relevance: string;
};

function CaseStudy({
  sectionLabel,
  meta,
  title,
  problem,
  images,
  stat,
  statLabel,
  quote,
  relevance,
}: CaseStudyProps) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>{sectionLabel}</SectionLabel>
      <CenterFocus minOpacity={0} falloff={0.8} minScale={0.98}>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1fr] md:items-center md:gap-16 lg:gap-20">
          {/* Left — images */}
          <CaseStudyGallery images={images} alt={title} />

          {/* Right — info */}
          <div className="flex flex-col gap-7">
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              {meta}
            </p>
            <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
              {title}
            </h2>
            <p className="text-[1rem] leading-[1.7rem] text-ink">{problem}</p>

            {stat ? (
              <div className="mt-2">
                <p className="font-display text-[2rem] font-bold leading-none text-ink md:text-[2.5rem]">
                  {stat}
                </p>
                {statLabel ? (
                  <p className="mt-3 text-[0.9rem] leading-[1.5rem] text-muted">
                    {statLabel}
                  </p>
                ) : null}
              </div>
            ) : null}

            {quote ? (
              <blockquote className="border-l-2 border-accent pl-5">
                <p className="font-display text-[1.15rem] italic leading-[1.5] text-ink">
                  &ldquo;{quote}&rdquo;
                </p>
                <footer className="mt-3 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                  {title} founder
                </footer>
              </blockquote>
            ) : null}

            <div className="mt-2 border-t border-rule-soft pt-6">
              <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                Why it matters for Odyssey
              </p>
              <p className="mt-3 text-[1rem] leading-[1.7rem] text-ink">
                {relevance}
              </p>
            </div>
          </div>
        </div>
      </CenterFocus>
    </section>
  );
}

// ---------------------------------------------------------------------
// CaseStudyGallery — compact horizontal scroll-snap gallery inside the
// left column of a case study. Shows one image at a time, user swipes
// to see more. Falls back to a dashed placeholder when no images.
// ---------------------------------------------------------------------
function CaseStudyGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[16px] border border-dashed border-rule bg-card/30">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {alt} images coming
        </p>
      </div>
    );
  }

  return (
    <div className="scroll-row flex w-full snap-x snap-mandatory gap-3 overflow-x-auto rounded-[16px]">
      {images.map((src, i) => (
        <div
          key={src}
          className="relative aspect-[4/3] w-full shrink-0 snap-start overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]"
        >
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
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
    number: "01",
    icon: "users",
    title: "Shared ownership",
    body: "Whether I work independently or integrate with your team, everyone comes along.",
  },
  {
    number: "02",
    icon: "zap",
    title: "I work fast",
    body: "Quick iteration allows us to zoom through explorations until something feels right.",
  },
  {
    number: "03",
    icon: "video",
    title: "Show and tell",
    body: "I frequently share work in progress via screen recordings with voice over.",
  },
  {
    number: "04",
    icon: "hammer",
    title: "Bias for action",
    body: "I prefer tangible artifacts over lengthy documents that go ignored.",
  },
  {
    number: "05",
    icon: "grid",
    title: "I work in systems",
    body: "I create reusable components whether it's a feature or a design system.",
  },
  {
    number: "06",
    icon: "compass",
    title: "Design is thinking",
    body: "I explore divergent solutions. The more the merrier.",
  },
];

function HowIWork() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Approach</SectionLabel>
      <CenterFocus minOpacity={0.25} falloff={0.6} minScale={0.99}>
        <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
          How I work
        </h2>
      </CenterFocus>

      <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-4 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
                  <span className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                    {item.number}
                  </span>
                </div>
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
    body: [
      "For teams that want to move carefully, establish a working rhythm, and see the collaboration in action before committing to bigger product work.",
      "In practice: site iterations, campaign and content assets, design QA on new features, fast turnaround on requests. Embedded design thinking from day one, scoped to what's most immediately useful.",
    ],
    response: "Response time: 48 hours",
    recommended: false,
  },
  {
    label: "Start building",
    price: "$8,800",
    cadence: "~20 hrs/week",
    body: [
      "For teams that are ready to move on new product surfaces now. The risk assessment tool, prep courses, and educational hub all need design thinking from the start, not squeezed into spare hours.",
      "In practice: everything above, plus dedicated design on new product initiatives, brand system ownership, and a weekly live sync with Nick and Chris.",
    ],
    response: "Response time: 24 hours",
    recommended: true,
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
                className={`relative flex flex-col gap-8 rounded-[16px] border p-8 ${
                  tier.recommended
                    ? "border-ink bg-card/30"
                    : "border-rule bg-transparent"
                }`}
              >
                {tier.recommended ? (
                  <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-ink px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-bg">
                    Recommended
                  </span>
                ) : null}

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

                <div className="flex flex-col gap-4 border-t border-rule-soft pt-6">
                  {tier.body.map((para, i) => (
                    <p
                      key={i}
                      className="text-[0.95rem] leading-[1.6rem] text-ink"
                    >
                      {para}
                    </p>
                  ))}
                </div>

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

          <p className="mt-20 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            guil.is
          </p>
        </CenterFocus>
      </div>
    </section>
  );
}
