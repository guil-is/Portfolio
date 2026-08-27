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
 * v6 (Aug 2026) turns this into a framework: standing terms signed once,
 * with each video commissioned by a written confirmation rather than a new
 * contract. Studio Huit stays on a project basis with Safe rather than
 * folding motion design into an hourly retainer, so per-video pricing is
 * the shape that has to hold.
 *
 * Deliberately no rate card in the document — prices move, standing terms
 * don't. "Confirmed in writing before work starts" is the protection; the
 * tiers live in chat and can change without a re-signature.
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
  heading: "Safe videos",
  subtitle: "Ongoing motion design collaboration with Studio Huit",

  sow: {
    title: "Framework Agreement",
    version: "v6-2026-08-27",
    preamble:
      "Guilherme Maueler provides motion design to Studio Huit for Safe's video series. This agreement sits under Studio Huit's contract with the end client, Safe Labs GmbH. It sets the terms once; each video is then commissioned by a short written confirmation rather than a new contract.",
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
        heading: "How this works",
        blocks: [
          {
            type: "p",
            text: "This agreement covers the motion design I provide to Studio Huit for Safe's videos on a project basis. It runs until either party ends it, and applies to every video commissioned under it — no separate contract per video.",
          },
          {
            type: "ul",
            items: [
              "I provide animation and production support under Studio Huit's creative direction.",
              "Studio Huit leads script, storyboard, creative direction, client coordination, and final delivery.",
              "Safe Labs supplies voice over and any live-action footage. Studio Huit supplies music tracks and holds their licences.",
              "I deliver final exports and project files to Studio Huit.",
            ],
          },
        ],
      },
      {
        heading: "Commissioning a video",
        blocks: [
          {
            type: "p",
            text: "Each video starts with a short written confirmation from Studio Huit — a message is enough. It sets out four things:",
          },
          {
            type: "ul",
            items: [
              "What the video is: runtime, aspect ratios, roughly how many scenes, and whether it reuses the established Safe style or needs new components.",
              "The fee for that video, net of VAT.",
              "The delivery date, and the date the voice over, footage, and any other source material reach me.",
              "Anything unusual: added formats, a rush turnaround, or more than the one revision round included below.",
            ],
          },
          {
            type: "p",
            text: "Once I confirm back, that scope and fee are agreed and I start. Work isn't begun on an unconfirmed video, and a confirmed fee doesn't change afterwards unless the scope does.",
          },
        ],
      },
      {
        heading: "Fees",
        blocks: [
          {
            type: "p",
            text: "The standard rate is 1600 EUR net for a video of the reference scope: roughly 30 seconds, around ten scenes, 16:9, animated from Studio Huit's animatic in the established Safe style. The \"address poisoning\" video below is that reference.",
          },
          {
            type: "ul",
            items: [
              "Simpler or shorter videos are priced below the standard rate, agreed per video.",
              "Longer runtime, more scenes, added aspect ratios, new components beyond the established style, rush turnarounds, or extra revision rounds are quoted before the work starts.",
              "All fees are net. I add 19% VAT and invoice Studio Huit per video.",
            ],
          },
          {
            type: "p",
            text: "We keep a shared rate card for common video shapes so Studio Huit can quote Safe without checking each time. The rate card is a working reference, not part of this agreement, and either of us can propose changing it — the fee that binds is the one confirmed for a given video.",
          },
        ],
      },
      {
        heading: "Payment terms",
        blocks: [
          {
            type: "p",
            text: "I invoice per video on delivery. Payment is tied to my delivery to Studio Huit, not to the end client's payment schedule.",
          },
          {
            type: "p",
            text: "Full amount due within 14 days of final handoff — or, where Studio Huit takes over the remaining animation on a video, within 14 days of the project files being handed over.",
          },
        ],
      },
      {
        heading: "Revisions",
        blocks: [
          {
            type: "p",
            text: "Each video's fee includes one round of revisions within the agreed creative direction, folded in before final delivery.",
          },
          {
            type: "p",
            text: "Requests that materially change approved work, expand the deliverables, or add significant production time are quoted as an addition to that video's fee, or move its delivery date.",
          },
        ],
      },
      {
        heading: "Timelines and slippage",
        blocks: [
          {
            type: "p",
            text: "Each video's delivery date assumes its source material — voice over, footage, animatic, and any other assets — reaches me by the date named in the confirmation. If material arrives late, the delivery date moves by at least the same amount, and we agree the new date together rather than compressing production.",
          },
          {
            type: "p",
            text: "If Studio Huit takes over the remaining animation on a video rather than rescheduling it, I hand over the project files and the work completed to that point is invoiced pro rata against that video's fee.",
          },
          {
            type: "p",
            text: "I flag known unavailability ahead of confirming a video, and Studio Huit gives me reasonable notice before commissioning one so the slot can be held.",
          },
        ],
      },
      {
        heading: 'First video: "address poisoning"',
        blocks: [
          {
            type: "p",
            text: "The first video commissioned under this agreement, confirmed here rather than by separate message.",
          },
          {
            type: "kv",
            rows: [
              [
                "Scope",
                'Approximately 30 seconds, 16:9 only, around ten scenes, animated from Studio Huit\'s Figma animatic in the style established by the Safe "Workspace" video.',
              ],
              ["Fee", "1600 EUR net, plus 19% VAT (304 EUR). Total 1904 EUR."],
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
        heading: "Term and ending it",
        blocks: [
          {
            type: "p",
            text: "This agreement runs from the date above until either of us ends it, which either can do at any time with two weeks' written notice — no reason needed.",
          },
          {
            type: "p",
            text: "Videos already confirmed when notice is given are finished under these terms and invoiced as agreed, unless we both prefer to stop them, in which case the work completed is invoiced pro rata and the project files handed over.",
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
          {
            type: "p",
            text: "This signature covers the framework and every video commissioned under it. Later videos need only the written confirmation described above — not a new signature.",
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
