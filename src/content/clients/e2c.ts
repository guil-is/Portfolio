/**
 * Data for the private client page at /for/e2c.
 *
 * E2C Cookbook redesign for Tara Merk and Primavera De Filippi, funded
 * through a CNRS research grant. The engagement covers the full redesign
 * of the E2C Cookbook report: cover, layout system, spot illustrations,
 * infographics, and final print and web PDFs. Final files land by
 * 21 August 2026, one week before the launch event on 28 August.
 *
 * All copy for the page lives in this file: the signable agreement
 * (`sow`) and the phase timeline (`phases`). Edit content here, not in
 * the component.
 *
 * Keeping it current:
 *   - Bump `currentPhase` as the project moves. It is the index of the
 *     phase in flight (0 through 3). Set it to `phases.length` (4) when
 *     everything is delivered. Statuses derive from this one value.
 *   - Bump `sow.version` only if the agreement text changes substantively.
 *
 * TODO before sharing with the client: the fee amount in "5. Fee" is a
 * placeholder ([FEE]). Fill in the agreed number.
 */

import type { SignableDocument } from "./types";

/** Client legal entity, recorded on the signature (`clientEntity`). */
export const CLIENT_ENTITY =
  "Centre National de la Recherche Scientifique (CNRS)";

export type E2cPhase = {
  /** Small caption above the title, e.g. "Phase 0". */
  label: string;
  /** Human-readable date window, e.g. "Before 28 July". */
  window: string;
  title: string;
  description: string;
  /** Concrete deliverables inside the phase. */
  items: string[];
};

export type E2cClient = {
  clientName: string;
  password: string;
  subtitle: string;
  /** Index of the phase currently in flight (0-based). Set to
   * `phases.length` when all phases are done. The single value to
   * update as the project moves. */
  currentPhase: number;
  finalDelivery: string;
  launchEvent: string;
  phases: E2cPhase[];
  sow: SignableDocument;
};

export const e2c: E2cClient = {
  clientName: "E2C Cookbook",
  password: "cookbook",
  subtitle:
    "Redesign of the E2C Cookbook for Tara Merk and Primavera De Filippi. A CNRS research grant project.",

  currentPhase: 0,
  finalDelivery: "21 August",
  launchEvent: "28 August",

  phases: [
    {
      label: "Phase 0",
      window: "Before 28 July",
      title: "Paperwork and groundwork",
      description:
        "Clear the admin and set up the work before design starts.",
      items: [
        "Agreement signed and invoice sent.",
        "Read the full report.",
        "Audit every asset the report needs.",
        "Collect reference reports from Tara and Primavera.",
      ],
    },
    {
      label: "Phase 1",
      window: "28 July to 2 August",
      title: "Cover directions and layout system",
      description: "First visual material to react to.",
      items: [
        "First cover drafts.",
        "A spot illustration.",
        "First infographic: before and after E2C.",
        "Layout system shown on the first pages of the report.",
      ],
    },
    {
      label: "Phase 2",
      window: "3 to 9 August",
      title: "Direction presentation and lock",
      description:
        "Review the directions together and commit to one.",
      items: [
        "Present the directions.",
        "One round of consolidated feedback.",
        "Direction locked for production.",
      ],
    },
    {
      label: "Phase 3",
      window: "10 to 21 August",
      title: "Full production",
      description:
        "Lay out the whole report in the locked direction and ship the final files.",
      items: [
        "Full report laid out: all spreads, illustrations, and infographics.",
        "Print test.",
        "Final print PDF and web PDF delivered.",
      ],
    },
  ],

  sow: {
    title: "Service Agreement",
    version: "v1-2026-07-23",
    preamble:
      "Plain-language agreement covering the redesign of the E2C Cookbook for CNRS. Questions before approving, just message me.",
    effectiveDate: "On signing",
    acknowledgments: [
      "I sign on behalf of the Client, and I have read and agree to the terms of this Service Agreement. I consent to sign it electronically. My full name, email, and this confirmation together form my legal signature under applicable electronic signature law.",
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
                "Centre National de la Recherche Scientifique (CNRS), represented by Primavera De Filippi.",
              ],
              ["Project contact", "Tara Merk"],
              ["Project", "E2C Cookbook redesign."],
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
            text: "This agreement sets out the whole arrangement between the Provider and the Client for the E2C Cookbook redesign. It replaces any earlier notes or discussions on the same work.",
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
            text: "The Provider redesigns the E2C Cookbook report. The goal is a document that works well both online and in print, and that reflects the care the project puts into decentralized governance. The work covers:",
          },
          {
            type: "ul",
            items: [
              "Cover design.",
              "A layout system for the full report.",
              "Spot illustrations.",
              "Infographics, starting with one comparing before and after E2C.",
              "Full layout of the report in the locked direction.",
              "A print test.",
              "Two final exports: a print PDF and a web PDF.",
            ],
          },
          {
            type: "p",
            text: "Not included unless agreed in writing: copywriting, editing, and translation, commissioned photography, third-party licenses (fonts, stock, plugins), print production and shipping, and any deliverables beyond the list above.",
          },
        ],
      },
      {
        heading: "3. Timeline",
        blocks: [
          {
            type: "kv",
            rows: [
              [
                "Before 28 July",
                "Paperwork done. Provider reads the report, audits the assets, and collects references.",
              ],
              [
                "28 July to 2 August",
                "Cover directions, a spot illustration, the first infographic, and the layout system on the first pages.",
              ],
              [
                "3 to 9 August",
                "Direction presentation. The Client returns consolidated feedback and the direction locks.",
              ],
              [
                "10 to 21 August",
                "Full production. Print test, then final print PDF and web PDF.",
              ],
              ["28 August", "Launch event. The final files land one week before."],
            ],
          },
          {
            type: "p",
            text: "The timeline depends on the Client returning feedback within the agreed review windows. Delays in Client feedback or materials shift the delivery dates by the equivalent time, and are not a breach by the Provider.",
          },
        ],
      },
      {
        heading: "4. Working together",
        blocks: [
          {
            type: "ul",
            items: [
              "The Client supplies the final report text and any required materials before production starts.",
              "The Client returns one set of consolidated feedback per review, usually within two to three business days.",
              "The direction locks at the end of the presentation phase. Direction changes after the lock are quoted separately.",
              "Day-to-day work runs in the shared Telegram chat. Paperwork runs over email.",
            ],
          },
        ],
      },
      {
        heading: "5. Fee",
        blocks: [
          {
            type: "kv",
            rows: [["Fixed fee (net)", "EUR [FEE]"]],
          },
          {
            type: "ul",
            items: [
              "VAT reverse charge applies: as an EU cross-border business-to-business service, the fee is invoiced net with no German VAT, and the Client accounts for VAT in France.",
              "The fee covers design work only. Third-party costs (fonts, stock, print) are billed at cost, quoted and approved before purchase.",
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
              "The invoice is issued alongside this agreement, so CNRS can formalize the commitment to pay before work starts.",
              "Payment by bank transfer, funded through the Client's research grant.",
              "The invoice is payable within 30 days.",
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
              "Each review phase includes one round of consolidated feedback.",
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
              "On full payment, the Client owns the final delivered files and may publish and distribute them across any channel, including under an open license of its choosing.",
              "The Provider retains ownership of source and working files, and may show the work in their portfolio unless the Client requests otherwise in writing.",
              "Third-party or licensed assets remain under their own licenses.",
            ],
          },
        ],
      },
      {
        heading: "9. Liability",
        blocks: [
          {
            type: "p",
            text: "The Provider is liable without limit for intent and gross negligence, and for injury to life, body, or health. For ordinary negligence, liability is limited to foreseeable damage typical for this kind of work, and in total to the fees paid under this agreement. The Provider is not liable for indirect or consequential loss, or for delays caused by late Client materials, feedback, or approvals.",
          },
        ],
      },
      {
        heading: "10. Cancellation",
        blocks: [
          {
            type: "ul",
            items: [
              "Either party may cancel in writing.",
              "If the Client cancels after work has begun, work performed to that point is billed pro rata.",
            ],
          },
        ],
      },
      {
        heading: "11. Independent contractor and governing law",
        blocks: [
          {
            type: "p",
            text: "The Provider is an independent contractor, responsible for their own taxes and insurance. Nothing here creates an employment relationship. This agreement is governed by the laws of the Federal Republic of Germany.",
          },
        ],
      },
      {
        heading: "Approval",
        blocks: [
          {
            type: "p",
            text: "Guilherme Maueler issues this agreement, and issuing it is his acceptance of these terms. The Client accepts by signing below. Both parties are then bound, with no second signature block needed.",
          },
        ],
      },
    ],
    signatories: [
      ["Provider", "Guilherme Maueler"],
      ["Client", `${CLIENT_ENTITY}, Primavera De Filippi`],
      ["Date signed", "Auto-filled on signing"],
    ],
  },
};

// -------- Derived helpers --------

export type PhaseStatus = "done" | "in_progress" | "upcoming";

/** Status of the phase at `index`, derived from the single
 * `currentPhase` config value. */
export function phaseStatus(c: E2cClient, index: number): PhaseStatus {
  if (index < c.currentPhase) return "done";
  if (index === c.currentPhase) return "in_progress";
  return "upcoming";
}

/** The phase in flight, or null when all phases are done. */
export function currentPhase(c: E2cClient): E2cPhase | null {
  return c.phases[c.currentPhase] ?? null;
}
