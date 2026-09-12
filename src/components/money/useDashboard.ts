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
import { loadExpected, saveExpected, type Expected } from "@/lib/money/expected";
import { changeSince, loadHistory, recordSnapshot, type Snapshot } from "@/lib/money/history";
import { attentionItems, cashflowMonths, categoryBreakdown, kpis, upcomingItems, upcomingWindow } from "@/lib/money/overview";
import { loadSnoozed, saveSnoozed, snoozeUntil } from "@/lib/money/snooze";
import type { Subscription } from "@/content/books/subscriptions";
import { usePrivacy } from "./Privacy";

/**
 * Everything the Financial Dashboard shows, computed once from what the
 * other pages keep. The layout file is presentation only.
 */

export type CashflowPeriod = "6m" | "12m" | "ytd";

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
  const [expected, setExpected] = useState<Expected[]>(() => loadExpected());
  const addExpected = useCallback((e: Expected) => {
    setExpected((cur) => {
      const next = [...cur, e];
      saveExpected(next);
      return next;
    });
  }, []);
  const closeExpected = useCallback((id: string, status: "received" | "rejected", today: string) => {
    setExpected((cur) => {
      const next = cur.map((e) => (e.id === id ? { ...e, status, closedAt: today } : e));
      saveExpected(next);
      return next;
    });
  }, []);
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
  const k = useMemo(() => kpis({ accounts, usdRate, picture, receivables, expected, entries: merged, today }), [accounts, usdRate, picture, receivables, expected, merged, today]);
  const attention = useMemo(
    () => attentionItems({ picture, receivables, subs, expected, kpis: k, syncOn, joint: settings.joint, undecided, lastBankRow, today }),
    [picture, receivables, subs, expected, k, syncOn, settings.joint, undecided, lastBankRow, today],
  );
  const [period, setPeriod] = useState<CashflowPeriod>("12m");
  const flowCount = period === "6m" ? 6 : period === "ytd" ? Number(today.slice(5, 7)) : 12;
  const flow = useMemo(() => cashflowMonths({ incomeMonths, entries: merged, usdRate, today, count: flowCount }), [incomeMonths, merged, usdRate, today, flowCount]);
  const flowSummary = useMemo(() => {
    const income = flow.reduce((t, m) => t + m.income, 0);
    const expenses = flow.reduce((t, m) => t + m.expenses, 0);
    return { income, expenses, net: income - expenses, avg: flow.length ? (income - expenses) / flow.length : 0 };
  }, [flow]);
  const categories = useMemo(() => categoryBreakdown(merged, today), [merged, today]);
  const upcoming = useMemo(() => upcomingItems({ picture, subs, receivables, expected, usdRate, today }), [picture, subs, receivables, expected, usdRate, today]);
  const window30 = useMemo(() => upcomingWindow(upcoming, today, 30), [upcoming, today]);

  // Net worth history: one snapshot per day, refreshed when balances change.
  const [history, setHistory] = useState<Snapshot[]>(() => loadHistory());
  useEffect(() => {
    setHistory(recordSnapshot(accounts, usdRate, today));
  }, [accounts, usdRate, today]);
  const change30 = useMemo(() => changeSince(history, 30, today), [history, today]);

  // Snoozed attention items (a week at a time; critical ones never).
  const [snoozed, setSnoozed] = useState<Record<string, string>>(() => loadSnoozed());
  const snooze = useCallback(
    (id: string) => {
      setSnoozed((cur) => {
        const next = { ...cur, [id]: snoozeUntil(today) };
        saveSnoozed(next);
        return next;
      });
    },
    [today],
  );
  const unsnoozeAll = useCallback(() => {
    setSnoozed({});
    saveSnoozed({});
  }, []);

  const noBalances = accounts.every((a) => !a.updatedAt);
  const assetCount = accounts.filter((a) => isAsset(a.kind)).length;
  const coverage = k.taxOwed > 0 ? k.taxReserve / k.taxOwed : 1;
  const dateLine = useMemo(
    () => new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [],
  );
  const visibleAttention = useMemo(() => attention.filter((a) => a.severity === "critical" || !(snoozed[a.id] && snoozed[a.id] > today)), [attention, snoozed, today]);
  const snoozedCount = attention.length - visibleAttention.length;
  const now = visibleAttention.filter((a) => a.severity === "critical").length;
  const soon = visibleAttention.filter((a) => a.severity === "warning").length;

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
    expected,
    addExpected,
    closeExpected,
    toast,
    setToast,
    reloadSoon,
    syncOn,
    picture,
    subs,
    k,
    attention: visibleAttention,
    snoozedCount,
    snooze,
    unsnoozeAll,
    flow,
    flowSummary,
    period,
    setPeriod,
    categories,
    upcoming,
    window30,
    history,
    change30,
    noBalances,
    assetCount,
    coverage,
    dateLine,
    counts: { now, soon, note: visibleAttention.length - now - soon },
    runway,
    receivables,
  };
}
