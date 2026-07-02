/**
 * Types and pure computation for the invoice maker. The PDF layout lives
 * in `invoice-pdf.tsx`; static issuer/payment data in
 * `src/content/invoices/config.ts`; the CLI in `scripts/make-invoice.ts`.
 */

export type Currency = "EUR" | "USD";

/**
 * German-freelancer tax treatment for the invoice:
 * - `de-19` — domestic German client, 19% MwSt added.
 * - `outside-eu` — client outside the EU, VAT exempt per §3a UStG.
 * - `reverse-charge` — EU business client outside Germany, §13b UStG.
 * - `none` — no tax line at all (use deliberately).
 */
export type TaxMode = "de-19" | "outside-eu" | "reverse-charge" | "none";

export type InvoiceLine = {
  description: string;
  /** Quantity (e.g. hours). Paired with `unitPrice`. */
  qty?: number;
  /** Price per unit in the invoice currency. */
  unitPrice?: number;
  /** Fixed line total; overrides qty × unitPrice when set. */
  amount?: number;
};

export type BillTo = {
  name: string;
  /** Free-form lines under the name: contact, VAT id, address. */
  lines?: string[];
};

export type PaymentProfile = {
  heading: string;
  subheading?: string;
  rows: [label: string, value: string][];
};

export type InvoiceSpec = {
  /** e.g. "INV-26014" */
  number: string;
  /** ISO date the invoice is issued. */
  issuedAt: string;
  /** ISO date payment is due. */
  dueAt: string;
  /** Optional ISO date (or short label) for when the work happened. */
  serviceDate?: string;
  currency: Currency;
  taxMode: TaxMode;
  billTo: BillTo;
  lines: InvoiceLine[];
  /** Keys into `paymentProfiles` from the invoices config. */
  paymentProfiles: string[];
  /** Optional short note rendered above the payment details. */
  note?: string;
};

export function lineAmount(line: InvoiceLine): number {
  return line.amount ?? (line.qty ?? 0) * (line.unitPrice ?? 0);
}

export function subtotal(spec: InvoiceSpec): number {
  return spec.lines.reduce((sum, l) => sum + lineAmount(l), 0);
}

export function taxAmount(spec: InvoiceSpec): number {
  return spec.taxMode === "de-19" ? subtotal(spec) * 0.19 : 0;
}

export function grandTotal(spec: InvoiceSpec): number {
  return subtotal(spec) + taxAmount(spec);
}

export function taxNote(mode: TaxMode): string | null {
  switch (mode) {
    case "outside-eu":
      return "VAT exempt — place of supply outside the EU according to §3a UStG.";
    case "reverse-charge":
      return "Reverse charge — VAT liability transfers to the recipient per §13b UStG (Art. 196 EU VAT Directive).";
    default:
      return null;
  }
}

export function formatMoney(amount: number, currency: Currency): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  }).format(amount);
  return formatted;
}

/** EUR invoices use German date format; USD invoices use long en-US. */
export function formatDate(iso: string, currency: Currency): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  if (currency === "EUR") {
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${date.getUTCFullYear()}`;
  }
  return date.toLocaleDateString("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  });
}
