import type { Proposal } from "./types";

export const odyssey: Proposal = {
  slug: "odyssey",
  password: "psilocybin",
  clientName: "Odyssey",
  preparedFor: "Prepared for Nick DeNuzzo & Chris · Odyssey",
  date: "April 2026",

  hero: {
    title: "Design partner for Odyssey",
    blurb:
      "Odyssey is tripling sales this year and launching new product surfaces fast. You need a design partner embedded enough to move at that pace, and strategic enough to shape what you\u2019re building, not just execute on it.",
    loomUrl: "https://www.loom.com/share/287197230f7d42d7be5b475fe30f535e",
    loomLabel: "Watch the walkthrough",
  },

  caseStudies: [
    {
      sectionLabel: "Recent work · 01",
      meta: "Fractional Design Partner · 10 hrs/week · Pre-launch",
      title: "Clawbank",
      url: "https://clawbank.co",
      problem:
        "A technically real product with no visual credibility. In crypto, perception precedes traction, they needed to look fundable before they could become fundable.",
      whatIShipped:
        "Brand identity, landing page from zero to live, design system, base marketing assets and promo videos. Zero to launch in two weeks.",
      galleryFolder: "odyssey/clawbank",
      mediaLinks: {
        "Clawbank_promo.webm":
          "https://x.com/singularityhack/status/2044519546610995356",
      },
      stat: "$150K \u2192 $800K",
      statLabel: (
        <>
          Market cap in 13 days · +433% · #5 trending on{" "}
          <a
            href="https://dexscreener.com/base/0xb04b187062efbf94cf9b4b6f42bf688258d3c88b7c9283bbc74dbbfb1af40d54"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-rule-soft underline-offset-4 transition-colors hover:text-ink"
          >
            DexScreener
          </a>
        </>
      ),
      relevance:
        "Fast building. Lean approach. Same mechanism Odyssey needs. Design legitimacy unlocks trust, trust unlocks momentum.",
    },
    {
      sectionLabel: "Recent work · 02",
      meta: "Lead Designer · Brand, Design System & Product UI · 2025\u20132026",
      title: "Thrive",
      url: "https://thrive.xyz",
      problem:
        "Strong idea, weak articulation. The brand meant nothing to outsiders, and the product felt like separate tools that happened to share a codebase.",
      whatIShipped: [
        "Partial rebrand, design system, and product UI overhaul. Brand strategy alongside the team. Hiring. AI integration.",
        "Team reported working at a much higher efficiency. The product started to feel like one system. New features are built faster with less rework.",
      ],
      galleryFolder: "odyssey/thrive",
      relevance:
        "Brand and product simultaneously. Fast-moving small team. Async-heavy, fast iteration, no room for slow feedback cycles. Similar structure as Odyssey.",
    },
  ],

  engagement: {
    heading: "Where do we want to start?",
    subheading:
      "Two starting points depending on where Odyssey is right now. Both are month-to-month and can flex after the first month.",
    footnote:
      "Both options are month-to-month. Scope is reviewed after the first month and adjusted if needed. If you\u2019re unsure which fits, the first conversation will make it clear.",
    tiers: [
      {
        label: "Start focused",
        price: "$4,800",
        cadence: "~10 hrs/week",
        body: "If you want to establish a working rhythm before moving to bigger product work. Site iterations, campaign assets, design QA, fast turnaround. You get embedded design thinking from day one, scoped to what's most immediately useful.",
        response: "Response time: within 24h",
      },
      {
        label: "Start building",
        price: "$8,800",
        cadence: "~20 hrs/week",
        priceNote:
          "First month: $7,040 \u2014 then $8,800/month from month two.",
        body: "If you are ready to move on new product surfaces immediately. The risk assessment tool, prep courses, and educational hub all need design thinking from the start. This scope includes dedicated design on new product initiatives and ownership of the design system as Odyssey scales.",
        response: "Response time: within 12h",
      },
    ],
  },

  nextStep: {
    heading: "Ready to move?",
    body: "Next step is a 30-minute call with Nick and Chris. We answer questions on both sides, talk through scope and SLA terms. From there we agree on a starting point and I can be live within a week.",
    ctaHref: "mailto:guil@guil.is",
    ctaLabel: "Get in touch",
  },

  metadata: {
    title: "Odyssey | Guil Maueler",
    description: "Private proposal page",
  },
};
