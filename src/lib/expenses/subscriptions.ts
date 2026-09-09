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
  /** Registry plan with no matching charge in the books (yet, or any more). */
  unseen?: boolean;
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
  const seen = new Set<string>();
  for (const e of entries) {
    if (e.kind !== "expense" || seen.has(e.id)) continue;
    seen.add(e.id);
    const k = merchantKey(e.party);
    const list = groups.get(k) ?? [];
    list.push(e);
    groups.set(k, list);
  }
  const out: TrackedSubscription[] = [];
  for (const [key, list] of groups) {
    // Same-day duplicates (a sheet row next to the bank row) collapse.
    const byDay = new Map<string, BookEntry>();
    for (const e of [...list].sort((a, b) => a.date.localeCompare(b.date))) {
      byDay.set(`${e.date}|${e.amount.toFixed(2)}`, e);
    }
    const sorted = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 2) continue;
    // Judge cadence on the charges priced like the latest one — a yearly
    // plan that became monthly, or an old aggregate row, shouldn't hide it.
    const latest = sorted[sorted.length - 1];
    const cluster = sorted.filter((e) => Math.abs(e.amount - latest.amount) <= latest.amount * 0.15);
    if (cluster.length < 2) continue;
    const gaps = cluster.slice(1).map((e, i) => (Date.parse(e.date) - Date.parse(cluster[i].date)) / DAY);
    const median = [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
    let interval: "monthly" | "yearly" | null = null;
    if (cluster.length >= 3 && median >= 25 && median <= 36) interval = "monthly";
    else if (median >= 330 && median <= 400) interval = "yearly";
    if (!interval) continue;
    // Lapsed plans (no charge for well over an interval) stay out.
    const sinceLast = (Date.parse(today) - Date.parse(latest.date)) / DAY;
    if (sinceLast > (interval === "monthly" ? 45 : 400)) continue;
    out.push({
      key,
      name: latest.party,
      amount: latest.amount,
      interval,
      category: latest.category,
      lastCharge: latest.date,
      nextRenewal: nextRenewalFrom(latest.date, interval, addDays(today, 1)),
      yearly: interval === "monthly" ? latest.amount * 12 : latest.amount,
      charges: cluster.length,
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
      unseen: !seen && !entries.some((e) => e.kind === "expense" && merchantKey(e.party) === key),
    });
  }
  out.push(...detected.values());
  return out.sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal));
}
