/**
 * Subscription tracker. Two sources, merged by merchant key:
 *
 *  - detected: a merchant charged at a steady cadence in the books —
 *    at least 3 monthly charges (~30 days apart) or 2 yearly ones
 *    (~365 days), amounts within 15 % of each other;
 *  - registry: src/content/books/subscriptions.ts, for prices that
 *    step, plans you intend to cancel, or things the books haven't seen
 *    twice yet.
 *
 * Output is what the Subscriptions tab shows: cadence, price, next
 * renewal, yearly cost.
 */

import type { BookEntry } from "./books";
import { merchantKey } from "./text";
import type { Category } from "./types";
import type { Subscription } from "@/content/books/subscriptions";

export type TrackedSubscription = {
  key: string;
  name: string;
  amount: number;
  interval: "monthly" | "yearly";
  category: Category;
  lastCharge?: string;
  nextRenewal: string;
  /** Cost per year at the current price. */
  yearly: number;
  charges: number;
  source: "registry" | "detected";
  note?: string;
  url?: string;
  nextAmount?: number;
  endsAt?: string;
};

const DAY = 86_400_000;

function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY).toISOString().slice(0, 10);
}

function addMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

function addYears(iso: string, years: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

/** First renewal on or after `today`, stepping from `from` by the interval. */
export function nextRenewalFrom(from: string, interval: "monthly" | "yearly", today: string): string {
  let next = from;
  let guard = 0;
  while (next < today && guard++ < 600) {
    next = interval === "monthly" ? addMonths(next, 1) : addYears(next, 1);
  }
  return next;
}

export function detectSubscriptions(entries: BookEntry[], today: string): TrackedSubscription[] {
  const groups = new Map<string, BookEntry[]>();
  for (const e of entries) {
    if (e.kind !== "expense") continue;
    const k = merchantKey(e.party);
    const list = groups.get(k) ?? [];
    list.push(e);
    groups.set(k, list);
  }
  const out: TrackedSubscription[] = [];
  for (const [key, list] of groups) {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 2) continue;
    const gaps = sorted.slice(1).map((e, i) => (Date.parse(e.date) - Date.parse(sorted[i].date)) / DAY);
    const median = [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
    let interval: "monthly" | "yearly" | null = null;
    if (sorted.length >= 3 && median >= 25 && median <= 36) interval = "monthly";
    else if (median >= 330 && median <= 400) interval = "yearly";
    if (!interval) continue;
    const amounts = sorted.map((e) => e.amount).sort((a, b) => a - b);
    const mid = amounts[Math.floor(amounts.length / 2)];
    const steady = amounts.every((a) => Math.abs(a - mid) <= mid * 0.15);
    if (!steady) continue;
    const last = sorted[sorted.length - 1];
    out.push({
      key,
      name: last.party,
      amount: last.amount,
      interval,
      category: last.category,
      lastCharge: last.date,
      nextRenewal: nextRenewalFrom(last.date, interval, addDays(today, 1)),
      yearly: interval === "monthly" ? last.amount * 12 : last.amount,
      charges: sorted.length,
      source: "detected",
    });
  }
  return out;
}

export function trackSubscriptions(
  entries: BookEntry[],
  registry: Subscription[],
  today = new Date().toISOString().slice(0, 10),
): TrackedSubscription[] {
  const detected = new Map(detectSubscriptions(entries, today).map((s) => [s.key, s]));
  const out: TrackedSubscription[] = [];
  for (const r of registry) {
    const key = merchantKey(r.match);
    const seen = detected.get(key);
    detected.delete(key);
    if (r.endsAt && r.endsAt <= today) continue;
    const next = nextRenewalFrom(r.startedAt, r.interval, addDays(today, 1));
    // Once the first term is over, the forecast uses the stepped price.
    const priceAtNext = r.nextAmount !== undefined && next !== r.startedAt ? r.nextAmount : r.amount;
    out.push({
      key,
      name: r.name,
      amount: r.amount,
      interval: r.interval,
      category: r.category,
      lastCharge: seen?.lastCharge ?? (r.startedAt <= today ? r.startedAt : undefined),
      nextRenewal: next,
      yearly: r.interval === "monthly" ? priceAtNext * 12 : priceAtNext,
      charges: seen?.charges ?? (r.startedAt <= today ? 1 : 0),
      source: "registry",
      note: r.note,
      url: r.url,
      nextAmount: r.nextAmount,
      endsAt: r.endsAt,
    });
  }
  out.push(...detected.values());
  return out.sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal));
}
