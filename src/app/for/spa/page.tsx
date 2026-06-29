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
  type LucideIcon,
} from "lucide-react";
import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CtaButton } from "@/components/CtaButton";
import { CenterFocus } from "@/components/CenterFocus";

// ---------------------------------------------------------------------
// /for/spa — bespoke proposal for Lara Sibbing (Sustainable Public
// Affairs), WinWin 2026. Built on the same design language as the
// /for/[slug] proposal template (same text scale, SectionLabel, bullets,
// CenterFocus crossfades, CtaButton), but ordered to this brief: intro,
// approach, process, tiers, timeline, terms, relevant work, close.
//
// Password gate matches /for/huit. storageKey is unique so unlocking
// another client page never unlocks this one.
//
// Unified text styles — keep to these 4:
//   H1    font-display text-[3rem] md:text-[5rem] font-bold
//   H2    font-display text-[2rem] md:text-[2.75rem] font-bold
//   Label font-caption text-[11px] uppercase tracking-[1.5px] text-muted
//   Body  text-[1rem] leading-[1.7rem] text-ink
// ---------------------------------------------------------------------

export const metadata = {
  title: "WinWin 2026 × Guil | Private",
  description: "Private proposal page",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const PASSWORD = "competitiveness";

export default function SpaPage() {
  return (
    <>
      <div className="no-print fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <PasswordGate password={PASSWORD} storageKey="for-spa-unlocked">
        <main className="page-fade-in pb-40">
          <Header />
          <Intro />
          <HowIWork />
          <ProcessTimeline />
          <Tiers />
          <Terms />
          <RelevantWork />
          <NextStep />
        </main>
      </PasswordGate>
    </>
  );
}

// ---------------------------------------------------------------------
// Shared primitives — mirror the /for/[slug] template so the styling is
// identical across every proposal page.
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

function Paragraphs({ body }: { body: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      {body.map((p, i) => (
        <p key={i} className="text-[1rem] leading-[1.7rem] text-ink">
          {p}
        </p>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3 text-[1rem] leading-[1.7rem] text-ink">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="select-none text-muted">
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------
// Header — editorial cover, content vertically centered.
// ---------------------------------------------------------------------
function Header() {
  return (
    <section className="relative flex min-h-[90vh] flex-col px-6 md:px-10">
      <div className="mx-auto mt-10 flex w-full max-w-[960px] flex-wrap items-center justify-between gap-3 border-b border-rule pb-3 md:mt-12">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          Prepared for Lara Sibbing · Sustainable Public Affairs
        </p>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          June 2026
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-[960px] flex-1 flex-col justify-center py-16">
        <span
          aria-hidden
          className="hero-mark mb-7 block h-px w-12 bg-ink md:mb-9"
        />

        <p
          className="intro-rise font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted"
          style={{ animationDelay: "120ms" }}
        >
          Proposal · WinWin 2026
        </p>

        <h1 className="mt-5 font-display text-[3rem] font-bold leading-[1] tracking-tight text-ink md:mt-7 md:text-[5rem] lg:text-[5.75rem]">
          <span className="intro-rise block" style={{ animationDelay: "200ms" }}>
            WinWin 2026
          </span>
          <span
            className="intro-rise block font-normal text-muted"
            style={{ animationDelay: "280ms" }}
          >
            identity, invite, website
          </span>
        </h1>

        <p
          className="intro-rise mt-6 max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted md:mt-8 md:text-[1rem]"
          style={{ animationDelay: "380ms" }}
        >
          A summit in Brussels on October 29 that puts 350 to 400 CEOs, founders,
          funders, and EU policymakers in one room. The identity has to argue
          that sustainability is competitiveness, to people who need convincing.
        </p>
      </div>

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
// Intro — a formal summary of the brief, written to be forwarded to the
// team. Labeled blocks keep it skimmable.
// ---------------------------------------------------------------------
function Intro() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>The brief</SectionLabel>
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-12">
        <CenterFocus minOpacity={0.2} falloff={0.55} minScale={0.99} disableBelowMd>
          <div>
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              The event
            </p>
            <div className="mt-4">
              <Paragraphs
                body={[
                  "WinWin 2026 is a high-level summit in Brussels on October 29. It brings 350 to 400 CEOs, founders, funders, and EU policymakers into one room. The argument is direct: sustainability is competitiveness. The audience is corporates who still need convincing, not the crowd that is already sold.",
                ]}
              />
            </div>
          </div>
        </CenterFocus>

        <CenterFocus minOpacity={0.2} falloff={0.55} minScale={0.99} disableBelowMd>
          <div>
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              The work
            </p>
            <div className="mt-4">
              <Paragraphs
                body={[
                  "Three pieces, delivered in order. A visual identity and logo first. An invitation second, out before the summer break in mid-July. A website third.",
                  "The studio behind this brings 14+ years of brand and digital work, much of it for events and communities that had to land with a serious room. WinWin is exactly that.",
                ]}
              />
            </div>
          </div>
        </CenterFocus>

        <CenterFocus minOpacity={0.2} falloff={0.55} minScale={0.99} disableBelowMd>
          <div>
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              The creative tension
            </p>
            <div className="mt-4">
              <Paragraphs
                body={[
                  "Natural, modern, futuristic. Not too green. Not cheesy. Not dark. The abstract power of nature in close-up. Energy as the thread that connects nature and industry.",
                  "This identity is built to convince corporates, not to preach to the already-convinced green crowd. The visual language has to read as power and progress, not as a cause.",
                ]}
              />
            </div>
          </div>
        </CenterFocus>

        <CenterFocus minOpacity={0.2} falloff={0.55} minScale={0.99} disableBelowMd>
          <div>
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              Built to extend
            </p>
            <div className="mt-4">
              <Paragraphs
                body={[
                  "The identity also carries visibility for Sustainable Public Affairs. So it is built as a system, not a one-off. It holds up when WinWin returns next year, and when SPA puts the look to work beyond the summit.",
                ]}
              />
            </div>
          </div>
        </CenterFocus>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// How I work — six principles, plus two lines specific to this engagement.
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
    body: "Whether I run this independently or inside your team, everyone comes along.",
  },
  {
    icon: "zap",
    title: "I work fast",
    body: "Quick iteration lets us move through explorations until something feels right.",
  },
  {
    icon: "video",
    title: "Show and tell",
    body: "I share work in progress through short screen recordings with voiceover.",
  },
  {
    icon: "hammer",
    title: "Bias for action",
    body: "I prefer tangible artifacts over long documents that go unread.",
  },
  {
    icon: "grid",
    title: "I work in systems",
    body: "I build reusable parts, whether it is a logo lockup or a full design system.",
  },
  {
    icon: "compass",
    title: "Design is thinking",
    body: "I explore divergent directions before settling. The more the merrier.",
  },
];

function HowIWork() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>How I work</SectionLabel>

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

      <div className="mx-auto mt-6 w-full max-w-[960px] border-t border-rule-soft pt-8">
        <CenterFocus minOpacity={0.2} falloff={0.55} minScale={0.99} disableBelowMd>
          <Paragraphs
            body={[
              "I run an AI-augmented workflow. It lets me move fast and build the website myself, not just design it.",
              "I can plug into your team or run this independently, whichever keeps it moving.",
            ]}
          />
        </CenterFocus>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Process and timeline — merged. At-a-glance milestone strip on top,
// then the four phases in detail. Anchored to the invite deadline and
// the October 29 summit.
// ---------------------------------------------------------------------
const milestones = [
  { label: "Phase 1", title: "Discovery" },
  { label: "Phase 2", title: "Visual identity" },
  { label: "Phase 3", title: "Website and assets" },
  { label: "Phase 4", title: "Final deliverables" },
  { label: "October 29", title: "Summit" },
];

const phases = [
  {
    label: "Phase 1",
    title: "Discovery",
    body: "You fill a short questionnaire and share the mood board and any references. I use it to align on direction, audience, and tone before any design starts. No guessing at a concept upfront.",
  },
  {
    label: "Phase 2",
    title: "Visual identity",
    body: "I consolidate the inputs and develop the identity. A few distinct directions first, then we lock one and build it out: core marks, colour, type, usage, and the logo. The invitation and save-the-date come out of this phase, out the door before the summer break in mid-July, while the room is still at their desks.",
  },
  {
    label: "Phase 3",
    title: "Website and assets",
    body: "A landing page with all the event information, linking out to Ticket Tailor for reservations. Plus the key applications the event needs.",
  },
  {
    label: "Phase 4",
    title: "Final deliverables",
    body: "Brand guidelines, motion, and merch, plus anything else in scope. Added as funding lands and the event gets closer.",
  },
];

function ProcessTimeline() {
  const lineEdge = `${50 / Math.max(milestones.length, 1)}%`;

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Process and timeline</SectionLabel>

      <div className="mx-auto mb-14 w-full max-w-[960px]">
        <Paragraphs
          body={[
            "Phased delivery. Each phase ends in something concrete to sign off on.",
            "The work is anchored to two dates: the invitation out before the summer break in mid-July, and the summit on October 29. I can start next week.",
          ]}
        />
      </div>

      {/* At-a-glance strip — mobile vertical */}
      <ol className="mx-auto mb-16 flex w-full max-w-[960px] flex-col gap-8 md:hidden">
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1;
          return (
            <li key={i} className="relative pl-9">
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute left-[11px] top-[15px] bottom-[-37px] w-px bg-rule"
                />
              ) : null}
              <span
                aria-hidden
                className="absolute left-[6.5px] top-[5px] block h-[10px] w-[10px] rounded-full bg-ink"
              />
              <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                {m.label}
              </p>
              <h3 className="mt-1 font-display text-[1.15rem] font-bold leading-tight text-ink">
                {m.title}
              </h3>
            </li>
          );
        })}
      </ol>

      {/* At-a-glance strip — desktop horizontal */}
      <div className="relative mb-20 hidden md:block">
        <div
          aria-hidden
          className="absolute top-[4.5px] h-px bg-rule"
          style={{ left: lineEdge, right: lineEdge }}
        />
        <ol
          className="grid"
          style={{ gridTemplateColumns: `repeat(${milestones.length}, 1fr)` }}
        >
          {milestones.map((m, i) => (
            <li
              key={i}
              className="relative flex flex-col items-center px-3 text-center"
            >
              <span
                aria-hidden
                className="relative z-10 block h-[10px] w-[10px] rounded-full bg-ink"
              />
              <p className="mt-5 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                {m.label}
              </p>
              <p className="mt-2 font-display text-[0.95rem] font-bold leading-snug text-ink lg:text-[1rem]">
                {m.title}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* The phases in detail */}
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-10">
        {phases.map((phase) => (
          <CenterFocus
            key={phase.label}
            minOpacity={0.2}
            falloff={0.55}
            minScale={0.99}
            disableBelowMd
          >
            <div className="border-t border-rule-soft pt-6">
              <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                {phase.label}
              </p>
              <h3 className="mt-3 font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.75rem]">
                {phase.title}
              </h3>
              <p className="mt-3 text-[1rem] leading-[1.7rem] text-ink">
                {phase.body}
              </p>
            </div>
          </CenterFocus>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Tiers — three options. Tier 2 recommended. EUR figures left as
// placeholders for Guil to fill in.
// ---------------------------------------------------------------------
type TierData = {
  label: string;
  title: string;
  lead: string;
  includes: string[];
  price: string;
  priceNote: string;
  recommended?: boolean;
};

const tiers: TierData[] = [
  {
    label: "Tier 1 · Essential",
    title: "Identity and invite",
    lead: "The minimum to get invites out strong.",
    includes: [
      "Visual identity: core marks, colour, type, core usage",
      "Logo for WinWin 2026",
      "Invitation design",
      "Save-the-date template",
      "Built to ship before the summer break in mid-July",
    ],
    price: "[TIER 1 PRICE]",
    priceNote: "Clearly under 10,000 EUR.",
  },
  {
    label: "Tier 2 · Recommended",
    title: "The full brief",
    lead: "Everything in Essential, plus the website and a few key applications. This is the brief as briefed.",
    includes: [
      "Everything in Essential",
      "Website design and build: landing page with all event info, linking out to Ticket Tailor for reservations",
      "A small set of key applications",
    ],
    price: "[TIER 2 PRICE]",
    priceNote: "Around the 10,000 EUR mark.",
    recommended: true,
  },
  {
    label: "Tier 3 · Full",
    title: "Identity that compounds",
    lead: "Everything in Recommended, plus the pieces that turn one summit into a recurring brand.",
    includes: [
      "Everything in Recommended",
      "Motion design: logo loop, intro and outro animations for presentations and recorded content",
      "Light brand guidelines for WinWin as a recurring annual event",
      "Merch starter set",
    ],
    price: "[TIER 3 PRICE]",
    priceNote:
      "Above 10,000 EUR. The version to grow into when the next funding tranche lands, or once the invites land well with funders.",
  },
];

function TierCard({ tier }: { tier: TierData }) {
  return (
    <div
      className={`flex h-full flex-col gap-5 rounded-[16px] border bg-transparent px-8 py-7 ${
        tier.recommended ? "border-ink" : "border-rule"
      }`}
    >
      <div>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {tier.label}
        </p>
        <h3 className="mt-4 font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.75rem]">
          {tier.title}
        </h3>
      </div>

      <p className="text-[0.95rem] leading-[1.6rem] text-ink">{tier.lead}</p>

      <BulletList items={tier.includes} />

      <div className="mt-auto border-t border-rule-soft pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            Fee
          </p>
          <p className="font-display text-[1.5rem] font-bold leading-none text-ink md:text-[1.75rem]">
            {tier.price}
          </p>
        </div>
        <p className="mt-4 text-[0.9rem] leading-[1.5rem] text-ink">
          {tier.priceNote}
        </p>
        <p className="mt-2 text-[0.85rem] leading-[1.4rem] text-muted">
          Two revision rounds per deliverable. Extra rounds billed hourly.
        </p>
      </div>
    </div>
  );
}

function Tiers() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Scope and tiers</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus minOpacity={0.15} falloff={0.55} minScale={0.99} disableBelowMd>
          <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
            Start safe, add as funding lands.
          </h2>
          <p className="mt-5 max-w-[620px] text-[0.9rem] leading-[1.5rem] text-muted">
            Three tiers. Each one builds on the one before it. Funding is still
            coming in, so you can lock the essentials now and grow the scope as
            the budget firms up.
          </p>
        </CenterFocus>

        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-3">
          {tiers.map((tier) => (
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
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Terms — payment and terms.
// ---------------------------------------------------------------------
function Terms() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Payment and terms</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <BulletList
          items={[
            "Phased payment, tied to phase delivery.",
            "Invoice to Sustainable Public Affairs.",
            "Standard 19 percent German VAT applies.",
            "Two revision rounds per deliverable. Extra rounds billed hourly.",
            "Funding is still coming in, so you can start at Essential and add scope as it lands.",
          ]}
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Relevant work — two short references, links out.
// ---------------------------------------------------------------------
const relevantWork = [
  {
    title: "Regens Unite",
    href: "https://regensunite.earth",
    body: "Cross-movement community and event identity. The closest match to WinWin: bridging tech, institutions, and the people who move between them, then building the identity and the programming around it.",
  },
  {
    title: "The DAOist",
    href: "https://thedaoist2.webflow.io/",
    body: "Event identity with full scope: video, merch, swag, and a high-contrast direction. The reference point for tier three.",
  },
];

function RelevantWork() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Relevant work</SectionLabel>
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-10">
        {relevantWork.map((work) => (
          <CenterFocus
            key={work.title}
            minOpacity={0.2}
            falloff={0.55}
            minScale={0.99}
            disableBelowMd
          >
            <div className="border-t border-rule-soft pt-6">
              <h3 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.75rem]">
                <a
                  href={work.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-colors hover:text-muted"
                >
                  {work.title}
                  <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
                </a>
              </h3>
              <p className="mt-3 max-w-[680px] text-[1rem] leading-[1.7rem] text-ink">
                {work.body}
              </p>
            </div>
          </CenterFocus>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Next step — direct close + Loom placeholder.
// ---------------------------------------------------------------------
function NextStep() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
      <SectionLabel>Next step</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus minOpacity={0.15} falloff={0.55} minScale={0.99}>
          <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
            Let me walk you through it.
          </h2>
          <p className="mt-6 max-w-[620px] text-[1rem] leading-[1.7rem] text-ink">
            I recorded a short Loom that talks through this proposal end to end.
            Watch it, pick a tier, and I can start next week. Tell me where you
            want to begin and I will send a short agreement and a start date.
          </p>
        </CenterFocus>

        {/* Loom embed placeholder — swap in the share URL / iframe. */}
        <CenterFocus minOpacity={0.15} falloff={0.55} minScale={0.99}>
          <div className="mt-10 flex aspect-video w-full items-center justify-center rounded-[16px] border border-dashed border-rule bg-card/30">
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              Loom walkthrough
            </p>
          </div>
        </CenterFocus>

        <CenterFocus minOpacity={0.15} falloff={0.5} minScale={0.98}>
          <div className="mt-10">
            <CtaButton href="mailto:guil@guil.is" label="Get in touch" />
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
