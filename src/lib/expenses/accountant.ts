/**
 * The accountant's Primanota layout — the columns of the sheet you have
 * been filling by hand, so the copy pastes straight into it:
 *
 *   Date | Income (EUR) | Expense (EUR) | Client + Reference | USt./VAT %
 *   | Country | Invoice nr | Currency | USD to EUR | Income (USD)
 *
 * Income rows first, then expenses (tax-relevant rows among them — the
 * accountant sorts Krankenkasse and Finanzamt lines themselves).
 */

import type { BookEntry } from "./books";
import { CATEGORY_LABELS } from "./types";

export const ACCOUNTANT_COLUMNS = [
  "Date",
  "Income (EUR)",
  "Expense (EUR)",
  "Client + Reference",
  "USt./VAT %",
  "Country",
  "Invoice nr",
  "Currency",
  "USD to EUR",
  "Income (USD)",
  "Category",
] as const;

function dmy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function money(n: number | undefined, decimalComma: boolean): string {
  if (n === undefined) return "";
  const s = n.toFixed(2);
  return decimalComma ? s.replace(".", ",") : s;
}

export function accountantRow(e: BookEntry, decimalComma: boolean): string[] {
  const isIncome = e.kind === "income";
  const usd = e.currency === "USD";
  const label = [e.party, e.reference, e.note].filter(Boolean).join(" · ");
  return [
    dmy(e.date),
    isIncome ? money(e.amount, decimalComma) : "",
    isIncome ? "" : money(-e.amount, decimalComma),
    label,
    e.vat !== undefined ? `${e.vat}%` : isIncome ? "-" : "",
    e.country ?? "",
    e.invoiceNr ?? "",
    e.currency ?? "EUR",
    usd && e.rate !== undefined ? String(Number(e.rate.toFixed(4))) : "",
    usd && e.original !== undefined ? money(e.original, decimalComma) : "",
    e.kind === "tax" ? `Tax-relevant: ${CATEGORY_LABELS[e.category]}` : CATEGORY_LABELS[e.category],
  ];
}

export function accountantTsv(entries: BookEntry[], decimalComma: boolean, header = true): string {
  const sorted = [...entries].sort((a, b) => {
    const ka = a.kind === "income" ? 0 : 1;
    const kb = b.kind === "income" ? 0 : 1;
    return ka - kb || a.date.localeCompare(b.date);
  });
  const lines = header ? [ACCOUNTANT_COLUMNS.join("\t")] : [];
  for (const e of sorted) {
    lines.push(
      accountantRow(e, decimalComma)
        .map((c) => c.replace(/[\t\r\n]+/g, " "))
        .join("\t"),
    );
  }
  return lines.join("\n");
}
