import type { Proposal } from "./types";

/**
 * Add-on quote for WinWin 2026 (Sustainable Public Affairs): the event
 * video. Separate from the design agreement at /for/spa, quoted on its
 * own because it is video production, not design scope. Lara asked for
 * it on the 1 Sep and 8 Sep calls; SPA is choosing between Guil and an
 * event videographer (Roman Piola), so the edit-only option exists to
 * keep the brand in the edit either way.
 *
 * Pricing follows the GovHack 2024 media package (industry-standard
 * day rates), scaled to a one-day event in EUR. Travel is tickets only:
 * Guil has a place to stay in Brussels.
 *
 * TODO: add the TEDxBerlin 2026 and DWeb Camp 2026 videos to the
 * "Previous event work" media row once the links are to hand.
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
    titleContinuation:
      "An aftermovie for the comms push, and every talk recorded in full.",
    blurb: [
      "The real communication push happens after 3 November, and video is what carries it. One package covers the two things worth having: a two-minute aftermovie in the WinWin identity, and each main-stage talk recorded and edited so speakers, partners and press can watch or share them.",
      "I already know the brand from the inside, so the edit looks like the rest of WinWin rather than a generic event recap.",
    ],
  },

  brief: {
    heading: "The day",
    intro:
      "One day, one stage, roundtables in the breakout rooms. Around 150 invited guests at the Albert Rooftop and the Royal Library. Commissioners on the programme, confirmations landing late. Low buzz before, a real push after.",
    blocks: [
      {
        label: "What the video has to do",
        list: [
          "Give the post-event comms push its centrepiece: a short film people watch to the end and partners are proud to repost.",
          "Make every talk available in full, at a quality the speaker's own team would publish.",
          "Look like WinWin: the lockup, the motion system, the palette, running through titles and transitions.",
          "Arrive fast. The aftermovie lands within the week, while the event is still a conversation.",
        ],
      },
      {
        label: "Previous event work",
        items: [
          {
            title: "GovHack at ETHDenver · Day 1 recap",
            url: "https://www.youtube.com/watch?v=nBc6CW_c_UE",
            caption: "Three-day hackathon: daily recaps, full session recordings, interviews.",
          },
          {
            title: "GovHack at ETHDenver · Day 2 recap",
            url: "https://www.youtube.com/watch?v=OzW7ZPcuOq0",
          },
          {
            title: "GovHack at ETHDenver · Day 3 recap",
            url: "https://www.youtube.com/watch?v=DzYbD9FVOz0",
          },
          {
            title: "GovHack at ETHDenver · Stakeholder interview",
            url: "https://www.youtube.com/watch?v=9eRc01Rj7Mc",
            caption: "One of three edited interviews from the same event.",
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
          "About two minutes. 16:9 for the site, a 4:5 cut for LinkedIn.",
          "Titles, lockup and motion in the WinWin identity. Licensed music. Sound mix and colour grade.",
          "Two revision rounds on consolidated feedback.",
          "First cut within five working days of the event.",
        ],
      },
      {
        label: "The talk recordings",
        list: [
          "Every main-stage talk recorded in full from a locked-off camera, with a clean audio feed from the AV desk. Broadcast-quality speech, not room sound.",
          "Each talk trimmed, synced, given a branded title card and lower third, and exported as its own file. Ready for the site or YouTube.",
          "Up to eight talks included. Extra talks at 175 EUR each.",
          "Delivered within ten working days of the event.",
        ],
      },
      {
        label: "On the day",
        list: [
          "Me on site from doors to close. The stage camera runs continuously while I shoot the aftermovie material with a second camera, gimbal and audio.",
          "A creative brief and a run-of-show check the week before, so nothing on the day is left to chance.",
        ],
      },
    ],
    provides: {
      label: "What I need from the venue",
      body: "A line out from the AV desk (XLR or mini-jack) for the stage camera. A fixed spot with a clear view of the lectern and screen. The run-of-show a week ahead. We can settle all three at the venue visit.",
    },
  },

  timeline: {
    heading: "How it runs",
    milestones: [
      {
        label: "By 10 October",
        title: "Go-ahead",
        body: "Holds 3 November in my calendar.",
        kind: "start",
      },
      {
        label: "Week of 26 October",
        title: "Brief and run-of-show check",
        body: "Shot list agreed, AV feed and camera spot confirmed with the venue.",
      },
      {
        label: "3 November",
        title: "Shoot day",
        body: "Stage camera on every talk, second camera on everything else.",
      },
      {
        label: "By 10 November",
        title: "Aftermovie first cut",
        body: "Then two revision rounds on consolidated feedback.",
      },
      {
        label: "By 17 November",
        title: "Talk recordings delivered",
        body: "Each talk as its own file, branded and ready to publish.",
        kind: "end",
      },
    ],
    note: {
      label: "Add-ons",
      body: "A next-morning teaser, vertical speaker clips, event photos, a second operator for the breakout rooms, or a raw-footage handover. Priced under the quote.",
    },
  },

  quote: {
    heading: "The quote",
    subheading: "Net, VAT reverse charge as on the rest of the project.",
    options: [
      {
        label: "",
        title: "Shoot and edit",
        lead: "I film the day and deliver both the aftermovie and the talk recordings.",
        includes: [
          "Creative direction and prep · 700",
          "Shoot day, two cameras · 1,200",
          "Equipment · 550",
          "Aftermovie edit and post · 2,800",
          "Talk recordings, up to eight, edited and exported · 1,400",
          "File handling, admin, revisions · 400",
        ],
        prices: [
          { label: "Package", amount: "7,050 EUR" },
          { label: "Travel, at cost", amount: "≈ 150–250 EUR" },
        ],
        priceNote:
          "Travel is the Berlin–Brussels ticket only. I have a place to stay in Brussels.",
        timeline: "Aftermovie by 10 November, talk recordings by 17 November.",
        recommended: true,
      },
      {
        label: "If Roman shoots",
        title: "Edit only",
        lead: "Your videographer films, I keep the brand in the edit.",
        includes: [
          "Creative brief and shot list for the videographer · 500",
          "Aftermovie edit and post · 2,800",
          "Talk recordings, up to eight, edited and exported · 1,400",
          "File handling, admin, revisions · 400",
        ],
        prices: [{ label: "Fee", amount: "5,100 EUR" }],
        priceNote:
          "The videographer runs the stage camera on the AV feed. I'm happy to coordinate that with him directly.",
        timeline: "Same delivery dates, counted from receiving the footage.",
      },
    ],
    footnote:
      "Either way, the brand runs through every frame: I built it, so the titles, lockup and motion come from the same system as the site and the invitation.",
  },

  terms: {
    heading: "Add-ons and terms",
    kv: [
      ["Teaser on LinkedIn the next morning, 15–20 seconds", "500 EUR"],
      ["Vertical speaker clip, 30–45 seconds, captioned", "450 EUR each"],
      ["Event photos, 40–60 treated stills the next morning", "600 EUR"],
      ["Second camera operator for the breakout rooms", "1,650 EUR + travel"],
      ["Raw footage handover, organised and labelled", "300 EUR"],
      ["Extra talk recording beyond eight", "175 EUR each"],
      ["Extra revision round", "300 EUR"],
    ],
    items: [
      "Invoiced on delivery, payable within 14 days, like the rest of the project.",
      "Go-ahead by 10 October holds the date. After that, subject to availability.",
      "Music is licensed for online use. Speakers appear on the recordings by SPA's arrangement with them.",
      "Print, venue AV and third-party costs are not included.",
    ],
  },

  showApproach: false,

  nextStep: {
    heading: "Ready to book 3 November?",
    body: "Reply with the option you'd like and I'll confirm the date and send a one-page addendum to our agreement. The venue visit on the 15th is a good moment to check the AV feed and the camera spot.",
    ctaHref: "mailto:hello@guil.is?subject=WinWin%202026%20video",
    ctaLabel: "Confirm by email",
    showPortfolioLink: false,
  },

  metadata: {
    title: "WinWin 2026 on film · Proposal",
    description: "Private proposal",
  },
};
