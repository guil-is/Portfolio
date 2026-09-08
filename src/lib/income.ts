/**
 * Income per year from the invoice ledger, for the tax estimate on
 * /for/expenses. Server-side only — it imports the ledger, which must
 * not ship in a client bundle. The page passes the aggregates down.
 *
 * Cash basis (Zuflussprinzip), as for an EÜR: an invoice counts in the
 * year the money landed. Entries with no `paidAt` and no `dueAt` predate
 * payment tracking and are assumed paid on their issue date. Unpaid
 * tracked invoices are reported separately as outstanding.
 */

import { entryTaxMode, invoiceLedger, type LedgerEntry } from "@/content/invoices/ledger";

export type IncomeYear = {
  year: number;
  /** Net revenue received in EUR (VAT stripped from de-19 invoices). */
  eurNet: number;
  /** VAT collected on de-19 invoices received. */
  eurVat: number;
  /** USD received (converted in the UI at a rate you set). */
  usd: number;
  /** Unpaid invoices due — not counted above. */
  outstandingEurNet: number;
  outstandingUsd: number;
  invoices: number;
};

function receivedOn(e: LedgerEntry): string | null {
  if (e.paidAt) return e.paidAt;
  if (!e.dueAt) return e.issuedAt;
  return null;
}

function net(e: LedgerEntry): number {
  return entryTaxMode(e) === "de-19" ? e.total / 1.19 : e.total;
}

export function incomeByYear(): IncomeYear[] {
  const years = new Map<number, IncomeYear>();
  const bucket = (y: number) => {
    const cur = years.get(y) ?? {
      year: y,
      eurNet: 0,
      eurVat: 0,
      usd: 0,
      outstandingEurNet: 0,
      outstandingUsd: 0,
      invoices: 0,
    };
    years.set(y, cur);
    return cur;
  };
  for (const e of invoiceLedger) {
    const received = receivedOn(e);
    const b = bucket(Number((received ?? e.issuedAt).slice(0, 4)));
    if (received) {
      b.invoices++;
      if (e.currency === "EUR") {
        b.eurNet += net(e);
        b.eurVat += e.total - net(e);
      } else {
        b.usd += e.total;
      }
    } else if (e.currency === "EUR") {
      b.outstandingEurNet += net(e);
    } else {
      b.outstandingUsd += e.total;
    }
  }
  return [...years.values()].sort((a, b) => b.year - a.year);
}

/** One ledger invoice as a books row (what the accountant export needs). */
export type InvoiceRow = {
  number: string;
  client: string;
  /** Date the money landed (or issue date for legacy entries). */
  date: string;
  /** Gross total in `currency`. */
  total: number;
  currency: "EUR" | "USD";
  taxMode: "de-19" | "none";
  /** Unpaid, tracked — shown but not counted. */
  outstanding: boolean;
};

export function invoiceRows(): InvoiceRow[] {
  return invoiceLedger.map((e) => {
    const received = receivedOn(e);
    return {
      number: e.number,
      client: e.client,
      date: received ?? e.dueAt ?? e.issuedAt,
      total: e.total,
      currency: e.currency,
      taxMode: entryTaxMode(e),
      outstanding: !received,
    };
  });
}
