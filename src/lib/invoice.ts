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
  /** Set false for rails that can't carry a payment reference (crypto). */
  includeReference?: boolean;
};

export type InvoiceSpec = {
  /** e.g. "INV-26014" */
  number: string;
  /** ISO date the invoice is issued. */
  issuedAt: string;
  /** ISO date payment is due. */
  dueAt: string;
  /** Optional ISO date (or short label) for when the work happened.
   * With `serviceEndDate` it becomes the start of the service period. */
  serviceDate?: string;
  /** Optional ISO end date. Set it when the work spans a period rather
   * than a single day: the invoice then states the Leistungszeitraum
   * ("Service period", e.g. July 8 – August 11, 2026) instead of one
   * date, which is what §14 UStG asks for on multi-day engagements. */
  serviceEndDate?: string;
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

/** Wise-style amount: "800.00 USD", "1,190.00 EUR". */
export function formatMoney(amount: number, currency: Currency): string {
  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${num} ${currency}`;
}

/** Like formatMoney but drops a ".00" — for the headline and unit prices
 * ("800 USD due by …"), matching Wise. */
export function formatMoneyCompact(amount: number, currency: Currency): string {
  return formatMoney(amount, currency).replace(/\.00 /, " ");
}

/** Wise-style long date: "June 23, 2026". */
export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  });
}

/**
 * A service period, e.g. "July 8 – August 11, 2026". The year is printed
 * once when both ends fall in the same year, so the range stays narrow
 * enough for the invoice header.
 */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(`${startIso}T00:00:00Z`);
  const end = new Date(`${endIso}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${formatDate(startIso)} – ${formatDate(endIso)}`;
  }
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const startText = start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
  return `${startText} – ${formatDate(endIso)}`;
}
