"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IncomeMonth, IncomeYear, Receivable } from "@/lib/income";
import {
  loadAllBooks,
  loadBooksSettings,
  loadSubsMeta,
  mergeYearEntries,
  prepaidElsewhereFor,
  syncItemsIntoBooks,
  type BookEntry,
  type YearSettings,
} from "@/lib/expenses/books";
import { yearPicture } from "@/lib/expenses/estimate";
import { applySubsMeta, sessionSources, trackSubscriptions } from "@/lib/expenses/subscriptions";
import { loadMemory, loadSession } from "@/lib/expenses/storage";
import { loadSyncState } from "@/lib/expenses/sync";
import { buildItems } from "@/lib/expenses/triage";
import { isAsset, loadAccounts, saveAccounts, type Account } from "@/lib/money/accounts";
import { attentionItems, cashflowMonths, kpis, upcomingItems } from "@/lib/money/overview";
import type { Subscription } from "@/content/books/subscriptions";
import { usePrivacy } from "./Privacy";

/**
 * Everything the Financial Dashboard shows, computed once from what the
 * other pages keep. Both layouts (/money and /money/v2) read this hook,
 * so they can never disagree on a number.
 */

export type DashboardProps = {
  income: IncomeYear[];
  incomeMonths: IncomeMonth[];
  receivables: Receivable[];
  /** Pre-tool years + rows added from chat (src/content/books). */
  seed: BookEntry[];
  facts: Record<number, YearSettings>;
  registry: Subscription[];
  ledgerLoaded: boolean;
};

export function useDashboard({ income, incomeMonths, receivables, seed, facts, registry }: DashboardProps) {
  const { hidden } = usePrivacy();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const year = Number(today.slice(0, 4));
  // Same as /books: reconcile the expenses session into the books before
  // reading them, so a fresh triage shows here without a detour.
  const [books] = useState<BookEntry[]>(() => {
    const session = loadSession();
    if (session) syncItemsIntoBooks(buildItems(session.parsed.transactions, loadMemory(), session.decisions));
    return loadAllBooks();
  });
  const [settings] = useState(() => loadBooksSettings());
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const [toast, setToast] = useState<string | null>(null);
  const reloadSoon = useCallback(() => window.setTimeout(() => window.location.reload(), 600), []);
  // Read each render (cheap): the sync control's toast re-renders us after enable/disable.
  const syncOn = Boolean(loadSyncState());
  const usdRate = settings.usdRate;

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Every year's rows, with the seed rules applied per year.
  const merged = useMemo(() => {
    const years = new Set<number>([...books, ...seed].map((e) => Number(e.date.slice(0, 4))));
    return [...years].flatMap((y) => mergeYearEntries(y, books, seed));
  }, [books, seed]);
  const yearEntries = useMemo(() => merged.filter((e) => e.date.startsWith(String(year))), [merged, year]);
  const elsewhere = useMemo(() => prepaidElsewhereFor(year, books), [year, books]);
  const picture = useMemo(
    () => yearPicture({ year, income: income.find((i) => i.year === year), entries: yearEntries, elsewhere, settings, facts: facts[year], today }),
    [year, income, yearEntries, elsewhere, settings, facts, today],
  );
  const session = useMemo(() => sessionSources(new Set(books.map((e) => e.id))), [books]);
  const subs = useMemo(
    () => applySubsMeta(trackSubscriptions([...books, ...seed, ...session], registry, today), loadSubsMeta()),
    [books, seed, session, registry, today],
  );
  const undecided = useMemo(() => session.filter((s) => s.verdict === "undecided").length, [session]);
  const lastBankRow = useMemo(
    () =>
      [...books, ...session]
        .filter((e) => e.source === "n26")
        .map((e) => e.date)
        .sort()
        .at(-1),
    [books, session],
  );
  const k = useMemo(() => kpis({ accounts, usdRate, picture, receivables, entries: merged, today }), [accounts, usdRate, picture, receivables, merged, today]);
  const attention = useMemo(
    () => attentionItems({ picture, receivables, subs, kpis: k, syncOn, joint: settings.joint, undecided, lastBankRow, today }),
    [picture, receivables, subs, k, syncOn, settings.joint, undecided, lastBankRow, today],
  );
  const flow = useMemo(() => cashflowMonths({ incomeMonths, entries: merged, usdRate, today }), [incomeMonths, merged, usdRate, today]);
  const upcoming = useMemo(() => upcomingItems({ picture, subs, receivables, usdRate, today }), [picture, subs, receivables, usdRate, today]);

  const noBalances = accounts.every((a) => !a.updatedAt);
  const assetCount = accounts.filter((a) => isAsset(a.kind)).length;
  const coverage = k.taxOwed > 0 ? k.taxReserve / k.taxOwed : 1;
  const dateLine = useMemo(
    () => new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [],
  );
  const now = attention.filter((a) => a.severity === "critical").length;
  const soon = attention.filter((a) => a.severity === "warning").length;

  const changeAccounts = useCallback((next: Account[]) => {
    setAccounts(next);
    saveAccounts(next);
  }, []);

  const runway =
    k.runwayMonths === null ? "—" : hidden ? "••" : k.runwayMonths <= 0 ? "0" : k.runwayMonths >= 24 ? "24+" : k.runwayMonths.toFixed(1);

  return {
    today,
    year,
    usdRate,
    settings,
    hidden,
    accounts,
    changeAccounts,
    toast,
    setToast,
    reloadSoon,
    syncOn,
    picture,
    subs,
    k,
    attention,
    flow,
    upcoming,
    noBalances,
    assetCount,
    coverage,
    dateLine,
    counts: { now, soon, note: attention.length - now - soon },
    runway,
    receivables,
  };
}
