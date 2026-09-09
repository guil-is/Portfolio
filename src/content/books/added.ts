/**
 * Work expenses added from chat ("I just got a Mobbin subscription")
 * instead of on the page. They count in the books like manual rows.
 * When the same charge later shows up in an N26 import or was already
 * quick-added on the page (same merchant, same amount, within a week),
 * the row here steps aside, so nothing double-counts.
 *
 * Append a line; keep the date the money left the account.
 */

import type { BookEntry } from "@/lib/expenses/books";

type Added = Omit<BookEntry, "id" | "source" | "updatedAt">;

export const addedEntries: Added[] = [
  {
    date: "2026-09-09",
    kind: "expense",
    amount: 96,
    party: "Mobbin",
    reference: "",
    note: "Yearly plan, first year with 20 % discount — €120/year after",
    category: "software",
    currency: "EUR",
  },
];

export function addedBookEntries(): BookEntry[] {
  return addedEntries.map((e, i) => ({
    ...e,
    id: `added-${e.date}-${i}`,
    source: "seed" as const,
    keep: true,
    updatedAt: "",
  }));
}
