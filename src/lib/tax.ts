/**
 * German income-tax estimate for a single freelancer (Einzelveranlagung,
 * no church tax, no children). Pure functions — the /for/expenses Tax tab
 * and any CLI can share them.
 *
 * Tariff parameters are the § 32a EStG figures per Veranlagungszeitraum.
 * Add a year here when the Finanzamt publishes it; the estimate falls
 * back to the latest known year otherwise.
 */

type Tariff = {
  /** Grundfreibetrag: no tax up to here. */
  zone1: number;
  /** End of the first progression zone. */
  zone2: number;
  /** End of the second progression zone. */
  zone3: number;
  /** End of the 42 % zone; 45 % above. */
  zone4: number;
  y: [a: number, b: number];
  z: [a: number, b: number, c: number];
  lin42: number;
  lin45: number;
  /** Solidaritätszuschlag: no surcharge up to this income tax. */
  soliFree: number;
};

const TARIFFS: Record<number, Tariff> = {
  2025: {
    zone1: 12_096,
    zone2: 17_443,
    zone3: 68_480,
    zone4: 277_825,
    y: [932.3, 1_400],
    z: [176.64, 2_397, 1_015.13],
    lin42: 10_911.92,
    lin45: 19_246.67,
    soliFree: 19_950,
  },
  2026: {
    zone1: 12_348,
    zone2: 17_799,
    zone3: 69_878,
    zone4: 277_825,
    y: [914.51, 1_400],
    z: [173.1, 2_397, 1_034.87],
    lin42: 11_135.63,
    lin45: 19_470.38,
    soliFree: 20_350,
  },
};

export function tariffFor(year: number): { year: number; tariff: Tariff } {
  const years = Object.keys(TARIFFS).map(Number).sort((a, b) => a - b);
  const known = years.filter((y) => y <= year);
  const pick = known.length > 0 ? known[known.length - 1] : years[0];
  return { year: pick, tariff: TARIFFS[pick] };
}

/** Income tax on the taxable income (zvE), § 32a Abs. 1 EStG. */
export function incomeTax(zvE: number, year: number): number {
  const { tariff: t } = tariffFor(year);
  const x = Math.floor(Math.max(0, zvE));
  if (x <= t.zone1) return 0;
  if (x <= t.zone2) {
    const y = (x - t.zone1) / 10_000;
    return Math.floor((t.y[0] * y + t.y[1]) * y);
  }
  if (x <= t.zone3) {
    const z = (x - t.zone2) / 10_000;
    return Math.floor((t.z[0] * z + t.z[1]) * z + t.z[2]);
  }
  if (x <= t.zone4) return Math.floor(0.42 * x - t.lin42);
  return Math.floor(0.45 * x - t.lin45);
}

/** Solidaritätszuschlag with the Milderungszone (11.9 % above the free amount). */
export function soli(tax: number, year: number): number {
  const { tariff: t } = tariffFor(year);
  if (tax <= t.soliFree) return 0;
  return Math.min(tax * 0.055, (tax - t.soliFree) * 0.119);
}

export type TaxInput = {
  year: number;
  /** Net revenue received in the year (EUR, without VAT). */
  revenue: number;
  /** Deductible business expenses (EUR). */
  expenses: number;
  /** Health insurance + Künstlersozialkasse + pension paid (Sonderausgaben). */
  insurance: number;
  /** Income-tax prepayments already made to the Finanzamt. */
  prepaid: number;
  /** VAT collected on invoices. */
  vatCollected: number;
  /** VAT already paid via Umsatzsteuer-Voranmeldungen. */
  vatPaid: number;
  /** Input VAT (Vorsteuer) on expenses, when known. */
  vorsteuer?: number;
};

export type TaxEstimate = {
  tariffYear: number;
  profit: number;
  sonderausgaben: number;
  taxable: number;
  incomeTax: number;
  soli: number;
  /** Income tax + soli for the year. */
  liability: number;
  /** What's left after prepayments: positive = pay, negative = refund. */
  incomeTaxDue: number;
  vatDue: number;
  /** Effective rate on profit, for a sanity check. */
  effectiveRate: number;
};

export function estimateTax(input: TaxInput): TaxEstimate {
  const { year: tariffYear } = tariffFor(input.year);
  const profit = input.revenue - input.expenses;
  // Basic health/pension cover is (almost) fully deductible as
  // Sonderausgaben; the few percent the Finanzamt trims are ignored here.
  const sonderausgaben = Math.max(0, input.insurance);
  const taxable = Math.max(0, profit - sonderausgaben);
  const tax = incomeTax(taxable, input.year);
  const surcharge = soli(tax, input.year);
  const liability = tax + surcharge;
  return {
    tariffYear,
    profit,
    sonderausgaben,
    taxable,
    incomeTax: tax,
    soli: surcharge,
    liability,
    incomeTaxDue: liability - input.prepaid,
    vatDue: input.vatCollected - (input.vorsteuer ?? 0) - input.vatPaid,
    effectiveRate: profit > 0 ? liability / profit : 0,
  };
}
