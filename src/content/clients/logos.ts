/**
 * Data for the private client page at /for/logos.
 *
 * One-off video engagement: DWeb Camp 2026 video content for Logos
 * (contact: Jonny, via Discord). Three videos (two ~30s shorts and one
 * 1–1.5 min aftermovie), cut in a raw, DIY, action-oriented style from
 * footage the Contractor captured on site (3 shoot days, 8–12 July 2026).
 * Rendered as a standalone Service Agreement using the same signing
 * backend as the other /for/ pages: this `sow` is a SignableDocument and
 * the client is registered as a SignableClient.
 *
 * Client legal entity supplied by Logos: Logos Collective Association,
 * Baarerstrasse 10, 6300 Zug, Switzerland (UID CHE-134.145.789). Baked
 * into the document; the signer still signs through the standard flow.
 *
 * VAT: the Client is established in Switzerland (outside the EU). Under
 * §3a UStG the place of supply is the Client's seat, so the Contractor's
 * services are not subject to German VAT and none is charged (reverse
 * charge in the recipient country). Contractor USt-IdNr DE308488034 (a
 * VAT ID, not a Steuernummer).
 */

import type { SignableDocument } from "./types";

/** Client legal entity, surfaced in the Parties/Signatures blocks and
 * recorded on the signature (`clientEntity`) via the page. */
export const CLIENT_ENTITY = "Logos Collective Association";

export type LogosClient = {
  clientName: string;
  password: string;
  /** Sub-line shown under the title. */
  subtitle: string;
  sow: SignableDocument;
};

export const logos: LogosClient = {
  clientName: "Logos",
  password: "dwebcamp",
  subtitle: "Video content: DWeb Camp 2026",

  sow: {
    title: "Service Agreement",
    version: "v2-2026-07-22",
    preamble:
      "This agreement sets out the terms for producing video content from DWeb Camp 2026 for Logos. The terms are below.",
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
              [
                "Client",
                "Logos Collective Association, Baarerstrasse 10, 6300 Zug, Switzerland. UID: CHE-134.145.789",
              ],
              ["Client contact", "Jonny (Logos)"],
            ],
          },
        ],
      },
      {
        heading: "Scope of work",
        blocks: [
          {
            type: "p",
            text: "The Contractor will produce three (3) videos from DWeb Camp 2026: two (2) short-form videos of approximately 30 seconds each, and one (1) aftermovie of approximately 1 to 1.5 minutes. The aftermovie combines the event's developer and movement presence into a single cut.",
          },
          {
            type: "p",
            text: "The edit is intentionally raw, DIY, and action-oriented, with no talking heads and no polished corporate treatment. The scope covers footage review and selection, editing, basic color and sound treatment in keeping with the raw style, and music selection.",
          },
          {
            type: "p",
            text: "Filming was carried out by the Contractor on site across three (3) shoot days between 8 and 12 July 2026. Editing and post-production are performed by the Contractor.",
          },
        ],
      },
      {
        heading: "Deliverables",
        blocks: [
          {
            type: "p",
            text: "Three (3) master files delivered via download link: two (2) short videos of approximately 30 seconds and one (1) aftermovie of approximately 1 to 1.5 minutes, in the formats and aspect ratios agreed for their intended use (social and event channels).",
          },
        ],
      },
      {
        heading: "Revisions",
        blocks: [
          {
            type: "p",
            text: "The fee includes one (1) round of revisions per video, based on consolidated written feedback from the Client. Additional revision rounds are billed at EUR 150 per video per round. Changes to the agreed scope are quoted separately.",
          },
        ],
      },
      {
        heading: "Fees and payment",
        blocks: [
          {
            type: "kv",
            rows: [
              ["Shoot (3 days × EUR 480)", "EUR 1,440"],
              ["Edit & post (3 videos × EUR 500)", "EUR 1,500"],
              ["Total", "EUR 2,940"],
            ],
          },
          {
            type: "p",
            text: "The total fee is EUR 2,940. The Client is established in Switzerland (outside the EU), so under §3a UStG the place of supply is the Client's seat: the Contractor's services are not subject to German VAT and no German VAT is charged (reverse charge in the recipient country). Any Swiss tax on the acquisition of services, if applicable, is the Client's responsibility.",
          },
          {
            type: "p",
            text: "Payment is due in full upon delivery of the videos. The invoice is issued upon delivery of the final approved videos and is payable within 14 days of the invoice date.",
          },
        ],
      },
      {
        heading: "Timeline",
        blocks: [
          {
            type: "p",
            text: "Footage has been captured and editing is in progress. First preview cuts are delivered by Monday, 27 July 2026. Final videos follow shortly after, subject to the Client returning consolidated feedback promptly (within five (5) working days of receiving the preview cuts).",
          },
        ],
      },
      {
        heading: "Rights and credit",
        blocks: [
          {
            type: "p",
            text: "Upon full payment, the Client receives a non-exclusive, worldwide, perpetual right to use the final videos for its communication purposes (online, social media, internal, event, sponsor, and partner contexts).",
          },
          {
            type: "p",
            text: "The Contractor retains portfolio and self-promotion rights for the videos and excerpts. Where reasonably possible, the Contractor is credited in accompanying publications.",
          },
        ],
      },
      {
        heading: "Materials and consents",
        blocks: [
          {
            type: "p",
            text: "The Client warrants that filming and usage consents for identifiable persons appearing in the footage have been obtained under the event's terms, and that it holds all necessary rights to any logos or materials it supplies. The Contractor is not liable for rights or consent claims arising from the event or from Client-provided materials. Music selected by the Contractor will be properly licensed for the agreed usage.",
          },
        ],
      },
      {
        heading: "Cancellation",
        blocks: [
          {
            type: "p",
            text: "The shoot has been completed and is billable in full. If the Client cancels the edit after work has started, work performed is billed pro rata, with a minimum of 50% of the edit-and-post fee in addition to the completed shoot days.",
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
      ["Client", CLIENT_ENTITY],
      ["Place", "Berlin"],
      ["Date", "Auto-filled on signing"],
    ],
  },
};
