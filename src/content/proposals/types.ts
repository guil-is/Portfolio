import type { ReactNode } from "react";

/**
 * Data shape for a templated client proposal page at /for/[slug].
 *
 * Each proposal lives as one .tsx file under src/content/proposals/
 * and gets registered in src/content/proposals/index.ts. All copy,
 * pricing, and per-client bits are data-driven; the structural
 * layout lives in src/app/for/[slug]/page.tsx.
 */

export type Body = string | string[];

export type CaseStudyData = {
  sectionLabel: string;
  meta: string;
  title: string;
  /** Optional external link on the title (e.g. startup website). */
  url?: string;
  problem: Body;
  whatIShipped?: Body;
  whatIDid?: Body;
  whatChanged?: Body;
  /** Folder under /public/ to auto-discover images/videos from. */
  galleryFolder: string;
  /** Map of media basename → external URL (clickable slides). */
  mediaLinks?: Record<string, string>;
  stat?: string;
  /** Accepts JSX so copy can embed inline links. */
  statLabel?: ReactNode;
  relevance: Body;
};

export type Tier = {
  label: string;
  price: string;
  cadence: string;
  priceNote?: string;
  body: string;
  response: string;
};

export type Proposal = {
  /** URL slug — /for/<slug>. */
  slug: string;
  /** Shared-secret password for the gate. */
  password: string;
  /** Used in the hero meta line and "Why it matters for <clientName>" labels. */
  clientName: string;
  /** e.g. "Prepared for Nick DeNuzzo & Chris · Odyssey" */
  preparedFor: string;
  /** e.g. "April 2026" */
  date: string;
  hero: {
    /** Defaults to "A proposal from Guil Maueler". */
    eyebrow?: string;
    title: string;
    blurb: string;
    /** Optional Loom walkthrough link. When set, renders a CTA button. */
    loomUrl?: string;
    loomLabel?: string;
  };
  caseStudies: CaseStudyData[];
  engagement: {
    heading: string;
    subheading: string;
    footnote: string;
    tiers: Tier[];
  };
  nextStep: {
    heading: string;
    body: string;
    ctaHref: string;
    ctaLabel: string;
  };
  /** Optional HTML head overrides. */
  metadata?: {
    title?: string;
    description?: string;
  };
};
