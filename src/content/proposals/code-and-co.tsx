import type { Proposal } from "./types";

/**
 * Retainer proposal for Code & Co. (codeandco.com), prepared for
 * Kelly Cheesman. Structured like the Odyssey proposal: hero with
 * bio blurb, Thrive case study with gallery, approach grid, single
 * engagement card, next-step closer. No portfolio cross-links — one
 * audience. Copy is Guil's draft; deviations are marked TODO copy.
 */

const CLIENT_NAME = "Code & Co.";

export const codeAndCo: Proposal = {
  slug: "code-and-co",
  password: "duediligence",
  clientName: CLIENT_NAME,
  preparedFor: "Prepared for Kelly Cheesman",
  date: "September 2026",

  hero: {
    eyebrow: "Proposal",
    title: `Design partner for ${CLIENT_NAME}`,
    // TODO copy: reframed around Code & Co.'s situation, Odyssey-style,
    // with the draft's credentials line folded back in.
    blurb:
      "Code & Co. has more product work than hands, and the next two surfaces are already defined. You need a design partner embedded enough to move at your pace, and senior enough to take Target Portal and AI KPI tracking from first flow to working interface without being managed. I bring 15 years across product, brand and design systems, built and led the motion team at N26 during its global expansion, and was most recently Design Lead at Thrive.",
  },

  caseStudies: [
    {
      sectionLabel: "Recent work",
      meta: "Design Lead · Product, Brand & Design Systems · 2025–2026",
      title: "Thrive",
      // Links to the full case study at guil.is/projects/thrive-product.
      url: "/projects/thrive-product",
      // TODO copy: case study framing written for this proposal, leading
      // with the diligence-shaped problem rather than the crypto stack.
      problem:
        "Thrive evaluates companies and projects for capital allocation. The hard part was intake: getting structured, verifiable information out of teams without chasing them, then turning dense data into decisions non-experts can act on.",
      // TODO copy: assembled from the draft's Thrive references.
      whatIShipped:
        "Product UI across intake, verification and decision flows. A guided intake pattern that shows what’s missing, what it’s worth, and how to fix it. Design system, and working interfaces shipped directly, cutting the design to build loop from weeks to days.",
      // Hero opener gif (same one the public case studies use, served
      // from the Webflow CDN), then the verification pipeline and deal
      // flow screens. Local files are measured at build so the frames
      // match their aspect ratio instead of cropping.
      media: [
        {
          src: "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc8c76563ae4fa076fec0_home%20page.gif",
          aspect: 16 / 9,
        },
        { src: "/code-and-co/thrive/02-verification-pipeline.png" },
        { src: "/code-and-co/thrive/03-deal-flows.png" },
      ],
      mediaHref: "/projects/thrive-product",
      // TODO copy: relevance line written for this proposal.
      relevance:
        "Target Portal is this exact pattern: guided, conversational intake instead of forms and email chases. I have designed and shipped it once already.",
    },
  ],

  brief: {
    heading: "What I’d work on",
    // TODO copy: intro shortened, "more product work than hands" moved
    // to the hero blurb.
    intro: "These are the two I know about.",
    columns: [
      {
        icon: "message",
        title: "Target Portal",
        body: "Moving due diligence intake from forms to a guided, conversational flow. Target companies see what’s missing, what it’s worth, and how to fix it, without your team chasing documents by email. I designed this exact pattern at Thrive.",
      },
      {
        icon: "chart",
        title: "AI KPI tracking",
        body: "The reporting layer for the US investor engagement. Standardised intake across 50 companies, scoring against defined rubrics, trends over time, rolled up into a dashboard the investor reads without an analyst next to them.",
      },
    ],
    blocks: [
      {
        label: "Plus whatever ships next",
        body: "The retainer model below exists because your priorities move. Brand and visual work fits inside it too.",
      },
    ],
  },

  // Custom approach grid; titles added for the card format (TODO copy),
  // bodies are the draft bullets verbatim.
  approach: {
    heading: "How I work",
    items: [
      {
        icon: "users",
        title: "Reserved capacity",
        body: "Two days a week, reserved. Yours whether the week is one project or five.",
      },
      {
        // From the Odyssey proposal's approach grid.
        icon: "grid",
        title: "I work in systems",
        body: "I create reusable components whether it’s a feature or a design system.",
      },
      {
        // TODO copy: card written for this grid.
        icon: "zap",
        title: "I ship fast",
        body: "Quick iteration. We zoom through explorations until something feels right, then lock it in.",
      },
      {
        icon: "hammer",
        title: "Design to shipped",
        body: "I design in Figma and ship working interfaces directly when useful. At Thrive this cut the design to build loop from weeks to days.",
      },
      {
        // TODO copy: card written for this grid.
        icon: "compass",
        title: "AI-augmented workflow",
        body: "AI tooling runs through my whole process, from exploration to production code. More output from the same two days.",
      },
      {
        icon: "video",
        title: "Show and tell",
        body: "I frequently share work in progress via screen recording walkthroughs.",
      },
    ],
  },

  engagement: {
    tiers: [
      {
        // TODO copy: card label.
        label: "Design retainer",
        price: "950 EUR",
        per: "/ day",
        cadence: "2 days per week, fixed",
        // TODO copy: weekly and monthly rollup for faster decisions.
        priceNote: "1,900 EUR per week, around 8,200 EUR per month.",
        // TODO copy: draft terms joined into one card body, plus the
        // draft's working-model line restored.
        body: "Priorities set weekly with Kelly. Async by default, Berlin time. Invoiced monthly, from my German freelance business. Rolling engagement, one month notice either side. Extra days billed on top, agreed in advance.",
        response: "Available from September 9, 2026",
      },
    ],
  },

  nextStep: {
    // TODO copy: intro-call closer in the Odyssey style.
    heading: "Ready to move?",
    body: "Next step is a 30-minute intro call. We talk through Target Portal, AI KPI tracking and how the retainer works. If it fits, send me the paperwork and a first priority. I can start on the 9th. hi@guil.is, or Telegram.",
    // Prefilled subject so the mailto opens ready to send on mobile.
    ctaHref:
      "mailto:hi@guil.is?subject=Intro%20call%20-%20Code%20%26%20Co.%20proposal",
    ctaLabel: "Schedule an intro call",
    // Call-first close: no accept button on first touch.
    showAccept: false,
    showPortfolioLink: false,
  },

  metadata: {
    title: `${CLIENT_NAME} | Guil Maueler`,
    description: "Private proposal page",
  },
};
