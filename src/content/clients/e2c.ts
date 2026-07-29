/**
 * Data for the private client page at /for/e2c.
 *
 * E2C Cookbook design refinement for Tara Merk and Primavera De Filippi,
 * in collaboration with the Exit to Community collective (e2c.how),
 * funded through Primavera's research grant and administered by CNRS.
 * Fixed fee EUR 2,000, invoiced up front. Final print and web PDFs land
 * by 21 August 2026, one week before the launch event on 28 August.
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
 * Signing model (settled 28 July): nobody can sign on behalf of CNRS —
 * Primavera said so directly. So the roles are split. CNRS is the paying
 * entity and formalizes its commitment by processing invoice INV-26017
 * (issued 28 July, EUR 2,000, reverse charge). The agreement itself is
 * approved by a project lead (Primavera De Filippi or Tara Merk) signing
 * in their own name: they confirm scope, timeline, fee, and revision
 * terms, not CNRS's obligations. Billing details per Primavera's
 * annuaire link: CNRS, 3 Rue Michel-Ange, 75016 Paris, VAT FR40
 * 180089013 (the earlier CERSA address was wrong info, retracted).
 */

import type { SignableDocument } from "./types";

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
    "Design refinement of the E2C Cookbook for Tara Merk and Primavera De Filippi, in collaboration with the Exit to Community collective. A CNRS research grant project.",

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
        "Read the full cookbook and complete the asset audit.",
        "Send the asset list to Tara and Primavera.",
        "Study the reference reports.",
        "Agreement published and invoice sent.",
        "Flag content bugs in writing.",
      ],
    },
    {
      label: "Phase 1",
      window: "28 July to 2 August",
      title: "Cover drafts and layout system",
      description: "First visual material to react to.",
      items: [
        "Document setup: masters, styles, color profiles.",
        "First drafts of the cover.",
        "Layout and type system: grid, type scale, chapter opener template, callouts.",
        "First spot illustration, first infographic (before and after E2C), and the intro spread.",
      ],
    },
    {
      label: "Phase 2",
      window: "3 to 9 August",
      title: "Direction presentation and lock",
      description:
        "Review the directions together and commit to one by the end of the week.",
      items: [
        "Presentation round 1: PDF with cover drafts, spot illustration, infographic, and intro layout.",
        "One round of consolidated feedback.",
        "Cover refinement after the direction lock.",
      ],
    },
    {
      label: "Phase 3",
      window: "10 to 21 August",
      title: "Full production",
      description:
        "Apply the locked system across the whole document and ship the final files.",
      items: [
        "Seven chapter opener illustrations.",
        "Infographic system: flavor matrix component, before and after diagram, TLDR box style.",
        "Full document production: flow styles through all pages.",
        "Print test, then final print PDF and web PDF with the e2c.how link check.",
        "Feedback round 2 and final fixes.",
      ],
    },
  ],

  sow: {
    title: "Service Agreement",
    version: "v2-2026-07-28",
    preamble:
      "Plain-language agreement covering the design refinement of the E2C Cookbook. A project lead approves it in their own name. Nobody signs on behalf of CNRS: CNRS commits to payment by processing the invoice. Questions before approving, just message me.",
    effectiveDate: "On approval",
    acknowledgments: [
      "I approve this agreement as a project lead for the E2C Cookbook, signing in my own name. I confirm the scope, timeline, fee, and revision terms, and I acknowledge that payment is processed by CNRS administration under the research grant. I consent to sign electronically. My full name, email, and this confirmation together form my signature under applicable electronic signature law.",
    ],
    sections: [
      {
        heading: "Parties",
        blocks: [
          {
            type: "kv",
            rows: [
              [
                "Designer",
                "Guilherme Maueler, Berlin, Germany. VAT ID: DE308488034.",
              ],
              [
                "Paying entity",
                "Centre National de la Recherche Scientifique (CNRS), CERSA, 3 Rue Michel-Ange, 75016 Paris, France. VAT: FR40 180089013. Payment is processed by CNRS administration under the BlockchainGov research grant.",
              ],
              [
                "Project reference",
                "ERC BlockchainGov Grant Agreements No. 865856",
              ],
              ["Project leads", "Tara Merk, Primavera De Filippi"],
              ["Dated", "Auto-filled on signing"],
            ],
          },
        ],
      },
      {
        heading: "Project",
        blocks: [
          {
            type: "p",
            text: "Design refinement of the E2C Cookbook, a printed and digital publication on decentralized governance, produced in collaboration with the Exit to Community collective.",
          },
        ],
      },
      {
        heading: "Deliverables",
        blocks: [
          {
            type: "ul",
            items: [
              "New cover design.",
              "Layout and typography system applied across the full document.",
              "7 chapter opener illustrations.",
              "Flavor matrix component (one design, applied across all ~12 placements).",
              "Redesigned before/after E2C infographic.",
              "Refined TLDR box and case study template styles.",
              "Print-ready PDF (color-managed, with bleed, print-tested).",
              "Web-optimized PDF with the case study annex replaced by links to e2c.how.",
            ],
          },
          {
            type: "p",
            text: "Not included: copyediting or corrections to the text content. Text issues found during production are flagged to the client for correction in the source.",
          },
        ],
      },
      {
        heading: "Timeline",
        blocks: [
          {
            type: "kv",
            rows: [
              ["28 July 2026", "Work begins."],
              [
                "28 July to 2 August",
                "First cover drafts, layout and type system, first spot illustration and infographic.",
              ],
              [
                "3 to 9 August",
                "Direction presentation: cover drafts, spot illustration, infographic, and intro layout. One round of consolidated feedback, then the client locks the direction before full production begins.",
              ],
              [
                "10 to 21 August",
                "Full production: the locked system applied across the document, plus a print test.",
              ],
              ["21 August 2026", "Delivery of both PDF versions."],
            ],
          },
        ],
      },
      {
        heading: "Fee",
        blocks: [
          {
            type: "p",
            text: "EUR 2,000 flat, all deliverables included. Invoiced up front upon signing.",
          },
          {
            type: "p",
            text: "Reverse charge applies (Art. 196 EU VAT Directive). No German VAT charged. The recipient accounts for VAT in France.",
          },
        ],
      },
      {
        heading: "Payment",
        blocks: [
          {
            type: "ul",
            items: [
              "Invoice INV-26017 (EUR 2,000, due on receipt) is issued alongside this agreement. CNRS formalizes its commitment to pay by processing it.",
              "Card payment via the Stripe link on the invoice, or bank transfer. Card payment may be split into smaller installments, one single-use link per installment.",
              "Both parties acknowledge payment is processed by CNRS administration and may complete after delivery.",
            ],
          },
        ],
      },
      {
        heading: "Revisions",
        blocks: [
          {
            type: "p",
            text: "Two revision rounds included: one at direction lock, one at final delivery. Additional rounds billed at EUR 100 per hour, agreed in advance.",
          },
        ],
      },
      {
        heading: "Scope changes",
        blocks: [
          {
            type: "p",
            text: "Work beyond the deliverables listed above is quoted separately.",
          },
        ],
      },
      {
        heading: "Approval",
        blocks: [
          {
            type: "p",
            text: "Guilherme Maueler issues this agreement, and issuing it is his acceptance of these terms. A project lead (Primavera De Filippi or Tara Merk) approves by signing below in their own name. Approval confirms the scope, timeline, and fee, and work begins. It does not bind CNRS: CNRS commits to payment by processing the invoice.",
          },
        ],
      },
    ],
    signatories: [
      ["Designer", "Guilherme Maueler"],
      ["Project lead", "Primavera De Filippi or Tara Merk"],
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
