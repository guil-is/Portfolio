/**
 * Known work subscriptions — the ones the books can't fully describe
 * on their own (a price that steps up after the first year, a plan you
 * intend to cancel). The Subscriptions tab on /for/books merges these
 * with what it detects from recurring charges in the books; an entry
 * here wins on name, price, cadence and next renewal.
 */

import type { Category } from "@/lib/expenses/types";

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
};

export const subscriptions: Subscription[] = [
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
];
