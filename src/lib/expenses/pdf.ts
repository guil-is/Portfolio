/**
 * Best-effort reader for PDF bank statements. Browser only — pdf.js is
 * loaded on demand the first time a PDF is dropped, so it never lands in
 * the page bundle otherwise.
 *
 * Strategy: pull every page's text with positions, rebuild lines, then
 * treat each line that ends in a money amount as the end of one
 * transaction. The text lines above it (since the previous amount) are
 * the merchant + reference; the date comes from the same block or the
 * last one seen. This copes with N26's statement layout and most
 * single-column statements, but a CSV export is always the safer input.
 */

import { assignIds, detectKind } from "./parse";
import { AMOUNT_RE, DATE_RE, parseAmount, parseDate } from "./text";
import type { ParseResult, Transaction } from "./types";

/** One reconstructed line; `y` grows down the document (across pages). */
export type TextLine = { y: number; text: string };

const NOISE_LINE =
  /\b(saldo|balance|kontostand|summe|total|ubertrag|uebertrag|carry|zwischensumme|iban|bic|seite|page|statement|kontoauszug|auszug|zeitraum|period|ausgaben|einnahmen|expenses|income)\b/i;

async function extractLines(data: ArrayBuffer): Promise<TextLine[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const doc = await pdfjs.getDocument({ data }).promise;
  const lines: TextLine[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const rows = new Map<number, { x: number; str: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const x = item.transform[4];
      const y = Math.round(item.transform[5] / 3) * 3;
      const bucket = rows.get(y) ?? [];
      bucket.push({ x, str: item.str });
      rows.set(y, bucket);
    }
    const pageLines = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([y, parts]) => ({
        y: p * 100000 - y,
        text: parts
          .sort((a, b) => a.x - b.x)
          .map((s) => s.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
      }));
    lines.push(...pageLines);
  }
  return lines;
}

const TRAILING_AMOUNT = new RegExp(`${AMOUNT_RE.source}\\s*$`);
// Lookarounds instead of \b so "Überweisung" (non-ASCII first letter)
// still counts as a whole word.
const LABELS =
  /(?<![a-zäöüß])(value date|booking date|wertstellung(sdatum)?|buchungsdatum|buchungstag|valuta|datum|date|mastercard|visa|card payment|kartenzahlung|uberweisung|überweisung|lastschrift|direct debit|transfer|presentment)(?![a-zäöüß]):?/gi;
/** Separators between text fragments: " · ", " • ", " | ", " - ", edges. */
const SEPARATORS = /\s[·•|:-]+\s|^[·•|:-]+\s*|\s*[·•|:-]+$/g;

type Entry =
  | { kind: "amount"; y: number; line: string; rest: string; amountText: string; amount: number }
  | { kind: "text"; y: number; line: string };

/** Text left on an amount line once the amount, dates, and labels go. */
function restOf(line: string, amountMatch: string): string {
  return clean(line.replace(amountMatch, ""));
}

function clean(line: string): string {
  return line
    .replace(new RegExp(DATE_RE.source, "g"), "")
    .replace(LABELS, "")
    .replace(SEPARATORS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasName(text: string): boolean {
  return /[a-z]{3,}/i.test(text);
}

function firstDate(lines: string[]): string | null {
  for (const l of lines) {
    const m = l.match(DATE_RE);
    if (m) {
      const d = parseDate(m[1]);
      if (d) return d;
    }
  }
  return null;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Statements come in several shapes: the amount on the merchant's line
 * (N26: "Adobe … -64,99€", details under it), on a line of its own
 * between the merchant and the details, or on the last line after the
 * merchant and reference. Rather than guess the shape, each text line
 * is attached to whichever amount line sits closest to it vertically —
 * transactions are spaced further apart than the lines inside them.
 * Lines further away than a few line heights (page headers, addresses)
 * attach to nothing.
 */
export function linesToTransactions(lines: TextLine[]): ParseResult {
  const entries: Entry[] = [];
  for (const { y, text } of lines) {
    const line = text.trim();
    if (!line || NOISE_LINE.test(line)) continue;
    const amountMatch = line.match(TRAILING_AMOUNT);
    const amount = amountMatch ? parseAmount(amountMatch[1]) : null;
    if (!amountMatch || amount === null) {
      entries.push({ kind: "text", y, line });
      continue;
    }
    entries.push({
      kind: "amount",
      y,
      line,
      rest: restOf(line, amountMatch[0]),
      amountText: amountMatch[1].trim(),
      amount,
    });
  }

  const amounts = entries
    .map((e, i) => ({ e, i }))
    .filter((x): x is { e: Extract<Entry, { kind: "amount" }>; i: number } => x.e.kind === "amount");
  const named = amounts.filter((a) => hasName(a.e.rest)).length;
  const amountFirst = amounts.length > 0 && named * 2 >= amounts.length;

  // Split into blocks wherever the vertical gap is clearly wider than the
  // usual line spacing. A block with exactly one amount line is one
  // transaction, whichever line the amount sits on. Blocks without an
  // amount (headers, addresses) are dropped. Uniformly spaced documents
  // collapse into one block; those fall back to reading order: details
  // after the amount line when amount lines carry the merchant name,
  // before it otherwise.
  const gaps = entries.slice(1).map((e, i) => Math.abs(e.y - entries[i].y)).filter((g) => g > 0);
  const step = Math.max(1, median(gaps));
  const blocks: Entry[][] = [];
  let block: Entry[] = [];
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && Math.abs(entries[i].y - entries[i - 1].y) > step * 1.5 && block.length > 0) {
      blocks.push(block);
      block = [];
    }
    block.push(entries[i]);
  }
  if (block.length > 0) blocks.push(block);

  const attached = new Map<number, string[]>(amounts.map((a) => [a.i, []]));
  for (const b of blocks) {
    const idxs = b.map((e) => entries.indexOf(e));
    const amountIdxs = idxs.filter((i) => entries[i].kind === "amount");
    if (amountIdxs.length === 0) continue;
    if (amountIdxs.length === 1) {
      const target = amountIdxs[0];
      for (const i of idxs) if (i !== target) attached.get(target)!.push(entries[i].line);
      continue;
    }
    if (amountFirst) {
      let current: number | null = null;
      for (const i of idxs) {
        if (entries[i].kind === "amount") current = i;
        else if (current !== null) attached.get(current)!.push(entries[i].line);
      }
    } else {
      let pending: string[] = [];
      for (const i of idxs) {
        if (entries[i].kind === "amount") {
          attached.get(i)!.push(...pending);
          pending = [];
        } else {
          pending.push(entries[i].line);
        }
      }
    }
  }

  const drafts: Omit<Transaction, "id">[] = [];
  let lastDate: string | null = null;
  let unsignedCount = 0;
  let incomingCount = 0;
  for (const { e, i } of amounts) {
    const details = attached.get(i) ?? [];
    const date: string | null = firstDate([e.line, ...details]) ?? lastDate;
    if (!date) continue;
    lastDate = date;
    const textLines = [
      ...(hasName(e.rest) ? [e.rest] : []),
      ...details.map(clean),
    ].filter((l) => hasName(l));
    if (!/^[-+−]/.test(e.amountText)) unsignedCount++;
    if (e.amount > 0) {
      incomingCount++;
      continue;
    }
    const partner = textLines[0] ?? "Unknown";
    const reference = textLines.slice(1).join(" · ");
    drafts.push({
      date,
      partner,
      reference,
      type: "",
      kind: detectKind(e.line, partner, reference),
      amount: -Math.abs(e.amount),
      currency: "EUR",
      raw: { Text: [e.line, ...details].join(" | ") },
      source: "pdf",
    });
  }

  const warnings: string[] = [
    "Read from a PDF — merchant and reference are reconstructed from the page text. Spot-check a few rows against the statement; a CSV export is more reliable.",
  ];
  if (unsignedCount > 0) {
    warnings.push(
      `${unsignedCount} amount${unsignedCount === 1 ? " had" : "s had"} no sign, so incoming payments may have slipped in. Mark any you spot as “Skip” in All entries.`,
    );
  }
  return {
    transactions: assignIds(drafts).sort((a, b) => a.date.localeCompare(b.date)),
    format: "pdf",
    incomingCount,
    skippedRows: 0,
    warnings,
  };
}

export async function parseStatementPdf(data: ArrayBuffer): Promise<ParseResult> {
  const lines = await extractLines(data);
  const result = linesToTransactions(lines);
  if (result.transactions.length === 0) {
    result.warnings.push(
      "No transactions found in the PDF. Export a CSV from the N26 web app instead (My Account → Statements → Download CSV).",
    );
  }
  return result;
}
