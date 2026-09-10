/**
 * Pure state helpers for the triage flow. The React component and the
 * CLI both build on these so the two never disagree about what counts
 * as decided, pending, or exportable.
 */

import { classify, itemKey, refineTaxCategory } from "./classify";
import {
  AUTO_THRESHOLD,
  BUSINESS_CATEGORIES,
  TAX_CATEGORIES,
  type Category,
  type DecidedVerdict,
  type Decision,
  type Classification,
  type MerchantMemory,
  type Transaction,
} from "./types";

export type Item = {
  tx: Transaction;
  auto: Classification;
  decision?: Decision;
  /** Memory key shared with every other payment to the same merchant
   * (merchant + amount for pass-through billers like Apple). */
  key: string;
};

/** Explicit decisions by transaction id. `null` pins a row as "ask me"
 * even when the rules would have auto-decided it. */
export type DecisionMap = Record<string, Decision | null>;

export function buildItems(
  transactions: Transaction[],
  memory: Record<string, MerchantMemory>,
  saved: DecisionMap = {},
): Item[] {
  return transactions.map((tx) => {
    const auto = classify(tx, memory);
    const key = itemKey(tx);
    // A move between your own accounts is never an expense — a swipe on it
    // (from before the row was recognised) doesn't pin it.
    const pinned = tx.id in saved && auto.ruleId !== "kind-internal";
    let decision: Decision | undefined = pinned ? (saved[tx.id] ?? undefined) : undefined;
    if (!pinned && auto.verdict !== "unsure" && auto.confidence >= AUTO_THRESHOLD) {
      decision = {
        verdict: auto.verdict,
        category: auto.category,
        by: auto.ruleId === "memory" ? "memory" : "auto",
      };
    }
    return { tx, auto, decision, key };
  });
}

export function pendingItems(items: Item[]): Item[] {
  return items.filter((i) => !i.decision);
}

export function decidedItems(items: Item[], verdict: DecidedVerdict): Item[] {
  return items.filter((i) => i.decision?.verdict === verdict);
}

export function sumAmount(items: Item[]): number {
  return items.reduce((s, i) => s + Math.abs(i.tx.amount), 0);
}

/** Every other undecided payment sharing this merchant key. */
export function similarPending(items: Item[], item: Item): Item[] {
  return items.filter((i) => i !== item && !i.decision && i.key === item.key);
}

/** Every payment (decided or not) sharing this merchant key. */
export function sameMerchant(items: Item[], item: Item): Item[] {
  return items.filter((i) => i !== item && i.key === item.key);
}

export function makeDecision(
  verdict: DecidedVerdict,
  category: Category,
  note?: string,
): Decision {
  const keep =
    (verdict === "business" && BUSINESS_CATEGORIES.includes(category)) ||
    (verdict === "tax" && TAX_CATEGORIES.includes(category));
  return {
    verdict,
    category: keep ? category : defaultCategory(verdict),
    note: note?.trim() ? note.trim() : undefined,
    by: "you",
    at: new Date().toISOString(),
  };
}

export function defaultCategory(verdict: DecidedVerdict): Category {
  switch (verdict) {
    case "business":
      return "other";
    case "personal":
      return "personal";
    case "tax":
      // Unknown tax-relevant rows are listed, not counted, until you
      // say which bucket they belong to.
      return "taxother";
    case "skip":
      return "internal";
  }
}

export type Summary = {
  total: number;
  business: number;
  personal: number;
  tax: number;
  skip: number;
  pending: number;
  businessCount: number;
  pendingCount: number;
  count: number;
};

export function summarize(items: Item[]): Summary {
  const s: Summary = {
    total: sumAmount(items),
    business: 0,
    personal: 0,
    tax: 0,
    skip: 0,
    pending: 0,
    businessCount: 0,
    pendingCount: 0,
    count: items.length,
  };
  for (const i of items) {
    const a = Math.abs(i.tx.amount);
    if (!i.decision) {
      s.pending += a;
      s.pendingCount++;
      continue;
    }
    s[i.decision.verdict] += a;
    if (i.decision.verdict === "business") s.businessCount++;
  }
  return s;
}

export function byCategory(items: Item[]): { category: Category; total: number; count: number }[] {
  const map = new Map<Category, { total: number; count: number }>();
  for (const i of items) {
    if (i.decision?.verdict !== "business") continue;
    const cur = map.get(i.decision.category) ?? { total: 0, count: 0 };
    cur.total += Math.abs(i.tx.amount);
    cur.count++;
    map.set(i.decision.category, cur);
  }
  return [...map.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.total - a.total);
}

export function byMonth(items: Item[]): { month: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const i of items) {
    if (i.decision?.verdict !== "business") continue;
    const month = i.tx.date.slice(0, 7);
    const cur = map.get(month) ?? { total: 0, count: 0 };
    cur.total += Math.abs(i.tx.amount);
    cur.count++;
    map.set(month, cur);
  }
  return [...map.entries()]
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function formatEur(n: number, decimalComma = false): string {
  const s = Math.abs(n).toFixed(2);
  const [int, dec] = s.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, decimalComma ? "." : ",");
  return `${n < 0 ? "-" : ""}${grouped}${decimalComma ? "," : "."}${dec}`;
}

/** Which bucket a tax-relevant row counts in. Legacy rows still carrying
 * the broad "tax" category are re-read from their reference. */
export function taxBucket(item: Item): "tax" | "vat" | "health" | "taxother" {
  const c = item.decision?.category;
  if (c === "vat" || c === "health" || c === "taxother") return c;
  const refined = refineTaxCategory(item.tx, {
    verdict: "tax",
    category: "tax",
    confidence: 1,
    reason: "",
  });
  return refined.category === "tax" ? "tax" : (refined.category as "vat" | "health" | "taxother");
}

/** Years present in the data, most recent first. */
export function yearsOf(items: Item[]): number[] {
  return [...new Set(items.map((i) => Number(i.tx.date.slice(0, 4))))].sort((a, b) => b - a);
}
