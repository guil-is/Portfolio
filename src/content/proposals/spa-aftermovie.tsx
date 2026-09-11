import type { Proposal } from "./types";

/**
 * Video quote for WinWin 2026 (Sustainable Public Affairs). Separate from
 * the design agreement at /for/spa: video production, not design scope.
 * Lara asked for it on the 1 Sep and 8 Sep calls; SPA is choosing between
 * Guil and an event videographer (Roman Piola).
 *
 * v2, 11 Sep: same deliverables in both tiers (aftermovie in two formats,
 * a 48-hour teaser, every stage session recorded, no cap), the difference
 * is crew and kit only. Edit line identical on both cards so nobody asks
 * why "the same edit" costs less. Half up front, usage and portfolio
 * rights spelled out, filming notice on WinWin's side, the protocol
 * clause softened. Prices sit on the 10 Sep market check (DE aftermovie
 * packages 1,200 to 4,490 net, shoot days 800 to 1,500, assistant 250 to
 * 450). Travel is tickets only, Guil has a place to stay in Brussels.
 *
 * Kept short on purpose: a budget page the WinWin team can decide from
 * in one read. Copy edits happen on the page (?edit), see
 * docs/editing-proposals.md.
 */

const CLIENT_NAME = "WinWin 2026";

export const spaAftermovie: Proposal = {
  slug: "spa-aftermovie",
  // Same password as the client page, so Lara's existing link habit works.
  password: "winwin",
  defaultTheme: "light",
  clientName: CLIENT_NAME,
  preparedFor: "Prepared for Lara Sibbing · Sustainable Public Affairs",
  date: "September 2026",

  hero: {
    eyebrow: "Proposal",
    title: "WinWin 2026 video content creation",
    blurb:
      "A two-minute aftermovie for the comms push, a teaser within 48 hours, and every talk and pitch recorded in full. Two budget options, same deliverables.",
  },

  brief: {
    heading: "",
    blocks: [
      {
        label: "Previous event work",
        items: [
          {
            title: "Arbitrum GovHack 2024, ETHDenver",
            url: "https://www.youtube.com/watch?v=-0Bt-wQt8sE",
            caption: "Three-day hackathon. Aftermovie, daily recaps, every session recorded.",
          },
          {
            title: "The DAOist GGG 2022, Berlin",
            url: "https://youtu.be/LF0QYO7P_Cg",
            caption: "Conference aftermovie.",
          },
          {
            title: "Regen Village 2024, Brussels",
            url: "https://www.youtube.com/watch?v=FSCi_173Alw",
            caption: "Five days at the Commons Hub. Aftermovie.",
          },
        ],
      },
    ],
  },

  scope: {
    heading: "What you get",
    lists: [
      {
        label: "The aftermovie",
        list: [
          "About two minutes, in the WinWin identity. 16:9 for the site, vertical for LinkedIn.",
          "Licensed music, sound mix, colour grade. Two revision rounds.",
          "A 20-second teaser within 48 hours. First cut five working days after the event.",
        ],
      },
      {
        label: "Every talk and pitch",
        list: [
          "A locked-off camera on the stage, audio from the AV desk. Lav mic as fallback.",
          "Each session trimmed, title card and lower third, slides cut in where speakers share them, its own file. Ready for the site, YouTube, and the speakers themselves.",
          "All stage sessions. Delivered ten working days after the event.",
        ],
      },
      {
        label: "On the day",
        list: [
          "The stage during the talks, the main room in between. Breakout rooms as b-roll only, no audio, unless you ask.",
          "Run-of-show check at the venue the day before.",
        ],
      },
    ],
    provides: {
      label: "From the venue",
      body: "The run-of-show a week ahead, a line out from the AV desk, and a fixed camera spot with a clear view of the lectern. All of it can be settled at the venue visit.",
    },
  },

  timeline: {
    heading: "timeline",
    milestones: [
      {
        label: "By 10 October",
        title: "Go-ahead",
        body: "Crew, rental and cabinet accreditation need three weeks. Later works subject to availability.",
        kind: "start",
      },
      {
        label: "2 November",
        title: "Run-of-show check",
        body: "Morning, at the venue. AV feed and camera spot confirmed.",
      },
      {
        label: "3 November",
        title: "Shoot day",
      },
      {
        label: "5 November",
        title: "Teaser",
      },
      {
        label: "By 10 November",
        title: "Aftermovie first cut",
        body: "Then two revision rounds.",
      },
      {
        label: "By 17 November",
        title: "All talks delivered",
        kind: "end",
      },
    ],
  },

  quote: {
    heading: "Budget Options",
    subheading: "Net. VAT reverse charge, as on the rest of the project. Same deliverables in both; the difference is crew and kit.",
    options: [
      {
        label: "",
        title: "Professional",
        lead: "Rented cinema cameras and proper audio. Two angles on the stage during the talks, an assistant on the second camera. The room in between.",
        includes: [
          "Shoot day, me plus an assistant operator · 1,300",
          "Camera and audio rental · 450",
          "Aftermovie, teaser and vertical cut, edit and post · 2,000",
          "Talk recordings, edit and delivery · 800",
          "Travel Berlin–Brussels · 200",
        ],
        prices: [{ label: "Package", amount: "4,750 EUR" }],
        priceNote: "Cinema image: real depth of field, clean in low light, broadcast sound.",
        timeline: "Teaser 5 November, aftermovie 10 November, talks 17 November.",
        recommended: true,
      },
      {
        label: "Lighter budget",
        title: "Lightweight",
        lead: "Me alone, iPhones and my own compact kit. One camera on the stage during the talks. The room in between.",
        includes: [
          "Shoot day, solo, my own kit · 800",
          "Aftermovie, teaser and vertical cut, edit and post · 2,000",
          "Talk recordings, edit and delivery · 800",
          "Travel Berlin–Brussels · 200",
        ],
        prices: [{ label: "Package", amount: "3,800 EUR" }],
        priceNote: "Phone image: sharp, but \"fake\" depth of field and grainier in low light.",
        timeline: "Same dates.",
      },
    ],
  },

  terms: {
    heading: "Add-ons and terms",
    addons: {
      label: "Add-ons",
      items: [
        {
          title: "Speaker clips",
          detail: "Vertical, 30 to 45 seconds, captioned. One per speaker to share.",
          price: "200 EUR each",
        },
        {
          title: "Event photos",
          detail: "40 to 60 treated stills, delivered the next morning. Professional only.",
          price: "600 EUR",
        },
        {
          title: "Extra camera operator",
          detail: "Covers the breakout rooms with sound while the main stage runs.",
          price: "900 EUR + travel",
        },
        {
          title: "Extra revision round",
          detail: "Beyond the two included.",
          price: "250 EUR",
        },
        {
          title: "Raw footage",
          detail: "Every clip, organised and labelled, on a drive or a download link.",
          price: "250 EUR",
        },
      ],
    },
    itemsLabel: "Terms",
    items: [
      "Half on go-ahead, half on delivery. 14 days, reverse charge, like the rest of the project.",
      "You own the films: web and social use, worldwide, no time limit. Music is licensed for that use, not for paid ads or broadcast.",
      "Portfolio use only with your written OK.",
      "The filming notice and opt-out at registration are on WinWin's side. I keep anyone who opts out out of the cut.",
      "Footage of protected guests goes out only with their office's approval. I prepare a short filming plan for the cabinet after the venue visit. If protocol limits filming of a guest on the day, we film everything else and the day stands.",
      "Venue AV and third-party costs are not included.",
    ],
  },

  showApproach: false,

  nextStep: {
    heading: "Questions?",
    body: "Tell me on WhatsApp which package you'd like, or ask anything first. I'll confirm 3 November with a one-page addendum to our agreement.",
    ctaHref: "https://wa.me/4917676241374?text=Hi%20Guil%2C%20about%20the%20WinWin%20video%3A",
    ctaLabel: "Message me on WhatsApp",
    showAccept: false,
    showPortfolioLink: false,
  },

  metadata: {
    title: "WinWin 2026 video · Proposal",
    description: "Private proposal",
  },
};
