/**
 * Book rows that predate the tools — transcribed from the yearly Google
 * Sheet so /for/books can show those years. Read on the server and
 * passed down after the gate, like the ledger.
 *
 * 2024: from the "2024" sheet — 26 invoices with the sheet's USD rates
 * (German invoices kept gross + 19 %), expenses as listed (aggregates
 * dated 31 Dec), the three work-travel totals as travel rows.
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

/** German invoice: the sheet lists the net; the books keep gross + 19 %. */
const de = (
  date: string,
  net: number,
  party: string,
  reference: string,
  invoiceNr: string,
): Seed =>
  inc(date, Number((net * 1.19).toFixed(2)), party, reference, {
    vat: 19,
    country: "Germany",
    invoiceNr,
  });

export const seedBooks: Record<number, Seed[]> = {
  2024: [
    // ── Income (26 invoices, sheet rates) ─────────────────────────────
    usd("2024-01-01", 2172.96, 2400, "Giveth", "Design services for General Magic, Jan", "USA", "240101"),
    de("2024-01-15", 825, "Deutsche Aidshilfe", "Artwork licensing + image adaptation fee", "240115"),
    usd("2024-02-01", 1949.98, 2120, "Giveth", "Design services for General Magic, Feb", "USA", "240201"),
    usd("2024-02-19", 1957.44, 2109.76, "Hack Humanity", "Creative direction & flights Berlin–Denver, ESTA fee", "New Zealand", "240219"),
    usd("2024-03-01", 1494.61, 1620, "Giveth", "Design services for General Magic, Mar", "USA", "240301"),
    usd("2024-03-19", 981.03, 1065.99, "Hack Humanity", "Reimbursements during Arbitrum GovHack event", "New Zealand", "240319"),
    de("2024-03-21", 1720.5, "Fairplay / Richard O'Grady", "Creative direction & design services for Fairplay", "240321"),
    usd("2024-04-01", 6701.76, 7200, "Giveth", "Design services for General Magic, Apr", "USA", "240401"),
    usd("2024-04-08", 2947.2, 3200.35, "Hack Humanity", "Media production for Arbitrum GovHack event, part 1/2", "New Zealand", "240408"),
    usd("2024-05-01", 6721.92, 7200, "Giveth", "Design services for General Magic, May", "USA", "240501"),
    usd("2024-05-29", 2975.71, 3214.2, "Hack Humanity", "Media production for Arbitrum GovHack event, part 2/2", "New Zealand", "240529"),
    usd("2024-06-01", 6640.56, 7200, "Giveth", "Design services for General Magic, Jun", "USA", "240601"),
    usd("2024-06-28", 2234.66, 2394.36, "Hack Humanity", "Creative direction & design services, final 2/3", "New Zealand", "240628"),
    usd("2024-07-01", 6703.92, 7200, "Giveth", "Design services for General Magic, Jul", "USA", "240701"),
    usd("2024-08-01", 6672.24, 7200, "Giveth", "Design services for General Magic, Aug", "USA", "240801"),
    usd("2024-09-01", 6517.44, 7200, "Giveth", "Design services for General Magic, Sep", "USA", "240901"),
    usd("2024-10-01", 6505.2, 7200, "Giveth", "Design services for General Magic, Oct", "USA", "241001"),
    usd("2024-11-01", 6646.32, 7200, "Giveth", "Design services for General Magic, Nov", "USA", "241101"),
    de("2024-11-29", 800, "Deutsche Aidshilfe", "Commissioned artwork & licensing (postcards & stickers)", "241129"),
    usd("2024-12-01", 3811.55, 4031.25, "Giveth", "Design services for General Magic, Dec", "USA", "241201"),
    usd("2024-12-10", 3039.68, 3200, "Citizen Spring ASBL", "Global coordination & event production, Q1", "Belgium", "2412101"),
    usd("2024-12-10", 3039.68, 3200, "Citizen Spring ASBL", "Global coordination & event production, Q2", "Belgium", "2412102"),
    usd("2024-12-10", 3039.68, 3200, "Citizen Spring ASBL", "Global coordination & event production, Q3", "Belgium", "2412103"),
    usd("2024-12-30", 3170.97, 3300, "Citizen Spring ASBL", "Global coordination & event production, Q4 part 1", "Belgium", "2412301"),
    usd("2024-12-30", 3170.97, 3300, "Citizen Spring ASBL", "Global coordination & event production, Q3 part 2", "Belgium", "2412302"),
    usd("2024-12-30", 3267.06, 3400, "Citizen Spring ASBL", "Global coordination & event production, Q4 part 2", "Belgium", "2412303"),

    // ── Expenses (sheet order; "Jan–Dez" aggregates dated 31 Dec) ─────
    exp("2024-11-27", 286.84, "Topaz Labs", "software", "Photo/video AI tool"),
    exp("2024-12-31", 55.72, "Medium", "education", "Membership, articles/research, Jan–Dec"),
    tax("2024-12-31", 8803.41, "Techniker Krankenkasse", "health", "Jan–Dec 2024"),
    exp("2024-12-31", 640.98, "Figma", "software", "Jan–Dec 2024"),
    exp("2024-12-31", 398.65, "Framer", "web", "Jan–Dec 2024"),
    exp("2024-12-31", 142.8, "Pitch.com", "software", "Jan–Dec 2024"),
    tax("2024-12-31", 929.45, "ENTEGA", "taxother", "Electricity Jan–Dec 2024 — home-office share, accountant applies the ratio"),
    exp("2024-12-31", 539.76, "1&1 Telecom", "telecom", "Internet, Jan–Dec 2024"),
    exp("2024-12-31", 268.54, "Congstar", "telecom", "Mobile, Jan–Dec 2024"),
    exp("2024-07-31", 33.2, "Stylar.ai", "software", "May–Jul 2024"),
    exp("2024-12-31", 54.97, "Dzine.ai", "software", "Aug–Dec 2024"),
    exp("2024-05-19", 97.2, "Modulor", "office", "Art materials for workshop"),
    exp("2024-12-31", 1289.76, "Adobe", "software", "Creative Cloud, Jan–Dec 2024"),
    exp("2024-12-31", 288.46, "Magnific.ai", "software", "Jan–Dec 2024"),
    exp("2024-07-07", 1142.24, "Kamera Express", "production", "Camera rental, Regen Village shoot"),
    exp("2024-12-31", 281.6, "GoDaddy", "web", "Domains, Jan–Dec 2024"),
    exp("2024-09-04", 60, "MasterClass", "education"),
    exp("2024-02-21", 133.75, "StickerMule", "production", "Promotional printing"),
    exp("2024-10-31", 443.1, "StickerMule", "production", "Promotional printing"),
    exp("2024-11-01", 114.91, "StickerMule", "production", "Promotional printing"),
    exp("2024-06-27", 117.5, "StickerMule", "production", "Promotional printing"),
    exp("2024-06-29", 305.09, "StickerMule", "production", "Promotional printing"),
    exp("2024-07-04", 157.3, "StickerMule", "production", "Promotional printing"),
    exp("2024-12-31", 211.59, "Relume.io", "software", "Jan–Dec 2024"),
    exp("2024-12-31", 1291.11, "Webflow", "web", "Jan–Dec 2024"),
    exp("2024-01-02", 68.84, "ClickUp", "software"),
    exp("2024-12-31", 300.92, "Midjourney", "software", "Jan–Dec 2024"),
    exp("2024-12-31", 88.15, "Loom", "software", "Jan–Dec 2024"),
    exp("2024-12-31", 106.1, "Opus Clip", "software", "Jan–Dec 2024"),
    exp("2024-12-31", 152.76, "Krea.ai", "software", "Jan–Dec 2024"),
    exp("2024-12-31", 56.4, "Runway", "software", "Sep–Dec 2024"),
    exp("2024-12-31", 222.69, "ChatGPT", "software", "Jan–Dec 2024"),
    exp("2024-12-31", 423.99, "Frame.io", "software", "Jan–Dec 2024"),
    exp("2024-04-06", 131.99, "Rawpixel", "assets"),
    exp("2024-06-12", 64.8, "Freepik", "assets", "Premium, yearly"),
    exp("2024-04-04", 402.35, "Cabin.city", "other", "Year membership"),
    exp("2024-12-31", 327.5, "Open Collective", "other", "Memberships, Jan–Dec 2024"),
    exp("2024-12-31", 122.54, "Timely", "software", "Jan–Dec 2024"),
    exp("2024-12-31", 167.76, "Descript", "software", "Jan–Dec 2024"),
    exp("2024-02-24", 14.8, "Airalo", "travel", "Travel SIM"),
    exp("2024-03-12", 12.78, "Airalo", "travel", "Travel SIM"),
    exp("2024-03-23", 23.96, "Airalo", "travel", "Travel SIM"),
    exp("2024-04-01", 10.22, "Airalo", "travel", "Travel SIM"),
    exp("2024-07-21", 21.61, "Airalo", "travel", "Travel SIM"),
    exp("2024-07-25", 14.3, "Airalo", "travel", "Travel SIM"),
    exp("2024-10-23", 18.47, "Airalo", "travel", "Travel SIM"),
    exp("2024-11-09", 18.63, "Airalo", "travel", "Travel SIM"),
    exp("2024-12-31", 789.57, "PremiumBeat", "assets", "Music tracks, Jan–Dec 2024"),
    exp("2024-02-22", 791.64, "LensRentals", "production", "Camera rental"),
    exp("2024-03-12", 26.57, "LensRentals", "production", "Camera rental"),
    exp("2024-04-15", 529.95, "Flexispot", "hardware", "Office desk"),
    exp("2024-10-10", 41.6, "ElevenLabs", "software"),
    exp("2024-12-31", 112.97, "IconScout", "assets", "Jan–Dec 2024"),
    exp("2024-12-31", 89.92, "Tactiq.io", "software", "AI note-taker, Jan–Dec 2024"),
    exp("2024-04-27", 174, "Envato", "assets", "Design resources"),
    exp("2024-10-23", 39.47, "1Password", "software"),
    exp("2024-12-05", 72, "Grammarly", "software"),
    exp("2024-09-20", 52.17, "Namecheap", "web", "Domain registrar"),
    exp("2024-10-20", 138.62, "Typefully", "marketing"),
    exp("2024-12-31", 111.15, "Notion", "software", "Jan–Dec 2024"),
    exp("2024-12-31", 177.42, "super.so", "web", "Jan–Dec 2024"),
    exp("2024-12-31", 141.91, "logo-archive", "assets", "Jan–Dec 2024"),
    exp("2024-12-31", 143.8, "N26", "fees", "Business membership fees, Jan–Dec 2024"),
    exp("2024-12-31", 119.88, "iCloud", "software", "2 TB storage, 12 × monthly"),
    exp("2024-04-27", 29.99, "Google Storage", "software"),
    exp("2024-12-31", 101.94, "YouTube Premium", "other", "50 % share — mixed work/private (content research)"),
    exp("2024-12-31", 109.44, "Citizen Spring", "other", "Membership, Jan–Dec 2024"),
    exp("2024-01-03", 14.99, "Upscayl", "software"),
    exp("2024-05-01", 22.99, "Teleprompter", "software", "App, annual"),
    exp("2024-12-01", 96.99, "Amie", "software", "Calendar app, annual"),
    exp("2024-12-31", 4067.49, "Work travels", "travel", "Plane / train tickets 2024 (Denver, Rio, Brussels ×2, Thailand)"),
    exp("2024-12-31", 2321.45, "Work travels", "travel", "Accommodation 2024"),
    exp("2024-12-31", 5525, "Work travels", "travel", "Per diems 2024, 112 days"),
  ],
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
