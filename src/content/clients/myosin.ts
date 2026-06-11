/**
 * Data for the private client page at /for/myosin.
 *
 * Myosin is a one-off project client (the Hivemind launch video), not a
 * retainer. So instead of a billed-hours log it carries a fixed project
 * scope, a milestone progress tracker, and a two-part payment schedule.
 * The `sow` here is the signable Service Agreement.
 */

import type { SignableDocument } from "./types";

export type MilestoneStatus =
  | "upcoming"
  | "in_progress"
  | "delivered"
  | "approved";

export type ProjectMilestone = {
  /** Small caption above the title, e.g. "Direction". */
  label: string;
  /** Milestone title, e.g. "Script, storyboard, soundtrack". */
  title: string;
  /** One-line description of what ships at this step. */
  description?: string;
  status: MilestoneStatus;
  /** ISO date this step was delivered or approved, if reached. */
  date?: string;
};

export type PaymentStatus = "due" | "invoiced" | "paid";

export type PaymentMilestone = {
  /** Short label, e.g. "Deposit". */
  label: string;
  /** When the payment falls due, e.g. "50% to begin". */
  description: string;
  amountUsd: number;
  status: PaymentStatus;
  /** ISO date paid, if paid. */
  date?: string;
};

export type MyosinProject = {
  name: string;
  feeUsd: number;
  startDate: string;
  targetDelivery: string;
};

export type MyosinClient = {
  clientName: string;
  password: string;
  project: MyosinProject;
  /** Ordered project milestones, first to last. */
  milestones: ProjectMilestone[];
  /** Two-part payment schedule (deposit, balance). */
  payments: PaymentMilestone[];
  /** The signable Service Agreement. */
  sow: SignableDocument;
};

export const myosin: MyosinClient = {
  clientName: "Myosin",
  // Matches the proposal password so the client's existing link still works.
  password: "kinesin",

  project: {
    name: "Hivemind launch video",
    feeUsd: 1600,
    startDate: "June 9, 2026",
    targetDelivery: "June 18, 2026",
  },

  // First to last. Update `status` (and `date` once reached) as the
  // project moves. Statuses: upcoming → in_progress → delivered → approved.
  milestones: [
    {
      label: "Kickoff",
      title: "Agreement + assets",
      description:
        "Sign the agreement and hand over product access, the Figma, and the brand pack.",
      status: "approved",
      date: "2026-06-11",
    },
    {
      label: "Direction",
      title: "Script, storyboard, soundtrack",
      description: "Lock the direction before animation. Review point one.",
      status: "in_progress",
    },
    {
      label: "Production",
      title: "Launch-ready cut",
      description:
        "Full 30-second animation, primary format. Review point two.",
      status: "upcoming",
    },
    {
      label: "Polish",
      title: "Notes applied",
      description: "Second revision round, format approved.",
      status: "upcoming",
    },
    {
      label: "Delivery",
      title: "Final exports",
      description: "Square and vertical cuts for LinkedIn, X, and web.",
      status: "upcoming",
    },
  ],

  payments: [
    {
      label: "Deposit",
      description: "50% before work begins",
      amountUsd: 800,
      status: "invoiced",
    },
    {
      label: "Balance",
      description: "50% on the launch-ready cut",
      amountUsd: 800,
      status: "due",
    },
  ],

  sow: {
    title: "Service Agreement",
    version: "v1-2026-06-08",
    preamble:
      "Plain-language agreement covering the Hivemind launch video. Questions before signing, just message me.",
    effectiveDate: "On signing",
    acknowledgments: [
      "I have read and agree to the terms of this Service Agreement, and I consent to sign it electronically. My full name, email, and this confirmation together constitute my legal signature under the ESIGN Act and equivalent electronic signature laws.",
    ],
    sections: [
      {
        heading: "Parties",
        blocks: [
          {
            type: "kv",
            rows: [
              ["Provider", "Guilherme Maueler (guil.is), Berlin, Germany"],
              ["Client", "Myosin"],
              ["Date", "Auto-filled on signing"],
            ],
          },
        ],
      },
      {
        heading: "1. The work",
        blocks: [
          {
            type: "p",
            text: "A 30-second animated launch video for Myosin's product, Hivemind. Scope as agreed in the proposal at guil.is/for/myosin:",
          },
          {
            type: "ul",
            items: [
              "Concept, script and storyboard pass",
              "Full animation and motion design",
              "2 revision rounds",
              "Final delivery in formats for LinkedIn, X, and web (square and vertical)",
            ],
          },
        ],
      },
      {
        heading: "2. Timeline",
        blocks: [
          {
            type: "ul",
            items: [
              "Work starts Tuesday 9 June 2026, on receipt of all assets (product access, Figma, brand pack).",
              "A launch-ready cut delivered by 18 June 2026.",
              "Final polished exports delivered shortly after launch.",
              "The timeline depends on the Client returning feedback at the two review points (storyboard and first cut) within one business day. Delays in Client feedback or asset delivery shift the delivery date by the equivalent time, and are not a breach by the Provider.",
            ],
          },
        ],
      },
      {
        heading: "3. Fee and payment",
        blocks: [
          {
            type: "ul",
            items: [
              "Total fee: 1,600 USD (first-engagement rate, 15% off the standard 1,920 USD).",
              "50% (800 USD) due before work begins. Remaining 50% (800 USD) due on delivery of the launch-ready cut.",
              "Payment in USD, by fiat bank transfer or USD stablecoin (USDC), Client's choice.",
              "Invoices payable within 7 days.",
            ],
          },
        ],
      },
      {
        heading: "4. Revisions",
        blocks: [
          {
            type: "ul",
            items: [
              "Includes 2 rounds of revisions within the agreed scope.",
              "Additional revisions or changes beyond the agreed scope are billed at 120 USD per hour, quoted and approved before work.",
            ],
          },
        ],
      },
      {
        heading: "5. Ownership",
        blocks: [
          {
            type: "ul",
            items: [
              "On final payment, the Client owns the final delivered video and may use it across any channel.",
              "The Provider retains ownership of project files, source files, and working assets, and may show the final work in their portfolio unless the Client requests otherwise in writing.",
              "Third-party or licensed assets (fonts, stock, music) remain under their own licenses.",
            ],
          },
        ],
      },
      {
        heading: "6. Cancellation",
        blocks: [
          {
            type: "ul",
            items: [
              "Either party may cancel in writing.",
              "If the Client cancels after work has begun, the 50% deposit is non-refundable and covers work done to that point. Any work completed beyond the deposit value is billed pro-rata.",
            ],
          },
        ],
      },
      {
        heading: "7. Confidentiality",
        blocks: [
          {
            type: "p",
            text: "The Provider keeps Client product information and unreleased materials confidential until the Client's public launch.",
          },
        ],
      },
      {
        heading: "8. Independent contractor",
        blocks: [
          {
            type: "p",
            text: "The Provider is an independent contractor, responsible for their own taxes and insurance. Nothing here creates an employment relationship.",
          },
        ],
      },
    ],
    signatories: [
      ["Provider", "Guilherme Maueler"],
      ["Client", "Myosin"],
      ["Date signed", "Auto-filled on signing"],
    ],
  },
};

// -------- Derived helpers --------

export function totalPaid(c: MyosinClient): number {
  return c.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountUsd, 0);
}

export function totalOutstanding(c: MyosinClient): number {
  return c.project.feeUsd - totalPaid(c);
}

/** Index of the first milestone not yet delivered/approved, i.e. the one
 * currently in flight. Returns the count when everything is done. */
export function currentMilestoneIndex(c: MyosinClient): number {
  const i = c.milestones.findIndex(
    (m) => m.status === "upcoming" || m.status === "in_progress",
  );
  return i === -1 ? c.milestones.length : i;
}

/** Completed milestones over total — drives the progress summary. */
export function milestonesComplete(c: MyosinClient): number {
  return c.milestones.filter(
    (m) => m.status === "delivered" || m.status === "approved",
  ).length;
}
