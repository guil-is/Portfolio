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

export type DeliverableStatus = "upcoming" | "in_progress" | "done";

export type Deliverable = {
  title: string;
  /** Which phase it's billed under, shown as a small tag ("Phase 4"). */
  phase: string;
  status: DeliverableStatus;
  /** Shown when the row is opened: what it covers, what the client
   * supplies. Keep it to a couple of sentences. */
  detail?: string;
  /** ISO date delivered, once done. */
  date?: string;
  /** Optional link shown in the opened row (the live thing itself). */
  link?: { label: string; href: string };
};

export type PaymentStatus = "due" | "invoiced" | "paid" | "overdue";

export type PaymentMilestone = {
  label: string;
  description: string;
  amountEur: number;
  status: PaymentStatus;
  /** ISO date paid, if paid. */
  date?: string;
  /** Issued invoice number, if one exists. Must be registered in
   * src/content/invoices/issued.ts — the row then shows a PDF download
   * link served by /api/invoice/[number]. */
  invoiceNumber?: string;
};

export type SpaProject = {
  name: string;
  feeEur: number;
  startDate: string;
  targetDelivery: string;
};

export type ClientAction = {
  /** What the client needs to do, phrased to them ("Fill in..."). */
  text: string;
  /** Optional human-readable deadline, e.g. "By Friday, July 4". */
  due?: string;
  /** Optional link. `label` must be a phrase that appears inside `text`:
   * that phrase renders underlined and linked to `href` (in-page hash like
   * "#agreement" or a full URL). If the phrase isn't found, the text
   * renders plain. */
  link?: { label: string; href: string };
};

export type SpaClient = {
  clientName: string;
  password: string;
  project: SpaProject;
  milestones: ProjectMilestone[];
  /** Itemised checklist under the phases: everything still to land, one
   * row each, with detail on open. Flip `status` (and set `date`) as
   * items ship; the "n of m delivered" count derives from it. */
  deliverables?: {
    intro?: string;
    items: Deliverable[];
    /** Rendered after the list: exclusions, who pays for what. */
    note?: string;
  };
  payments: PaymentMilestone[];
  /** Open items the Client needs to act on, shown as a pending checklist
   * at the top of the Progress tab. Remove items as they're resolved;
   * remove the field (or empty the array) to hide the block. */
  pendingActions?: ClientAction[];
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
    // Keep this short: it renders as a large one-line stat value.
    targetDelivery: "Before Nov 3",
  },

  pendingActions: [
    {
      text: "Settle the Phase 3 invoice, 3,800 EUR.",
      due: "By Wednesday, September 16",
      link: { label: "Phase 3 invoice", href: "/api/invoice/INV-26020" },
    },
    {
      text: "Confirm the Phase 4 deliverables list, or flag anything to change, so that work can start.",
      due: "Before Phase 4 kicks off",
      link: { label: "Phase 4 deliverables list", href: "#deliverables" },
    },
  ],

  milestones: [
    {
      label: "Phase 1 · Week 1",
      title: "Discovery + explorations",
      description:
        "Discovery workshop and questionnaire, then a few distinct brand directions to explore together.",
      status: "approved",
    },
    {
      label: "Phase 2 · Week 2",
      title: "Core identity + invite",
      description:
        "Lock the direction, build the core identity, and ship the save-the-date before the summer break.",
      status: "approved",
    },
    {
      label: "Phase 3 · Weeks 3-4",
      title: "Full website + assets",
      description:
        "The event website, designed and deployed, plus additional brand assets.",
      status: "delivered",
      date: "2026-09-02",
    },
    {
      label: "Phase 4 · Weeks 5-6",
      title: "All deliverables",
      description:
        "Extended brand assets, printed collateral, and event materials for the day itself. Itemised in the deliverables list below.",
      status: "upcoming",
    },
  ],

  deliverables: {
    intro:
      "The whole project, one row each: delivered, in progress, and still to come. Open a row for what it covers and what your team supplies. The Phase 4 rows are what we agreed on our September 1 call: confirm the list, or flag anything to change, and that work starts.",
    items: [
      {
        title: "Discovery workshop and questionnaire",
        phase: "Phase 1",
        status: "done",
        detail:
          "Kickoff workshop plus the written questionnaire that set the brief: the one takeaway for attendees, the objection to design against, and the references to lean on and avoid.",
      },
      {
        title: "Three brand directions",
        phase: "Phase 1",
        status: "done",
        date: "2026-07-17",
        detail:
          "Minimal, bold, and a middle route, explored side by side. The bold direction was chosen and signed off on July 17.",
      },
      {
        title: "Visual identity and logo system",
        phase: "Phase 2",
        status: "done",
        detail:
          "Neon spectrum on cream, condensed Archivo display type, the generative WIN/WIN lockup, and the woven-strip motion system, with the never-on-dark rule. Applied across every asset since.",
      },
      {
        title: "Save-the-date email and animated header",
        phase: "Phase 2",
        status: "done",
        detail:
          "The first invitation email built as a Mailchimp master template with swappable zones, plus animated GIFs of the lockup for the header. Rebuilt for Outlook so the callout renders everywhere.",
      },
      {
        title: "Key visuals",
        phase: "Phase 2",
        status: "done",
        detail:
          "Two risograph-style illustrations in the brand (the thermal Atomium, which also animates as a loop, and the light burst between arches), plus the social share card.",
      },
      {
        title: "Event website with RSVP",
        phase: "Phase 3",
        status: "done",
        detail:
          "winwin.brussels: the save-the-date one-pager in the neon identity, RSVP wired to your Microsoft Forms, with a light brand treatment on the form itself.",
      },
      {
        title: "Partner logos and speaker slot on the site",
        phase: "Phase 3",
        status: "done",
        date: "2026-08-25",
        detail:
          "Four partner logos live (Norrsken, We Mean Business Coalition, Centre for Future Generations, CISL), added as each was cleared, and the official Commission photo in the speaker slot. More logos go in as they land.",
      },
      {
        title: "Branded document template and renderer",
        phase: "Phase 3",
        status: "done",
        detail:
          "The Anchor Partners info pack as a branded Google Doc template your team edits directly, plus winwin.brussels/doc, which turns any shared Google Doc into a branded, paginated PDF.",
      },
      {
        title: "Brand assets page",
        phase: "Phase 3",
        status: "done",
        detail:
          "Logo pack, palette, type, and usage rules in one place at winwin.brussels/brand, for your team, partners, and the venue's AV crew to pull from directly.",
        link: { label: "winwin.brussels/brand", href: "https://winwin.brussels/brand/" },
      },
      {
        title: "Site pages: programme, press, partners, Letter to the Future",
        phase: "Phase 3",
        status: "in_progress",
        detail:
          "Hidden pages on winwin.brussels instead of Word templates: pitcher, letter to the future, programme, press, partner kit. Flora sends the copy in Word and I transpose it. Password only where participant lists appear; the press kit and manifesto stay public.",
      },
      {
        title: "Second invitation round (reminder emails)",
        phase: "Phase 3",
        status: "in_progress",
        detail:
          "Claire duplicates the first email in Mailchimp and adapts the copy. I do the final design pass before each send.",
      },
      {
        title: "Main-stage backdrop",
        phase: "Phase 4",
        status: "upcoming",
        detail:
          "Print-ready artwork to the AV partner's spec. Your team sends the dimensions and places the print order.",
      },
      {
        title: "Roll-up banners",
        phase: "Phase 4",
        status: "upcoming",
        detail:
          "Four to six cardboard roll-ups in the one standard size. No date on them, so they work again next year: logo, tagline, website.",
      },
      {
        title: "LinkedIn speaker kit",
        phase: "Phase 4",
        status: "upcoming",
        detail:
          "Personal \"stay tuned\" cards for up to ten key speakers, speaker announcement posts for the WinWin account, and countdown visuals. Claire collects the speaker photos.",
      },
      {
        title: "Partner comms kit",
        phase: "Phase 4",
        status: "upcoming",
        detail:
          "Shareable graphics and ready-to-post copy blocks for partners, delivered as a kit on the site's partner page.",
      },
      {
        title: "Name stickers",
        phase: "Phase 4",
        status: "upcoming",
        detail:
          "One colour-coded template covering six roles (team, participant, speaker, roundtable host, moderator, roundtable speaker) plus blanks. Roundtable numbers stay hand-written so late host confirmations don't break the print run.",
      },
      {
        title: "Venue signage",
        phase: "Phase 4",
        status: "upcoming",
        detail:
          "Floor-tape navigation lines, arrow floor stickers, and standing signs. Placement planned at the venue walk-through mid-September.",
      },
      {
        title: "Event slide template",
        phase: "Phase 4",
        status: "upcoming",
        detail:
          "Welcome screens, interstitials, and a speaker slide template in the brand, ready for the AV team to run on the day.",
      },
    ],
    note:
      "Print production stays your cost, as in the agreement; I supply print-ready files. Not listed: the aftermovie (quoted separately) and table tents (parked until we know they're needed).",
  },

  payments: [
    {
      label: "Deposit",
      description: "30% on signing, credited to the first invoice",
      amountEur: 1560,
      status: "paid",
      date: "2026-07-15",
      invoiceNumber: "INV-26015",
    },
    {
      label: "Phase 1-2",
      description: "Balance at the end of week 2",
      amountEur: 3640,
      status: "paid",
      date: "2026-08-17",
      invoiceNumber: "INV-26016",
    },
    {
      label: "Phase 3",
      description: "At the end of week 4",
      amountEur: 3800,
      status: "invoiced",
      invoiceNumber: "INV-26020",
    },
    {
      label: "Phase 4",
      description: "At the end of week 6",
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
                "Guilherme Maueler (guil.is), Müggelstraße 15, 10247 Berlin, Germany, VAT DE308488034.",
              ],
              [
                "Client",
                "Sustainable Public Affairs, c/o Norrsken House Brussels, Rue du Commerce 72, Brussels, Belgium, VAT BE0642.953.216, represented by Lara Sibbing.",
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
              "VAT reverse charge applies: as an EU cross-border business-to-business service, the fee is invoiced net with no German VAT, and the Client accounts for VAT in Belgium under its VAT number stated in Parties.",
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
