/**
 * Book rows that predate the tools — transcribed from the yearly Google
 * Sheet so /for/books can show those years. Read on the server and
 * passed down after the gate, like the ledger.
 *
 * 2025: from "2025" sheet (income rows with the USD rates it recorded;
 * expense rows as listed — several were aggregated per merchant over
 * Jan–May, dated to the end of that range). Expense rows are hidden
 * once an N26 import for the year exists, so nothing double-counts;
 * income rows always count because the invoice ledger starts in 2026.
 */

import type { BookEntry } from "@/lib/expenses/books";

type Seed = Omit<BookEntry, "id" | "source" | "updatedAt">;

const inc = (
  date: string,
  amount: number,
  party: string,
  reference: string,
  extra: Partial<Seed> = {},
): Seed => ({
  date,
  kind: "income",
  amount,
  party,
  reference,
  category: "other",
  vat: 0,
  currency: "EUR",
  ...extra,
});

const usd = (
  date: string,
  eur: number,
  original: number,
  party: string,
  reference: string,
  country: string,
  invoiceNr?: string,
): Seed =>
  inc(date, eur, party, reference, {
    currency: "USD",
    original,
    rate: Number((eur / original).toFixed(4)),
    country,
    invoiceNr,
  });

const exp = (
  date: string,
  amount: number,
  party: string,
  category: BookEntry["category"],
  reference = "",
): Seed => ({ date, kind: "expense", amount, party, reference, category, currency: "EUR" });

const tax = (
  date: string,
  amount: number,
  party: string,
  category: BookEntry["category"],
  reference = "",
): Seed => ({ date, kind: "tax", amount, party, reference, category, currency: "EUR" });

export const seedBooks: Record<number, Seed[]> = {
  2025: [
    // ── Income ────────────────────────────────────────────────────────
    usd("2025-01-29", 6915.32, 7200, "Giveth", "Design services for General Magic, Jan", "USA"),
    usd("2025-03-07", 5461.05, 5925, "Giveth", "Design services for General Magic, Feb", "USA"),
    usd("2025-04-07", 6537.91, 7200, "Giveth", "Design services for General Magic, Mar", "USA"),
    usd("2025-05-06", 3178.56, 3600, "Giveth", "Design services for General Magic, Apr", "USA"),
    usd("2025-05-23", 3336.68, 3779.12, "Regens Unite", "March + April 2025", "Switzerland"),
    usd("2025-06-05", 2365.54, 2700, "Giveth", "Remaining PTO General Magic, May", "Switzerland"),
    usd("2025-07-28", 562.68, 661.43, "Justice Conder", "Infographics", "USA"),
    usd("2025-07-28", 2004.44, 2350, "Regens Unite", "June + July", "Switzerland"),
    inc("2025-08-01", 2250, "WE ARE REBEL SC", "Gratiago UX/UI (reverse charge)", {
      country: "Belgium",
      invoiceNr: "2025-4",
    }),
    usd("2025-08-25", 1841.24, 2153.5, "Thrive", "Design services for Thrive website", "USA", "250825"),
    usd("2025-09-30", 5964, 7000, "Thrive", "Design consulting services, Sep 2025", "USA", "250930"),
    usd("2025-10-31", 6062, 7000, "Thrive", "Design consulting services, Oct 2025", "USA", "251031"),
    usd("2025-11-30", 6055, 7000, "Thrive", "Design consulting services, Nov 2025", "USA", "251130"),
    usd("2025-12-31", 5957, 7000, "Thrive", "Design consulting services, Dec 2025", "USA", "251231"),

    // ── Expenses (sheet order) ─────────────────────────────────────────
    exp("2025-01-01", 14.46, "Krea.ai", "software"),
    exp("2025-02-19", 91.73, "Krea.ai", "software"),
    exp("2025-05-31", 47.2, "Notion Labs", "software", "Jan–May 2025"),
    exp("2025-05-31", 153.21, "Magnific AI", "software", "Jan–May 2025"),
    exp("2025-05-31", 60.35, "Dzine.ai", "software", "Jan–May 2025"),
    exp("2025-05-31", 49.5, "N26", "fees", "Bank fees Jan–May 2025"),
    exp("2025-05-31", 708.48, "Adobe", "software", "Creative Cloud apps Feb–May 2025"),
    exp("2025-05-31", 149.95, "Adobe Stock", "assets", "Subscription Jan–May 2025"),
    exp("2025-03-20", 200, "Open Collective", "other"),
    exp("2025-01-08", 11.5, "Open Collective", "other"),
    exp("2025-05-31", 757.79, "Webflow", "web", "Jan–May 2025"),
    tax("2025-05-31", 6158.68, "Techniker Krankenkasse", "health", "Jan–May 2025"),
    exp("2025-05-31", 74.95, "artlist.io", "assets", "Jan–May 2025"),
    tax("2025-04-30", 304, "ENTEGA", "taxother", "Electricity Jan–Apr 2025 — home-office share, accountant applies the ratio"),
    exp("2025-05-31", 162.2, "Descript", "software", "Jan–May 2025"),
    exp("2025-05-31", 116.71, "Congstar", "telecom", "Jan–May 2025"),
    exp("2025-05-31", 224.9, "1&1 Telekom", "telecom", "Jan–May 2025"),
    exp("2025-01-31", 14.45, "Frame.io", "software"),
    exp("2025-02-01", 11.9, "Pitch.com", "software"),
    exp("2025-05-31", 74.25, "OpenAI", "software", "Feb–May 2025"),
    exp("2025-02-14", 279.2, "Midjourney", "software", "Yearly plan"),
    exp("2025-02-18", 109.88, "Opus Clip", "software", "Yearly plan"),
    exp("2025-05-31", 87.86, "Relume.io", "software", "Feb–May 2025"),
    exp("2025-03-05", 18, "Claude.ai", "software"),
    exp("2025-05-31", 55.44, "Perplexity.ai", "software", "Mar–May 2025"),
    exp("2025-05-31", 54.5, "Ideogram.ai", "software", "Mar–May 2025"),
    exp("2025-03-12", 22.21, "Loom", "software", "Subscription"),
    exp("2025-05-31", 13.53, "ElevenLabs", "software", "Mar–May 2025"),
    exp("2025-05-31", 54.11, "Lovable.ai", "software", "Mar–May 2025"),
    exp("2025-04-09", 14.71, "super.so", "web", "Notion to web service"),
    exp("2025-04-17", 25.71, "Pixel Surplus", "assets"),
    exp("2025-05-01", 84.44, "Tactiq.io", "software", "Yearly plan"),
    exp("2025-05-04", 49.63, "McPaper Berlin", "office", "Facilitation material"),
    exp("2025-05-06", 29.99, "Google One", "software"),
    exp("2025-05-06", 11.9, "Trust Collective", "other", "Membership"),
    exp("2025-05-09", 201.77, "Figma", "software", "Yearly plan"),
    exp("2025-06-02", 29.59, "Magnific AI", "software"),
    exp("2025-06-02", 8.82, "Notion", "software"),
    exp("2025-06-03", 29.99, "Adobe Stock", "assets", "Subscription"),
    exp("2025-06-04", 17.59, "Dzine.ai", "software"),
    exp("2025-07-12", 103, "IconScout", "assets"),
    exp("2025-07-24", 34.95, "CleanMyMac", "software"),
    exp("2025-07-31", 10.13, "Namecheap", "web", "Email add-on (guil.is) — date not in the sheet"),
    exp("2025-09-04", 359.44, "Fred Reichel", "services", "Accounting / legal services"),
    exp("2025-11-26", 128.62, "Envato", "assets", "Annual plan"),
  ],
};

/** Seed rows as book entries, ids stable per year + index. */
export function seedEntries(year: number): BookEntry[] {
  return (seedBooks[year] ?? []).map((s, i) => ({
    ...s,
    id: `seed-${year}-${i}`,
    source: "seed" as const,
    updatedAt: "",
  }));
}
