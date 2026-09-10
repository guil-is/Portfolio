import type { Proposal } from "./types";

/**
 * Add-on quote for WinWin 2026 (Sustainable Public Affairs): the event
 * video. Separate from the design agreement at /for/spa, quoted on its
 * own because it is video production, not design scope. Lara asked for
 * it on the 1 Sep and 8 Sep calls; SPA is choosing between Guil and an
 * event videographer (Roman Piola). Two tiers: a professional shoot
 * (rented cameras, assistant operator) and a lightweight one (Guil alone
 * with iPhones and his own kit, guerrilla style like the DWeb Camp shoot
 * for Logos), same deliverables in both.
 *
 * Pricing follows the GovHack 2024 media package (industry-standard
 * day rates), scaled to a one-day event in EUR, then trimmed on 10 Sep
 * so it passes SPA's budget: no prep line, talk recordings included at no
 * extra charge, travel folded in at 150 (tickets only, Guil has a place to
 * stay in Brussels).
 *
 * Kept deliberately short: the WinWin team should be able to decide
 * from one read. Hero, three reference videos, what you get, how it
 * runs, two cards, add-ons, one closing line.
 *
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
    title: "WinWin 2026 on film",
    blurb:
      "A two-minute aftermovie for the comms push, and every talk recorded in full. Two ways to shoot it, depending on the look you want.",
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
            title: "TEDxBerlin 2026",
            url: "https://www.youtube.com/watch?v=C7ZcG00r6d8",
            caption: "Aftermovie, one day.",
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
          "About two minutes, in the WinWin identity: lockup, motion system, titles. 16:9 for the site, 4:5 for LinkedIn.",
          "Licensed music, sound mix, colour grade. Two revision rounds.",
          "First cut five working days after the event.",
        ],
      },
      {
        label: "Every talk, in full",
        list: [
          "A locked-off camera on the stage, fed from the AV desk. Clean speech, not room sound.",
          "Each talk trimmed, branded with a title card and lower third, exported as its own file. Ready for the site or YouTube.",
          "Up to eight talks. Delivered ten working days after the event.",
        ],
      },
      {
        label: "On the day",
        list: [
          "One camera locked on the stage for every talk, another in my hands for everything else.",
          "Run-of-show check the week before.",
        ],
      },
    ],
    provides: {
      label: "From the venue",
      body: "A line out from the AV desk, a fixed camera spot with a clear view of the lectern, and the run-of-show a week ahead. All three can be settled at the venue visit.",
    },
  },

  timeline: {
    heading: "How it runs",
    milestones: [
      {
        label: "By 10 October",
        title: "Go-ahead",
        body: "Holds 3 November.",
        kind: "start",
      },
      {
        label: "Week of 26 October",
        title: "Run-of-show check",
        body: "AV feed and camera spot confirmed.",
      },
      {
        label: "3 November",
        title: "Shoot day",
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
    heading: "The quote",
    subheading: "Net. VAT reverse charge, as on the rest of the project.",
    options: [
      {
        label: "",
        title: "Professional",
        lead: "Rented cinema cameras, an assistant camera operator, proper audio. The look you'd expect from a broadcast crew.",
        includes: [
          "Shoot day, me plus an assistant operator · 1,200",
          "Camera and audio rental · 550",
          "Aftermovie edit and post · 2,800",
          "Talk recordings, up to eight · included",
          "File handling, admin, revisions · 400",
          "Travel Berlin–Brussels · 150",
        ],
        prices: [{ label: "Package", amount: "5,100 EUR" }],
        priceNote: "Travel included. I have a place to stay in Brussels.",
        timeline: "Aftermovie by 10 November, talks by 17 November.",
        recommended: true,
      },
      {
        label: "Lighter budget",
        title: "Lightweight",
        lead: "Me alone with iPhones and the compact kit I own. Guerrilla style: fewer angles, less polish in low light, the same edit.",
        includes: [
          "Shoot day, solo, my own kit · 900",
          "Aftermovie edit and post · 2,400",
          "Talk recordings, up to eight · included",
          "File handling, admin, revisions · 300",
          "Travel Berlin–Brussels · 150",
        ],
        prices: [{ label: "Package", amount: "3,750 EUR" }],
        priceNote: "Good for LinkedIn and the site. Not the one for a big screen.",
        timeline: "Same delivery dates.",
      },
    ],
  },

  terms: {
    heading: "Add-ons and terms",
    addons: {
      label: "Add-ons, either package",
      items: [
        {
          title: "Next-morning teaser",
          detail: "15 to 20 seconds on LinkedIn while the day is still fresh.",
          price: "500 EUR",
        },
        {
          title: "Speaker clips",
          detail: "Vertical, 30 to 45 seconds, captioned. One per speaker to share.",
          price: "450 EUR each",
        },
        {
          title: "Event photos",
          detail: "40 to 60 treated stills, delivered the next morning.",
          price: "600 EUR",
        },
        {
          title: "Extra camera operator",
          detail: "Covers the breakout rooms while the main stage runs.",
          price: "1,650 EUR + travel",
        },
        {
          title: "Extra talk",
          detail: "Beyond the eight included.",
          price: "175 EUR each",
        },
        {
          title: "Extra revision round",
          detail: "Beyond the two included.",
          price: "300 EUR",
        },
        {
          title: "Raw footage",
          detail: "Every clip, organised and labelled, on a drive or a download link.",
          price: "300 EUR",
        },
      ],
    },
    itemsLabel: "Terms",
    items: [
      "Invoiced on delivery, payable within 14 days, like the rest of the project.",
      "A go-ahead by 10 October holds the date.",
      "Venue AV and third-party costs are not included.",
    ],
  },

  showApproach: false,

  nextStep: {
    heading: "Which one?",
    body: "Send me a message on WhatsApp with the option you'd like and I'll confirm the date with a one-page addendum to our agreement.",
    ctaHref: "https://wa.me/4917676241374?text=Hi%20Guil%2C%20about%20the%20WinWin%20video%3A",
    ctaLabel: "Message me on WhatsApp",
    showPortfolioLink: false,
  },

  metadata: {
    title: "WinWin 2026 on film · Proposal",
    description: "Private proposal",
  },
};
