"use client";

import type { IncomeYear } from "@/lib/income";
import type { TaxEstimate as Estimate } from "@/lib/tax";
import { yearPicture } from "@/lib/expenses/estimate";
import {
  bookTotals,
  type BookEntry,
  type BooksSettings,
  type TaxBucket,
  type YearSettings,
} from "@/lib/expenses/books";
import { formatEur } from "@/lib/expenses/triage";
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { StatStrip, StatTile } from "./finance/Kpi";
import { prettyDate } from "./ExpenseSwipeDeck";

/**
 * The year-end Finanzamt estimate: income from the ledger, expenses and
 * tax-relevant rows from the books, § 32a tariff on top. Two columns —
 * what the year looks like so far, and the same run-rate carried to
 * 31 December.
 */

type Tone = "up" | "down" | "warn" | "ink";
const TONE: Record<Tone, string> = { up: "text-fd-up", down: "text-fd-down", warn: "text-fd-warn", ink: "" };
const signTone = (n: number): Tone => (n < 0 ? "down" : "up");

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
  const picture = yearPicture({ year, income, entries, elsewhere, settings, facts });
  const { side, ys, prepaid, prepaidElsewhere, unpaid, stillDue, overdue, revenue, outstanding, vatCollected, progress, isPartial, soFar, projected } = picture;
  const today = new Date().toISOString().slice(0, 10);
  const setYs = (patch: Partial<YearSettings>) =>
    setSettings({ ...settings, years: { ...settings.years, [year]: { ...ys, ...patch, source: undefined } } });
  const scale = progress > 0 ? 1 / progress : 1;
  const eur = (n: number) => `€${formatEur(Math.round(n))}`;
  const monthsRun = Math.max(1, Math.round(progress * 12));

  const dueLabel = (d: { due: string; amount: number }) =>
    `${prettyDate(d.due)} ${eur(d.amount)}${d.due < today ? " · overdue" : d.due === today ? " · due today" : ""}`;

  const field = "h-8 w-[100px] text-sm";

  return (
    <section className="flex flex-col gap-8">
      {overdue.length > 0 ? (
        <p className="rounded-xl border border-fd-down/40 bg-fd-down/5 px-4 py-3 text-sm leading-6">
          <span className="font-medium text-fd-down">
            {eur(overdue.reduce((t, s) => t + s.amount, 0))} of Vorauszahlungen past due
          </span>{" "}
          and not in the books: {overdue.map((d) => `${prettyDate(d.due)} ${eur(d.amount)}`).join(", ")}. The Finanzamt adds a 1 % Säumniszuschlag per month started, so pay it now with the Steuernummer and “ESt-VZ” in the reference. If you did pay it from another account, add the row in Entries.
        </p>
      ) : null}

      <StatStrip className="md:grid-cols-3">
        <StatTile
          label={isPartial ? "Expected bill at year end" : "Expected bill"}
          value={eur(Math.max(0, projected.incomeTaxDue))}
          sub={
            projected.incomeTaxDue < 0
              ? `refund of ${eur(-projected.incomeTaxDue)} at this pace`
              : isPartial
                ? `run-rate over ${monthsRun} months · so far ${eur(Math.max(0, soFar.incomeTaxDue))}`
                : `after ${eur(prepaid + stillDue)} prepaid`
          }
          tone={projected.incomeTaxDue <= 0 ? "up" : "down"}
        />
        <StatTile label="VAT still to pay" value={eur(Math.max(0, soFar.vatDue))} sub={`collected ${eur(vatCollected)} · paid ${eur(side.vatPaid)} · before Vorsteuer`} tone={soFar.vatDue > 0 ? "warn" : undefined} />
        <StatTile
          label={isPartial ? "Profit, projected" : "Profit"}
          value={eur(projected.profit)}
          sub={`${isPartial ? `so far ${eur(soFar.profit)} · ` : ""}effective rate ${Math.round(projected.effectiveRate * 100)} %`}
          tone={projected.profit < 0 ? "down" : "up"}
        />
      </StatStrip>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <Label className="gap-2 font-normal text-fd-muted-foreground">
          1 USD =
          <Input
            type="number"
            step="0.01"
            min="0.5"
            max="1.5"
            value={settings.usdRate}
            onChange={(e) => setSettings({ ...settings, usdRate: Number(e.target.value) || settings.usdRate })}
            className="h-8 w-[76px] text-sm"
          />
          EUR
        </Label>
        <Label className="gap-2 font-normal text-fd-muted-foreground">
          <Checkbox checked={settings.joint} onCheckedChange={(v) => setSettings({ ...settings, joint: v === true })} />
          Married, filing jointly (Splittingtarif)
        </Label>
        <Label className="gap-2 font-normal text-fd-muted-foreground">
          Vorauszahlungen not in the books
          <Input type="number" step="1" min="0" value={ys.prepaidExtra} onChange={(e) => setYs({ prepaidExtra: Number(e.target.value) || 0 })} className={field} />
        </Label>
        {settings.joint ? (
          <>
            <Label className="gap-2 font-normal text-fd-muted-foreground">
              Partner&apos;s taxable income {year}
              <Input type="number" step="100" min="0" value={ys.spouseIncome} onChange={(e) => setYs({ spouseIncome: Number(e.target.value) || 0 })} className={field} />
            </Label>
            <Label className="gap-2 font-normal text-fd-muted-foreground">
              Their Lohnsteuer withheld
              <Input type="number" step="100" min="0" value={ys.spouseWithheld} onChange={(e) => setYs({ spouseWithheld: Number(e.target.value) || 0 })} className={field} />
            </Label>
            <Label className="gap-2 font-normal text-fd-muted-foreground" title="Tax-free, but raises the rate on everything else (Progressionsvorbehalt)">
              Their Elterngeld / Krankengeld
              <Input type="number" step="100" min="0" value={ys.spouseBenefits} onChange={(e) => setYs({ spouseBenefits: Number(e.target.value) || 0 })} className={field} />
            </Label>
          </>
        ) : null}
        {ys.source ? <span className="text-xs text-fd-muted-foreground/70">Prefilled {ys.source}</span> : null}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow className="bg-fd-muted/50 hover:bg-fd-muted/50">
              <TableHead className="px-4">Line</TableHead>
              <TableHead className="px-4 text-right">So far</TableHead>
              {isPartial ? <TableHead className="px-4 text-right">Projected to 31 Dec</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
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
            {stillDue > 0 ? (
              <Line
                label="Vorauszahlungen still to pay this year"
                tone={overdue.length > 0 ? "warn" : "up"}
                sub={`set by the Finanzamt: ${unpaid.map(dueLabel).join(" · ")} — counted in the projection`}
                a={0}
                b={-stillDue}
                partial={isPartial}
                eur={eur}
              />
            ) : null}
            {settings.joint ? <Line label="Partner's Lohnsteuer withheld" tone="up" a={-ys.spouseWithheld} b={-ys.spouseWithheld} partial={isPartial} eur={eur} /> : null}
            <Line label={projected.incomeTaxDue >= 0 ? "Expected bill" : "Expected refund"} a={Math.abs(soFar.incomeTaxDue)} b={Math.abs(projected.incomeTaxDue)} partial={isPartial} eur={eur} strong tone={projected.incomeTaxDue >= 0 ? "down" : "up"} />
          </TableBody>
        </Table>
      </div>

      <TaxRows side={side} eur={eur} />

      <ul className="flex flex-col gap-1.5 text-xs leading-5 text-fd-muted-foreground">
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
  const cls = cn("px-4 py-2.5 text-right tabular-nums", strong ? "text-base font-semibold" : "", TONE[tone ?? "ink"]);
  return (
    <TableRow className={strong ? "bg-fd-muted/30" : undefined}>
      <TableCell className="px-4 py-2.5 whitespace-normal">
        <span className={strong ? "font-medium" : ""}>{label}</span>
        {sub ? <span className="ml-2 text-xs text-fd-muted-foreground">{sub}</span> : null}
      </TableCell>
      <TableCell className={cls}>{fmt(a)}</TableCell>
      {partial ? <TableCell className={cls}>{fmt(b)}</TableCell> : null}
    </TableRow>
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
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-fd-muted-foreground">Tax-relevant rows · what counts where</p>
      {groups.map(([bucket, title, hint]) =>
        side.rows[bucket].length === 0 ? null : (
          <div key={bucket} className="overflow-hidden rounded-xl border">
            <p className="flex items-baseline justify-between gap-4 border-b bg-fd-muted/50 px-4 py-2.5 text-sm">
              <span>
                {title} <span className="ml-1 text-fd-muted-foreground">· {hint}</span>
              </span>
              <span className={cn("tabular-nums font-medium", bucket === "tax" ? "text-fd-up" : bucket === "taxother" ? "text-fd-muted-foreground" : "text-fd-warn")}>{eur(side.rows[bucket].reduce((t, e) => t + e.amount, 0))}</span>
            </p>
            <ul className="flex flex-col divide-y">
              {side.rows[bucket].map((e) => (
                <li key={e.id} className="grid grid-cols-[84px_minmax(0,1fr)_auto] items-baseline gap-3 px-4 py-2 text-sm">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">{prettyDate(e.date)}</span>
                  <span className="truncate">
                    {e.party}
                    {e.reference ? <span className="text-fd-muted-foreground"> · {e.reference}</span> : null}
                  </span>
                  <span className="tabular-nums">{eur(e.amount)}</span>
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
