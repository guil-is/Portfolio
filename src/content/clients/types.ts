/**
 * Shared types for signable client agreements (SOWs, amendments) and the
 * generic signing backend (hashing, PDF, the sign-agreement API).
 *
 * Both the retainer client (Justice) and one-off project clients (Myosin)
 * resolve to a `SignableClient` for the purpose of signing. Anything the
 * signing flow does not need (hours logs, progress trackers, passwords)
 * lives on the per-client types, not here.
 */

export type SowSection = {
  heading: string;
  /** Paragraphs and/or bullet lists, rendered in order. */
  blocks: Array<
    | { type: "p"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "kv"; rows: Array<[string, string]> }
  >;
};

/**
 * Generic shape for a signable document — the SOW, an amendment, or a
 * one-off service agreement. Keeps the signature flow / hash / PDF
 * generic so adding a new document is data-only.
 */
export type SignableDocument = {
  /** Display title shown above the doc. Defaults to "Statement of Work". */
  title?: string;
  /** Bump this when the doc content changes substantively. Previous
   * signatures remain valid records of what was signed then, but the
   * new version requires a fresh signature. */
  version: string;
  preamble: string;
  effectiveDate: string;
  sections: SowSection[];
  signatories: Array<[string, string]>;
  /** Wording of each checkbox the signer must tick. These exact
   * strings are stored on the signature record. */
  acknowledgments: string[];
  /** Optional plain-English summary card shown above the legal text. */
  tldr?: string[];
  /** Optional plain-English breakdown table — section name → one-line summary. */
  breakdown?: Array<{ section: string; summary: string }>;
  /** Optional footer note (e.g. "no attorney reviewed this"). */
  noteOnApproach?: string;
};

/**
 * Engagement metadata for a retainer SOW (rate, weekly hours, start).
 * Present on Justice; absent on one-off project agreements. When present
 * it is folded into the document hash and the PDF header.
 */
export type SignableEngagement = {
  startDate: string;
  rateUsd: number;
  weeklyHoursMin: number;
  weeklyHoursMax: number;
};

/** Minimal shape the signing backend needs from any client. */
export type SignableClient = {
  clientName: string;
  engagement?: SignableEngagement;
  sow: SignableDocument;
  /** Optional supplementary documents keyed by stable slug. The key
   * doubles as the `documentKey` passed to the signature API. */
  amendments?: Record<string, SignableDocument>;
};
