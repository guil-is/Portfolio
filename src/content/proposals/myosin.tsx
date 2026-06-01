import type { Proposal } from "./types";

export const myosin: Proposal = {
  slug: "myosin",
  password: "kinesin",
  clientName: "Myosin",
  preparedFor: "Prepared for Mitch & Matt · Myosin",
  date: "May 2026",

  showApproach: false,

  hero: {
    title: "Hive Mind, launch demo video",
    blurb:
      "A 30-second animated product demo, built to make Hive Mind's strategist output impossible to ignore.",
  },

  brief: {
    blocks: [
      {
        label: "The ask",
        body: "A short animated social video demoing Hive Mind, your AI marketing strategist. The job: take a text-heavy product conversation and make it paced and engaging, not a flat screen recording. Loopable, built for the Product Hunt launch and paid social on LinkedIn and X.",
      },
      {
        label: "Format",
        body: "30 seconds. Snappy. Loopable. Designed to live across multiple channels, not just the site.",
      },
      {
        label: "The narrative",
        list: [
          "The output quality beats generic LLMs at brand strategy.",
          "The thinking is specialized, modeled on how a real strategist works.",
          "The moat is human knowledge, trained on real playbooks from Myosin's expert community.",
        ],
      },
      {
        label: "Creative direction",
        list: [
          "Don't ask viewers to read the full conversation. Highlight the phrases that hit and hold them on screen.",
          "Side-by-side: Hive Mind against a generic chatbot on the same prompt. Visual contrast, not two full demos.",
          "Real-people avatars feeding into the Hive Mind, showing the human knowledge behind the answers.",
          "An interplay between the live demo and simple kinetic text stating the value.",
          "Close on the CTA: Hire Hive Mind.",
        ],
      },
    ],
  },

  scope: {
    intro:
      "Eight scene units across 30 seconds, built from the Quick Hit demo script.",
    items: [
      "User prompt types into the chat.",
      "Strategist response forms, with highlight zooms on the sharpest lines.",
      "The three-phase structure animates as a clean sequence.",
      "Persona shift: a visual transition as the response style changes.",
      "Ghostwriter output generates, key line pulled forward.",
      "Avatars feed into the Hive Mind: the human-knowledge moat.",
      "Side-by-side comparison against a generic chatbot.",
      "Kinetic value line resolves into the Hire Hive Mind CTA.",
    ],
    outro:
      "Heaviest custom builds: the comparison scene and the avatar-moat sequence. The rest leans on brand and UI assets you provide.",
    provides: {
      label: "You provide",
      body: "Hive Mind product access, the Figma with branding and UI assets, and the existing brand asset pack including the 3D motion elements.",
    },
  },

  quote: {
    heading: "Two options",
    subheading:
      "Pick the lane that matches your runway. Option B is the recommended path if the Quick Hit format is repeating.",
    options: [
      {
        label: "Option A",
        title: "Single launch video",
        lead: "One 30-second animated demo, fully produced.",
        includes: [
          "Concept, script and storyboard pass",
          "Full animation and motion design across all eight scenes",
          "2 revision rounds",
          "Final delivery in formats for LinkedIn, X, and web (square and vertical)",
        ],
        prices: [{ label: "Fee", amount: "4,200 USD" }],
        timeline: "Timeline: 3 weeks, aligned to your Product Hunt launch",
      },
      {
        label: "Option B",
        title: "Quick Hit series",
        recommended: true,
        lead: "This is Quick Hit #8. The format repeats. Option B builds the launch video and turns it into a repeatable motion system, so every future Quick Hit ships faster and looks consistent.",
        includes: [
          "Everything in Option A for the launch video",
          "A reusable motion template system: scene structures, transitions, type treatment, and a consistent visual language across the Quick Hit series",
          "Reduced per-video rate on subsequent Quick Hits",
        ],
        prices: [
          { label: "Launch + system", amount: "6,500 USD" },
          { label: "Each Quick Hit after", amount: "2,600 USD" },
        ],
        timeline: "First delivery: 3 weeks",
        closing:
          "The system pays for itself by the third video and keeps the series visually coherent across every channel.",
      },
    ],
  },

  terms: {
    items: [
      "2 revision rounds per video. Further rounds quoted separately.",
      "Payment in fiat or stablecoin.",
      "50% on start, 50% on delivery for the first project. Net-15 on subsequent work.",
      "Timeline assumes assets delivered within the first few days of kickoff.",
    ],
  },

  nextStep: {
    heading: "Ready to start",
    body: "Reply to confirm which option works and I'll send a short agreement and a start date. Once the product access and brand assets land, I begin with the script and storyboard.",
    ctaHref: "mailto:guil@guil.is",
    ctaLabel: "Get in touch",
  },

  metadata: {
    title: "Myosin | Guil Maueler",
    description: "Private proposal page",
  },
};
