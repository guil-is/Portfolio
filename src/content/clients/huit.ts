/**
 * Data for the private agreement page at /for/huit.
 *
 * A minimal subcontractor agreement: Guilherme Maueler provides motion
 * design to Studio Huit, which holds the upstream contract with the end
 * client (Safe Labs GmbH) and owns the creative direction. Studio Huit
 * (Noa) signs on the page through the same signature flow as the other
 * /for/ agreements, and the page prints cleanly to PDF.
 *
 * Uses the shared SignableDocument shape so it plugs into the signing
 * backend (hash, PDF, email) and matches the other agreements' typography.
 *
 * v5 (Aug 2026) covers the "address poisoning" video only — one video of
 * the four Safe approved, deliberately scoped as a one-off while Studio
 * Huit negotiates an ongoing retainer with Safe. The remaining videos and
 * any retainer get their own agreement once that shape is known.
 */

import type { SignableDocument } from "./types";

export type HuitClient = {
  clientName: string;
  password: string;
  /** Big page headline (the project). The document type stays in the
   * eyebrow and in sow.title. */
  heading: string;
  /** Sub-line under the title. */
  subtitle: string;
  sow: SignableDocument;
};

export const huit: HuitClient = {
  clientName: "Studio Huit",
  password: "studiohuit",
  heading: "Safe — Address poisoning video",
  subtitle: "Motion design collaboration with Studio Huit",

  sow: {
    title: "Service Agreement",
    version: "v5-2026-08-27",
    preamble:
      "Guilherme Maueler provides motion design to Studio Huit for Safe's \"address poisoning\" video. This agreement sits under Studio Huit's contract with the end client, Safe Labs GmbH, and covers this one video.",
    effectiveDate: "August 2026",
    acknowledgments: [
      "I sign on behalf of Studio Huit, and I have read and agree to the terms of this Service Agreement. I consent to sign it electronically. My full name, email, and this confirmation together form my legal signature under applicable electronic signature law.",
    ],
    sections: [
      {
        heading: "Parties",
        blocks: [
          {
            type: "kv",
            rows: [
              [
                "Motion designer",
                "Guilherme Maueler, Müggelstraße 15, 10247 Berlin.",
              ],
              [
                "Client",
                "Studio Huit, represented by Lea Filipowicz (Noa), Reichenberger Str. 60, 10999 Berlin.",
              ],
              ["Dated", "27 August 2026"],
            ],
          },
        ],
      },
      {
        heading: "Scope",
        blocks: [
          {
            type: "p",
            text: 'Motion design and animation for Safe\'s "address poisoning" video: approximately 30 seconds, 16:9 only, animated from Studio Huit\'s Figma animatic in the style established by the Safe "Workspace" video.',
          },
          {
            type: "ul",
            items: [
              "I provide animation and production support under Studio Huit's creative direction.",
              "Studio Huit leads script, storyboard, creative direction, client coordination, and final delivery.",
              "Safe Labs supplies the voice over and the live-action footage. Studio Huit supplies the music track and holds its licence.",
              "I deliver the final export and project files to Studio Huit.",
              "This agreement covers this one video. Further videos, and any ongoing retainer between Studio Huit and Safe Labs, are agreed separately.",
            ],
          },
        ],
      },
      {
        heading: "Fee",
        blocks: [
          {
            type: "ul",
            items: [
              "1600 EUR net for motion design services.",
              "Plus 19% VAT (304 EUR). Total 1904 EUR.",
              "I invoice Studio Huit.",
            ],
          },
          {
            type: "p",
            text: "This rate covers a video of the scope above. Materially more animation — longer runtime, more scenes, added formats, or new components beyond the established style — is quoted separately before the work starts.",
          },
        ],
      },
      {
        heading: "Payment terms",
        blocks: [
          {
            type: "p",
            text: "Payment is tied to my final delivery to Studio Huit, not to the end client's payment schedule.",
          },
          {
            type: "p",
            text: "Full amount due within 14 days of final handoff — or, where Studio Huit takes over the remaining animation, within 14 days of the project files being handed over.",
          },
        ],
      },
      {
        heading: "Revisions",
        blocks: [
          {
            type: "p",
            text: "The fee includes one round of revisions within the agreed creative direction, folded in before final delivery.",
          },
          {
            type: "p",
            text: "Requests that materially change approved work, expand the deliverables, or add significant production time may need a revised fee or delivery schedule.",
          },
        ],
      },
      {
        heading: "Timeline",
        blocks: [
          {
            type: "kv",
            rows: [
              ["Monday 31 August", "First animation pass to Studio Huit, end of day."],
              [
                "Tuesday 1 September",
                "Safe Labs delivers the voice over and live-action footage.",
              ],
              ["Wednesday 2 September", "Final version to Studio Huit, end of day."],
              [
                "Thursday 3 September",
                "Small tweaks until midday. I travel from 15:00 and am unavailable Thursday 3 to Monday 7 September.",
              ],
            ],
          },
        ],
      },
      {
        heading: "If the timeline slips",
        blocks: [
          {
            type: "p",
            text: "The schedule above depends on Safe Labs delivering the voice over and footage by Tuesday 1 September. If those arrive later, the Wednesday delivery no longer applies and we agree a new date together — both parties have limited availability the following week.",
          },
          {
            type: "p",
            text: "If Studio Huit takes over the remaining animation rather than rescheduling, I hand over the project files and the work completed to that point is invoiced pro rata against the fee above.",
          },
        ],
      },
      {
        heading: "Credit",
        blocks: [
          {
            type: "p",
            text: "Studio Huit credits me as a collaborator on the final piece.",
          },
        ],
      },
      {
        heading: "Ownership",
        blocks: [
          {
            type: "ul",
            items: [
              "Rights to final approved deliverables transfer on full payment.",
              "I share editable source and project files with Studio Huit to support collaboration.",
            ],
          },
        ],
      },
      {
        heading: "Governing law",
        blocks: [
          {
            type: "p",
            text: "This agreement is governed by the laws of the Federal Republic of Germany.",
          },
        ],
      },
      {
        heading: "Acceptance",
        blocks: [
          {
            type: "p",
            text: "Guilherme Maueler issues this agreement, and issuing it is his acceptance of these terms. Studio Huit accepts by signing below. Both parties are then bound, with no second signature block needed.",
          },
        ],
      },
    ],
    signatories: [
      ["Motion designer", "Guilherme Maueler"],
      ["Client", "Studio Huit, Lea Filipowicz (Noa)"],
      ["Date", "Auto-filled on signing"],
    ],
  },
};
