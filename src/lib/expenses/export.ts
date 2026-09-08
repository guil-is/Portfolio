/**
 * Builds the sheet you paste into Google Sheets. TSV pastes straight
 * into a sheet as columns; CSV is the download fallback.
 */

import { csvCell } from "./csv";
import type { Item } from "./triage";
import { CATEGORY_LABELS } from "./types";

export type ExportOptions = {
  /** "business" → only the deductible rows; "all" → every decided row
   * with a Verdict column, for a full-year audit sheet. */
  scope: "business" | "all";
  /** Append Finanzamt / health-insurance rows under the business rows. */
  includeTax: boolean;
  /** "12,99" instead of "12.99" — for Sheets set to a German locale. */
  decimalComma: boolean;
};

export type ExportRow = {
  date: string;
  vendor: string;
  description: string;
  amount: number;
  category: string;
  verdict: string;
  by: string;
  note: string;
};

export function exportRows(items: Item[], opts: ExportOptions): ExportRow[] {
  const decided = items
    .filter((i) => i.decision)
    .sort((a, b) => a.tx.date.localeCompare(b.tx.date));
  const pick = (i: Item) => {
    const v = i.decision!.verdict;
    if (opts.scope === "all") return v !== "skip";
    if (v === "business") return true;
    if (v === "tax" && opts.includeTax) return true;
    return false;
  };
  return decided.filter(pick).map((i) => {
    const d = i.decision!;
    const desc =
      i.tx.reference ||
      (i.tx.originalAmount !== undefined
        ? `${Math.abs(i.tx.originalAmount).toFixed(2)} ${i.tx.originalCurrency}`
        : "");
    return {
      date: i.tx.date,
      vendor: i.tx.partner,
      description: desc,
      amount: Math.abs(i.tx.amount),
      category: CATEGORY_LABELS[d.category],
      verdict: d.verdict,
      by: d.by,
      note: d.note ?? "",
    };
  });
}

export function exportColumns(opts: ExportOptions): (keyof ExportRow)[] {
  return opts.scope === "all"
    ? ["date", "vendor", "description", "amount", "category", "verdict", "by", "note"]
    : ["date", "vendor", "description", "amount", "category", "note"];
}

export const COLUMN_LABELS: Record<keyof ExportRow, string> = {
  date: "Date",
  vendor: "Vendor",
  description: "Description",
  amount: "Amount (EUR)",
  category: "Category",
  verdict: "Verdict",
  by: "Decided by",
  note: "Note",
};

function cellText(row: ExportRow, col: keyof ExportRow, decimalComma: boolean): string {
  if (col === "amount") {
    const s = row.amount.toFixed(2);
    return decimalComma ? s.replace(".", ",") : s;
  }
  return String(row[col] ?? "");
}

export function toTsv(rows: ExportRow[], opts: ExportOptions, header = true): string {
  const cols = exportColumns(opts);
  const lines: string[] = [];
  if (header) lines.push(cols.map((c) => COLUMN_LABELS[c]).join("\t"));
  for (const r of rows) {
    lines.push(
      cols
        .map((c) => cellText(r, c, opts.decimalComma).replace(/[\t\r\n]+/g, " "))
        .join("\t"),
    );
  }
  return lines.join("\n");
}

export function toCsv(rows: ExportRow[], opts: ExportOptions): string {
  const cols = exportColumns(opts);
  const sep = opts.decimalComma ? ";" : ",";
  const lines = [cols.map((c) => COLUMN_LABELS[c]).join(sep)];
  for (const r of rows) {
    lines.push(cols.map((c) => csvCell(cellText(r, c, opts.decimalComma))).join(sep));
  }
  return lines.join("\r\n");
}
