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
 * v7 (Aug 2026) is a framework: standing terms signed once, covering any
 * short-form Safe video up to 30 seconds. Studio Huit stays on a project
 * basis with Safe rather than folding motion design into an hourly
 * retainer, so per-video pricing is the shape that has to hold.
 *
 * Two things are deliberately absent. There is no rate card, because
 * prices move and standing terms don't. And there are no per-video
 * details: each video is commissioned by a written confirmation, which
 * the client dashboard will carry so terms can be agreed case by case
 * without touching the signed document.
 */

import type { ClientVideo, SignableDocument } from "./types";

export type HuitClient = {
  clientName: string;
  password: string;
  /** Big page headline (the project). The document type stays in the
   * eyebrow and in sow.title. */
  heading: string;
  /** Sub-line under the title. */
  subtitle: string;
  sow: SignableDocument;
  /** Newest first. Rendered as brief cards under the agreement. */
  videos: ClientVideo[];
  /** Derived from `videos` so the signing backend can resolve a brief by
   * its key. Keep in step by building it from the same array. */
  amendments: Record<string, SignableDocument>;
};

/** The framework version each brief is commissioned under. */
const FRAMEWORK_VERSION = "v7-2026-08-27";

const videos: ClientVideo[] = [
  {
    key: "address-poisoning",
    title: "Address poisoning",
    status: "briefed",
    brief: {
      title: "Video brief",
      version: "brief-address-poisoning-2026-08-27",
      preamble: `Commissioned under the Framework Agreement (${FRAMEWORK_VERSION}). That agreement governs the work; this brief sets only the scope, fee and dates for this one video.`,
      effectiveDate: "August 2026",
      acknowledgments: [
        "I confirm this brief on behalf of Studio Huit. The scope, fee and dates above are agreed, and the signed Framework Agreement governs the work. I consent to confirm electronically.",
      ],
      sections: [
        {
          heading: "The video",
          blocks: [
            {
              type: "kv",
              rows: [
                [
                  "Scope",
                  'About 30 seconds and ten scenes, 16:9 only, animated from Studio Huit\'s Figma animatic in the style established on the Safe "Workspace" video.',
                ],
                ["Fee", "1600 EUR net, plus 19% VAT (304 EUR). Total 1904 EUR."],
                ["Revisions", "One round, within the agreed creative direction."],
              ],
            },
          ],
        },
        {
          heading: "Who supplies what",
          blocks: [
            {
              type: "kv",
              rows: [
                ["Safe Labs", "Voice over (Rahul) and the live-action footage."],
                ["Studio Huit", "Animatic, Figma board, music track, and notes."],
                ["Guilherme", "Animation, final export, and project files."],
              ],
            },
          ],
        },
        {
          heading: "Dates",
          blocks: [
            {
              type: "kv",
              rows: [
                [
                  "Monday 31 August",
                  "First animation pass to Studio Huit, end of day.",
                ],
                [
                  "Tuesday 1 September",
                  "Safe Labs delivers the voice over and live-action footage.",
                ],
                [
                  "Wednesday 2 September",
                  "Final version to Studio Huit, end of day.",
                ],
                [
                  "Thursday 3 September",
                  "Small tweaks until midday. I travel from 15:00 and am unavailable until Tuesday 8 September.",
                ],
              ],
            },
            {
              type: "p",
              text: "If the voice over or footage arrives after Tuesday 1 September, the Wednesday delivery no longer holds and we agree a new date together, as set out in the Framework Agreement.",
            },
          ],
        },
      ],
      signatories: [
        ["Motion designer", "Guilherme Maueler"],
        ["Client", "Studio Huit, Lea Filipowicz (Noa)"],
        ["Confirmed", "Auto-filled on signing"],
      ],
    },
  },
];

export const huit: HuitClient = {
  clientName: "Studio Huit",
  password: "studiohuit",
  heading: "Safe videos",
  subtitle: "Ongoing motion design collaboration with Studio Huit",

  videos,
  amendments: Object.fromEntries(videos.map((v) => [v.key, v.brief])),

  sow: {
    title: "Framework Agreement",
    version: FRAMEWORK_VERSION,
    preamble:
      "Guilherme Maueler provides motion design to Studio Huit for Safe's short-form videos. This agreement sits under Studio Huit's contract with the end client, Safe Labs GmbH. It sets the terms once, so each new video only needs a short written confirmation.",
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
            text: "This agreement covers the motion design I provide to Studio Huit for Safe's short-form videos, up to 30 seconds each, priced per video. It applies to every video commissioned under it and runs until either of us ends it.",
          },
          {
            type: "ul",
            items: [
              "I provide animation and production support under Studio Huit's creative direction.",
              "Studio Huit leads script, storyboard, creative direction, client coordination, and final delivery.",
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
            text: "Each video starts with a short written confirmation from Studio Huit. A message is enough, and it needs to cover:",
          },
          {
            type: "ul",
            items: [
              "What the video is: runtime, aspect ratios, how many scenes, and whether it reuses the established Safe style.",
              "The delivery date, and when the source material reaches me.",
              "Who supplies the voice over, footage and music.",
              "Anything out of the ordinary: added formats, a rush turnaround, extra revision rounds.",
            ],
          },
          {
            type: "p",
            text: "Once I confirm back, the scope and fee are agreed and I start work. I don't start on a video that hasn't been confirmed, and an agreed fee only changes if the scope does.",
          },
        ],
      },
      {
        heading: "Fees and payment",
        blocks: [
          {
            type: "p",
            text: "The standard rate is 1600 EUR net for a video of up to 30 seconds in one aspect ratio, around ten scenes, animated from Studio Huit's animatic in the Safe style we have already established. It is the fee for any video commissioned under this agreement unless the confirmation names a different one.",
          },
          {
            type: "ul",
            items: [
              "Shorter or simpler videos cost less, agreed video by video.",
              "Anything that adds work is quoted before it starts: extra scenes or aspect ratios, new components outside the established style, rush turnarounds, or revision rounds beyond the one included.",
              "Fees are net. I add 19% VAT and invoice for each video on delivery.",
              "Payment is due within 14 days and does not depend on when the end client pays.",
            ],
          },
          {
            type: "p",
            text: "We keep a shared rate card so Studio Huit can quote Safe without checking with me each time. It is a working reference rather than part of this agreement. What binds is the fee confirmed for the video in question.",
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
        heading: "Timelines",
        blocks: [
          {
            type: "p",
            text: "Every delivery date assumes the source material for that video reaches me by the date named in the confirmation. If it arrives late, the delivery date moves by at least as much, and we agree the new date together instead of compressing production.",
          },
          {
            type: "p",
            text: "I tell Studio Huit about my availability before confirming a video, and Studio Huit gives me reasonable notice before commissioning one so I can hold the time.",
          },
        ],
      },
      {
        heading: "Credit and ownership",
        blocks: [
          {
            type: "ul",
            items: [
              "Studio Huit credits me as a collaborator on the finished videos.",
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
            text: "This signature covers the framework and every video commissioned under it. Later videos need only the written confirmation described above.",
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
