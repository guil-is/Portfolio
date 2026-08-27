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
 * Deliberately no rate card in the document, because prices move and
 * standing terms don't. "Confirmed in writing before work starts" is the
 * protection; the tiers live in chat and change without a re-signature.
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
      "Guilherme Maueler provides motion design to Studio Huit for Safe's videos. This agreement sits under Studio Huit's contract with the end client, Safe Labs GmbH. It sets the terms once, so each new video only needs a short written confirmation instead of another contract.",
    effectiveDate: "August 2026",
    acknowledgments: [
      "I sign on behalf of Studio Huit, and I have read and agree to the terms of this Framework Agreement. I consent to sign it electronically. My full name, email, and this confirmation together form my legal signature under applicable electronic signature law.",
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
            text: "This agreement covers the motion design I provide to Studio Huit for Safe's videos, priced per video rather than by the hour. It applies to every video commissioned under it and runs until either of us ends it, so there is no separate contract each time.",
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
            text: "Each video starts with a short written confirmation from Studio Huit. A message is enough. It needs to cover:",
          },
          {
            type: "ul",
            items: [
              "What the video is: runtime, aspect ratios, roughly how many scenes, and whether it reuses the established Safe style or needs new components.",
              "The fee for that video, net of VAT.",
              "The delivery date, and when the voice over, footage and other source material will reach me.",
              "Anything out of the ordinary: added formats, a rush turnaround, or more than the one revision round included below.",
            ],
          },
          {
            type: "p",
            text: "Once I confirm back, the scope and fee are agreed and I start work. I don't start on a video that hasn't been confirmed, and an agreed fee only changes if the scope does.",
          },
        ],
      },
      {
        heading: "Fees",
        blocks: [
          {
            type: "p",
            text: "The standard rate is 1600 EUR net for a video of about 30 seconds and ten scenes, in 16:9, animated from Studio Huit's animatic in the Safe style we have already established. The \"address poisoning\" video below is the reference for what that covers.",
          },
          {
            type: "ul",
            items: [
              "Shorter or simpler videos cost less, agreed video by video.",
              "Anything that adds work is quoted before it starts: longer runtimes, extra scenes or aspect ratios, new components outside the established style, rush turnarounds, or revision rounds beyond the one included.",
              "Fees are always net. I add 19% VAT and invoice Studio Huit for each video.",
            ],
          },
          {
            type: "p",
            text: "We keep a shared rate card for the common video shapes so Studio Huit can quote Safe without checking with me each time. That rate card is a working reference rather than part of this agreement, and either of us can suggest changes to it. What binds is the fee confirmed for the video in question.",
          },
        ],
      },
      {
        heading: "Payment terms",
        blocks: [
          {
            type: "p",
            text: "I invoice for each video on delivery. Payment follows my delivery to Studio Huit and does not depend on when the end client pays.",
          },
          {
            type: "p",
            text: "The full amount is due within 14 days of final handoff. If Studio Huit takes over the remaining animation on a video, the 14 days run from the day I hand over the project files.",
          },
        ],
      },
      {
        heading: "Revisions",
        blocks: [
          {
            type: "p",
            text: "Each video's fee includes one round of revisions within the agreed creative direction, done before final delivery.",
          },
          {
            type: "p",
            text: "Requests that change approved work substantially, add deliverables, or need significant extra production time are quoted on top of that video's fee, or move its delivery date.",
          },
        ],
      },
      {
        heading: "Timelines and slippage",
        blocks: [
          {
            type: "p",
            text: "Every delivery date assumes the source material for that video (voice over, footage, animatic and anything else) reaches me by the date named in the confirmation. If it arrives late, the delivery date moves by at least as much, and we agree the new date together instead of compressing production.",
          },
          {
            type: "p",
            text: "If Studio Huit would rather take over the remaining animation than reschedule, I hand over the project files and invoice pro rata for the work done up to that point.",
          },
          {
            type: "p",
            text: "I tell Studio Huit about time off before confirming a video. Studio Huit gives me reasonable notice before commissioning one so I can hold the time.",
          },
        ],
      },
      {
        heading: 'First video: "address poisoning"',
        blocks: [
          {
            type: "p",
            text: "The first video under this agreement, confirmed here instead of by separate message.",
          },
          {
            type: "kv",
            rows: [
              [
                "Scope",
                'About 30 seconds and ten scenes, 16:9 only, animated from Studio Huit\'s Figma animatic in the style we established on the Safe "Workspace" video.',
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
            text: "Studio Huit credits me as a collaborator on the finished videos.",
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
              "I share editable source and project files with Studio Huit.",
            ],
          },
        ],
      },
      {
        heading: "Ending this agreement",
        blocks: [
          {
            type: "p",
            text: "This agreement starts on the date above and runs until either of us ends it. Either party can do that at any time, in writing, with two weeks' notice and no reason given.",
          },
          {
            type: "p",
            text: "Videos already confirmed when notice is given are finished under these terms and invoiced as agreed. If we both prefer to stop them instead, I invoice pro rata for the work done and hand over the project files.",
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
            text: "This signature covers the framework and every video commissioned under it. Later videos need only the written confirmation described above, not a new signature.",
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
