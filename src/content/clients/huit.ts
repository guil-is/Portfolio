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
 */

import type { SignableDocument } from "./types";

export type HuitClient = {
  clientName: string;
  password: string;
  /** Sub-line under the title. */
  subtitle: string;
  sow: SignableDocument;
};

export const huit: HuitClient = {
  clientName: "Studio Huit",
  password: "studiohuit",
  subtitle: "Motion design collaboration: Safe Workspace video",

  sow: {
    title: "Service Agreement",
    version: "v3-2026-06-25",
    preamble:
      "Guilherme Maueler provides motion design to Studio Huit for the Safe Workspace launch video. This agreement sits under Studio Huit's contract with the end client, Safe Labs GmbH.",
    effectiveDate: "June 2026",
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
              ["Dated", "25 June 2026"],
            ],
          },
        ],
      },
      {
        heading: "Scope",
        blocks: [
          {
            type: "p",
            text: 'Motion design and animation for Studio Huit\'s Safe "Workspace" launch video. 30 seconds, in 9:16, 1:1, and 16:9.',
          },
          {
            type: "ul",
            items: [
              "I provide animation and production support under Studio Huit's creative direction.",
              "Studio Huit leads storyboard, creative direction, client coordination, and final delivery.",
              "We agree specific scene allocation as the storyboard develops, aiming for balanced effort rather than scene count alone.",
              "I deliver final exports and project files to Studio Huit.",
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
              "2950 EUR net for motion design services.",
              "Plus 19% VAT (560.50 EUR). Total 3510.50 EUR.",
              "I invoice Studio Huit.",
            ],
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
            text: "Full amount due within 14 days of final handoff.",
          },
        ],
      },
      {
        heading: "Revisions",
        blocks: [
          {
            type: "p",
            text: "I fold in revisions that stay within the agreed creative direction and scope, where production time allows.",
          },
          {
            type: "p",
            text: "Requests that materially change approved work, expand the deliverables, or add significant production time may need a revised fee or delivery schedule.",
          },
        ],
      },
      {
        heading: "Dependency and timeline",
        blocks: [
          {
            type: "ul",
            items: [
              "My animation work depends on a locked storyboard by Friday evening.",
              "Delays to the storyboard, source materials, or client feedback shift my delivery timeline.",
            ],
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
      ["Motion design", "Guilherme Maueler"],
      ["Studio Huit", "Noa (legal name Lea Filipowicz)"],
      ["Date", "Auto-filled on signing"],
    ],
  },
};
