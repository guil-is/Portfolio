import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Zap,
  Video,
  Hammer,
  LayoutGrid,
  Compass,
  Sparkles,
  Check,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  Play,
  type LucideIcon,
} from "lucide-react";
import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CtaButton } from "@/components/CtaButton";
import { CenterFocus } from "@/components/CenterFocus";
import { pastProjects } from "@/content/projects";
import { SectionNav } from "./SectionNav";
import { ExpandAllToggle } from "./ExpandAllToggle";

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

const PASSWORD = "winwin";

// Loom walkthrough link for the hero CTA. Swap in the recorded share URL.
const LOOM_URL = "#";

export default function SpaPage() {
  return (
    <>
      <div className="no-print fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <PasswordGate password={PASSWORD} storageKey="for-spa-unlocked">
        <SectionNav />
        <main className="page-fade-in pb-40">
          <Header />
          <Intro />
          <ProcessTimeline />
          <Investment />
          <FullScope />
          <Terms />
          <RelevantWork />
          <HowIWork />
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
            visual identity
            <br aria-hidden />
            &amp;&nbsp;website
          </span>
        </h1>

        <p
          className="intro-rise mt-6 max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted md:mt-8 md:text-[1rem]"
          style={{ animationDelay: "380ms" }}
        >
          A half-day summit in Brussels that puts 350-400 CEOs, founders,
          funders, and EU policymakers in one room. The identity embodies the
          concept of{" "}
          <span className="whitespace-nowrap">
            sustainability = competitiveness.
          </span>
        </p>

        <div
          className="intro-rise mt-10"
          style={{ animationDelay: "460ms" }}
        >
          <CtaButton href={LOOM_URL} label="Watch the walkthrough" icon={Play} />
        </div>
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
    <section id="brief" className="mx-auto w-full max-w-[1200px] px-6 py-14 md:px-10 md:py-16">
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
                  "The program is dense: a top-level European Commission keynote, ten founder pitches against ten priorities, themed roundtables, and the Founders' Letter for the Future handed over live.",
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
            <div className="mt-4 flex flex-col gap-2.5">
              {[
                "Full visual identity, logo, and guidelines",
                "Event website, plus on-site and printed material",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-3 text-[1rem] leading-[1.6rem] text-ink"
                >
                  <Check
                    className="mt-[3px] h-3.5 w-3.5 shrink-0 text-ink"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <a
              href="#scope"
              className="mt-5 inline-flex items-center gap-1 self-start text-[0.9rem] font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
            >
              See the full scope
              <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </a>
          </div>
        </CenterFocus>

        <CenterFocus minOpacity={0.2} falloff={0.55} minScale={0.99} disableBelowMd>
          <div>
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              Creative direction
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
              Project goals
            </p>
            <div className="mt-4">
              <BulletList
                items={[
                  "Inspire event participants and the larger audience",
                  "Carry visibility and legitimacy for Sustainable Public Affairs",
                  "Be replicable for future events beyond the summit",
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
  sparkles: Sparkles,
};

const howItems = [
  {
    icon: "sparkles",
    title: "AI Augmented",
    body: "An AI-augmented workflow lets me move fast and build the website myself, not just design it.",
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
    <section id="approach" className="mx-auto w-full max-w-[1200px] px-6 py-14 md:px-10 md:py-16">
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

    </section>
  );
}

// ---------------------------------------------------------------------
// Process and timeline — one compact, single-viewport block. The
// timeline axis and the phase detail are merged: each phase is a node
// on the line and carries its week, a one-line summary, and its
// deliverables. Six to seven weeks end to end.
// ---------------------------------------------------------------------
const phases = [
  {
    week: "Week 1",
    title: "Discovery + explorations",
    line: "Align on creative brief and explore distinct directions with trade-offs.",
    items: ["Discovery workshop", "Brand direction explorations"],
  },
  {
    week: "Week 2",
    title: "Core identity + invite",
    line: "Consolidate final direction + create invitation landing page.",
    items: [
      "Core brand assets (logo, color, typography, main applications)",
      "Invite landing page with RSVP",
    ],
  },
  {
    week: "Weeks 3-4",
    title: "Full website + assets",
    line: "The complete site with all event info, linking to the RSVP link.",
    items: ["Website designed + deployed", "Additional brand assets"],
  },
  {
    week: "Weeks 5-6",
    title: "All deliverables",
    line: "Everything else, digital and printed, wrapped for production window.",
    items: [
      "Extended brand assets",
      "Printed collateral (rollups, etc)",
      "Merch",
    ],
  },
];

function ProcessTimeline() {
  return (
    <section id="timeline" className="mx-auto w-full max-w-[1200px] px-6 py-14 md:px-10 md:py-16">
      {/* Compact section label — tighter than the shared SectionLabel. */}
      <div className="mb-12 w-full border-t border-rule-soft pt-5">
        <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
          Process and timeline
        </p>
      </div>

      {/* Merged timeline: each phase is a node on the axis (lg) and carries
          its own date, description, and deliverables. */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {phases.map((phase, idx) => {
          const isLast = idx === phases.length - 1;
          return (
            <div key={phase.title} className="relative lg:pt-9">
              {/* Connecting axis segment to the next node (desktop only) */}
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-[5px] hidden h-px w-[calc(100%+2.5rem)] bg-rule lg:block"
                />
              ) : null}
              {/* Node dot, masked from the line by a bg ring */}
              <span
                aria-hidden
                className="absolute left-0 top-0 hidden h-[10px] w-[10px] rounded-full bg-ink ring-4 ring-bg lg:block"
              />

              <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px]">
                <span className="text-ink">Phase {idx + 1}</span>
                <span className="text-muted"> · {phase.week}</span>
              </p>
              <h3 className="mt-3 font-display text-[1.15rem] font-bold leading-tight text-ink">
                {phase.title}
              </h3>
              <p className="mt-3 text-[0.85rem] leading-[1.5rem] text-muted">
                {phase.line}
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {phase.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-[0.85rem] leading-[1.4rem] text-ink"
                  >
                    <Check
                      className="mt-[2px] h-3.5 w-3.5 shrink-0 text-ink"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Closing note: total span + optional retainer */}
      <div className="mt-14 max-w-[860px] border-t border-rule-soft pt-7">
        <p className="text-[0.95rem] font-bold leading-[1.5rem] text-ink">
          6 to 7 weeks, start to finish
        </p>
        <p className="mt-2.5 text-[0.9rem] leading-[1.6rem] text-muted">
          The work wraps by late August, leaving two full months before the
          summit. If helpful, I can stay on for Sept + Oct on a small retainer
          (5h/week) to maintain and update the website and cover design needs.
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Investment — fixed price, billed by phase. Same phase spine as the
// timeline, so the money maps onto the work one to one.
// ---------------------------------------------------------------------
const investment: {
  phase: string;
  title: string;
  weeks: string;
  amount: string;
  estimate?: boolean;
}[] = [
  { phase: "Phase 1-2", title: "Core identity + invite", weeks: "Weeks 1-2", amount: "5,200 EUR" },
  { phase: "Phase 3", title: "Full website + assets", weeks: "Weeks 3-4", amount: "3,800 EUR" },
  { phase: "Phase 4", title: "All deliverables", weeks: "Weeks 5-6", amount: "2,800 EUR", estimate: true },
];

function Investment() {
  return (
    <section id="investment" className="mx-auto w-full max-w-[1200px] px-6 py-14 md:px-10 md:py-16">
      <SectionLabel>Investment</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus minOpacity={0.15} falloff={0.55} minScale={0.99} disableBelowMd>
          <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
            Pay as it ships.
          </h2>
          <p className="mt-5 text-[0.9rem] leading-[1.5rem] text-muted">
            You commit phase by phase, as the work lands. Each phase stands on
            its own, no long lock-in.
          </p>
        </CenterFocus>

        <CenterFocus minOpacity={0.15} falloff={0.5} minScale={0.98} disableBelowMd>
          <div className="mt-12 max-w-[640px] rounded-[16px] border border-rule px-8 py-3">
            {investment.map((row) => (
              <div key={row.phase} className="border-b border-rule-soft py-5">
                <p className="font-caption text-[10px] font-medium uppercase tracking-[1.5px]">
                  <span className="text-ink">{row.phase}</span>
                  <span className="text-muted"> · {row.weeks}</span>
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <p className="font-display text-[1.3rem] font-bold leading-tight text-ink md:text-[1.45rem]">
                    {row.title}
                  </p>
                  <p className="shrink-0 font-display text-[1.3rem] font-bold leading-none text-ink md:text-[1.45rem]">
                    {row.amount}
                    {row.estimate ? (
                      <span className="align-super text-[0.85em] font-bold text-ink">
                        *
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex items-baseline justify-between gap-4 pt-5">
              <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
                Total
              </p>
              <div className="text-right">
                <p className="font-display text-[1.5rem] font-bold leading-none text-ink md:text-[1.75rem]">
                  11,800 EUR
                </p>
                <p className="mt-1.5 font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
                  + 19% VAT
                </p>
              </div>
            </div>
          </div>
        </CenterFocus>

        <CenterFocus minOpacity={0.15} falloff={0.55} minScale={0.99} disableBelowMd>
          <p className="mt-10 max-w-[640px] text-[0.9rem] leading-[1.5rem] text-muted">
            All four phases: the full identity, the website, and the deliverables
            the summit needs. Billing by phase keeps it flexible. You sign off and
            pay as each block ships.
          </p>
          <p className="mt-4 max-w-[640px] text-[0.9rem] leading-[1.5rem] text-muted">
            A 30% deposit on signing, 1,560 EUR, credited to the first invoice.
            Each phase is invoiced at the end of its block, bi-weekly. All
            amounts plus 19% German VAT.
          </p>
          <p className="mt-5 max-w-[640px] text-[0.8rem] leading-[1.5rem] text-faint">
            * Phase 4 is a working estimate. As we scope the real needs and
            budget together during the project, it can move up or down, and the
            total moves with it.
          </p>
        </CenterFocus>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Full scope — the complete deliverable menu, grouped by discipline.
// Collapsed by default (native <details>) so the depth is available
// without bloating the page. Phasing lives in the timeline, not here.
// ---------------------------------------------------------------------
const fullScope: { title: string; optional?: boolean; items: string[] }[] = [
  {
    title: "Visual identity",
    items: [
      "Logo system: primary, horizontal, stacked, icon-only",
      "Color and mono variants, clear-space and minimum-size rules",
      "WinWin 2026 year lockup and a recurring-edition lockup",
      "Color palette for screen and print, full typography system",
      "Core graphic device: reusable motif",
      "Imagery direction for the abstract-nature close-ups, plus a texture set",
      "Mini brand guidelines for the event",
    ],
  },
  {
    title: "Invitation and save-the-date",
    items: [
      "Save-the-date: digital, ships first, links to the early RSVP page",
      "Formal invitation: email-ready (Mailchimp or La Posta), once the program is locked",
      "Optional printed invitation for VIPs",
    ],
  },
  {
    title: "Event website",
    items: [
      "Sitemap and wireframe",
      "Early RSVP page, live first, linked from the save-the-date",
      "Landing page, desktop and mobile: hero, program, speakers, venue, partners, RSVP",
      "RSVP flow linking to Ticket Tailor",
      "Build, deploy, responsive behavior and light motion",
      "Favicon, social share image, meta, basic accessibility pass",
    ],
  },
  {
    title: "Event and on-site collateral",
    items: [
      "Main-stage backdrop and stage visual",
      "Step-and-repeat photo wall for the group photo",
      "Signage system: wayfinding, registration, roundtable signs",
      "Name badges and lanyards",
      "Printed program and agenda",
      "Founders' Letter for the Future: document design",
    ],
  },
  {
    title: "Stage and screen graphics",
    items: [
      "Presentation template with the ten priorities on screen",
      "Speaker name graphics template",
      "Interstitial screens (holding / schedule)",
      "Roundtable title cards, one per theme",
    ],
  },
  {
    title: "Social and co-branding",
    items: [
      "Post templates: announcement, speaker reveal, countdown, quote card",
      "Story, vertical, and LinkedIn formats",
      "Partner and funder co-branding lockups",
      "Profile assets if WinWin runs its own channels",
    ],
  },
  {
    title: "Files and handoff",
    items: [
      "Organized asset library and export pack for your team",
      "Source files: Figma and vector",
      "Print-ready files with correct bleeds and specs",
    ],
  },
  {
    title: "Motion",
    optional: true,
    items: [
      "Logo animation",
      "Animated screen loops",
      "Social teaser animations",
    ],
  },
  {
    title: "Merch",
    optional: true,
    items: [
      "Tote or gift bag, notebook, pins, stickers",
      "Cap or T-shirt",
      "VIP gift items",
    ],
  },
];

function FullScope() {
  return (
    <section id="scope" className="mx-auto w-full max-w-[1200px] px-6 py-14 md:px-10 md:py-16">
      <SectionLabel>Full scope</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus minOpacity={0.2} falloff={0.55} minScale={0.99} disableBelowMd>
          <p className="max-w-[680px] text-[1rem] leading-[1.7rem] text-ink">
            The full deliverable set, by category. Final list to be confirmed.
          </p>
        </CenterFocus>

        <div className="mt-8 flex justify-end">
          <ExpandAllToggle />
        </div>
        <div className="mt-2 flex flex-col">
          {fullScope.map((group) => (
            <details
              key={group.title}
              className="group border-b border-rule-soft last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-90"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="text-[1rem] leading-[1.5rem] text-ink">
                  {group.title}
                </span>
                {group.optional ? (
                  <span className="ml-auto shrink-0 pl-3 font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-faint">
                    Optional
                  </span>
                ) : null}
              </summary>
              <ul className="flex flex-col gap-2 pb-4 pl-7">
                {group.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-[0.9rem] leading-[1.5rem] text-muted"
                  >
                    <span aria-hidden className="select-none">
                      –
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Terms — the contractual bits not covered in Investment.
// ---------------------------------------------------------------------
function Terms() {
  return (
    <section id="terms" className="mx-auto w-full max-w-[1200px] px-6 py-14 md:px-10 md:py-16">
      <SectionLabel>Terms</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <BulletList
          items={[
            "Invoiced to Sustainable Public Affairs, plus 19% German VAT.",
            "30% deposit on signing, the balance billed per phase, bi-weekly.",
            "Two revision rounds per phase. Extra rounds and out-of-scope work billed hourly.",
            "High-volume on-site collateral is produced by your team from the templates I provide. I design the system and the hero pieces.",
            "Optional hour-capped retainer through September and October to maintain the site and cover small requests.",
          ]}
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Relevant work — same card treatment as the homepage "Past work" grid
// (thumbnail, title, client caption), pulling two projects by slug from
// the shared project data, with a short description added under each.
// ---------------------------------------------------------------------
const relevantWork = [
  {
    slug: "chinwags",
    description:
      "Brand, landing page, and event materials for a web3 governance retreat, built to bring a mixed room together in nature.",
  },
  {
    slug: "the-daoist",
    description:
      "Event identity at full scope: brand, website, motion, merch, and swag, held together across five cities.",
  },
];

function RelevantWork() {
  return (
    <section id="work" className="mx-auto w-full max-w-[1200px] px-6 py-14 md:px-10 md:py-16">
      <SectionLabel>Relevant work</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus minOpacity={0.2} falloff={0.55} minScale={0.99} disableBelowMd>
          <p className="max-w-[680px] text-[1rem] leading-[1.7rem] text-ink">
            I have built brand and digital work for 14+ years, much of it for
            events and communities that had to land with a serious room. Two that
            map onto WinWin:
          </p>
        </CenterFocus>

        <CenterFocus minOpacity={0.25} falloff={0.55} minScale={0.97}>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {relevantWork.map((work) => {
              const project = pastProjects.find((p) => p.slug === work.slug);
              if (!project) return null;
              return (
                <div key={work.slug} className="flex flex-col gap-3">
                  <Link
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-3"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433]">
                      {project.gridImage ? (
                        <Image
                          src={project.gridImage}
                          alt={project.name}
                          fill
                          sizes="(min-width: 768px) 380px, 100vw"
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <h5 className="font-display text-xl leading-tight text-ink">
                        {project.name}
                      </h5>
                      <div className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
                        {project.client}
                      </div>
                    </div>
                  </Link>
                  <p className="text-[0.9rem] leading-[1.5rem] text-muted">
                    {work.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CenterFocus>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Next step — direct close + Loom placeholder.
// ---------------------------------------------------------------------
function NextStep() {
  return (
    <section id="next" className="mx-auto w-full max-w-[1200px] px-6 py-14 md:px-10 md:py-16">
      <SectionLabel>Next step</SectionLabel>
      <div className="mx-auto w-full max-w-[960px]">
        <CenterFocus minOpacity={0.15} falloff={0.55} minScale={0.99}>
          <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
            Ready to move?
          </h2>
          <p className="mt-6 max-w-[620px] text-[1rem] leading-[1.7rem] text-ink">
            Next step is a quick call. We answer questions on both sides and talk
            through scope and SOW terms (sent before the call). From there, we
            agree on a starting point. Earliest start date from Tuesday, July 7.
          </p>
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
