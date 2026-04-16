import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CtaButton } from "@/components/CtaButton";

// Password is held in a server-only constant. Still ships to the
// client via the gate's prop — this is not real auth, it's a shared
// link + soft barrier.
const PASSWORD = "psilocybin";

export default function OdysseyPage() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <PasswordGate password={PASSWORD}>
        <main className="page-fade-in px-6 pb-24 pt-16 md:px-10 md:pt-24">
          <Header />
          <CaseStudy
            number="01"
            tag="Fractional Design Partner"
            title="Clawbank"
            subtitle="AI-native fintech · 10 hrs/week · Days before launch"
            problem="A technically real product with no visual credibility. In crypto, perception precedes traction. They needed to look fundable before they could become fundable."
            did={[
              "Full brand identity system: mark, typography, color, motion language",
              "Landing page from zero to live, built to serve developers and investors simultaneously",
              "Design tokens → production CSS, structured for a team to scale from",
              "Visual direction for product content: video structure, demo framing",
            ]}
            result="Token market cap: $150K → $800K in 13 days. +433%. Hit #5 trending on DexScreener on launch day."
            quote={{
              body: "We wouldn't have launched if it weren't for you.",
              attribution: "Clawbank founder",
            }}
            relevance="The mechanism is universal: design legitimacy unlocks trust, trust unlocks momentum. The engagement was 10 hrs/week, embedded enough to move fast, scoped enough to stay strategic."
          />
          <CaseStudy
            number="02"
            tag="Brand & Product Design"
            title="Thrive"
            subtitle="Web3 funding & intelligence platform · Full rebrand"
            problem="Make a VC-facing crypto platform feel credible to an audience conditioned to expect scams. Complex product, stigmatized category, small team."
            did={[
              "Full rebrand: visual identity, design system, marketing site and web app redesign",
              "Worked directly with a 2-person leadership team",
              "Rough concepts same day, refined through fast iteration cycles",
            ]}
            relevance="Same core challenge: take something the mainstream doesn't fully trust yet, and design it into something they do. Category differs, dynamic is identical."
          />
          <CaseStudy
            number="03"
            tag="Design at Scale"
            title="N26"
            subtitle="International fintech · Nearly 4 years · Led a team of 5"
            problem="Scale brand and product design across 5 international markets during rapid expansion. Maintain visual coherence in a regulated, high-stakes category where design directly affects user trust."
            did={[
              "Led a motion design team of 5 during international expansion",
              "Built and maintained design systems across product and marketing surfaces",
              "Designed across campaign, product, and content channels simultaneously, at pace",
            ]}
            relevance="The site is working. I know how to move fast on new surfaces without breaking what's already performing."
          />
          <HowIWork />
          <Engagement />
          <NextStep />
        </main>
      </PasswordGate>
    </>
  );
}

function Header() {
  return (
    <section className="mx-auto w-full max-w-[800px] pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-6">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          Prepared for Nick DeNuzzo & Chris · Odyssey
        </p>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          April 2026
        </p>
      </div>

      <h1 className="intro-rise mt-12 font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[3.5rem]">
        Guil Maueler
      </h1>
      <p className="mt-3 font-display text-[1.25rem] italic leading-tight text-muted md:text-[1.5rem]">
        Creative Director & Senior Brand Designer
      </p>
      <p className="mt-8 max-w-[600px] text-[1rem] leading-[1.7rem] text-ink">
        14+ years building visual identities, design systems, and product
        interfaces. This page covers three relevant projects and two ways to
        work together.
      </p>
    </section>
  );
}

type CaseStudyProps = {
  number: string;
  tag: string;
  title: string;
  subtitle: string;
  problem: string;
  did: string[];
  result?: string;
  quote?: { body: string; attribution: string };
  relevance: string;
};

function CaseStudy({
  number,
  tag,
  title,
  subtitle,
  problem,
  did,
  result,
  quote,
  relevance,
}: CaseStudyProps) {
  return (
    <section className="mx-auto w-full max-w-[800px] border-t border-rule py-16 md:py-20">
      <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
        {number} &nbsp;·&nbsp; {tag}
      </p>
      <h2 className="mt-6 font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
        {title}
      </h2>
      <p className="mt-2 font-caption text-[13px] font-medium uppercase tracking-[1.5px] text-muted">
        {subtitle}
      </p>

      <div className="mt-10 flex flex-col gap-8">
        <Field label="Problem">
          <p className="text-[1rem] leading-[1.7rem] text-ink">{problem}</p>
        </Field>

        <Field label="What I did">
          <ul className="flex flex-col gap-3">
            {did.map((item, i) => (
              <li
                key={i}
                className="grid grid-cols-[16px_1fr] gap-3 text-[1rem] leading-[1.7rem] text-ink"
              >
                <span aria-hidden className="pt-[0.6rem] text-muted">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Field>

        {result ? (
          <Field label="The result">
            <p className="text-[1rem] leading-[1.7rem] text-ink">{result}</p>
          </Field>
        ) : null}

        {quote ? (
          <blockquote className="border-l-2 border-accent pl-6">
            <p className="font-display text-[1.4rem] italic leading-[1.5] text-ink md:text-[1.6rem]">
              &ldquo;{quote.body}&rdquo;
            </p>
            <footer className="mt-3 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              {quote.attribution}
            </footer>
          </blockquote>
        ) : null}

        <Field label="Why it's relevant to Odyssey">
          <p className="text-[1rem] leading-[1.7rem] text-ink">{relevance}</p>
        </Field>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr] md:gap-8">
      <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      <div>{children}</div>
    </div>
  );
}

const howItems = [
  {
    title: "Fast first drafts",
    body: "Same day or next day rough concepts. We validate early before I go deep. No wasted cycles on misaligned work.",
  },
  {
    title: "Embedded, not briefed",
    body: "I bring strategic input before I open Figma. You bring the business context, I bring the design POV.",
  },
  {
    title: "Figma → Webflow, end-to-end",
    body: "Design in Figma, delivered in Webflow. I'm also integrating Claude Code with Webflow via MCP for faster, AI-augmented deployment.",
  },
  {
    title: "Direct access",
    body: "No layers, no account managers. You message me, I respond.",
  },
];

function HowIWork() {
  return (
    <section className="mx-auto w-full max-w-[800px] border-t border-rule py-16 md:py-20">
      <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.5rem]">
        How I work
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
        {howItems.map((item, i) => (
          <div key={item.title} className="flex flex-col gap-3">
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              0{i + 1}
            </p>
            <h3 className="font-display text-[1.25rem] font-bold leading-tight text-ink">
              {item.title}
            </h3>
            <p className="text-[0.95rem] leading-[1.6rem] text-ink">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const tiers = [
  {
    label: "Design Support",
    price: "$4,800 / month",
    cadence: "~10 hrs per week · Monthly retainer",
    includes: [
      "Site updates and iterations on existing pages",
      "Campaign and content asset design",
      "Design QA on new features",
      "48hr turnaround on requests",
      "Async weekly update",
    ],
    recommended: false,
  },
  {
    label: "Design Partner",
    price: "$9,600 / month",
    cadence: "~20 hrs per week · Monthly retainer",
    includes: [
      "Everything in Design Support",
      "New product design: risk assessment tool, prep courses, educational hub",
      "Brand system ownership and development",
      "Weekly live sync with Nick & Chris",
      "24hr turnaround on requests",
      "Proactive strategic input",
    ],
    recommended: true,
  },
];

function Engagement() {
  return (
    <section className="mx-auto w-full max-w-[800px] border-t border-rule py-16 md:py-20">
      <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.5rem]">
        Two ways to work together
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {tiers.map((tier) => (
          <div
            key={tier.label}
            className={`relative flex flex-col gap-6 rounded-[16px] border p-8 ${
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

            <div className="flex flex-col gap-2">
              <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                {tier.label}
              </p>
              <p className="font-display text-[1.75rem] font-bold leading-tight text-ink">
                {tier.price}
              </p>
              <p className="text-[0.9rem] leading-[1.5rem] text-muted">
                {tier.cadence}
              </p>
            </div>

            <ul className="flex flex-col gap-3 border-t border-rule-soft pt-6">
              {tier.includes.map((item, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[16px_1fr] gap-3 text-[0.95rem] leading-[1.5rem] text-ink"
                >
                  <span aria-hidden className="pt-[0.35rem] text-muted">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-[600px] text-[0.9rem] leading-[1.5rem] text-muted">
        Both tiers are month-to-month. Scope reviewed after month one and
        adjusted if needed. First month of Design Partner includes a brand
        audit at no extra charge.
      </p>
    </section>
  );
}

function NextStep() {
  return (
    <section className="mx-auto w-full max-w-[800px] border-t border-rule py-16 md:py-20">
      <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.5rem]">
        Ready to move?
      </h2>
      <p className="mt-6 max-w-[620px] text-[1rem] leading-[1.75rem] text-ink">
        Next step is a 30-minute call. I&rsquo;ll come with specific
        directions for the educational hub and the risk assessment UI.
        Concrete, not vague. We agree on a scope and I can be live within a
        week.
      </p>

      <div className="mt-10">
        <CtaButton
          href="mailto:guil@guil.is"
          label="Get in touch"
        />
      </div>

      <p className="mt-16 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        guil.is
      </p>
    </section>
  );
}
