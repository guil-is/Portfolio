/**
 * The books: one list of entries per year, kept in this browser's
 * localStorage. This is what replaces the Google Sheet.
 *
 * Entries arrive three ways:
 *   - the N26 triage on /for/expenses writes every decided business and
 *     tax-relevant row here (personal and skipped rows are removed);
 *   - the invoice ledger in the repo supplies income (mapped at render
 *     time by the dashboard — not stored, the ledger is the truth);
 *   - you add rows by hand (cash receipts, a pre-ledger invoice).
 *
 * `sentAt` marks rows already copied into the accountant's Primanota, so
 * the next export can be "only what's new".
 */

import { classify, refineTaxCategory } from "./classify";
import { merchantKey, parseAmount } from "./text";
import { BUSINESS_CATEGORIES, TAX_CATEGORIES, type Category, type DecidedVerdict, type Transaction } from "./types";
import type { Item } from "./triage";

export type BookKind = "income" | "expense" | "tax";

export type BookEntry = {
  id: string;
  /** ISO date. */
  date: string;
  kind: BookKind;
  /** Positive EUR amount. */
  amount: number;
  /** Merchant or client. */
  party: string;
  reference: string;
  category: Category;
  note?: string;
  /** VAT rate on the receipt (19, 7, 0) when you know it — for Vorsteuer. */
  vat?: number;
  country?: string;
  invoiceNr?: string;
  currency?: "EUR" | "USD";
  /** Original amount when the payment was in another currency. */
  original?: number;
  /** EUR per 1 unit of the original currency. */
  rate?: number;
  source: "n26" | "manual" | "ledger" | "seed";
  /** Seed row that counts even when an import exists for its year
   * (rows added from chat) — unless a bank/manual row matches it. */
  keep?: boolean;
  /** Set when the row has been handed to the accountant. */
  sentAt?: string;
  updatedAt: string;
};

/** Figures that differ per tax year (partner's payslips, the Bescheid). */
export type YearSettings = {
  /** Partner's taxable income after their own deductions. */
  spouseIncome: number;
  /** Lohnsteuer + Soli withheld from the partner's salary. */
  spouseWithheld: number;
  /** Partner's wage-replacement benefits (Elterngeld etc.) — Progressionsvorbehalt. */
  spouseBenefits: number;
  /** Vorauszahlungen for the year not visible in the books (e.g. from a Bescheid). */
  prepaidExtra: number;
  /** Income-tax prepayments the Finanzamt set for the year (Vorauszahlungsbescheid), by due date. */
  scheduled?: { due: string; amount: number }[];
  /** Where the defaults came from, shown under the fields. */
  source?: string;
};

export type BooksSettings = {
  joint: boolean;
  /** Legacy single figures; `years` wins when set for the year. */
  spouseIncome: number;
  spouseWithheld: number;
  years: Record<number, YearSettings>;
  usdRate: number;
  /** "12,99" in exports, for a German-locale sheet. */
  decimalComma: boolean;
};

/**
 * Instalments of a Vorauszahlungsbescheid not yet covered by what was
 * paid, in due-date order (payments cover the earliest instalments first).
 */
export function unpaidInstalments(schedule: { due: string; amount: number }[], paid: number): { due: string; amount: number }[] {
  let covered = paid;
  const out: { due: string; amount: number }[] = [];
  for (const s of [...schedule].sort((a, b) => a.due.localeCompare(b.due))) {
    if (covered >= s.amount - 0.01) covered -= s.amount;
    else out.push(s);
  }
  return out;
}

export const EMPTY_YEAR: YearSettings = {
  spouseIncome: 0,
  spouseWithheld: 0,
  spouseBenefits: 0,
  prepaidExtra: 0,
};

const KEY = (year: number) => `books:v1:${year}`;
const YEARS_KEY = "books:v1:years";
const SETTINGS_KEY = "books:v1:settings";
const SUBS_META_KEY = "books:v1:subs-meta";

/**
 * A year's rows for the books: what's stored for the year plus the seed
 * rows that still apply — seed income always; seed expenses only until
 * an N26 import exists for the year (the import is the complete record),
 * unless the row is marked `keep`; and a kept row steps aside once the
 * same charge exists as a bank or quick-add row.
 */
export function mergeYearEntries(year: number, own: BookEntry[], seed: BookEntry[]): BookEntry[] {
  const mine = own.filter((e) => e.date.startsWith(String(year)));
  const hasImport = mine.some((e) => e.source === "n26");
  const seeded = seed.filter(
    (e) =>
      e.date.startsWith(String(year)) &&
      (e.kind === "income" || !hasImport || e.keep) &&
      !(e.keep && mine.some((o) => sameCharge(o, e))),
  );
  return [...mine, ...seeded];
}

/** How much a subscription earns its keep. 3 = essential, 1 = could cut. */
export type SubRating = 1 | 2 | 3;

/** What you decide about a subscription on the tab, keyed by merchant key. */
export type SubMeta = {
  rating?: SubRating;
  /** Not a subscription after all (a detected false positive) — hidden. */
  ignored?: boolean;
  /** ISO date you cancelled it. `null` = resubscribed (overrides a registry `endsAt`). */
  cancelledAt?: string | null;
};

export function loadSubsMeta(): Record<string, SubMeta> {
  return read<Record<string, SubMeta>>(SUBS_META_KEY) ?? {};
}

export function saveSubsMeta(meta: Record<string, SubMeta>): void {
  write(SUBS_META_KEY, meta);
}

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / private mode — the page still works for this session
  }
}

export function bookYears(): number[] {
  return (read<number[]>(YEARS_KEY) ?? []).sort((a, b) => b - a);
}

export function loadBook(year: number): BookEntry[] {
  return read<BookEntry[]>(KEY(year)) ?? [];
}

export function loadAllBooks(): BookEntry[] {
  return bookYears().flatMap((y) => loadBook(y));
}

/**
 * Finanzamt payments booked in OTHER years that name this one — an
 * "ESt VZ 2025" paid in May 2026 is a 2025 prepayment. Only income-tax
 * payments; VAT for another year is rare and left to the accountant.
 */
export function prepaidElsewhereFor(year: number, all: BookEntry[]): BookEntry[] {
  return all.filter((e) => {
    if (e.kind !== "tax" || e.date.startsWith(String(year))) return false;
    const ref = `${e.party} ${e.reference} ${e.note ?? ""}`.toLowerCase();
    if (!/finanzamt|finanzkasse|bundeskasse|landeshauptkasse|steuer/.test(ref)) return false;
    if (/umsatzsteuer|\bust\b|ust-?va|voranmeldung/.test(ref)) return false;
    const named = [...ref.matchAll(/(?<!\d)(20[0-4]\d)(?!\d)/g)].map((m) => Number(m[1]));
    return named.includes(year);
  });
}

export function saveBook(year: number, entries: BookEntry[]): void {
  write(KEY(year), entries);
  const years = new Set(bookYears());
  years.add(year);
  write(YEARS_KEY, [...years]);
}

/** Invoice numbers already handed to the accountant, per year. */
export function loadSentInvoices(year: number): string[] {
  return read<string[]>(`${KEY(year)}:sent-invoices`) ?? [];
}

export function saveSentInvoices(year: number, numbers: string[]): void {
  write(`${KEY(year)}:sent-invoices`, [...new Set(numbers)]);
}

export function loadBooksSettings(): BooksSettings {
  return {
    // Married, filing jointly — the 2024 Bescheid is a joint assessment.
    joint: true,
    spouseIncome: 0,
    spouseWithheld: 0,
    years: {},
    usdRate: 0.9,
    decimalComma: false,
    ...(read<Partial<BooksSettings>>(SETTINGS_KEY) ?? {}),
  };
}

export function saveBooksSettings(s: BooksSettings): void {
  write(SETTINGS_KEY, s);
}

function kindOf(verdict: DecidedVerdict): BookKind | null {
  if (verdict === "business") return "expense";
  if (verdict === "tax") return "tax";
  return null;
}

/**
 * Mirror the triage decisions into the books. Decided business / tax
 * rows are upserted by transaction id (keeping `sentAt` and any VAT /
 * country you set on the dashboard); rows now personal, skipped, or
 * undecided are removed. Manual and ledger rows are untouched. Returns
 * the years that changed.
 */
export function syncItemsIntoBooks(items: Item[]): number[] {
  const byYear = new Map<number, Item[]>();
  for (const i of items) {
    const y = Number(i.tx.date.slice(0, 4));
    const list = byYear.get(y) ?? [];
    list.push(i);
    byYear.set(y, list);
  }
  const changed: number[] = [];
  const now = new Date().toISOString();
  for (const [year, list] of byYear) {
    const book = loadBook(year);
    const existing = new Map(book.map((e) => [e.id, e]));
    const keepIds = new Set<string>();
    let dirty = false;
    for (const i of list) {
      const kind = i.decision ? kindOf(i.decision.verdict) : null;
      if (!kind || !i.decision) continue;
      keepIds.add(i.tx.id);
      const prev = existing.get(i.tx.id);
      const next: BookEntry = {
        id: i.tx.id,
        date: i.tx.date,
        kind,
        amount: Math.abs(i.tx.amount),
        party: i.tx.partner,
        reference: i.tx.reference,
        category: i.decision.category,
        note: i.decision.note,
        vat: prev?.vat,
        country: prev?.country,
        invoiceNr: prev?.invoiceNr,
        currency: i.tx.originalCurrency === "USD" ? "USD" : "EUR",
        original: i.tx.originalAmount !== undefined ? Math.abs(i.tx.originalAmount) : undefined,
        rate:
          i.tx.originalAmount !== undefined && i.tx.originalAmount !== 0
            ? Math.abs(i.tx.amount / i.tx.originalAmount)
            : undefined,
        source: "n26",
        sentAt: prev?.sentAt,
        updatedAt: prev?.updatedAt ?? now,
      };
      if (!prev || JSON.stringify({ ...prev, updatedAt: "" }) !== JSON.stringify({ ...next, updatedAt: "" })) {
        existing.set(i.tx.id, { ...next, updatedAt: now });
        dirty = true;
      }
    }
    // A manual row for the same charge (same merchant, same amount, within
    // a week) is superseded by the bank row — keep its category and note.
    for (const i of list) {
      const bank = existing.get(i.tx.id);
      if (!bank || bank.source !== "n26") continue;
      for (const m of [...existing.values()]) {
        if (m.source !== "manual" || m.kind !== bank.kind) continue;
        if (Math.abs(m.amount - bank.amount) > 0.01) continue;
        if (merchantKey(m.party) !== merchantKey(bank.party)) continue;
        if (Math.abs(Date.parse(m.date) - Date.parse(bank.date)) > 7 * 86_400_000) continue;
        existing.set(bank.id, {
          ...bank,
          category: m.category,
          note: m.note ?? bank.note,
          vat: m.vat ?? bank.vat,
          sentAt: m.sentAt ?? bank.sentAt,
          updatedAt: now,
        });
        existing.delete(m.id);
        dirty = true;
      }
    }
    // Drop n26 rows from this import that are no longer business/tax.
    const importIds = new Set(list.map((i) => i.tx.id));
    for (const e of book) {
      if (e.source === "n26" && importIds.has(e.id) && !keepIds.has(e.id)) {
        existing.delete(e.id);
        dirty = true;
      }
    }
    if (dirty) {
      saveBook(year, [...existing.values()].sort((a, b) => a.date.localeCompare(b.date)));
      changed.push(year);
    }
  }
  return changed;
}

export function newManualEntry(partial: Omit<BookEntry, "id" | "source" | "updatedAt">): BookEntry {
  return {
    ...partial,
    id: `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    source: "manual",
    updatedAt: new Date().toISOString(),
  };
}

export type TaxBucket = "tax" | "vat" | "health" | "taxother";

/** Which bucket a tax-relevant entry counts in. Rows still carrying the
 * broad "tax" category are re-read from their reference. */
export function taxBucketOf(e: BookEntry): TaxBucket {
  if (e.category === "vat" || e.category === "health" || e.category === "taxother") return e.category;
  if (e.category !== "tax") return "taxother";
  const tx: Transaction = {
    id: e.id,
    date: e.date,
    partner: e.party,
    reference: `${e.reference} ${e.note ?? ""}`,
    type: "",
    kind: "other",
    amount: -e.amount,
    currency: "EUR",
    raw: {},
    source: "csv",
  };
  const refined = refineTaxCategory(tx, { verdict: "tax", category: "tax", confidence: 1, reason: "" });
  return refined.category === "tax" ? "tax" : (refined.category as TaxBucket);
}

export type BookTotals = {
  year: number;
  /** Deductible business expenses. */
  expenses: number;
  /** Manual / seed income rows, net (years the ledger doesn't cover). */
  manualIncome: number;
  /** VAT collected on those rows (19 % ones). */
  manualVat: number;
  insurance: number;
  incomeTaxPrepaid: number;
  vatPaid: number;
  otherTax: number;
  rows: Record<TaxBucket, BookEntry[]>;
  /** Highest month (1–12) with any entry — how far the year is booked. */
  lastMonth: number;
};

export function bookTotals(entries: BookEntry[], year: number): BookTotals {
  const t: BookTotals = {
    year,
    expenses: 0,
    manualIncome: 0,
    manualVat: 0,
    insurance: 0,
    incomeTaxPrepaid: 0,
    vatPaid: 0,
    otherTax: 0,
    rows: { tax: [], vat: [], health: [], taxother: [] },
    lastMonth: 0,
  };
  for (const e of entries) {
    if (!e.date.startsWith(String(year))) continue;
    t.lastMonth = Math.max(t.lastMonth, Number(e.date.slice(5, 7)));
    if (e.kind === "expense") t.expenses += e.amount;
    else if (e.kind === "income") {
      const net = e.vat === 19 ? e.amount / 1.19 : e.amount;
      t.manualIncome += net;
      t.manualVat += e.amount - net;
    }
    else {
      const b = taxBucketOf(e);
      t.rows[b].push(e);
      if (b === "health") t.insurance += e.amount;
      else if (b === "vat") t.vatPaid += e.amount;
      else if (b === "tax") t.incomeTaxPrepaid += e.amount;
      else t.otherTax += e.amount;
    }
  }
  return t;
}

/**
 * Fraction of the year that has run, for projecting a partial year:
 * 1 for a past year, days elapsed / days in year for the current one.
 */
export function yearProgress(year: number, today = new Date()): number {
  const y = today.getFullYear();
  if (year < y) return 1;
  if (year > y) return 0;
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  const now = Date.UTC(y, today.getMonth(), today.getDate());
  return Math.min(1, Math.max(0.02, (now - start) / (end - start)));
}

/**
 * "Mobbin 119.88 yearly design library" → a manual expense dated today:
 * the first number is the amount, the words before it the merchant, the
 * rest a note. Category comes from the merchant rules, so "Mobbin" lands
 * in software without asking. Returns null when there's no amount.
 */
export function parseQuickAdd(
  text: string,
  today = new Date().toISOString().slice(0, 10),
): Omit<BookEntry, "id" | "source" | "updatedAt"> | null {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const idx = tokens.findIndex((t) => /^[€$]?-?\d[\d.,]*€?$/.test(t));
  if (idx < 0) return null;
  const amount = parseAmount(tokens[idx].replace(/[€$]/g, ""));
  if (amount === null || amount === 0) return null;
  const party = tokens.slice(0, idx).join(" ") || "Unknown";
  let rest = tokens.slice(idx + 1);
  let date = today;
  const dateTok = rest.find((t) => /^\d{4}-\d{2}-\d{2}$/.test(t) || /^\d{1,2}\.\d{1,2}\.(\d{2}|\d{4})$/.test(t));
  if (dateTok) {
    rest = rest.filter((t) => t !== dateTok);
    const m = dateTok.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
    date = m
      ? `${m[3].length === 2 ? "20" + m[3] : m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`
      : dateTok;
  }
  const note = rest.join(" ") || undefined;
  const guess = classify({
    id: "quick",
    date,
    partner: party,
    reference: note ?? "",
    type: "",
    kind: "card",
    amount: -Math.abs(amount),
    currency: "EUR",
    raw: {},
    source: "csv",
  });
  const kind: BookKind = guess.verdict === "tax" ? "tax" : "expense";
  // You're adding it as a work expense, so a "personal" verdict only
  // means the rules had no business category: food rules → meals.
  const category: Category =
    kind === "tax"
      ? guess.category
      : guess.ruleId === "restaurants" || guess.ruleId === "delivery"
        ? "meals"
        : guess.category === "personal" || guess.category === "internal"
          ? "other"
          : guess.category;
  return {
    date,
    kind,
    amount: Math.abs(amount),
    party,
    reference: "",
    note,
    category: TAX_CATEGORIES.includes(category) || BUSINESS_CATEGORIES.includes(category) ? category : "other",
    currency: "EUR",
  };
}

/** Same charge: same merchant, same amount (±1 ct), within a week. */
export function sameCharge(a: BookEntry, b: BookEntry): boolean {
  return (
    a.kind === b.kind &&
    Math.abs(a.amount - b.amount) <= 0.01 &&
    merchantKey(a.party) === merchantKey(b.party) &&
    Math.abs(Date.parse(a.date) - Date.parse(b.date)) <= 7 * 86_400_000
  );
}
