import type { Proposal } from "./types";

export const myosin: Proposal = {
  slug: "myosin",
  password: "kinesin",
  clientName: "Myosin",
  preparedFor: "Prepared for Mitch & Matt · Myosin",
  date: "May 2026",

  showApproach: false,

  hero: {
    eyebrow: "Motion proposal",
    title: "Hivemind",
    titleContinuation: "launch demo video",
    blurb:
      "A 30-second animated product demo, built to make Hivemind's strategist output impossible to ignore.",
  },

  brief: {
    blocks: [
      {
        label: "The ask",
        body: "A short animated social video demoing Hivemind, your AI marketing strategist. The job: take a text-heavy product conversation and make it paced and engaging, not a flat screen recording. Loopable, built for the Product Hunt launch and paid social on LinkedIn and X.",
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
          "Side-by-side: Hivemind against a generic chatbot on the same prompt. Visual contrast, not two full demos.",
          "Real-people avatars feeding into the Hivemind, showing the human knowledge behind the answers.",
          "An interplay between the live demo and simple kinetic text stating the value.",
          "Close on the CTA: Hire Hivemind.",
        ],
      },
      {
        label: "References",
        items: [
          {
            title: "Asana",
            url: "https://www.youtube.com/watch?v=AW_PDcmjE-o",
          },
          {
            title: "Clawbank",
            url: "https://x.com/i/status/2050255828578394596",
            videoSrc: "/myosin/references/Clawbank_Formation.mp4",
          },
          {
            title: "Higgsfield MCP",
            url: "https://www.instagram.com/reel/DYsBA_kiP67/",
            videoSrc: "/myosin/references/Higgsfield_ClaudeCode.mp4",
          },
        ],
      },
    ],
  },

  scope: {
    intro:
      "A 30-second animated demo, scripted and storyboarded before any animation begins. The structure below is the shape of the piece. The exact scenes get locked together at the storyboard stage.",
    lists: [
      {
        label: "The shape",
        list: [
          "A hook that frames the problem fast.",
          "The live demo, with the sharpest lines pulled forward and held on screen.",
          "The human knowledge behind the answers, the moat that sets Hivemind apart.",
          "A clear contrast against a generic chatbot on the same prompt.",
          "A close on the CTA: Hire Hivemind.",
        ],
      },
      {
        label: "What's included",
        list: [
          "Narrative script and scene-by-scene storyboard.",
          "Soundtrack selection from a curated shortlist.",
          "Full animation and motion design for the 30-second piece.",
          "2 revision rounds, gated at storyboard and at first cut.",
          "Final delivery in vertical and square formats for LinkedIn, X, and web.",
        ],
      },
    ],
    provides: {
      label: "You provide",
      body: "Hivemind product access, the Figma with branding and UI assets, and the existing brand asset pack including the 3D motion elements.",
    },
  },

  timeline: {
    intro:
      "Two weeks from contract signing to final exports. Each milestone ships, you review, we move forward.",
    milestones: [
      {
        label: "Kickoff",
        title: "SOW + Assets",
        body: "You hand over product access, Figma, and brand assets.",
        kind: "start",
      },
      {
        label: "Direction",
        title: "Script, storyboard, soundtrack",
        body: "Revision round 1. Lock direction before animation.",
        kind: "deliverable",
      },
      {
        label: "Production",
        title: "Video first pass",
        body: "Full 30-second animation, primary format.",
        kind: "deliverable",
      },
      {
        label: "Polish",
        title: "Video second pass",
        body: "Revision round 2. Notes applied, format approved.",
        kind: "deliverable",
      },
      {
        label: "Delivery",
        title: "Format exports",
        body: "Vertical and square cuts for LinkedIn, X, and web.",
        kind: "end",
      },
    ],
  },

  quote: {
    options: [
      {
        label: "",
        title: "Hivemind launch video",
        lead: "One 30-second animated demo, fully produced.",
        includes: [
          "Concept, script and storyboard pass",
          "Full animation and motion design across all eight scenes",
          "2 revision rounds",
          "Final delivery in formats for LinkedIn, X, and web (square and vertical)",
        ],
        prices: [
          {
            label: "Fee",
            amount: "1,600 USD",
            previous: "1,920 USD",
          },
        ],
        priceNote:
          "First-engagement rate. 15% off my standard, to kick off working together.",
        timeline: "Timeline: 2 weeks from signing",
      },
    ],
  },

  terms: {
    items: [
      "2 revision rounds included. Edits outside these are billed at 120 USD per hour.",
      "Payment in fiat or stablecoin.",
      "50% on start, 50% on delivery.",
      "Timeline assumes assets delivered within the first few days of kickoff.",
    ],
  },

  nextStep: {
    heading: "Ready to start",
    body: "Reply to confirm and I'll send a short agreement and a start date. Once the product access and brand assets land, I begin with the script and storyboard.",
    ctaHref: "mailto:guil@guil.is",
    ctaLabel: "Get in touch",
  },

  metadata: {
    title: "Myosin | Guil Maueler",
    description: "Private proposal page",
  },
};
