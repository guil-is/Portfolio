import { createHash } from "node:crypto";
import type {
  JusticeClient,
  SignableDocument,
} from "@/content/clients/justice";

/**
 * Produce a deterministic plain-text rendering of a signable document
 * that can be hashed to create a stable fingerprint. Any change to
 * visible copy invalidates the hash and any signature of the previous
 * version.
 *
 * Server-only: pulls in node:crypto.
 */
export function serializeDocument(
  client: JusticeClient,
  doc: SignableDocument,
): string {
  const { engagement } = client;
  const lines: string[] = [];

  lines.push(`CLIENT: ${client.clientName}`);
  lines.push(`DOC: ${doc.title ?? "Statement of Work"}`);
  lines.push(`VERSION: ${doc.version}`);
  lines.push(`EFFECTIVE: ${doc.effectiveDate}`);
  lines.push(`RATE: $${engagement.rateUsd}/hr`);
  lines.push(`WEEKLY: ${engagement.weeklyHoursMin}-${engagement.weeklyHoursMax}h`);
  lines.push(`START: ${engagement.startDate}`);
  lines.push("");
  lines.push(`PREAMBLE: ${doc.preamble}`);
  lines.push("");

  if (doc.tldr && doc.tldr.length) {
    lines.push("## TL;DR");
    for (const t of doc.tldr) lines.push(t);
    lines.push("");
  }

  for (const section of doc.sections) {
    lines.push(`## ${section.heading}`);
    for (const block of section.blocks) {
      if (block.type === "p") {
        lines.push(block.text);
      } else if (block.type === "ul") {
        for (const item of block.items) lines.push(`- ${item}`);
      } else {
        for (const [k, v] of block.rows) lines.push(`${k}: ${v}`);
      }
    }
    lines.push("");
  }

  if (doc.noteOnApproach) {
    lines.push("## Note on the Approach");
    lines.push(doc.noteOnApproach);
    lines.push("");
  }

  for (const [k, v] of doc.signatories) {
    lines.push(`${k}: ${v}`);
  }

  for (const a of doc.acknowledgments) {
    lines.push(`ACK: ${a}`);
  }

  return lines.join("\n");
}

export function hashDocument(
  client: JusticeClient,
  doc: SignableDocument,
): string {
  return createHash("sha256").update(serializeDocument(client, doc)).digest("hex");
}

/** Backwards-compatible alias for SOW callers. */
export function serializeSow(client: JusticeClient): string {
  return serializeDocument(client, client.sow);
}
export function hashSow(client: JusticeClient): string {
  return hashDocument(client, client.sow);
}
