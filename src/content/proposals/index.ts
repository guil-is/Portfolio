import type { Proposal } from "./types";
import { odyssey } from "./odyssey";

/**
 * Registry of all client proposals. Each entry is keyed by the URL
 * slug and resolves to a full Proposal object. Add new proposals by
 * creating src/content/proposals/<slug>.tsx and registering the
 * export here.
 */
export const proposals: Record<string, Proposal> = {
  odyssey,
};

export function getProposal(slug: string): Proposal | null {
  return proposals[slug] ?? null;
}

export function getAllProposalSlugs(): string[] {
  return Object.keys(proposals);
}
