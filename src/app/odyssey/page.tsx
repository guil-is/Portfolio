import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CtaButton } from "@/components/CtaButton";
import { ImageGallery } from "@/components/ImageGallery";
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

export default function OdysseyPage() {
  const clawbankImages = getGalleryImages("odyssey/clawbank");
  const thriveImages = getGalleryImages("odyssey/thrive");

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <PasswordGate password={PASSWORD}>
        <main className="page-fade-in pb-24 pt-12 md:pt-20">
          <Header />

          <CaseStudy
            number="01"
            meta="Fractional Design Partner · 10 hrs/week · Pre-launch"
            title="Clawbank"
            problem="A technically real product with no visual credibility. In crypto, perception precedes traction — they needed to look fundable before they could become fundable."
            images={clawbankImages}
            stat="$150K → $800K"
            statLabel="Market cap in 13 days · +433% · #5 trending on DexScreener"
            quote="We wouldn't have launched if it weren't for you."
            relevance="Same mechanism Odyssey needs: design legitimacy unlocks trust, trust unlocks momentum."
          />

          <CaseStudy
            number="02"
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
// Header
// ---------------------------------------------------------------------
function Header() {
  return (
    <section className="mx-auto w-full max-w-[960px] px-6 pb-20 md:px-10 md:pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-5">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          Prepared for Nick DeNuzzo & Chris · Odyssey
        </p>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          April 2026
        </p>
      </div>

      <h1 className="intro-rise mt-16 font-display text-[3rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
        Guil Maueler
      </h1>
      <p className="mt-4 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        Creative Director & Senior Brand Designer
      </p>

      <p className="mt-10 max-w-[560px] text-[1rem] leading-[1.7rem] text-ink">
        14+ years of visual identity, design systems, and product interfaces.
        Two recent projects, and two ways to work together.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------
// Case study — hero copy, gallery, stat + quote, relevance
// ---------------------------------------------------------------------
type CaseStudyProps = {
  number: string;
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
  number,
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
    <section className="border-t border-rule py-20 md:py-28">
      <div className="mx-auto mb-12 w-full max-w-[960px] px-6 md:mb-16 md:px-10">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {number} · {meta}
        </p>
        <h2 className="mt-5 font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
          {title}
        </h2>
        <p className="mt-6 max-w-[620px] text-[1rem] leading-[1.7rem] text-ink">
          {problem}
        </p>
      </div>

      {/* Full-width gallery */}
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <ImageGallery images={images} alt={title} />
      </div>

      {/* Stat + quote + relevance */}
      <div className="mx-auto mt-12 w-full max-w-[960px] px-6 md:mt-16 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1fr]">
          {stat || quote ? (
            <div className="flex flex-col gap-8">
              {stat ? (
                <div>
                  <p className="font-display text-[2.5rem] font-bold leading-none text-ink md:text-[3rem]">
                    {stat}
                  </p>
                  {statLabel ? (
                    <p className="mt-3 max-w-[320px] text-[0.9rem] leading-[1.5rem] text-muted">
                      {statLabel}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {quote ? (
                <blockquote className="border-l-2 border-accent pl-5">
                  <p className="font-display text-[1.25rem] italic leading-[1.5] text-ink">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <footer className="mt-3 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                    {title} founder
                  </footer>
                </blockquote>
              ) : null}
            </div>
          ) : (
            <div />
          )}

          <div>
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              Why it matters for Odyssey
            </p>
            <p className="mt-4 text-[1rem] leading-[1.7rem] text-ink">
              {relevance}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// How I work — 4 short items, 2x2 grid
// ---------------------------------------------------------------------
const howItems = [
  {
    title: "Fast first drafts",
    body: "Same-day or next-day rough concepts. We validate early, before I go deep.",
  },
  {
    title: "Embedded, not briefed",
    body: "Strategic input before I open Figma. You bring business context, I bring design POV.",
  },
  {
    title: "Figma → Webflow, end-to-end",
    body: "Design and delivery in one flow, AI-augmented via Claude Code + Webflow MCP.",
  },
  {
    title: "Direct access",
    body: "No layers, no account managers. You message me, I respond.",
  },
];

function HowIWork() {
  return (
    <section className="mx-auto w-full max-w-[960px] border-t border-rule px-6 py-20 md:px-10 md:py-28">
      <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
        How I work
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2 md:mt-16">
        {howItems.map((item) => (
          <div key={item.title} className="flex flex-col gap-3">
            <h3 className="font-display text-[1.25rem] font-bold leading-tight text-ink">
              {item.title}
            </h3>
            <p className="text-[1rem] leading-[1.7rem] text-ink">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------
// Engagement — two tiers, right one recommended
// ---------------------------------------------------------------------
const tiers = [
  {
    label: "Design Support",
    price: "$4,800",
    cadence: "~10 hrs/week · Monthly",
    includes: [
      "Site updates and iterations",
      "Campaign and content asset design",
      "Design QA on new features",
      "48-hour turnaround",
      "Async weekly update",
    ],
    recommended: false,
  },
  {
    label: "Design Partner",
    price: "$9,600",
    cadence: "~20 hrs/week · Monthly",
    includes: [
      "Everything in Design Support",
      "New product design: risk assessment, prep courses, educational hub",
      "Brand system ownership",
      "Weekly live sync with Nick & Chris",
      "24-hour turnaround",
      "Proactive strategic input",
    ],
    recommended: true,
  },
];

function Engagement() {
  return (
    <section className="mx-auto w-full max-w-[960px] border-t border-rule px-6 py-20 md:px-10 md:py-28">
      <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
        Two ways to work together
      </h2>

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

      <p className="mt-10 max-w-[620px] text-[0.9rem] leading-[1.5rem] text-muted">
        Both tiers are month-to-month. Scope reviewed after month one. First
        month of Design Partner includes a brand audit at no extra charge.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------
// Next step
// ---------------------------------------------------------------------
function NextStep() {
  return (
    <section className="mx-auto w-full max-w-[960px] border-t border-rule px-6 py-20 md:px-10 md:py-28">
      <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
        Ready to move?
      </h2>
      <p className="mt-6 max-w-[620px] text-[1rem] leading-[1.7rem] text-ink">
        Next step is a 30-minute call. I&rsquo;ll come with specific directions
        for the educational hub and the risk assessment UI — concrete, not
        vague. We agree on scope and I can be live within a week.
      </p>

      <div className="mt-10">
        <CtaButton href="mailto:guil@guil.is" label="Get in touch" />
      </div>

      <p className="mt-20 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        guil.is
      </p>
    </section>
  );
}
