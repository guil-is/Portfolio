/**
 * Ledger of issued invoices, most recent first. Two jobs:
 *
 * 1. `nextInvoiceNumber()` — the CLI suggests max + 1 from here, so
 *    APPEND AN ENTRY EVERY TIME AN INVOICE IS ISSUED.
 * 2. A lightweight record of what went out, independent of any client's
 *    hours log.
 *
 * Justice retainer invoices are additionally tracked in
 * `src/content/clients/justice.ts` (`hoursLog[].invoice`) — keep both in
 * sync for that client.
 */

export type LedgerEntry = {
  number: string;
  client: string;
  /** Registry slug (src/content/clients/registry.ts) when the client has
   * a /for/ page — this is what links an invoice to its client record.
   * Unset only for clients that predate the site (e.g. ThriveCoin). */
  clientSlug?: string;
  /** ISO issue date. */
  issuedAt: string;
  /** ISO date payment is due. Set it so the invoice shows on the payment
   * radar (`npm run invoice -- --status`); an entry with no `dueAt` is
   * treated as untracked/legacy and stays off the radar. */
  dueAt?: string;
  /** ISO date payment landed. Set this when paid — it clears the invoice
   * from the outstanding/overdue radar. */
  paidAt?: string;
  /** Grand total (incl. tax) in `currency`. */
  total: number;
  currency: "EUR" | "USD";
  note?: string;
};

export const invoiceLedger: LedgerEntry[] = [
  {
    number: "INV-26015",
    client: "Sustainable Public Affairs (WinWin 2026)",
    clientSlug: "spa",
    issuedAt: "2026-07-02",
    dueAt: "2026-07-07",
    total: 1560,
    currency: "EUR",
    note: "30% deposit, credited to the Phase 1–2 invoice (reverse charge)",
  },
  {
    number: "INV-26014",
    client: "Studio Huit",
    clientSlug: "huit",
    issuedAt: "2026-07-02",
    dueAt: "2026-07-16",
    total: 3510.5,
    currency: "EUR",
    note: "Safe Workspace launch video, motion design (€2,950 + 19% MwSt)",
  },
  {
    number: "INV-26013",
    client: "Myosin",
    clientSlug: "myosin",
    issuedAt: "2026-06-23",
    total: 800,
    currency: "USD",
    note: "Hivemind launch video, pt. 2 (issued via Wise)",
  },
  {
    number: "INV-26012",
    client: "red onion GmbH (TEDxBerlin)",
    clientSlug: "tedxberlin",
    issuedAt: "2026-06-23",
    dueAt: "2026-07-07",
    total: 1190,
    currency: "EUR",
    note: "TEDxBerlin aftermovie (€1,000 + 19% MwSt)",
  },
  // Backfilled 2026-07-03 by reading the archived PDFs in Drive.
  {
    number: "INV-26011",
    client: "Myosin",
    clientSlug: "myosin",
    issuedAt: "2026-06-08",
    total: 800,
    currency: "USD",
    note: "Hivemind launch video, pt. 1 (§3a exempt, issued via Wise)",
  },
  {
    number: "INV-26010",
    client: "Justice Conder (Fraction Software LLC)",
    clientSlug: "justice",
    issuedAt: "2026-05-30",
    total: 1499,
    currency: "USD",
    note: "Retainer May 25–29 (12h + $59 expenses, §3a exempt)",
  },
  {
    number: "INV-26009",
    client: "Regens Unite Association (Baar, Switzerland)",
    issuedAt: "2026-05-27",
    total: 1534,
    currency: "USD",
    note: "Event coordination reimbursements, Devconnect ARG (§3a exempt)",
  },
  {
    number: "INV-26008",
    client: "Justice Conder",
    clientSlug: "justice",
    issuedAt: "2026-05-23",
    total: 2280,
    currency: "USD",
    note: "Retainer May 18–22 (19h)",
  },
  {
    number: "INV-26007",
    client: "Justice Conder",
    clientSlug: "justice",
    issuedAt: "2026-05-15",
    total: 4257,
    currency: "USD",
    note: "Retainer May 4–15 (35h + $57 expenses)",
  },
  {
    number: "INV-26006",
    client: "Justice Conder",
    clientSlug: "justice",
    issuedAt: "2026-04-30",
    total: 3205,
    currency: "USD",
    note: "Retainer (26h + $85 expenses) — invoiced amount, per archived PDF",
  },
  {
    number: "INV-26005",
    client: "Justice Conder",
    clientSlug: "justice",
    issuedAt: "2026-04-18",
    total: 1800,
    currency: "USD",
    note: "Retainer Apr 6–17 (15h)",
  },
  {
    number: "INV-26004",
    client: "Justice Conder",
    clientSlug: "justice",
    issuedAt: "2026-04-03",
    total: 1200,
    currency: "USD",
    note: "Retainer kickoff Mar 23 – Apr 3 (10h)",
  },

  // Pre-reform invoices (before the INV-260XX scheme). Date-numbered
  // (YYMMDD), kept here so the ledger is the complete 2026 income record.
  // They don't match the INV-\d+ pattern, so they don't affect numbering.
  // ⚠ Two things to review — see docs/making-an-invoice.md "Pre-reform
  // invoices to review": (1) the Feb and March invoices share number 260309
  // (duplicate — §14 UStG requires unique numbers); (2) the March invoice's
  // VAT-exemption note is wrong and should read §3a like the others.
  // Amounts below are the invoiced totals as archived.
  {
    number: "260309",
    client: "ThriveCoin (Daniel Jacobs)",
    issuedAt: "2026-03-30",
    total: 945,
    currency: "USD",
    note: "March consulting, 21h × $45. ⚠ duplicate no. 260309; PDF's VAT-exemption note is wrong (should be §3a).",
  },
  {
    number: "260309",
    client: "ThriveCoin (Daniel Jacobs)",
    issuedAt: "2026-03-09",
    total: 1750,
    currency: "USD",
    note: "Feb 1–7 consulting, pro-rated. ⚠ duplicate no. 260309 (shared with the March invoice).",
  },
  {
    number: "260131",
    client: "ThriveCoin (Daniel Jacobs)",
    issuedAt: "2026-01-31",
    total: 7000,
    currency: "USD",
    note: "January consulting, monthly fee. Doc cites §3a Abs. 2 (non-EU business).",
  },
];

/** Next number in the INV-XXXXX sequence, derived from the ledger. */
export function nextInvoiceNumber(): string {
  const max = invoiceLedger.reduce((acc, e) => {
    const m = /^INV-(\d+)$/.exec(e.number);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `INV-${max + 1}`;
}

const DAY_MS = 86_400_000;

export type OutstandingInvoice = LedgerEntry & {
  dueAt: string;
  /** Whole days overdue as of the reference date; ≤ 0 means not yet due. */
  overdueDays: number;
};

/**
 * Unpaid invoices that carry a due date, most-overdue first. `asOf` is an
 * ISO date (defaults handled by the caller, since Date isn't available in
 * every context). Entries with no `dueAt` are legacy/untracked and omitted.
 */
export function outstandingInvoices(asOf: string): OutstandingInvoice[] {
  const asOfMs = Date.parse(`${asOf}T00:00:00Z`);
  return invoiceLedger
    .filter((e): e is OutstandingInvoice => Boolean(e.dueAt) && !e.paidAt)
    .map((e) => ({
      ...e,
      overdueDays: Math.floor((asOfMs - Date.parse(`${e.dueAt}T00:00:00Z`)) / DAY_MS),
    }))
    .sort((a, b) => b.overdueDays - a.overdueDays);
}

/** Outstanding invoices already past their due date. */
export function overdueInvoices(asOf: string): OutstandingInvoice[] {
  return outstandingInvoices(asOf).filter((e) => e.overdueDays > 0);
}

/** Sum outstanding totals per currency. */
export function outstandingByCurrency(
  asOf: string,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const e of outstandingInvoices(asOf)) {
    totals[e.currency] = (totals[e.currency] ?? 0) + e.total;
  }
  return totals;
}
