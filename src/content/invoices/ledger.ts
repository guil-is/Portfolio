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
  /** ISO issue date. */
  issuedAt: string;
  /** Grand total (incl. tax) in `currency`. */
  total: number;
  currency: "EUR" | "USD";
  note?: string;
};

export const invoiceLedger: LedgerEntry[] = [
  {
    number: "INV-26015",
    client: "Sustainable Public Affairs (WinWin 2026)",
    issuedAt: "2026-07-02",
    total: 1560,
    currency: "EUR",
    note: "30% deposit, credited to the Phase 1–2 invoice (reverse charge)",
  },
  {
    number: "INV-26014",
    client: "Studio Huit",
    issuedAt: "2026-07-02",
    total: 3510.5,
    currency: "EUR",
    note: "Safe Workspace launch video, motion design (€2,950 + 19% MwSt)",
  },
  {
    number: "INV-26013",
    client: "Myosin",
    issuedAt: "2026-06-23",
    total: 800,
    currency: "USD",
    note: "Hivemind launch video, pt. 2 (issued via Wise)",
  },
  {
    number: "INV-26012",
    client: "red onion GmbH (TEDxBerlin)",
    issuedAt: "2026-06-23",
    total: 1190,
    currency: "EUR",
    note: "TEDxBerlin aftermovie (€1,000 + 19% MwSt)",
  },
  // TODO: INV-26010 and INV-26011 were issued outside this repo — backfill
  // client/amount when convenient. They still count for numbering.
  { number: "INV-26011", client: "(backfill)", issuedAt: "2026-06-01", total: 0, currency: "USD" },
  { number: "INV-26010", client: "(backfill)", issuedAt: "2026-06-01", total: 0, currency: "USD" },
  {
    number: "INV-26009",
    client: "Justice Conder",
    issuedAt: "2026-05-30",
    total: 1499,
    currency: "USD",
    note: "Retainer May 25–29 (12h + $59 expenses)",
  },
  {
    number: "INV-26008",
    client: "Justice Conder",
    issuedAt: "2026-05-22",
    total: 2280,
    currency: "USD",
    note: "Retainer May 18–22 (19h)",
  },
  {
    number: "INV-26007",
    client: "Justice Conder",
    issuedAt: "2026-05-15",
    total: 4257,
    currency: "USD",
    note: "Retainer May 4–15 (35h + $57 expenses)",
  },
  {
    number: "INV-26006",
    client: "Justice Conder",
    issuedAt: "2026-04-30",
    total: 3216.99,
    currency: "USD",
    note: "Retainer Apr 20 – May 1 (26.1h + $84.99 expenses)",
  },
  {
    number: "INV-26005",
    client: "Justice Conder",
    issuedAt: "2026-04-18",
    total: 1800,
    currency: "USD",
    note: "Retainer Apr 6–17 (15h)",
  },
  {
    number: "INV-26004",
    client: "Justice Conder",
    issuedAt: "2026-04-03",
    total: 1200,
    currency: "USD",
    note: "Retainer kickoff Mar 23 – Apr 3 (10h)",
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
