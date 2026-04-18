/**
 * Data for the private client page at /for/justice.
 *
 * Update `hoursLog` after each bi-weekly invoice cycle:
 * prepend a new period block at the top of the array so the most
 * recent period renders first on the page.
 */

export type HoursItem = {
  project: string;
  description: string;
  hours: number;
};

export type Invoice = {
  /** Optional human identifier shown in the UI (e.g. "INV-001"). */
  number?: string;
  /** ISO date the invoice was sent. */
  issuedAt: string;
  /** ISO date payment was received. Undefined = outstanding. */
  paidAt?: string;
};

export type HoursPeriod = {
  /** Display label, e.g. "Apr 6 – 17, 2026". */
  label: string;
  /** ISO date for the Monday of the first week (used for sorting). */
  weekStart: string;
  /** Number of weeks the period covers. Defaults to 2 (bi-weekly). */
  weeks?: number;
  items: HoursItem[];
  /** Optional one-line context shown alongside the period. */
  note?: string;
  /** Invoice metadata. Omit while a period is still in progress. */
  invoice?: Invoice;
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
  hoursLog: HoursPeriod[];
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

  // Most recent period first. Add new periods at the top.
  hoursLog: [
    {
      label: "Apr 6 – 17, 2026",
      weekStart: "2026-04-06",
      weeks: 2,
      items: [
        {
          project: "Clawbank",
          description:
            "Marketing assets — Twitter header, profile picture, X status update header",
          hours: 4,
        },
        { project: "Clawbank", description: "Design explorations", hours: 1 },
        { project: "Clawbank", description: "Launch / promo video", hours: 6 },
        { project: "Clawbank", description: "Blog page design", hours: 2 },
        { project: "Clawbank", description: "Audiogram asset + template", hours: 2 },
      ],
      invoice: {
        number: "INV-26005",
        issuedAt: "2026-04-18",
      },
    },
    {
      label: "Mar 23 – Apr 3, 2026",
      weekStart: "2026-03-23",
      weeks: 2,
      note: "Two-week kickoff — hours not tracked per task, logged as a block.",
      items: [
        {
          project: "Justice Conder",
          description: "Discovery, branding, logo design, website design",
          hours: 10,
        },
      ],
      invoice: {
        number: "INV-26004",
        issuedAt: "2026-04-03",
        paidAt: "2026-04-04",
      },
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
            text: "Guil provides creative direction and design services for Justice on an ongoing basis, across any projects Justice brings to the engagement. Projects may be added, paused, or reprioritized week to week by mutual agreement.",
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

export const DEFAULT_PERIOD_WEEKS = 2;

export function periodWeeks(p: HoursPeriod): number {
  return p.weeks ?? DEFAULT_PERIOD_WEEKS;
}

export function periodTotal(p: HoursPeriod): number {
  return p.items.reduce((sum, i) => sum + i.hours, 0);
}

export function totalHours(periods: HoursPeriod[]): number {
  return periods.reduce((sum, p) => sum + periodTotal(p), 0);
}

export function totalEarned(periods: HoursPeriod[], rate: number): number {
  return totalHours(periods) * rate;
}

export function periodAmount(p: HoursPeriod, rate: number): number {
  return periodTotal(p) * rate;
}

export function totalPaid(periods: HoursPeriod[], rate: number): number {
  return periods
    .filter((p) => p.invoice?.paidAt)
    .reduce((sum, p) => sum + periodAmount(p, rate), 0);
}

export function totalOutstanding(periods: HoursPeriod[], rate: number): number {
  return totalEarned(periods, rate) - totalPaid(periods, rate);
}

/** If every item in a period shares one project, return that name. */
export function singleProject(p: HoursPeriod): string | null {
  const first = p.items[0]?.project;
  if (!first) return null;
  return p.items.every((i) => i.project === first) ? first : null;
}

export type PaceStatus = {
  state: "on" | "over" | "under";
  /** Hours over (positive) or under (negative) the nearest bound. */
  delta: number;
  /** Lower bound of expected hours for this period. */
  min: number;
  /** Upper bound of expected hours for this period. */
  max: number;
};

export function paceStatus(
  p: HoursPeriod,
  engagement: JusticeClient["engagement"],
): PaceStatus {
  const weeks = periodWeeks(p);
  const min = engagement.weeklyHoursMin * weeks;
  const max = engagement.weeklyHoursMax * weeks;
  const total = periodTotal(p);
  if (total > max) return { state: "over", delta: total - max, min, max };
  if (total < min) return { state: "under", delta: total - min, min, max };
  return { state: "on", delta: 0, min, max };
}

export type InvoiceStatus =
  | { kind: "pending" }
  | { kind: "issued"; issuedAt: string; number?: string }
  | { kind: "paid"; issuedAt: string; paidAt: string; number?: string };

export function invoiceStatus(p: HoursPeriod): InvoiceStatus {
  if (!p.invoice) return { kind: "pending" };
  if (p.invoice.paidAt) {
    return {
      kind: "paid",
      issuedAt: p.invoice.issuedAt,
      paidAt: p.invoice.paidAt,
      number: p.invoice.number,
    };
  }
  return {
    kind: "issued",
    issuedAt: p.invoice.issuedAt,
    number: p.invoice.number,
  };
}
