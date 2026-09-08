/**
 * Turns a bank CSV export into normalized `Transaction`s.
 *
 * Recognizes both N26 layouts by header name:
 *   2024+ : Booking Date, Value Date, Partner Name, Partner Iban, Type,
 *           Payment Reference, Account Name, Amount (EUR), Original
 *           Amount, Original Currency, Exchange Rate
 *   legacy: Date, Payee, Account number, Transaction type, Payment
 *           reference, Amount (EUR), Amount (Foreign Currency), Type
 *           Foreign Currency, Exchange Rate
 * (German-language headers too.) Anything else falls back to sniffing
 * the date and amount columns by their values.
 *
 * Only money going out survives — incoming rows are counted and dropped.
 */

import { parseCsv } from "./csv";
import {
  fold,
  hash32,
  headerKey,
  parseAmount,
  parseDate,
} from "./text";
import type { ParseResult, Transaction, TransactionKind } from "./types";

type Field =
  | "bookingDate"
  | "valueDate"
  | "partner"
  | "partnerIban"
  | "type"
  | "reference"
  | "accountName"
  | "amount"
  | "originalAmount"
  | "originalCurrency"
  | "exchangeRate";

const FIELD_PATTERNS: Record<Field, RegExp[]> = {
  bookingDate: [
    /^booking date$/,
    /^buchungsdatum$/,
    /^date$/,
    /^datum$/,
    /^transaction date$/,
    /^booked at$/,
    /^buchungstag$/,
  ],
  valueDate: [/^value date$/, /^wertstellung(sdatum)?$/, /^valuta(datum)?$/],
  partner: [
    /^partner name$/,
    /^payee$/,
    /^empfanger$/,
    /^empfanger auftraggeber$/,
    /^auftraggeber empfanger$/,
    /^beguenstigter zahlungspflichtiger$/,
    /^beneficiary$/,
    /^merchant$/,
    /^counterparty$/,
    /^name$/,
    /^partner$/,
  ],
  partnerIban: [/^partner iban$/, /^account number$/, /^kontonummer$/, /^iban$/],
  type: [/^type$/, /^typ$/, /^transaction type$/, /^transaktionstyp$/, /^buchungstext$/],
  reference: [
    /^payment reference$/,
    /^verwendungszweck$/,
    /^reference$/,
    /^description$/,
    /^beschreibung$/,
    /^memo$/,
    /^purpose$/,
    /^details$/,
  ],
  accountName: [/^account name$/, /^kontoname$/],
  amount: [/^amount eur$/, /^betrag eur$/, /^amount$/, /^betrag$/, /^value$/],
  originalAmount: [
    /^original amount$/,
    /^amount foreign currency$/,
    /^betrag fremdwahrung$/,
    /^ursprunglicher betrag$/,
  ],
  originalCurrency: [
    /^original currency$/,
    /^type foreign currency$/,
    /^fremdwahrung$/,
    /^ursprungliche wahrung$/,
  ],
  exchangeRate: [/^exchange rate$/, /^wechselkurs$/],
};

function mapHeaders(headers: string[]): Partial<Record<Field, number>> {
  const map: Partial<Record<Field, number>> = {};
  const keys = headers.map(headerKey);
  for (const field of Object.keys(FIELD_PATTERNS) as Field[]) {
    for (const re of FIELD_PATTERNS[field]) {
      const idx = keys.findIndex((k, i) => re.test(k) && !Object.values(map).includes(i));
      if (idx >= 0) {
        map[field] = idx;
        break;
      }
    }
  }
  return map;
}

/** Sniff date/amount/partner columns by their values when headers are foreign. */
function sniffColumns(
  headers: string[],
  rows: string[][],
): Partial<Record<Field, number>> {
  const sample = rows.slice(0, 50);
  const cols = headers.length;
  const score = (fn: (v: string) => boolean, i: number) => {
    const values = sample.map((r) => r[i] ?? "").filter((v) => v.trim() !== "");
    if (values.length === 0) return 0;
    return values.filter(fn).length / values.length;
  };
  const map: Partial<Record<Field, number>> = {};
  let bestDate = -1;
  let bestDateScore = 0;
  for (let i = 0; i < cols; i++) {
    const s = score((v) => parseDate(v) !== null, i);
    if (s > bestDateScore) {
      bestDateScore = s;
      bestDate = i;
    }
  }
  if (bestDateScore >= 0.8) map.bookingDate = bestDate;

  let bestAmount = -1;
  let bestAmountScore = 0;
  for (let i = 0; i < cols; i++) {
    if (i === bestDate) continue;
    const s = score((v) => parseAmount(v) !== null && !/^\d{4}$/.test(v.trim()), i);
    const nameBoost = /amount|betrag|value|summe/.test(headerKey(headers[i])) ? 0.05 : 0;
    if (s + nameBoost > bestAmountScore) {
      bestAmountScore = s + nameBoost;
      bestAmount = i;
    }
  }
  if (bestAmountScore >= 0.8) map.amount = bestAmount;

  // Partner: the text column with the most distinct short values; the
  // rest of the text columns become the reference.
  let bestPartner = -1;
  let bestDistinct = 0;
  for (let i = 0; i < cols; i++) {
    if (i === map.bookingDate || i === map.amount) continue;
    const values = sample.map((r) => (r[i] ?? "").trim()).filter(Boolean);
    const textish = values.filter((v) => parseAmount(v) === null && parseDate(v) === null);
    if (textish.length < values.length * 0.8) continue;
    const distinct = new Set(textish.map(fold)).size;
    if (distinct > bestDistinct) {
      bestDistinct = distinct;
      bestPartner = i;
    }
  }
  if (bestPartner >= 0) map.partner = bestPartner;
  return map;
}

export function detectKind(type: string, partner: string, reference: string): TransactionKind {
  const t = fold(type);
  const all = fold(`${partner} ${reference}`);
  if (/space|savings|sub ?account|unterkonto|pocket/.test(t)) return "internal";
  if (/^(to|from) space|spaces? transfer|umbuchung space/.test(all)) return "internal";
  if (/atm|withdrawal|cash|bargeld|abhebung|geldautomat/.test(t)) return "atm";
  if (/fee|gebuhr|entgelt|membership/.test(t)) return "fee";
  if (/presentment|mastercard|card|karte|pos|purchase|kartenzahlung/.test(t)) return "card";
  if (/direct debit|lastschrift|sepa dd|debit/.test(t)) return "debit";
  if (/transfer|uberweisung|credit|outgoing|zahlung|gutschrift|sepa|instant/.test(t)) {
    return "transfer";
  }
  return "other";
}

function rowValue(row: string[], idx: number | undefined): string {
  if (idx === undefined) return "";
  return (row[idx] ?? "").trim();
}

/**
 * Stable per-row id. Duplicates (same date/partner/amount/reference —
 * two coffees at the same café) get an occurrence suffix so they stay
 * distinct across reloads regardless of row order.
 */
export function assignIds(
  drafts: Omit<Transaction, "id">[],
): Transaction[] {
  const seen = new Map<string, number>();
  return drafts.map((d) => {
    const base = `${d.date}|${fold(d.partner)}|${d.amount.toFixed(2)}|${fold(d.reference)}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return { ...d, id: hash32(`${base}|${n}`) };
  });
}

export function parseStatementCsv(text: string): ParseResult {
  const rows = parseCsv(text);
  const warnings: string[] = [];
  if (rows.length < 2) {
    return {
      transactions: [],
      format: "generic-csv",
      incomingCount: 0,
      skippedRows: 0,
      warnings: ["The file has no data rows."],
    };
  }

  const headers = rows[0].map((h) => h.trim());
  let map = mapHeaders(headers);
  let format: ParseResult["format"] = "generic-csv";
  const keys = headers.map(headerKey);
  if (keys.includes("partner name") && keys.some((k) => /^amount eur$|^betrag eur$/.test(k))) {
    format = "n26-2024";
  } else if (keys.includes("payee") || keys.includes("transaction type")) {
    format = "n26-legacy";
  }

  if (map.amount === undefined || map.bookingDate === undefined) {
    const sniffed = sniffColumns(headers, rows.slice(1));
    map = { ...sniffed, ...map };
    format = "generic-csv";
    if (map.amount === undefined || map.bookingDate === undefined) {
      return {
        transactions: [],
        format,
        incomingCount: 0,
        skippedRows: rows.length - 1,
        warnings: [
          "Couldn't find a date and an amount column. Export the CSV from the N26 web app (Transactions → Download) and try again.",
        ],
      };
    }
    warnings.push(
      "Headers weren't recognized as an N26 export — date, amount, and merchant columns were guessed from their values. Check a few rows.",
    );
  }

  const drafts: Omit<Transaction, "id">[] = [];
  let incomingCount = 0;
  let skippedRows = 0;

  for (const row of rows.slice(1)) {
    const amount = parseAmount(rowValue(row, map.amount));
    const date =
      parseDate(rowValue(row, map.bookingDate)) ?? parseDate(rowValue(row, map.valueDate));
    if (amount === null || date === null) {
      skippedRows++;
      continue;
    }
    if (amount >= 0) {
      incomingCount++;
      continue;
    }
    const partner = rowValue(row, map.partner);
    const reference = rowValue(row, map.reference);
    const type = rowValue(row, map.type);
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (h && (row[i] ?? "").trim() !== "") raw[h] = row[i].trim();
    });
    const originalAmount = parseAmount(rowValue(row, map.originalAmount));
    const originalCurrency = rowValue(row, map.originalCurrency);
    drafts.push({
      date,
      partner: partner || reference || "Unknown",
      reference,
      type,
      kind: detectKind(type, partner, reference),
      amount,
      currency: "EUR",
      originalAmount:
        originalAmount !== null && originalCurrency && originalCurrency !== "EUR"
          ? originalAmount
          : undefined,
      originalCurrency:
        originalAmount !== null && originalCurrency && originalCurrency !== "EUR"
          ? originalCurrency
          : undefined,
      raw,
      source: "csv",
    });
  }

  if (skippedRows > 0) {
    warnings.push(`${skippedRows} row${skippedRows === 1 ? "" : "s"} had no readable date or amount and were skipped.`);
  }

  const transactions = assignIds(drafts).sort((a, b) => a.date.localeCompare(b.date));
  return { transactions, format, incomingCount, skippedRows, warnings };
}
