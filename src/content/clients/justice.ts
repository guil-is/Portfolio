/**
 * Data for the private client page at /for/justice.
 *
 * Update `hoursLog` each week: prepend a new week block at the top of
 * the array so the most recent week renders first on the page.
 */

export type HoursItem = {
  project: string;
  description: string;
  hours: number;
};

export type HoursWeek = {
  /** Display label, e.g. "Apr 6 – 10". */
  label: string;
  /** ISO date for the Monday of the week (used for sorting). */
  weekStart: string;
  items: HoursItem[];
  /** Optional one-line note for the weekly summary sent with the invoice. */
  note?: string;
};

export type SowSection = {
  heading: string;
  /** Paragraphs and/or bullet lists, rendered in order. */
  blocks: Array<
    | { type: "p"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "kv"; rows: Array<[string, string]> }
  >;
};

export type JusticeClient = {
  clientName: string;
  password: string;
  engagement: {
    startDate: string;
    rateUsd: number;
    weeklyHoursMin: number;
    weeklyHoursMax: number;
  };
  hoursLog: HoursWeek[];
  sow: {
    /** Bump this when the SOW content changes substantively. Previous
     * signatures remain valid records of what was signed then, but the
     * new version requires a fresh signature. */
    version: string;
    preamble: string;
    effectiveDate: string;
    sections: SowSection[];
    signatories: Array<[string, string]>;
    /** Wording of each checkbox the signer must tick. These exact
     * strings are stored on the signature record. */
    acknowledgments: string[];
  };
};

export const justice: JusticeClient = {
  clientName: "Justice Conder",
  password: "lobster",

  engagement: {
    startDate: "March 26, 2026",
    rateUsd: 120,
    weeklyHoursMin: 5,
    weeklyHoursMax: 10,
  },

  // Most recent week first. Add new weeks at the top.
  hoursLog: [
    {
      label: "Apr 13 – 17",
      weekStart: "2026-04-13",
      items: [
        { project: "Clawbank", description: "Launch / promo video", hours: 6 },
        { project: "Clawbank", description: "Blog page design", hours: 2 },
        { project: "Clawbank", description: "Audiogram asset + template", hours: 2 },
      ],
    },
    {
      label: "Apr 6 – 10",
      weekStart: "2026-04-06",
      items: [
        {
          project: "Clawbank",
          description:
            "Marketing assets — Twitter header, profile picture, X status update header",
          hours: 4,
        },
        { project: "Clawbank", description: "Design explorations", hours: 1 },
      ],
    },
  ],

  sow: {
    version: "v1-2026-03-26",
    preamble:
      "This document confirms the working agreement between Guilherme Maueler (designer) and Justice Conder (client).",
    effectiveDate: "March 26, 2026",
    acknowledgments: [
      "I have read and agree to the terms of this Statement of Work, and I consent to sign it electronically. My full name, email, and this confirmation together constitute my legal signature under the ESIGN Act and equivalent electronic signature laws.",
    ],
    sections: [
      {
        heading: "Scope of Work",
        blocks: [
          {
            type: "p",
            text: "Guil provides creative direction and design services for Justice on an ongoing basis, across any projects Justice brings to the engagement. The current active project is Clawbank. Additional projects may be added week to week by mutual agreement.",
          },
          {
            type: "p",
            text: "Specific priorities are set by Justice at the end of each week for the week ahead.",
          },
        ],
      },
      {
        heading: "Rate and Hours",
        blocks: [
          {
            type: "kv",
            rows: [
              ["Hourly rate", "$120 USD"],
              ["Weekly allocation", "5–10 hours ($600–1,200 / week cap)"],
            ],
          },
          {
            type: "ul",
            items: [
              "Justice is only billed for hours actually worked.",
              "If a week runs light, the cap does not roll over.",
              "If scope requires more than the cap in a given week, Guil flags it before going over.",
            ],
          },
        ],
      },
      {
        heading: "Billing",
        blocks: [
          {
            type: "ul",
            items: [
              "Guil logs hours weekly and shares a brief summary with each invoice.",
              "Invoices are issued weekly or bi-weekly, as agreed.",
              "Payment due within 7 days of invoice.",
              "Any project expenses (fonts, stock assets, tools, etc.) are billed at cost and approved by Justice in advance.",
            ],
          },
        ],
      },
      {
        heading: "Working Rhythm",
        blocks: [
          {
            type: "ul",
            items: [
              "Weekly sync at end of week (counts toward hours).",
              "Async delivery in between.",
              "Guil requests priorities a few days in advance to block focused work time.",
            ],
          },
        ],
      },
      {
        heading: "Start Date",
        blocks: [
          {
            type: "p",
            text: "This engagement begins March 26, 2026. Work done prior to this date is not billed.",
          },
        ],
      },
      {
        heading: "General Terms",
        blocks: [
          {
            type: "ul",
            items: [
              "Either party can pause or end the engagement with one week's notice.",
              "Work created under this agreement is owned by the client upon full payment.",
              "Guil may reference this work in his portfolio unless asked otherwise.",
            ],
          },
        ],
      },
      {
        heading: "Agreement",
        blocks: [
          {
            type: "p",
            text: "By acknowledging this document (a reply, a comment, or a message confirming you've read it), both parties confirm they understand and agree to the above terms.",
          },
        ],
      },
    ],
    signatories: [
      ["Designer", "Guilherme Maueler"],
      ["Client", "Justice Conder"],
      ["Effective date", "March 26, 2026"],
    ],
  },
};

// -------- Derived helpers --------

export function weekTotal(week: HoursWeek): number {
  return week.items.reduce((sum, i) => sum + i.hours, 0);
}

export function totalHours(weeks: HoursWeek[]): number {
  return weeks.reduce((sum, w) => sum + weekTotal(w), 0);
}

export function totalEarned(weeks: HoursWeek[], rate: number): number {
  return totalHours(weeks) * rate;
}
