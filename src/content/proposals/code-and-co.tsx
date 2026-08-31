import type { Proposal } from "./types";

/**
 * Retainer proposal for Code & Co. (codeandco.com), prepared for
 * Kelly Cheesman. Document-style page: no hero image, no case study
 * galleries, no portfolio cross-links — one audience, reads in under
 * two minutes. Copy is Guil's draft; deviations are marked TODO copy.
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
  },

  showApproach: false,

  brief: {
    // Empty heading: the block labels below act as the section titles.
    heading: "",
    blocks: [
      {
        label: "Who",
        body: [
          "Guil Maueler. Design Lead with 15 years across product, brand and design systems. Built and led the motion team at N26 during its global expansion. Most recently Design Lead at Thrive, a capital allocation platform turning dense on-chain and off-chain data into decisions non-experts can act on.",
          <a
            key="thrive-link"
            href="/projects/thrive-product"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-rule-soft underline-offset-4 transition-colors hover:text-muted"
          >
            See the Thrive product case study →
          </a>,
        ],
      },
      {
        label: "What I'd work on",
        body: [
          "You have more product work than hands. The two I know about:",
          <span key="target-portal">
            <strong className="font-semibold">Target Portal.</strong>{" "}Moving
            due diligence intake from forms to a guided, conversational flow.
            Target companies see what&rsquo;s missing, what it&rsquo;s worth,
            and how to fix it, without your team chasing documents by email. I
            designed this exact pattern at Thrive.
          </span>,
          <span key="ai-kpi">
            <strong className="font-semibold">AI KPI tracking.</strong>{" "}The
            reporting layer for the US investor engagement. Standardised
            intake across 50 companies, scoring against defined rubrics,
            trends over time, rolled up into a dashboard the investor reads
            without an analyst next to them.
          </span>,
          "Plus whatever ships next. The retainer model below exists because your priorities move. Brand and visual work fits inside it too.",
        ],
      },
      {
        label: "How I work",
        list: [
          "Two days a week, reserved. Yours whether the week is one project or five.",
          "Priorities set weekly with Kelly. Async by default, Berlin time.",
          "I design in Figma and ship working interfaces directly when useful. At Thrive this cut the design to build loop from weeks to days.",
          "More than two days needed in a week? Extra days billed on top, agreed in advance.",
        ],
      },
    ],
  },

  terms: {
    kv: [
      ["Day rate", "950 EUR"],
      ["Block", "2 days per week, fixed"],
      // TODO copy: capitalised "monthly" for the definition-list value.
      ["Invoicing", "Monthly, from my German freelance business"],
      // TODO copy: draft line "Rolling engagement, one month notice either
      // side" split into label + value for the definition list.
      ["Engagement", "Rolling, one month notice either side"],
      // TODO copy: draft line "Available from September 9, 2026" split into
      // label + value for the definition list.
      ["Available", "From September 9, 2026"],
    ],
  },

  nextStep: {
    heading:
      "If this works, send me the paperwork and a first priority. I can start on the 9th.",
    body: "hi@guil.is, or the usual Telegram.",
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
