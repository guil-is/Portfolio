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
    title: `Design support for ${CLIENT_NAME}`,
    blurb:
      "Guil Maueler. Design Lead with 15 years across product, brand and design systems. Built and led the motion team at N26 during its global expansion. Most recently Design Lead at Thrive, a capital allocation platform turning dense on-chain and off-chain data into decisions non-experts can act on.",
  },

  caseStudies: [
    {
      sectionLabel: "Recent work",
      meta: "Design Lead · Product, Brand & Design Systems · 2025–2026",
      title: "Thrive",
      // Links to the full case study at guil.is/projects/thrive-product.
      url: "/projects/thrive-product",
      // TODO copy: case study framing written for this proposal.
      problem:
        "Thrive scores capital allocation with dense on-chain and off-chain data. The hard part was intake: getting structured, verifiable information out of people without chasing them, then turning it into decisions non-experts can act on.",
      // TODO copy: assembled from the draft's Thrive references.
      whatIShipped:
        "Product UI across intake, verification and decision flows. A guided intake pattern that shows what’s missing, what it’s worth, and how to fix it. Design system, and working interfaces shipped directly — cutting the design to build loop from weeks to days.",
      galleryFolder: "code-and-co/thrive",
      // TODO copy: relevance line written for this proposal.
      relevance:
        "Target Portal is this exact pattern: guided, conversational intake instead of forms and email chases. I have designed and shipped it once already.",
    },
  ],

  brief: {
    heading: "What I'd work on",
    intro: "You have more product work than hands. The two I know about:",
    blocks: [
      {
        label: "Target Portal",
        body: "Moving due diligence intake from forms to a guided, conversational flow. Target companies see what’s missing, what it’s worth, and how to fix it, without your team chasing documents by email. I designed this exact pattern at Thrive.",
      },
      {
        label: "AI KPI tracking",
        body: "The reporting layer for the US investor engagement. Standardised intake across 50 companies, scoring against defined rubrics, trends over time, rolled up into a dashboard the investor reads without an analyst next to them.",
      },
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
        icon: "grid",
        title: "Reserved capacity",
        body: "Two days a week, reserved. Yours whether the week is one project or five.",
      },
      {
        icon: "users",
        title: "Weekly priorities",
        body: "Priorities set weekly with Kelly. Async by default, Berlin time.",
      },
      {
        icon: "hammer",
        title: "Design to shipped",
        body: "I design in Figma and ship working interfaces directly when useful. At Thrive this cut the design to build loop from weeks to days.",
      },
      {
        icon: "zap",
        title: "Room to flex",
        body: "More than two days needed in a week? Extra days billed on top, agreed in advance.",
      },
    ],
  },

  engagement: {
    // TODO copy: section framing written for the card format.
    heading: "One offer, one price.",
    subheading:
      "A fixed block of two days per week, reserved for Code & Co. No tiers, no minimum project size.",
    tiers: [
      {
        // TODO copy: card label.
        label: "Design retainer",
        price: "950 EUR",
        per: "/ day",
        cadence: "2 days per week, fixed",
        // TODO copy: draft terms joined into one card body.
        body: "Invoiced monthly, from my German freelance business. Rolling engagement, one month notice either side. Extra days billed on top, agreed in advance.",
        response: "Available from September 9, 2026",
      },
    ],
  },

  nextStep: {
    // TODO copy: short closer heading in the Odyssey style.
    heading: "Ready when you are.",
    body: "If this works, send me the paperwork and a first priority. I can start on the 9th. hi@guil.is, or the usual Telegram.",
    ctaHref: "mailto:hi@guil.is",
    // TODO copy: CTA button label not in the draft.
    ctaLabel: "Email me",
    showPortfolioLink: false,
  },

  metadata: {
    title: `${CLIENT_NAME} | Guil Maueler`,
    description: "Private proposal page",
  },
};
