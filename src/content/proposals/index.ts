import type { Proposal } from "./types";
import { odyssey } from "./odyssey";

/**
 * Registry of all client proposals served by the dynamic /for/[slug]
 * route. Each entry is keyed by the URL slug and resolves to a full
 * Proposal object. Add new proposals by creating
 * src/content/proposals/<slug>.tsx and registering the export here.
 *
 * Note: Myosin is intentionally not registered here. /for/myosin is a
 * dedicated client dashboard (src/app/for/myosin/page.tsx) that renders
 * the Myosin proposal itself inside its "Proposal" tab, so the static
 * route owns that path. The proposal data still lives in ./myosin.
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
