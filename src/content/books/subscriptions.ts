/**
 * Known work subscriptions — the ones the books can't fully describe
 * on their own (a price that steps up after the first year, a plan you
 * intend to cancel). The Subscriptions tab on /for/books merges these
 * with what it detects from recurring charges in the books; an entry
 * here wins on name, price, cadence and next renewal.
 */

import type { Category } from "@/lib/expenses/types";
import type { SubRating } from "@/lib/expenses/books";

export type Subscription = {
  name: string;
  /** Matches the merchant on bank rows (folded, first words). */
  match: string;
  amount: number;
  interval: "monthly" | "yearly";
  /** ISO date the current term started (renews every interval from here). */
  startedAt: string;
  category: Category;
  /** Price after the current term, when known. */
  nextAmount?: number;
  note?: string;
  url?: string;
  /** Set when you cancel — it drops out of the forecast after this date. */
  endsAt?: string;
  /** Default usefulness (3 essential · 2 useful · 1 could cut); the tab's own rating wins. */
  rating?: SubRating;
};

/**
 * Websites for merchants the bank names but the registry doesn't — so
 * every row on the tab has somewhere to click. Keys are merchant keys
 * (`merchantKey()` in text.ts: folded, first two meaningful words).
 */
export const knownSites: Record<string, string> = {
  adobe: "https://account.adobe.com/plans",
  worldpay: "https://adminconsole.adobe.com/account",
  figma: "https://www.figma.com/settings",
  notion: "https://www.notion.so/my-account",
  anthropic: "https://claude.ai/settings/billing",
  claude: "https://claude.ai/settings/billing",
  openai: "https://chatgpt.com/#settings/Subscription",
  chatgpt: "https://chatgpt.com/#settings/Subscription",
  midjourney: "https://www.midjourney.com/account",
  vercel: "https://vercel.com/account/billing",
  github: "https://github.com/settings/billing",
  google: "https://one.google.com/storage",
  apple: "https://apps.apple.com/account/subscriptions",
  spotify: "https://www.spotify.com/account/subscription/",
  dropbox: "https://www.dropbox.com/account/plan",
  linear: "https://linear.app/settings/billing",
  loom: "https://www.loom.com/settings/billing",
  zoom: "https://zoom.us/billing",
  framer: "https://www.framer.com/account/",
  webflow: "https://webflow.com/dashboard/account/billing",
  mobbin: "https://mobbin.com/settings/billing",
  envato: "https://elements.envato.com/account/subscription",
  "opus clip": "https://www.opus.pro/settings",
  tactiq: "https://app.tactiq.io/settings/billing",
  iconscout: "https://iconscout.com/account/subscription",
  cleanmymac: "https://my.macpaw.com/",
  congstar: "https://www.congstar.de/meincongstar/",
  setapp: "https://my.setapp.com/",
  "1password": "https://my.1password.com/billing",
  canva: "https://www.canva.com/settings/billing-and-teams",
  higgsfield: "https://higgsfield.ai/settings",
  krea: "https://www.krea.ai/settings",
  magnific: "https://magnific.ai/settings",
  runway: "https://app.runwayml.com/settings/billing",
  elevenlabs: "https://elevenlabs.io/app/subscription",
  freepik: "https://www.freepik.com/profile/my_subscriptions",
  "google one": "https://one.google.com/storage",
};

export const subscriptions: Subscription[] = [
  {
    name: "Adobe Creative Cloud Pro (team)",
    match: "worldpay",
    amount: 173.1,
    interval: "monthly",
    startedAt: "2026-01-25",
    category: "software",
    rating: 3,
    note: "Annual plan paid monthly, 2 licenses but only 1 in use — drop to 1 at the Jan 25 2027 renewal (or ask Adobe support sooner). Billed via WorldPay.",
    url: "https://adminconsole.adobe.com/account",
  },
  {
    name: "Mobbin",
    match: "mobbin",
    amount: 96,
    nextAmount: 120,
    interval: "yearly",
    startedAt: "2026-09-09",
    category: "software",
    note: "First year at 20 % off, €120/year from Sep 2027",
    url: "https://mobbin.com",
  },
  // Yearly plans the 2025 sheet paid once — dated by that charge so the
  // next renewal lands on the anniversary. The bank confirms or contradicts
  // them; "not seen in the books" on the tab means it's time to check.
  {
    name: "Envato Elements",
    match: "envato",
    amount: 128.62,
    interval: "yearly",
    startedAt: "2025-11-26",
    category: "assets",
    note: "Annual, bought at a discount Nov 2025",
    url: "https://elements.envato.com",
  },
  {
    name: "Midjourney",
    match: "midjourney",
    amount: 279.2,
    interval: "yearly",
    startedAt: "2025-02-14",
    category: "software",
    note: "Yearly plan since Feb 2025 — the old tracker had it monthly at $30",
  },
  {
    name: "Opus Clip",
    match: "opus clip",
    amount: 109.88,
    interval: "yearly",
    startedAt: "2025-02-18",
    category: "software",
    note: "Pro, bought at 60 % off",
  },
  {
    name: "Tactiq",
    match: "tactiq",
    amount: 84.44,
    interval: "yearly",
    startedAt: "2025-05-01",
    category: "software",
  },
  {
    name: "Figma",
    match: "figma",
    amount: 201.77,
    interval: "yearly",
    startedAt: "2025-05-09",
    category: "software",
    rating: 3,
    note: "Yearly since May 2025; the old tracker had it monthly at $65",
  },
  {
    name: "Google One",
    match: "google one",
    amount: 29.99,
    interval: "yearly",
    startedAt: "2025-05-06",
    category: "software",
  },
  {
    name: "IconScout",
    match: "iconscout",
    amount: 103,
    interval: "yearly",
    startedAt: "2025-07-12",
    category: "assets",
  },
  {
    name: "CleanMyMac",
    match: "cleanmymac",
    amount: 34.95,
    interval: "yearly",
    startedAt: "2025-07-24",
    category: "software",
  },
];
