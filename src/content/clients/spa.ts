/**
 * Data for the private client page at /for/spa.
 *
 * WinWin 2026 is a fixed-fee, phased project (visual identity, invitation,
 * website) for Sustainable Public Affairs. Like Myosin it carries a project
 * scope, a phase progress tracker, and a phased payment schedule, plus the
 * signable Service Agreement. Currency is EUR.
 *
 * Keeping it current:
 *   - Update each milestone's `status` (and `date` once reached) as phases
 *     move: upcoming -> in_progress -> delivered -> approved.
 *   - Update each payment's `status` (and `date` once paid): due -> invoiced
 *     -> paid.
 *   - Bump `sow.version` only if the agreement text changes substantively
 *     (a signed record stays valid for the version it was signed against).
 */

import type { SignableDocument } from "./types";

export type MilestoneStatus =
  | "upcoming"
  | "in_progress"
  | "delivered"
  | "approved";

export type ProjectMilestone = {
  /** Small caption above the title, e.g. "Phase 1 · Week 1". */
  label: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  /** ISO date this phase was delivered or approved, if reached. */
  date?: string;
};

export type PaymentStatus = "due" | "invoiced" | "paid";

export type PaymentMilestone = {
  label: string;
  description: string;
  amountEur: number;
  status: PaymentStatus;
  /** ISO date paid, if paid. */
  date?: string;
};

export type SpaProject = {
  name: string;
  feeEur: number;
  startDate: string;
  targetDelivery: string;
};

export type SpaClient = {
  clientName: string;
  password: string;
  project: SpaProject;
  milestones: ProjectMilestone[];
  payments: PaymentMilestone[];
  sow: SignableDocument;
};

export const spa: SpaClient = {
  clientName: "WinWin 2026",
  // Matches the proposal password so the client's existing link still works.
  password: "winwin",

  project: {
    name: "Identity, invitation, and website",
    feeEur: 11800,
    startDate: "July 7, 2026",
    targetDelivery: "Late August 2026",
  },

  milestones: [
    {
      label: "Phase 1 · Week 1",
      title: "Discovery + explorations",
      description:
        "Discovery workshop and questionnaire, then a few distinct brand directions to explore together.",
      status: "in_progress",
    },
    {
      label: "Phase 2 · Week 2",
      title: "Core identity + invite",
      description:
        "Lock the direction, build the core identity, and ship the save-the-date before the summer break.",
      status: "upcoming",
    },
    {
      label: "Phase 3 · Weeks 3-4",
      title: "Full website + assets",
      description:
        "The event website, designed and deployed, plus additional brand assets.",
      status: "upcoming",
    },
    {
      label: "Phase 4 · Weeks 5-6",
      title: "All deliverables",
      description:
        "Extended brand assets, printed collateral, and merch. Scope confirmed as needs firm up.",
      status: "upcoming",
    },
  ],

  payments: [
    {
      label: "Deposit",
      description: "30% on signing, credited to the first invoice",
      amountEur: 1560,
      status: "due",
    },
    {
      label: "Phase 1-2",
      description: "Balance at the end of week 2",
      amountEur: 3640,
      status: "due",
    },
    {
      label: "Phase 3",
      description: "At the end of week 4",
      amountEur: 3800,
      status: "due",
    },
    {
      label: "Phase 4",
      description: "At the end of week 6 (working estimate)",
      amountEur: 2800,
      status: "due",
    },
  ],

  sow: {
    title: "Service Agreement",
    version: "v1-2026-07-02",
    preamble:
      "Plain-language agreement covering the WinWin 2026 visual identity, invitation, and website for Sustainable Public Affairs. Questions before signing, just message me.",
    effectiveDate: "On signing",
    acknowledgments: [
      "I sign on behalf of Sustainable Public Affairs, and I have read and agree to the terms of this Service Agreement. I consent to sign it electronically. My full name, email, and this confirmation together form my legal signature under applicable electronic signature law.",
    ],
    sections: [
      {
        heading: "Parties",
        blocks: [
          {
            type: "kv",
            rows: [
              [
                "Provider",
                "Guilherme Maueler (guil.is), Müggelstraße 15, 10247 Berlin, Germany.",
              ],
              [
                "Client",
                "Sustainable Public Affairs (SPA), represented by Lara Sibbing.",
              ],
              ["Project", "WinWin 2026, Brussels, 29 October 2026."],
              ["Dated", "Auto-filled on signing"],
            ],
          },
        ],
      },
      {
        heading: "1. The work",
        blocks: [
          {
            type: "p",
            text: "Visual identity, invitation, and event website for WinWin 2026, delivered in four phases. Full scope as agreed in the proposal at guil.is/for/spa:",
          },
          {
            type: "ul",
            items: [
              "Visual identity and logo system, with mini brand guidelines for the event.",
              "Save-the-date and formal invitation, plus an early RSVP page.",
              "Event website, designed and built, linking to Ticket Tailor.",
              "Extended brand assets, printed collateral, and a merch starter set.",
              "Two revision rounds per phase.",
            ],
          },
          {
            type: "p",
            text: "For high-volume on-site collateral (signage, badges, and similar), I design the system and the hero pieces, and the Client's team produces the rest from the templates I provide.",
          },
        ],
      },
      {
        heading: "2. Timeline",
        blocks: [
          {
            type: "ul",
            items: [
              "Work starts Tuesday 7 July 2026. Six to seven weeks in total, wrapping by late August.",
              "The save-the-date ships before the summer break, around mid-July.",
              "The timeline depends on the Client returning feedback within the agreed review windows. Delays in Client feedback or asset delivery shift the delivery dates by the equivalent time, and are not a breach by the Provider.",
            ],
          },
        ],
      },
      {
        heading: "3. Fee",
        blocks: [
          {
            type: "ul",
            items: [
              "Total fee: 11,800 EUR net, plus 19% German VAT.",
              "Phase 4 (2,800 EUR) is a working estimate. Its scope and amount are confirmed together before that phase begins, and the total moves with it.",
              "Invoiced to Sustainable Public Affairs.",
            ],
          },
        ],
      },
      {
        heading: "4. Payment",
        blocks: [
          {
            type: "ul",
            items: [
              "30% deposit (1,560 EUR) due on signing, credited to the first invoice.",
              "Each phase is invoiced at the end of its block, on a roughly bi-weekly cadence.",
              "Invoices payable within 14 days.",
            ],
          },
        ],
      },
      {
        heading: "5. Revisions",
        blocks: [
          {
            type: "ul",
            items: [
              "Includes two rounds of revisions per phase, within the agreed scope.",
              "Additional rounds or work beyond the agreed scope are billed hourly, quoted and approved before the work.",
            ],
          },
        ],
      },
      {
        heading: "6. Optional retainer",
        blocks: [
          {
            type: "p",
            text: "After delivery, the Client may keep the Provider on an optional retainer through September and October (around 5 hours per week) to maintain the website and cover small design requests. Billed monthly at a rate agreed separately.",
          },
        ],
      },
      {
        heading: "7. Ownership",
        blocks: [
          {
            type: "ul",
            items: [
              "On full payment, the Client owns the final delivered identity, invitation, and website, and may use them across any channel.",
              "The Provider retains ownership of source and working files, and may show the work in their portfolio unless the Client requests otherwise in writing.",
              "Third-party or licensed assets (fonts, stock, plugins) remain under their own licenses and are billed at cost.",
            ],
          },
        ],
      },
      {
        heading: "8. Cancellation",
        blocks: [
          {
            type: "ul",
            items: [
              "Either party may cancel in writing.",
              "If the Client cancels after work has begun, the deposit is non-refundable and covers work done to that point. Any completed work beyond the deposit value is billed pro-rata for the phase in progress.",
            ],
          },
        ],
      },
      {
        heading: "9. Confidentiality",
        blocks: [
          {
            type: "p",
            text: "The Provider keeps unreleased WinWin materials and Client information confidential until the Client's public launch.",
          },
        ],
      },
      {
        heading: "10. Independent contractor and governing law",
        blocks: [
          {
            type: "p",
            text: "The Provider is an independent contractor, responsible for their own taxes and insurance. Nothing here creates an employment relationship. This agreement is governed by the laws of the Federal Republic of Germany.",
          },
        ],
      },
      {
        heading: "Acceptance",
        blocks: [
          {
            type: "p",
            text: "Guilherme Maueler issues this agreement, and issuing it is his acceptance of these terms. Sustainable Public Affairs accepts by signing below. Both parties are then bound, with no second signature block needed.",
          },
        ],
      },
    ],
    signatories: [
      ["Provider", "Guilherme Maueler"],
      ["Client", "Sustainable Public Affairs, Lara Sibbing"],
      ["Date signed", "Auto-filled on signing"],
    ],
  },
};

// -------- Derived helpers --------

export function totalPaid(c: SpaClient): number {
  return c.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountEur, 0);
}

export function totalOutstanding(c: SpaClient): number {
  return c.project.feeEur - totalPaid(c);
}

/** Completed phases over total, drives the progress summary. */
export function milestonesComplete(c: SpaClient): number {
  return c.milestones.filter(
    (m) => m.status === "delivered" || m.status === "approved",
  ).length;
}
