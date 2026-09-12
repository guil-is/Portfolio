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

import type { BookEntry, SubMeta, SubRating } from "./books";
import { loadMemory, loadSession } from "./storage";
import { buildItems } from "./triage";
import { merchantKey, prettyMerchant } from "./text";

/** How the charge was triaged. Only business plans count in the totals. */
export type SubVerdict = "business" | "personal" | "undecided";

/** A book row, or a bank row that never reached the books (personal, undecided). */
export type SubSource = BookEntry & { verdict?: SubVerdict };

/**
 * Bank rows from the expenses session that never reached the books —
 * personal and undecided charges recur too. Skips rows already booked,
 * incoming money, internal moves and skipped rows.
 */
export function sessionSources(bookedIds: Set<string>): SubSource[] {
  const session = loadSession();
  if (!session) return [];
  return buildItems(session.parsed.transactions, loadMemory(), session.decisions)
    .filter((i) => !bookedIds.has(i.tx.id) && i.tx.amount < 0 && i.tx.kind !== "internal" && i.decision?.verdict !== "skip")
    .map((i) => ({
      id: i.tx.id,
      date: i.tx.date,
      kind: "expense" as const,
      amount: Math.abs(i.tx.amount),
      party: i.tx.partner,
      reference: i.tx.reference,
      category: i.decision?.category ?? "other",
      source: "n26" as const,
      updatedAt: "",
      verdict: i.decision?.verdict === "personal" ? "personal" : i.decision?.verdict === "business" ? "business" : "undecided",
    }));
}

/**
 * Merchant key for subscriptions: the cleaned name ("PAYPAL *MYFONTS" →
 * "myfonts", "ATLASSIAN PTY LTD" → "atlassian"), so one plan billed under
 * slightly different descriptors still lands on one row.
 */
export function subscriptionKey(party: string): string {
  return merchantKey(prettyMerchant(party));
}
import type { Category } from "./types";
import { knownSites, type Subscription } from "@/content/books/subscriptions";

export type TrackedSubscription = {
  key: string;
  name: string;
  /** What the bank calls it, when that differs from `name`. */
  raw?: string;
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
  rating?: SubRating;
  verdict: SubVerdict;
  /** Only two charges seen so far — probably monthly, confirm. */
  tentative?: boolean;
  /** Hidden on the tab as "not a subscription". */
  ignored?: boolean;
  /** ISO date it was cancelled (tab action or registry `endsAt`). Out of the totals. */
  cancelledAt?: string;
  /** A charge landed after the cancel date — the cancellation didn't take, or you're back. */
  chargedAfterCancel?: boolean;
};

export const RATING_LABELS: Record<SubRating, string> = {
  3: "Essential",
  2: "Useful",
  1: "Could cut",
};

/** Somewhere to click for a plan: registry url, then the known-sites table, then a search. */
export function websiteFor(s: Pick<TrackedSubscription, "key" | "name" | "url">): string {
  if (s.url) return s.url;
  const known = knownSites[s.key] ?? knownSites[s.key.split(" ")[0]];
  if (known) return known;
  return `https://duckduckgo.com/?q=${encodeURIComponent(`${s.name} subscription`)}`;
}

/** Your decisions from the tab (rating, ignored) laid over the tracked list. */
export function applySubsMeta(subs: TrackedSubscription[], meta: Record<string, SubMeta>): TrackedSubscription[] {
  return subs.map((s) => {
    const m = meta[s.key];
    const cancelledAt = m?.cancelledAt === undefined ? s.cancelledAt : (m.cancelledAt ?? undefined);
    return {
      ...s,
      rating: m?.rating ?? s.rating,
      ignored: m?.ignored ?? false,
      cancelledAt,
      chargedAfterCancel: Boolean(cancelledAt && s.lastCharge && s.lastCharge > cancelledAt),
    };
  });
}

export type SubSort = "renewal" | "cost" | "rating" | "name";

export function sortSubscriptions(subs: TrackedSubscription[], by: SubSort): TrackedSubscription[] {
  const list = [...subs];
  switch (by) {
    case "cost":
      return list.sort((a, b) => b.yearly - a.yearly || a.name.localeCompare(b.name));
    case "rating":
      // Essential first; unrated after the rated so they stand out at the bottom.
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.yearly - a.yearly);
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return list.sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal) || b.yearly - a.yearly);
  }
}

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

export function detectSubscriptions(entries: SubSource[], today: string): TrackedSubscription[] {
  const groups = new Map<string, SubSource[]>();
  const seen = new Set<string>();
  for (const e of entries) {
    if (e.kind !== "expense" || seen.has(e.id)) continue;
    seen.add(e.id);
    const k = subscriptionKey(e.party);
    const list = groups.get(k) ?? [];
    list.push(e);
    groups.set(k, list);
  }
  const out: TrackedSubscription[] = [];
  for (const [key, list] of groups) {
    // Same-day duplicates (a sheet row next to the bank row) collapse.
    const byDay = new Map<string, SubSource>();
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
    if (median >= 25 && median <= 36) interval = "monthly";
    else if (median >= 330 && median <= 400) interval = "yearly";
    if (!interval) continue;
    // Lapsed plans (no charge for well over an interval) stay out.
    const sinceLast = (Date.parse(today) - Date.parse(latest.date)) / DAY;
    if (sinceLast > (interval === "monthly" ? 45 : 400)) continue;
    const name = prettyMerchant(latest.party);
    // A plan is business if any charge was booked as business.
    const verdict: SubVerdict = cluster.some((e) => (e.verdict ?? "business") === "business")
      ? "business"
      : cluster.some((e) => e.verdict === "personal")
        ? "personal"
        : "undecided";
    out.push({
      key,
      name,
      raw: name === latest.party ? undefined : latest.party,
      amount: latest.amount,
      interval,
      category: latest.category,
      lastCharge: latest.date,
      nextRenewal: nextRenewalFrom(latest.date, interval, addDays(today, 1)),
      yearly: interval === "monthly" ? latest.amount * 12 : latest.amount,
      charges: cluster.length,
      source: "detected",
      verdict,
      tentative: interval === "monthly" && cluster.length < 3,
    });
  }
  return out;
}

export function trackSubscriptions(
  entries: SubSource[],
  registry: Subscription[],
  today = new Date().toISOString().slice(0, 10),
): TrackedSubscription[] {
  const detected = new Map(detectSubscriptions(entries, today).map((s) => [s.key, s]));
  const out: TrackedSubscription[] = [];
  for (const r of registry) {
    const key = subscriptionKey(r.match);
    const seen = detected.get(key);
    detected.delete(key);
    // No known start: step from the last bank charge (or today, so it shows up at all).
    const startedAt = r.startedAt ?? seen?.lastCharge ?? today;
    const next = nextRenewalFrom(startedAt, r.interval, addDays(today, 1));
    // Once the first term is over, the forecast uses the stepped price.
    const priceAtNext = r.nextAmount !== undefined && next !== startedAt ? r.nextAmount : r.amount;
    out.push({
      key,
      name: r.name,
      raw: seen?.raw ?? (seen && seen.name !== r.name ? seen.name : undefined),
      amount: r.amount,
      interval: r.interval,
      category: r.category,
      lastCharge: seen?.lastCharge ?? (r.startedAt && r.startedAt <= today ? r.startedAt : undefined),
      nextRenewal: next,
      yearly: r.interval === "monthly" ? priceAtNext * 12 : priceAtNext,
      charges: seen?.charges ?? (r.startedAt && r.startedAt <= today ? 1 : 0),
      source: "registry",
      note: r.note,
      url: r.url,
      nextAmount: r.nextAmount,
      endsAt: r.endsAt,
      rating: r.rating,
      cancelledAt: r.endsAt,
      verdict: "business",
      unseen: !seen && !entries.some((e) => e.kind === "expense" && subscriptionKey(e.party) === key),
    });
  }
  out.push(...detected.values());
  return out.sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal));
}

export type RenewalBucket = "week" | "month" | "quarter" | "later";

export const RENEWAL_BUCKET_LABELS: Record<RenewalBucket, string> = {
  week: "This week",
  month: "This month",
  quarter: "Next 3 months",
  later: "Later",
};

export function renewalBucket(days: number): RenewalBucket {
  if (days <= 7) return "week";
  if (days <= 30) return "month";
  if (days <= 90) return "quarter";
  return "later";
}

/** Days from `today` to the next renewal. */
export function daysUntil(iso: string, today: string): number {
  return Math.round((Date.parse(iso) - Date.parse(today)) / DAY);
}
