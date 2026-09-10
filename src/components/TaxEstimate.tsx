"use client";

import type { IncomeYear } from "@/lib/income";
import { estimateTax, type TaxEstimate as Estimate } from "@/lib/tax";
import {
  bookTotals,
  yearProgress,
  EMPTY_YEAR,
  type BookEntry,
  type BooksSettings,
  type TaxBucket,
  type YearSettings,
} from "@/lib/expenses/books";
import { formatEur } from "@/lib/expenses/triage";
import { prettyDate } from "./ExpenseSwipeDeck";
import { Stat, signTone, TONE_TEXT, type Tone } from "./Stat";

/**
 * The year-end Finanzamt estimate: income from the ledger, expenses and
 * tax-relevant rows from the books, § 32a tariff on top. Two columns —
 * what the year looks like so far, and the same run-rate carried to
 * 31 December.
 */
export function TaxEstimate({
  year,
  income,
  entries,
  elsewhere = [],
  settings,
  setSettings,
  facts,
}: {
  year: number;
  income?: IncomeYear;
  entries: BookEntry[];
  /** Income-tax payments for this year booked in other years. */
  elsewhere?: BookEntry[];
  settings: BooksSettings;
  setSettings: (s: BooksSettings) => void;
  /** Defaults for this year from a Bescheid (src/content/books/seed.ts). */
  facts?: YearSettings;
}) {
  const side = bookTotals(entries, year);
  const ys: YearSettings = settings.years[year] ?? facts ?? {
    ...EMPTY_YEAR,
    spouseIncome: settings.spouseIncome,
    spouseWithheld: settings.spouseWithheld,
  };
  const setYs = (patch: Partial<YearSettings>) =>
    setSettings({ ...settings, years: { ...settings.years, [year]: { ...ys, ...patch, source: undefined } } });
  const prepaidElsewhere = elsewhere.reduce((t, e) => t + e.amount, 0);
  const prepaid = side.incomeTaxPrepaid + prepaidElsewhere + ys.prepaidExtra;
  const usdEur = (income?.usd ?? 0) * settings.usdRate;
  const revenue = (income?.eurNet ?? 0) + usdEur + side.manualIncome;
  const progress = yearProgress(year);
  const scale = progress > 0 ? 1 / progress : 1;
  const outstanding = (income?.outstandingEurNet ?? 0) + (income?.outstandingUsd ?? 0) * settings.usdRate;

  const vatCollected = (income?.eurVat ?? 0) + side.manualVat;
  const base = {
    year,
    vatCollected,
    vatPaid: side.vatPaid,
    joint: settings.joint,
    spouseIncome: ys.spouseIncome,
    spouseWithheld: ys.spouseWithheld,
    spouseBenefits: ys.spouseBenefits,
  };
  const soFar = estimateTax({
    ...base,
    revenue,
    expenses: side.expenses,
    insurance: side.insurance,
    prepaid,
  });
  // Run-rate: revenue, expenses and insurance scale with the year; the
  // partner's figures and prepayments are entered as full-year values.
  const projected = estimateTax({
    ...base,
    revenue: revenue * scale,
    expenses: side.expenses * scale,
    insurance: side.insurance * scale,
    prepaid,
    vatCollected: vatCollected * scale,
    vatPaid: side.vatPaid,
  });
  const eur = (n: number) => `€${formatEur(Math.round(n))}`;
  const monthsRun = Math.max(1, Math.round(progress * 12));
  const isPartial = progress < 1;

  return (
    <section className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule md:grid-cols-3">
        <Stat
          label={isPartial ? "Expected bill at year end" : "Expected bill"}
          value={eur(Math.max(0, projected.incomeTaxDue))}
          sub={
            projected.incomeTaxDue < 0
              ? `refund of ${eur(-projected.incomeTaxDue)} at this pace`
              : isPartial
                ? `run-rate over ${monthsRun} months · so far ${eur(Math.max(0, soFar.incomeTaxDue))}`
                : `after ${eur(prepaid)} prepaid`
          }
          tone={projected.incomeTaxDue <= 0 ? "up" : "down"}
        />
        <Stat
          label="VAT still to pay"
          value={eur(Math.max(0, soFar.vatDue))}
          sub={`collected ${eur(vatCollected)} · paid ${eur(side.vatPaid)} · before Vorsteuer`}
          tone={soFar.vatDue > 0 ? "warn" : "ink"}
        />
        <Stat
          label={isPartial ? "Profit, projected" : "Profit"}
          value={eur(projected.profit)}
          sub={`${isPartial ? `so far ${eur(soFar.profit)} · ` : ""}effective rate ${Math.round(projected.effectiveRate * 100)} %`}
          tone={signTone(projected.profit)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <label className="flex items-center gap-2 text-[0.85rem] text-muted">
          1 USD =
          <input
            type="number"
            step="0.01"
            min="0.5"
            max="1.5"
            value={settings.usdRate}
            onChange={(e) => setSettings({ ...settings, usdRate: Number(e.target.value) || settings.usdRate })}
            className="w-[72px] rounded-[8px] border border-rule bg-bg px-2 py-1 text-[0.85rem] text-ink focus:border-ink focus:outline-none"
          />
          EUR
        </label>
        <label className="flex items-center gap-2 text-[0.85rem] text-muted">
          <input
            type="checkbox"
            checked={settings.joint}
            onChange={(e) => setSettings({ ...settings, joint: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Married, filing jointly (Splittingtarif)
        </label>
        <label className="flex items-center gap-2 text-[0.85rem] text-muted">
          Vorauszahlungen not in the books
          <input
            type="number"
            step="1"
            min="0"
            value={ys.prepaidExtra}
            onChange={(e) => setYs({ prepaidExtra: Number(e.target.value) || 0 })}
            className="w-[100px] rounded-[8px] border border-rule bg-bg px-2 py-1 text-[0.85rem] text-ink focus:border-ink focus:outline-none"
          />
        </label>
        {settings.joint ? (
          <>
            <label className="flex items-center gap-2 text-[0.85rem] text-muted">
              Partner&apos;s taxable income {year}
              <input
                type="number"
                step="100"
                min="0"
                value={ys.spouseIncome}
                onChange={(e) => setYs({ spouseIncome: Number(e.target.value) || 0 })}
                className="w-[110px] rounded-[8px] border border-rule bg-bg px-2 py-1 text-[0.85rem] text-ink focus:border-ink focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-[0.85rem] text-muted">
              Their Lohnsteuer withheld
              <input
                type="number"
                step="100"
                min="0"
                value={ys.spouseWithheld}
                onChange={(e) => setYs({ spouseWithheld: Number(e.target.value) || 0 })}
                className="w-[110px] rounded-[8px] border border-rule bg-bg px-2 py-1 text-[0.85rem] text-ink focus:border-ink focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-[0.85rem] text-muted">
              Their Elterngeld / Krankengeld
              <input
                type="number"
                step="100"
                min="0"
                title="Tax-free, but raises the rate on everything else (Progressionsvorbehalt)"
                value={ys.spouseBenefits}
                onChange={(e) => setYs({ spouseBenefits: Number(e.target.value) || 0 })}
                className="w-[110px] rounded-[8px] border border-rule bg-bg px-2 py-1 text-[0.85rem] text-ink focus:border-ink focus:outline-none"
              />
            </label>
          </>
        ) : null}
        {ys.source ? <span className="text-[0.8rem] text-faint">Prefilled {ys.source}</span> : null}
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-rule">
        <table className="w-full min-w-[560px] border-collapse text-[0.9rem]">
          <thead>
            <tr className="border-b border-rule bg-card/40 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">
              <th className="px-4 py-2 text-left">Line</th>
              <th className="px-4 py-2 text-right">So far</th>
              {isPartial ? <th className="px-4 py-2 text-right">Projected to 31 Dec</th> : null}
            </tr>
          </thead>
          <tbody>
            <Line label="Revenue received" sub={`${income?.invoices ?? 0} invoices${outstanding > 0 ? ` · ${eur(outstanding)} still unpaid, not counted` : ""}`} a={revenue} b={revenue * scale} partial={isPartial} eur={eur} tone="up" />
            <Line label="Business expenses" a={-side.expenses} b={-side.expenses * scale} partial={isPartial} eur={eur} tone="down" />
            <Line label="Profit" a={soFar.profit} b={projected.profit} partial={isPartial} eur={eur} strong tone={signTone(projected.profit)} />
            <Line label="Health, KSK, pension" sub="Sonderausgaben" a={-side.insurance} b={-side.insurance * scale} partial={isPartial} eur={eur} />
            {settings.joint ? <Line label="Partner's taxable income" a={ys.spouseIncome} b={ys.spouseIncome} partial={isPartial} eur={eur} /> : null}
            <Line label="Sonderausgaben-Pauschbetrag" a={settings.joint ? -72 : -36} b={settings.joint ? -72 : -36} partial={isPartial} eur={eur} />
            <Line label={settings.joint ? "Household taxable income" : "Taxable income"} a={soFar.taxable} b={projected.taxable} partial={isPartial} eur={eur} strong />
            <Line tone="down" label={`Einkommensteuer · § 32a tariff ${soFar.tariffYear}${settings.joint ? ", splitting" : ""}${ys.spouseBenefits > 0 ? ", Progressionsvorbehalt" : ""}`} a={soFar.incomeTax} b={projected.incomeTax} partial={isPartial} eur={eur} />
            <Line label="Solidaritätszuschlag" tone="down" a={soFar.soli} b={projected.soli} partial={isPartial} eur={eur} />
            <Line label="Prepaid for this year" tone="up" sub={side.otherTax > 0 ? `${eur(side.otherTax)} of other Finanzamt payments not counted — see below` : undefined} a={-side.incomeTaxPrepaid} b={-side.incomeTaxPrepaid} partial={isPartial} eur={eur} />
            {prepaidElsewhere > 0 ? (
              <Line label="Paid for this year in other years" tone="up" sub={elsewhere.map((e) => `${prettyDate(e.date)} · ${e.reference}`).join(" · ")} a={-prepaidElsewhere} b={-prepaidElsewhere} partial={isPartial} eur={eur} />
            ) : null}
            {ys.prepaidExtra > 0 ? <Line label="Vorauszahlungen not in the books" tone="up" a={-ys.prepaidExtra} b={-ys.prepaidExtra} partial={isPartial} eur={eur} /> : null}
            {settings.joint ? <Line label="Partner's Lohnsteuer withheld" tone="up" a={-ys.spouseWithheld} b={-ys.spouseWithheld} partial={isPartial} eur={eur} /> : null}
            <Line label={projected.incomeTaxDue >= 0 ? "Expected bill" : "Expected refund"} a={Math.abs(soFar.incomeTaxDue)} b={Math.abs(projected.incomeTaxDue)} partial={isPartial} eur={eur} strong tone={projected.incomeTaxDue >= 0 ? "down" : "up"} />
          </tbody>
        </table>
      </div>

      <TaxRows side={side} eur={eur} />

      <ul className="flex flex-col gap-1.5 text-[0.85rem] leading-[1.45rem] text-muted">
        <li>
          Projection = this year&apos;s average month × 12. It assumes the rest of the year looks like the part
          that&apos;s booked, which is optimistic in a slow autumn and pessimistic before a big invoice lands.
        </li>
        <li>Estimate, not advice: no church tax, no children, no other income. Joint filing needs your partner&apos;s figures from their payslips.</li>
        <li>Income counts when the money landed (EÜR). Set the USD rate to what Wise actually gave you across the year.</li>
        <li>Not in here: the home-office share of rent and utilities, depreciation on hardware over €1,000, the 30 % of client meals the Finanzamt disallows. Your accountant adds those.</li>
        <li>VAT is settled through the Voranmeldungen. The figure above ignores Vorsteuer on German receipts, so the real balance is lower.</li>
      </ul>
    </section>
  );
}

function Line({
  label,
  sub,
  a,
  b,
  partial,
  eur,
  strong,
  tone,
}: {
  label: string;
  sub?: string;
  a: number;
  b: number;
  partial: boolean;
  eur: (n: number) => string;
  strong?: boolean;
  /** Colour for the figures: up = money in / credits, down = money out. */
  tone?: Tone;
}) {
  const fmt = (n: number) => (n < 0 ? `− ${eur(-n)}` : eur(n));
  const cls = `${strong ? "font-display text-[1.05rem] font-bold" : ""} ${TONE_TEXT[tone ?? "ink"]}`;
  return (
    <tr className="border-b border-rule-soft last:border-b-0">
      <td className="px-4 py-2.5">
        <span className={strong ? "text-ink" : "text-body"}>{label}</span>
        {sub ? <span className="ml-2 text-[0.8rem] text-muted">{sub}</span> : null}
      </td>
      <td className={`px-4 py-2.5 text-right tabular-nums ${cls}`}>{fmt(a)}</td>
      {partial ? <td className={`px-4 py-2.5 text-right tabular-nums ${cls}`}>{fmt(b)}</td> : null}
    </tr>
  );
}

function TaxRows({ side, eur }: { side: ReturnType<typeof bookTotals>; eur: (n: number) => string }) {
  const groups: [TaxBucket, string, string][] = [
    ["tax", "Income-tax prepayments for this year", "reduce the bill"],
    ["vat", "Umsatzsteuer paid", "count against VAT collected"],
    ["health", "Health, KSK, pension", "Sonderausgaben"],
    ["taxother", "Not counted", "earlier years, or unclear — set the bucket in Entries"],
  ];
  if (groups.every(([b]) => side.rows[b].length === 0)) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
        Tax-relevant rows · what counts where
      </p>
      {groups.map(([bucket, title, hint]) =>
        side.rows[bucket].length === 0 ? null : (
          <div key={bucket} className="rounded-[14px] border border-rule px-4">
            <p className="flex items-baseline justify-between gap-4 border-b border-rule-soft py-2.5 text-[0.85rem]">
              <span className="text-ink">
                {title} <span className="ml-1 text-muted">· {hint}</span>
              </span>
              <span className={`tabular-nums ${bucket === "tax" ? "text-up" : bucket === "taxother" ? "text-muted" : "text-warn"}`}>{eur(side.rows[bucket].reduce((t, e) => t + e.amount, 0))}</span>
            </p>
            <ul className="flex flex-col divide-y divide-rule-soft">
              {side.rows[bucket].map((e) => (
                <li key={e.id} className="grid grid-cols-[84px_minmax(0,1fr)_auto] items-baseline gap-3 py-2 text-[0.8rem]">
                  <span className="font-caption text-[10px] uppercase tracking-[1px] text-muted">{prettyDate(e.date)}</span>
                  <span className="truncate text-body">
                    {e.party}
                    {e.reference ? <span className="text-muted"> · {e.reference}</span> : null}
                  </span>
                  <span className="tabular-nums text-ink">{eur(e.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        ),
      )}
    </div>
  );
}

export type { Estimate };
