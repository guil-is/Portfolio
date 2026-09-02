/**
 * Invoices downloadable from client pages, keyed by invoice number.
 *
 * The download route (/api/invoice/[number]) re-renders the PDF from the
 * spec here, so KEEP EACH SPEC IN SYNC WITH THE PDF THAT WAS EMAILED —
 * same dates, line wording, and amounts. Only invoices listed here are
 * downloadable; everything else 404s.
 *
 * This is intentionally separate from the ledger: the ledger records that
 * an invoice went out, this holds the full spec needed to reproduce it.
 */

import type { InvoiceSpec } from "../../lib/invoice";
import { billToPresets } from "./config";

export const issuedInvoices: Record<string, InvoiceSpec> = {
  "INV-26020": {
    number: "INV-26020",
    issuedAt: "2026-09-02",
    dueAt: "2026-09-16",
    serviceDate: "2026-07-29",
    serviceEndDate: "2026-09-02",
    currency: "EUR",
    taxMode: "reverse-charge",
    billTo: billToPresets.spa,
    lines: [
      {
        description: "WinWin 2026: Phase 3 (full website + assets)",
        amount: 3800,
      },
    ],
    paymentProfiles: ["n26-eur"],
  },
  "INV-26016": {
    number: "INV-26016",
    issuedAt: "2026-07-27",
    dueAt: "2026-08-10",
    serviceDate: "Phases 1-2 (weeks 1-2)",
    currency: "EUR",
    taxMode: "reverse-charge",
    billTo: billToPresets.spa,
    lines: [
      {
        description:
          "WinWin 2026: Phases 1-2 (visual identity + invitation)",
        amount: 5200,
      },
      {
        description: "Less deposit paid on INV-26015 (credited)",
        amount: -1560,
      },
    ],
    paymentProfiles: ["n26-eur"],
  },
  "INV-26015": {
    number: "INV-26015",
    issuedAt: "2026-07-02",
    dueAt: "2026-07-16",
    serviceDate: "2026-07-02",
    currency: "EUR",
    taxMode: "reverse-charge",
    billTo: billToPresets.spa,
    lines: [
      {
        description:
          "WinWin 2026: 30% deposit on signing, credited to the Phase 1-2 invoice",
        amount: 1560,
      },
    ],
    paymentProfiles: ["n26-eur"],
  },
};

export function getIssuedInvoice(number: string): InvoiceSpec | null {
  return Object.prototype.hasOwnProperty.call(issuedInvoices, number)
    ? issuedInvoices[number]
    : null;
}
