/**
 * The year's tax picture, computed once for both /books (the estimate
 * tab) and /money (the overview). Pure: books rows + ledger aggregates +
 * settings in, numbers out.
 */

import type { IncomeYear } from "@/lib/income";
import { estimateTax, type TaxEstimate } from "@/lib/tax";
import { bookTotals, unpaidInstalments, yearProgress, EMPTY_YEAR, type BookEntry, type BooksSettings, type BookTotals, type YearSettings } from "./books";

export type YearPicture = {
  year: number;
  ys: YearSettings;
  side: BookTotals;
  /** Revenue received so far (EUR net + USD converted + manual income). */
  revenue: number;
  /** Unpaid tracked invoices, converted. */
  outstanding: number;
  vatCollected: number;
  /** Prepayments counted for this year: booked + paid in other years + entered by hand. */
  prepaid: number;
  prepaidElsewhere: number;
  /** Instalments the Finanzamt set that no payment covers yet. */
  unpaid: { due: string; amount: number }[];
  overdue: { due: string; amount: number }[];
  stillDue: number;
  progress: number;
  isPartial: boolean;
  soFar: TaxEstimate;
  /** Run-rate to 31 Dec, with the unpaid instalments assumed paid. */
  projected: TaxEstimate;
};

export function yearPicture(input: {
  year: number;
  income?: IncomeYear;
  entries: BookEntry[];
  /** Income-tax payments for this year booked in other years. */
  elsewhere?: BookEntry[];
  settings: BooksSettings;
  facts?: YearSettings;
  today?: string;
}): YearPicture {
  const { year, income, entries, settings, facts } = input;
  const today = input.today ?? new Date().toISOString().slice(0, 10);
  const side = bookTotals(entries, year);
  const ys: YearSettings = settings.years[year] ?? facts ?? {
    ...EMPTY_YEAR,
    spouseIncome: settings.spouseIncome,
    spouseWithheld: settings.spouseWithheld,
  };
  const prepaidElsewhere = (input.elsewhere ?? []).reduce((t, e) => t + e.amount, 0);
  const prepaid = side.incomeTaxPrepaid + prepaidElsewhere + ys.prepaidExtra;
  const unpaid = unpaidInstalments(facts?.scheduled ?? ys.scheduled ?? [], side.incomeTaxPrepaid + ys.prepaidExtra);
  const stillDue = unpaid.reduce((t, s) => t + s.amount, 0);
  const overdue = unpaid.filter((s) => s.due < today);
  const usdEur = (income?.usd ?? 0) * settings.usdRate;
  const revenue = (income?.eurNet ?? 0) + usdEur + side.manualIncome;
  const outstanding = (income?.outstandingEurNet ?? 0) + (income?.outstandingUsd ?? 0) * settings.usdRate;
  const progress = yearProgress(year);
  const scale = progress > 0 ? 1 / progress : 1;
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
  const soFar = estimateTax({ ...base, revenue, expenses: side.expenses, insurance: side.insurance, prepaid });
  const projected = estimateTax({
    ...base,
    revenue: revenue * scale,
    expenses: side.expenses * scale,
    insurance: side.insurance * scale,
    prepaid: prepaid + stillDue,
    vatCollected: vatCollected * scale,
    vatPaid: side.vatPaid,
  });
  return {
    year,
    ys,
    side,
    revenue,
    outstanding,
    vatCollected,
    prepaid,
    prepaidElsewhere,
    unpaid,
    overdue,
    stillDue,
    progress,
    isPartial: progress < 1,
    soFar,
    projected,
  };
}
