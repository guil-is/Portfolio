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

export type PaymentStatus = "due" | "invoiced" | "paid" | "overdue";

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
      status: "invoiced",
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
                "Sustainable Public Affairs, c/o Norrsken House Brussels, Rue du Commerce 72, Brussels, Belgium, represented by Lara Sibbing.",
              ],
              ["Project", "WinWin 2026, Brussels."],
              ["Dated", "Auto-filled on signing"],
            ],
          },
        ],
      },
      {
        heading: "1. The agreement",
        blocks: [
          {
            type: "p",
            text: "This agreement, together with the proposal at guil.is/for/spa/proposal, sets out the whole arrangement between the Provider and the Client for WinWin 2026. It replaces any earlier notes or discussions on the same work.",
          },
          {
            type: "p",
            text: "Any change to the scope, fee, or timeline is agreed in writing by both parties before that work proceeds. Email counts as writing.",
          },
        ],
      },
      {
        heading: "2. The work",
        blocks: [
          {
            type: "p",
            text: "Visual identity, invitation, and event website for WinWin 2026, delivered in four phases. Full scope as agreed in the proposal at guil.is/for/spa/proposal:",
          },
          {
            type: "ul",
            items: [
              "Visual identity and logo system, with mini brand guidelines for the event.",
              "Save-the-date and formal invitation, plus an early RSVP page.",
              "Event website, designed and built, with an RSVP flow.",
              "Brand assets and printed collateral.",
              "Two revision rounds per phase.",
            ],
          },
          {
            type: "p",
            text: "For high-volume on-site collateral (signage, badges, and similar), the Provider designs the system and the hero pieces, and the Client's team produces the rest from the templates the Provider supplies.",
          },
          {
            type: "p",
            text: "Not included unless agreed in writing: copywriting and translation, commissioned photography or illustration, third-party licences (fonts, stock, plugins, music), print production and shipping, website hosting and maintenance after handover, and any deliverables beyond the four phases above.",
          },
        ],
      },
      {
        heading: "3. Timeline",
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
        heading: "4. Working together",
        blocks: [
          {
            type: "ul",
            items: [
              "The Client supplies the content and assets each phase needs on time: copy, logos, speaker and partner details, product information, and any brand material to work from.",
              "The Client returns consolidated feedback within the agreed review window for each phase, usually two to three business days.",
              "The parties agree the main channel at kickoff (email or a shared workspace). During active production, the Provider replies within one business day.",
              "Each phase is reviewed and signed off before the next begins. If the Client sends no feedback within five business days of a delivery, that phase counts as approved and the next one proceeds.",
            ],
          },
        ],
      },
      {
        heading: "5. Fee",
        blocks: [
          {
            type: "p",
            text: "Fixed fee of 11,800 EUR net, billed by phase:",
          },
          {
            type: "kv",
            rows: [
              ["Phase 1-2 · Core identity + invite", "5,200 EUR"],
              ["Phase 3 · Full website + assets", "3,800 EUR"],
              ["Phase 4 · All deliverables (estimate)", "2,800 EUR"],
              ["Total (net)", "11,800 EUR"],
            ],
          },
          {
            type: "ul",
            items: [
              "Phase 4 (2,800 EUR) is a working estimate. Its scope and amount are confirmed together before that phase begins, and the total moves with it.",
              "VAT reverse charge applies: as an EU cross-border business-to-business service, the fee is invoiced net with no German VAT, and the Client accounts for VAT in Belgium. This requires the Client's valid EU VAT identification number.",
              "The fee covers design and build only. Third-party and production costs are separate: fonts, stock, plugins, print, and similar are billed at cost, quoted and approved before purchase.",
              "The website runs on the Client's own accounts for hosting, domain, and any third-party services (ticketing, email, and similar). Those subscriptions are the Client's cost.",
              "Invoiced to Sustainable Public Affairs.",
            ],
          },
        ],
      },
      {
        heading: "6. Payment",
        blocks: [
          {
            type: "ul",
            items: [
              "30% deposit (1,560 EUR) due on signing, credited to the first invoice.",
              "Each phase is invoiced at the end of its block, on a roughly bi-weekly cadence.",
              "Invoices payable within 14 days.",
              "Invoices unpaid after 14 days accrue statutory default interest under German law, and the Provider may pause work until the account is current.",
            ],
          },
        ],
      },
      {
        heading: "7. Revisions",
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
        heading: "8. Ownership",
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
        heading: "9. Confidentiality",
        blocks: [
          {
            type: "p",
            text: "The Provider keeps unreleased WinWin materials and Client information confidential until the Client's public launch. This does not apply to information that is already public or was lawfully known to the Provider before disclosure.",
          },
        ],
      },
      {
        heading: "10. Liability",
        blocks: [
          {
            type: "p",
            text: "The Provider is liable without limit for intent and gross negligence, and for injury to life, body, or health. For ordinary negligence, liability is limited to foreseeable damage typical for this kind of work, and in total to the fees paid under this agreement. The Provider is not liable for indirect or consequential loss, or for delays caused by late Client materials, feedback, or approvals.",
          },
        ],
      },
      {
        heading: "11. Cancellation",
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
        heading: "12. Independent contractor and governing law",
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

/** The phase currently in flight, or the next one up. Null when all done. */
export function currentMilestone(c: SpaClient): ProjectMilestone | null {
  return (
    c.milestones.find((m) => m.status === "in_progress") ??
    c.milestones.find((m) => m.status === "upcoming") ??
    null
  );
}

/** First unsettled payment, drives the "next up" line in the summary. */
export function nextPayment(c: SpaClient): PaymentMilestone | null {
  return c.payments.find((p) => p.status !== "paid") ?? null;
}
