/**
 * Data for the private client page at /for/tedxberlin.
 *
 * One-off video-editing engagement (the TEDxBerlin Day 2 after-movie),
 * rendered as a standalone Service Agreement. Uses the same signing
 * backend as the other /for/ pages: this `sow` is a SignableDocument and
 * the client is registered in the sign-agreement API as a SignableClient.
 *
 * NOTE — unresolved placeholders before this can go live:
 *   • TODO_CLIENT_ENTITY  — the Client's legal entity name (Parties + signatories).
 *   • TODO_VAT            — VAT treatment of the EUR 1,000 fee
 *                           ("net, plus statutory VAT" or "including VAT").
 *   (Contractor USt-IdNr DE308488034 supplied; note this is a VAT ID, not
 *    a Steuernummer — confirm if a Steuernummer is also required.)
 */

import type { SignableDocument } from "./types";

export type TedxBerlinClient = {
  clientName: string;
  password: string;
  /** Sub-line shown under the title. */
  subtitle: string;
  sow: SignableDocument;
};

export const tedxberlin: TedxBerlinClient = {
  clientName: "TEDxBerlin",
  password: "aftermovie",
  subtitle:
    'Video editing services – TEDxBerlin "A World With AI" Day 2 after-movie',

  sow: {
    title: "Service Agreement",
    version: "v1-2026-06-12",
    preamble:
      "This agreement sets out the terms for editing the TEDxBerlin Day 2 after-movie. The terms are below.",
    effectiveDate: "On signing",
    acknowledgments: [
      "I have read and agree to the terms of this Service Agreement, and I consent to sign it electronically. My full name, email, and this confirmation together constitute my legal signature under the ESIGN Act and equivalent electronic signature laws.",
    ],
    sections: [
      {
        heading: "Parties",
        blocks: [
          {
            type: "kv",
            rows: [
              [
                "Contractor",
                "Guilherme Maueler, Berlin, Germany. USt-IdNr: DE308488034",
              ],
              ["Client", "TODO_CLIENT_ENTITY"],
            ],
          },
        ],
      },
      {
        heading: "Scope of work",
        blocks: [
          {
            type: "p",
            text: "The Contractor will edit one (1) after-movie of approximately 1-2 minutes covering Day 2 of the TEDxBerlin event of June 2026, in horizontal 16:9 format at 1920x1080 (Full HD). The edit combines footage provided by the Client (including material shot by a third-party videographer) and footage captured by the Contractor at the event, including interview material. The scope includes footage review and selection, editing, color correction and grading, sound design and mix, music selection, and basic titles/text.",
          },
        ],
      },
      {
        heading: "Deliverables",
        blocks: [
          {
            type: "p",
            text: "One (1) master file, 1920x1080, MP4 (H.264), delivered via download link.",
          },
          {
            type: "p",
            text: "Optional add-on (not included): vertical cutdowns for social media, available at EUR 250 upon written request.",
          },
        ],
      },
      {
        heading: "Revisions",
        blocks: [
          {
            type: "p",
            text: "The fee includes two (2) rounds of revisions based on consolidated written feedback from the Client. Additional revision rounds are billed at EUR 200 per round. Changes to the agreed scope are quoted separately.",
          },
        ],
      },
      {
        heading: "Fees and payment",
        blocks: [
          {
            type: "p",
            text: "The total fee is EUR 1,000 TODO_VAT. Payment is due within 14 days of invoice date. The invoice is issued upon delivery of the final approved version.",
          },
        ],
      },
      {
        heading: "Timeline",
        blocks: [
          {
            type: "p",
            text: "First version within two (2) working days of receiving all footage and written confirmation to start. Revision rounds turned around within one (1) working day of consolidated feedback, subject to Client feedback within five (5) working days per round.",
          },
        ],
      },
      {
        heading: "Rights and credit",
        blocks: [
          {
            type: "p",
            text: "Upon full payment, the Client receives a non-exclusive, worldwide, perpetual right to use the final video for its communication purposes (online, social media, internal, sponsor and partner contexts), within applicable TEDx licensing rules.",
          },
          {
            type: "p",
            text: "The Contractor retains portfolio and self-promotion rights for the video and excerpts. The Contractor is credited in the video credits and, where reasonably possible, in accompanying publications.",
          },
        ],
      },
      {
        heading: "Materials provided by the Client",
        blocks: [
          {
            type: "p",
            text: "The Client warrants it holds all necessary rights to materials it provides (including third-party footage, logos, and any music supplied by the Client) and that filming consents for identifiable persons have been obtained. The Contractor is not liable for rights claims arising from Client-provided materials. Music selected by the Contractor will be properly licensed for the agreed usage.",
          },
        ],
      },
      {
        heading: "Cancellation",
        blocks: [
          {
            type: "p",
            text: "If the Client cancels after work has started, work performed is billed pro rata, minimum 50% of the total fee.",
          },
        ],
      },
      {
        heading: "General",
        blocks: [
          {
            type: "ul",
            items: [
              "Independent contractor relationship.",
              "German law applies, place of jurisdiction Berlin.",
              "Amendments require text form (email suffices).",
            ],
          },
        ],
      },
    ],
    signatories: [
      ["Contractor", "Guilherme Maueler"],
      ["Client", "TODO_CLIENT_ENTITY"],
      ["Place", "Berlin"],
      ["Date", "Auto-filled on signing"],
    ],
  },
};
