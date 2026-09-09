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
  2024: {
    zone1: 11_784,
    zone2: 17_005,
    zone3: 66_760,
    zone4: 277_825,
    y: [922.98, 1_400],
    z: [181.19, 2_397, 1_025.38],
    lin42: 10_602.13,
    lin45: 18_936.88,
    soliFree: 18_130,
  },
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
  /** Married, filing jointly (Zusammenveranlagung, Splittingtarif). */
  joint?: boolean;
  /** Partner's taxable income for the year (after their own deductions). */
  spouseIncome?: number;
  /** Lohnsteuer + Soli already withheld from the partner's salary. */
  spouseWithheld?: number;
  /** Partner's tax-free wage-replacement benefits (Elterngeld,
   * Krankengeld, ALG): not taxed, but they raise the rate on the rest
   * (Progressionsvorbehalt, § 32b EStG). */
  spouseBenefits?: number;
};

export type TaxEstimate = {
  tariffYear: number;
  joint: boolean;
  profit: number;
  sonderausgaben: number;
  /** Household taxable income when joint, else yours. */
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
  const own = Math.max(0, profit - sonderausgaben);
  const joint = Boolean(input.joint);
  // Sonderausgaben-Pauschbetrag: €36 per person, always granted.
  const pauschbetrag = joint ? 72 : 36;
  const taxable = Math.max(0, (joint ? own + Math.max(0, input.spouseIncome ?? 0) : own) - pauschbetrag);
  // Splittingtarif: tax the household income as two halves.
  const tariff = (z: number) => (joint ? 2 * incomeTax(z / 2, input.year) : incomeTax(z, input.year));
  const benefits = Math.max(0, input.spouseBenefits ?? 0);
  // Progressionsvorbehalt: the rate that would apply including the
  // tax-free benefits, applied to the taxable income alone.
  const tax =
    benefits > 0 && taxable > 0
      ? Math.floor((taxable * tariff(taxable + benefits)) / (taxable + benefits))
      : tariff(taxable);
  const surcharge = joint ? 2 * soli(tax / 2, input.year) : soli(tax, input.year);
  const liability = tax + surcharge;
  const prepaid = input.prepaid + (joint ? (input.spouseWithheld ?? 0) : 0);
  return {
    tariffYear,
    joint,
    profit,
    sonderausgaben,
    taxable,
    incomeTax: tax,
    soli: surcharge,
    liability,
    incomeTaxDue: liability - prepaid,
    vatDue: input.vatCollected - (input.vorsteuer ?? 0) - input.vatPaid,
    effectiveRate: profit > 0 ? liability / profit : 0,
  };
}
