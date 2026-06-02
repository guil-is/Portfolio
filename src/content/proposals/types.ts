import type { ReactNode } from "react";

/**
 * Data shape for a templated client proposal page at /for/[slug].
 *
 * Each proposal lives as one .tsx file under src/content/proposals/
 * and gets registered in src/content/proposals/index.ts. All copy,
 * pricing, and per-client bits are data-driven; the structural
 * layout lives in src/app/for/[slug]/page.tsx.
 *
 * Two proposal shapes are supported, mixable per file:
 *   1. Retainer pitch (Odyssey-style): caseStudies + engagement.
 *   2. Project quote (Myosin-style): brief + scope + quote + terms.
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

export type LabeledBody = {
  label: string;
  body: Body;
};

export type LabeledList = {
  label: string;
  list: string[];
};

export type BriefMediaItem = {
  /** Display title for the reference. */
  title: string;
  /** Canonical source URL (used as platform-of-origin link and for
   * YouTube/Vimeo lightbox playback when no local file is provided). */
  url: string;
  /** Optional local video file (under /public). When set, the tile
   * autoplays this file muted and the lightbox plays it full-bleed. */
  videoSrc?: string;
  /** Optional poster image. For YouTube refs without one, the
   * thumbnail is auto-derived from the video ID. */
  poster?: string;
  /** Optional caption shown under the tile. */
  caption?: string;
};

export type LabeledMedia = {
  label: string;
  items: BriefMediaItem[];
};

export type BriefBlock = LabeledBody | LabeledList | LabeledMedia;

export type Brief = {
  heading?: string;
  blocks: BriefBlock[];
};

export type Scope = {
  heading?: string;
  intro?: Body;
  /** Numbered scene-style list (e.g. shot list). */
  items?: string[];
  /** Labeled bullet groups under the intro (e.g. "The shape" +
   * "What's included"). Rendered visually quiet, no numbering. */
  lists?: LabeledList[];
  outro?: Body;
  provides?: LabeledBody;
};

export type QuotePrice = {
  label: string;
  amount: string;
  /** Optional list/standard rate shown struck through above the
   * amount. Use for first-engagement or discounted pricing. */
  previous?: string;
};

export type QuoteOption = {
  label: string;
  title: string;
  lead?: Body;
  includes: string[];
  prices: QuotePrice[];
  /** Optional small note rendered right under the price block (above
   * the timeline). Use to caption a discount or framing. */
  priceNote?: string;
  timeline?: string;
  closing?: Body;
  recommended?: boolean;
};

export type Quote = {
  heading?: string;
  subheading?: string;
  options: QuoteOption[];
  footnote?: string;
};

export type Terms = {
  heading?: string;
  items: string[];
};

export type TimelineMilestone = {
  /** Small caption above the title, e.g. "Deliverable 1". */
  label: string;
  /** Milestone title, e.g. "Video first pass". */
  title: string;
  /** Optional one-line description. */
  body?: string;
  /** Visual variant for the marker dot. Defaults to "deliverable". */
  kind?: "start" | "deliverable" | "revision" | "end";
};

export type Timeline = {
  heading?: string;
  intro?: Body;
  milestones: TimelineMilestone[];
  /** Optional post-timeline note (e.g. hourly rate for out-of-scope work). */
  note?: LabeledBody;
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
    /** Defaults to "A proposal from Guil Maueler". Pass "" to hide. */
    eyebrow?: string;
    title: string;
    /** Optional softer continuation line under the title (rendered in
     * muted weight/color for a two-tier editorial treatment). */
    titleContinuation?: string;
    blurb: string;
    /** Optional Loom walkthrough link. When set, renders a CTA button. */
    loomUrl?: string;
    loomLabel?: string;
  };
  caseStudies?: CaseStudyData[];
  /** Project-style sections (omit any not needed). */
  brief?: Brief;
  scope?: Scope;
  timeline?: Timeline;
  quote?: Quote;
  terms?: Terms;
  /** Whether to render the static "How I work" section. Defaults to true. */
  showApproach?: boolean;
  engagement?: {
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
