import { createHash } from "node:crypto";
import type { JusticeClient } from "@/content/clients/justice";

/**
 * Produce a deterministic plain-text rendering of an SOW that can be
 * hashed to create a stable fingerprint. Any change to visible copy
 * invalidates the hash and any signature of the previous version.
 *
 * Server-only: pulls in node:crypto.
 */
export function serializeSow(client: JusticeClient): string {
  const { sow, engagement } = client;
  const lines: string[] = [];

  lines.push(`CLIENT: ${client.clientName}`);
  lines.push(`EFFECTIVE: ${sow.effectiveDate}`);
  lines.push(`RATE: $${engagement.rateUsd}/hr`);
  lines.push(`WEEKLY: ${engagement.weeklyHoursMin}-${engagement.weeklyHoursMax}h`);
  lines.push(`START: ${engagement.startDate}`);
  lines.push("");
  lines.push(`PREAMBLE: ${sow.preamble}`);
  lines.push("");

  for (const section of sow.sections) {
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

  for (const [k, v] of sow.signatories) {
    lines.push(`${k}: ${v}`);
  }

  return lines.join("\n");
}

export function hashSow(client: JusticeClient): string {
  return createHash("sha256").update(serializeSow(client)).digest("hex");
}
