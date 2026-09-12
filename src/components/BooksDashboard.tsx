"use client";

import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Copy, Plus, Search, Trash2 } from "lucide-react";
import type { IncomeYear, InvoiceRow } from "@/lib/income";
import {
  bookYears,
  loadAllBooks,
  loadBook,
  loadBooksSettings,
  mergeYearEntries,
  prepaidElsewhereFor,
  loadSentInvoices,
  newManualEntry,
  parseQuickAdd,
  saveBook,
  saveBooksSettings,
  saveSentInvoices,
  syncItemsIntoBooks,
  type BookEntry,
  type BookKind,
  type BooksSettings,
  type YearSettings,
} from "@/lib/expenses/books";
import { accountantRow, accountantTsv, ACCOUNTANT_COLUMNS } from "@/lib/expenses/accountant";
import { formatEur } from "@/lib/expenses/triage";
import {
  BUSINESS_CATEGORIES,
  CATEGORY_LABELS,
  TAX_CATEGORIES,
  type Category,
} from "@/lib/expenses/types";
import { TaxEstimate } from "./TaxEstimate";
import { SubscriptionsTab } from "./SubscriptionsTab";
import { ExpensesTriage } from "./ExpensesTriage";
import { FinanceShell } from "./finance/FinanceShell";
import { Kpi } from "./finance/Kpi";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { cn } from "@/lib/utils";
import { Amount } from "./money/Privacy";
import { sessionSources, trackSubscriptions } from "@/lib/expenses/subscriptions";
import { loadMemory, loadSession } from "@/lib/expenses/storage";
import { buildItems } from "@/lib/expenses/triage";
import type { Subscription } from "@/content/books/subscriptions";
import { prettyDate } from "./ExpenseSwipeDeck";

/**
 * /books — the bookkeeping home. One year at a time: income from
 * the invoice ledger, expenses and tax-relevant rows from the books
 * (fed by /for/expenses or typed in here), the Finanzamt estimate, and
 * the copy for the accountant's Primanota.
 */

type Tab = "overview" | "entries" | "import" | "subscriptions" | "accountant";
const TABS: Tab[] = ["overview", "entries", "import", "subscriptions", "accountant"];

function tabFromUrl(): Tab {
  if (typeof window === "undefined") return "overview";
  const t = new URLSearchParams(window.location.search).get("tab");
  return TABS.includes(t as Tab) ? (t as Tab) : "overview";
}
type Filter = "all" | "income" | "expense" | "tax";

export function BooksDashboard({
  income,
  invoices,
  seed,
  facts,
  registry,
  ledgerLoaded,
}: {
  income: IncomeYear[];
  invoices: InvoiceRow[];
  /** Pre-tool years transcribed from the old sheets (src/content/books/seed.ts). */
  seed: BookEntry[];
  /** Per-year defaults read off a Bescheid (src/content/books/seed.ts). */
  facts: Record<number, YearSettings>;
  /** Known subscriptions (src/content/books/subscriptions.ts). */
  registry: Subscription[];
  ledgerLoaded: boolean;
}) {
  const [years, setYears] = useState<number[]>(() => bookYears());
  const [year, setYear] = useState<number>(() => {
    const all = [...bookYears(), ...income.map((i) => i.year), new Date().getFullYear()];
    return Math.max(...all);
  });
  const seedYears = useMemo(() => [...new Set(seed.map((e) => Number(e.date.slice(0, 4))))], [seed]);
  // Reconcile the expenses session into the books before reading them, so
  // a rule change (a row that's now an internal move) shows here without
  // a visit to the expenses page.
  const [entries, setEntries] = useState<BookEntry[]>(() => {
    const session = loadSession();
    if (session) syncItemsIntoBooks(buildItems(session.parsed.transactions, loadMemory(), session.decisions));
    return loadBook(year);
  });
  const [sentInvoices, setSentInvoices] = useState<string[]>(() => loadSentInvoices(year));
  const [settings, setSettings] = useState<BooksSettings>(() => loadBooksSettings());
  const [tab, setTabState] = useState<Tab>(() => tabFromUrl());
  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    const url = new URL(window.location.href);
    if (t === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", t);
    window.history.replaceState(null, "", url.toString());
  }, []);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [onlyNew, setOnlyNew] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [quick, setQuick] = useState("");
  const quickPreview = useMemo(() => (quick.trim() ? parseQuickAdd(quick) : null), [quick]);
  const reloadSoon = useCallback(() => window.setTimeout(() => window.location.reload(), 600), []);

  function addQuick() {
    if (!quickPreview) return;
    const entry = newManualEntry(quickPreview);
    const y = Number(entry.date.slice(0, 4));
    if (y === year) updateEntries([...entries, entry].sort((a, b) => a.date.localeCompare(b.date)));
    else {
      saveBook(y, [...loadBook(y), entry].sort((a, b) => a.date.localeCompare(b.date)));
      setYears(bookYears());
    }
    setQuick("");
    setToast(`Added ${entry.party} · €${formatEur(entry.amount)} · ${CATEGORY_LABELS[entry.category]}`);
  }

  function switchYear(y: number) {
    setYear(y);
    setEntries(loadBook(y));
    setSentInvoices(loadSentInvoices(y));
  }

  useEffect(() => {
    saveBooksSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  function updateEntries(next: BookEntry[]) {
    setEntries(next);
    saveBook(year, next);
    setYears(bookYears());
  }

  function patchEntry(id: string, patch: Partial<BookEntry>) {
    updateEntries(
      entries.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e)),
    );
  }

  function removeEntry(id: string) {
    updateEntries(entries.filter((e) => e.id !== id));
  }

  const allYears = useMemo(
    () => [...new Set([...years, ...income.map((i) => i.year), ...seedYears, year])].sort((a, b) => b - a),
    [years, income, seedYears, year],
  );
  const inc = income.find((i) => i.year === year);

  // Ledger invoices as read-only book rows for this year.
  const ledgerRows = useMemo<BookEntry[]>(
    () =>
      invoices
        .filter((r) => r.date.startsWith(String(year)) && !r.outstanding)
        .map((r) => ({
          // Number + date: the ledger carries one duplicated number (260309).
          id: `inv-${r.number}-${r.date}`,
          date: r.date,
          kind: "income" as const,
          amount: r.currency === "USD" ? r.total * settings.usdRate : r.total,
          party: r.client,
          reference: r.number,
          category: "other" as const,
          vat: r.taxMode === "de-19" ? 19 : 0,
          country: r.taxMode === "de-19" ? "Germany" : undefined,
          invoiceNr: r.number,
          currency: r.currency,
          original: r.currency === "USD" ? r.total : undefined,
          rate: r.currency === "USD" ? settings.usdRate : undefined,
          source: "ledger" as const,
          sentAt: sentInvoices.includes(r.number) ? "sent" : undefined,
          updatedAt: "",
        })),
    [invoices, year, settings.usdRate, sentInvoices],
  );

  // Seed rows for the year: income always; expenses only until an N26
  // import for that year exists (the import is the complete record).
  const yearEntries = useMemo(() => mergeYearEntries(year, entries, seed), [entries, seed, year]);
  const seedExpensesHidden = useMemo(
    () =>
      entries.some((e) => e.date.startsWith(String(year)) && e.source === "n26") &&
      seed.some((e) => e.date.startsWith(String(year)) && e.kind !== "income"),
    [entries, seed, year],
  );
  // Subscriptions: every year's rows (stored years, this tab's rows for
  // the current year, the seed years) plus the bank rows in the expenses
  // session that never reached the books — personal and undecided
  // charges recur too, and a plan the rules don't know sits undecided.
  const subs = useMemo(() => {
    const booked = new Set([...loadAllBooks(), ...entries].map((e) => e.id));
    return trackSubscriptions(
      [...loadAllBooks().filter((e) => !e.date.startsWith(String(year))), ...entries, ...seed, ...sessionSources(booked)],
      registry,
    );
  }, [entries, seed, registry, year]);
  const today = new Date().toISOString().slice(0, 10);
  // Yearly renewals only — monthly plans are always "due soon".
  const soon = subs.filter((s) => s.verdict === "business" && !s.cancelledAt && s.interval === "yearly" && s.nextRenewal <= addDaysIso(today, 30));
  // Finanzamt payments in other years that name this one.
  const elsewhere = useMemo(
    () => prepaidElsewhereFor(year, [...entries, ...loadAllBooks().filter((e) => !e.date.startsWith(String(year)))]),
    [year, entries],
  );
  const allRows = useMemo(
    () => [...ledgerRows, ...yearEntries].sort((a, b) => b.date.localeCompare(a.date)),
    [ledgerRows, yearEntries],
  );

  // Revenue net of MwSt, so the tile agrees with the estimate.
  const totals = useMemo(() => {
    const t = { income: 0, expense: 0, tax: 0, count: allRows.length };
    for (const r of allRows) t[r.kind] += r.kind === "income" && r.vat === 19 ? r.amount / 1.19 : r.amount;
    return t;
  }, [allRows]);

  const exportRowsList = useMemo(
    () => allRows.filter((r) => !onlyNew || !r.sentAt),
    [allRows, onlyNew],
  );

  async function copyForAccountant() {
    const tsv = accountantTsv(exportRowsList, settings.decimalComma);
    try {
      await navigator.clipboard.writeText(tsv);
      setToast(`Copied ${exportRowsList.length} rows in the Primanota layout`);
    } catch {
      setToast("Clipboard blocked — select the table and copy by hand");
    }
  }

  function markSent() {
    const now = new Date().toISOString();
    const ids = new Set(exportRowsList.map((r) => r.id));
    updateEntries(entries.map((e) => (ids.has(e.id) ? { ...e, sentAt: now } : e)));
    const invNumbers = exportRowsList.filter((r) => r.source === "ledger").map((r) => r.invoiceNr!).filter(Boolean);
    const nextSent = [...sentInvoices, ...invNumbers];
    setSentInvoices(nextSent);
    saveSentInvoices(year, nextSent);
    setToast(`${exportRowsList.length} rows marked as sent to the accountant`);
  }

  function addManual(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const kind = String(f.get("kind")) as BookKind;
    const amount = Number(String(f.get("amount")).replace(",", "."));
    const date = String(f.get("date"));
    if (!date || !Number.isFinite(amount) || amount <= 0) return;
    const category = String(f.get("category")) as Category;
    const vatRaw = String(f.get("vat"));
    const entry = newManualEntry({
      date,
      kind,
      amount,
      party: String(f.get("party")).trim(),
      reference: String(f.get("reference")).trim(),
      category: kind === "income" ? "other" : category,
      vat: vatRaw === "" ? undefined : Number(vatRaw),
      currency: "EUR",
    });
    const y = Number(date.slice(0, 4));
    if (y === year) updateEntries([...entries, entry].sort((a, b) => a.date.localeCompare(b.date)));
    else {
      saveBook(y, [...loadBook(y), entry].sort((a, b) => a.date.localeCompare(b.date)));
      setYears(bookYears());
    }
    e.currentTarget.reset();
    setAdding(false);
    setToast(`Added to ${y}`);
  }

  const visible = allRows
    .filter((r) => filter === "all" || r.kind === filter)
    .filter((r) => {
      const q = search.trim().toLowerCase();
      return !q || `${r.party} ${r.reference} ${r.note ?? ""}`.toLowerCase().includes(q);
    });

  const tabItems: [Tab, string][] = [
    ["overview", "Tax estimate"],
    ["entries", `Entries · ${allRows.length}`],
    ["import", "Bank import"],
    ["subscriptions", `Subscriptions · ${subs.filter((s) => s.verdict === "business" && !s.cancelledAt).length}${soon.length > 0 ? ` · ${soon.length} yearly renewing` : ""}`],
    ["accountant", `For the accountant${exportRowsList.length > 0 ? ` · ${exportRowsList.length} new` : ""}`],
  ];

  return (
    <FinanceShell
      active="books"
      title="Books"
      subtitle={`${year} · income from the invoice ledger, expenses from the bank imports, the Finanzamt estimate, the copy for the accountant`}
      toast={toast}
      onToast={setToast}
      onRestored={reloadSoon}
      subnav={tabItems.map(([key, label]) => ({ key, label, active: tab === key, onSelect: () => setTab(key) }))}
      actions={
        <Tabs value={String(year)} onValueChange={(v) => switchYear(Number(v))}>
          <TabsList aria-label="Year">
            {allYears.map((y) => (
              <TabsTrigger key={y} value={String(y)}>{y}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      {!ledgerLoaded ? (
        <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-fd-muted-foreground">
          Invoice data loads after the gate — reload the page if income shows as zero.
        </p>
      ) : null}

      <Card className="fd-rise gap-2 py-4" style={{ "--i": 1 } as React.CSSProperties}>
        <CardContent className="flex flex-col gap-1.5 px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addQuick();
            }}
            className="flex items-center gap-2"
          >
            <Input
              type="text"
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              placeholder="Add an expense: Mobbin 119.88 yearly"
              aria-label="Quick add an expense"
              className="h-10 border-transparent bg-fd-muted/60 text-base shadow-none focus-visible:bg-fd-card md:text-[0.95rem]"
            />
            <Button type="submit" size="sm" disabled={!quickPreview} className="h-10 shrink-0">
              <Plus /> Add
            </Button>
          </form>
          <p className="min-h-[1.2rem] px-1 text-xs text-fd-muted-foreground">
            {quickPreview
              ? `${quickPreview.party} · €${formatEur(quickPreview.amount)} · ${CATEGORY_LABELS[quickPreview.category]} · ${prettyDate(quickPreview.date)}${quickPreview.note ? ` · “${quickPreview.note}”` : ""} — Enter to add`
              : quick.trim()
                ? "Type an amount to add it"
                : "Merchant, amount, optional note or date (12.09.2026). Category comes from the rules; the next bank import replaces the row with the bank line."}
          </p>
        </CardContent>
      </Card>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Revenue, net" value={<Amount value={totals.income} />} tone="up" style={{ "--i": 2 } as React.CSSProperties}>{`${allRows.filter((r) => r.kind === "income").length} invoices`}</Kpi>
        <Kpi label="Expenses" value={<Amount value={totals.expense} />} tone="down" style={{ "--i": 3 } as React.CSSProperties}>
          {`${yearEntries.filter((e) => e.kind === "expense").length} rows · ${totals.income > 0 ? `${Math.round((totals.expense / totals.income) * 100)} % of revenue` : "no revenue yet"}`}
        </Kpi>
        <Kpi label="Profit" value={<Amount value={totals.income - totals.expense} />} tone={totals.income - totals.expense < 0 ? "down" : "up"} style={{ "--i": 4 } as React.CSSProperties}>before Sonderausgaben</Kpi>
        <Kpi label="Tax-relevant" value={<Amount value={totals.tax} />} tone="warn" style={{ "--i": 5 } as React.CSSProperties}>{`${yearEntries.filter((e) => e.kind === "tax").length} rows · Finanzamt, health, KSK`}</Kpi>
      </section>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="fd-rise" style={{ "--i": 6 } as React.CSSProperties}>
        <TabsList aria-label="Books sections" className="-mx-4 h-auto w-auto max-w-[calc(100%+2rem)] flex-nowrap justify-start overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-[3px]">
          {tabItems.map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="h-8 flex-none">{label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === "overview" ? (
        <Panel>
        <>
          {seedExpensesHidden ? (
            <p className="rounded-xl border border-dashed px-4 py-3 text-sm leading-6 text-fd-muted-foreground">
              This year has an N26 import, so the expense rows transcribed from the old sheet are hidden to avoid double counting. Its income rows still count.
            </p>
          ) : null}
          <TaxEstimate year={year} income={inc} entries={yearEntries} elsewhere={elsewhere} settings={settings} setSettings={setSettings} facts={facts[year]} />
        </>
        </Panel>
      ) : null}

      {tab === "entries" ? (
        <Panel>
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                  <TabsList aria-label="Filter rows">
                    {(["all", "income", "expense", "tax"] as Filter[]).map((f) => (
                      <TabsTrigger key={f} value={f} className="capitalize">{f === "all" ? "All" : f === "tax" ? "Tax-relevant" : f}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Button type="button" variant={adding ? "secondary" : "outline"} size="sm" onClick={() => setAdding((a) => !a)}>
                  {adding ? "Cancel" : <><Plus /> Add a row</>}
                </Button>
              </div>
              <div className="relative md:w-[260px]">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fd-muted-foreground" aria-hidden />
                <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rows" className="h-9 pl-9" />
              </div>
            </div>

            {adding ? (
              <form onSubmit={addManual} className="grid grid-cols-2 gap-3 rounded-xl border bg-fd-muted/40 p-4 md:grid-cols-4">
                <Label className="flex-col items-start gap-1.5 text-xs text-fd-muted-foreground">
                  Date
                  <Input name="date" type="date" required defaultValue={`${year}-01-01`} className="h-8 text-sm" />
                </Label>
                <Label className="flex-col items-start gap-1.5 text-xs text-fd-muted-foreground">
                  Kind
                  <NativeSelect name="kind" className="h-8 w-full text-sm">
                    <NativeSelectOption value="expense">Expense</NativeSelectOption>
                    <NativeSelectOption value="income">Income</NativeSelectOption>
                    <NativeSelectOption value="tax">Tax-relevant</NativeSelectOption>
                  </NativeSelect>
                </Label>
                <Label className="flex-col items-start gap-1.5 text-xs text-fd-muted-foreground">
                  Amount (EUR)
                  <Input name="amount" type="text" inputMode="decimal" required placeholder="12.99" className="h-8 text-sm" />
                </Label>
                <Label className="flex-col items-start gap-1.5 text-xs text-fd-muted-foreground">
                  VAT on receipt
                  <NativeSelect name="vat" className="h-8 w-full text-sm">
                    <NativeSelectOption value="">unknown</NativeSelectOption>
                    <NativeSelectOption value="19">19 %</NativeSelectOption>
                    <NativeSelectOption value="7">7 %</NativeSelectOption>
                    <NativeSelectOption value="0">0 %</NativeSelectOption>
                  </NativeSelect>
                </Label>
                <Label className="flex-col items-start gap-1.5 text-xs text-fd-muted-foreground">
                  Vendor / client
                  <Input name="party" type="text" required className="h-8 text-sm" />
                </Label>
                <Label className="flex-col items-start gap-1.5 text-xs text-fd-muted-foreground md:col-span-2">
                  Reference
                  <Input name="reference" type="text" className="h-8 text-sm" />
                </Label>
                <Label className="flex-col items-start gap-1.5 text-xs text-fd-muted-foreground">
                  Category
                  <NativeSelect name="category" className="h-8 w-full text-sm">
                    {[...BUSINESS_CATEGORIES, ...TAX_CATEGORIES].map((c) => (
                      <NativeSelectOption key={c} value={c}>{CATEGORY_LABELS[c]}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Label>
                <div className="col-span-2 md:col-span-4">
                  <Button type="submit" size="sm"><Plus /> Add row</Button>
                </div>
              </form>
            ) : null}

            <ul className="flex flex-col divide-y overflow-hidden rounded-xl border">
              {visible.map((r) => (
                <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 px-4 py-3 md:grid-cols-[84px_minmax(0,1fr)_104px_168px_160px_32px] md:items-center">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">{prettyDate(r.date)}</p>
                  <p className={cn("justify-self-end text-base font-semibold tabular-nums md:col-start-3", r.kind === "income" ? "text-fd-up" : r.kind === "tax" ? "text-fd-warn" : "text-fd-down")}>
                    {r.kind === "income" ? "+" : "−"}€{formatEur(r.amount)}
                  </p>
                  <div className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
                      <span className="truncate">{r.party}</span>
                      <Badge variant="outline" className="shrink-0 px-1.5 text-[10px] text-fd-muted-foreground">{r.source}{r.sentAt ? " · sent" : ""}</Badge>
                    </p>
                    <p className="truncate text-xs text-fd-muted-foreground">{[r.reference, r.note].filter(Boolean).join(" · ") || CATEGORY_LABELS[r.category]}</p>
                  </div>
                  {r.source === "ledger" || r.source === "seed" ? (
                    <p className="text-xs text-fd-muted-foreground md:col-start-4">{r.kind === "income" ? (r.vat === 19 ? "19 % MwSt" : "no VAT") : CATEGORY_LABELS[r.category]}{r.currency === "USD" ? ` · $${formatEur(r.original ?? 0)}` : ""}</p>
                  ) : r.kind === "income" ? (
                    <span className="hidden md:col-start-4 md:block" />
                  ) : (
                    <NativeSelect value={r.category} onChange={(e) => patchEntry(r.id, { category: e.target.value as Category })} className="h-8 text-xs" aria-label="Category">
                      {(r.kind === "tax" ? TAX_CATEGORIES : BUSINESS_CATEGORIES).map((c) => (
                        <NativeSelectOption key={c} value={c}>{CATEGORY_LABELS[c]}</NativeSelectOption>
                      ))}
                    </NativeSelect>
                  )}
                  {r.source === "ledger" || r.source === "seed" ? (
                    <span className="hidden md:col-start-5 md:block" />
                  ) : (
                    <div className="flex gap-1.5 md:col-start-5">
                      <NativeSelect value={r.vat ?? ""} title="VAT on the receipt" aria-label="VAT" onChange={(e) => patchEntry(r.id, { vat: e.target.value === "" ? undefined : Number(e.target.value) })} className="h-8 w-[84px] text-xs">
                        <NativeSelectOption value="">VAT ?</NativeSelectOption>
                        <NativeSelectOption value="19">19 %</NativeSelectOption>
                        <NativeSelectOption value="7">7 %</NativeSelectOption>
                        <NativeSelectOption value="0">0 %</NativeSelectOption>
                      </NativeSelect>
                      <Input
                        type="text"
                        defaultValue={r.note ?? ""}
                        placeholder="Note"
                        aria-label="Note"
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v !== (r.note ?? "")) patchEntry(r.id, { note: v || undefined });
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                  {r.source === "manual" ? (
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete row" onClick={() => removeEntry(r.id)} className="text-fd-muted-foreground/70 hover:text-fd-down md:col-start-6">
                      <Trash2 />
                    </Button>
                  ) : (
                    <span className="hidden md:col-start-6 md:block" />
                  )}
                </li>
              ))}
              {visible.length === 0 ? (
                <li className="px-4 py-10 text-center text-sm text-fd-muted-foreground">
                  Nothing here yet. <Link href="/books?tab=import" className="underline underline-offset-4">Import an N26 export</Link> or add a row.
                </li>
              ) : null}
            </ul>
            <p className="text-xs leading-5 text-fd-muted-foreground">
            N26 rows are edited on the expenses page (verdict, tax bucket); here you set VAT on the receipt and notes. Ledger and seed rows come from the repo.
          </p>
          </section>
        </Panel>
      ) : null}

      {tab === "subscriptions" ? (
        <Panel>
          <SubscriptionsTab subs={subs} today={today} />
        </Panel>
      ) : null}

      {tab === "import" ? (
        <Panel>
          <ExpensesTriage embedded />
        </Panel>
      ) : null}

      {tab === "accountant" ? (
        <Panel>
          <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Label className="gap-2 font-normal">
                <Checkbox checked={onlyNew} onCheckedChange={(v) => setOnlyNew(v === true)} />
                Only rows not yet sent
              </Label>
              <Label className="gap-2 font-normal">
                <Checkbox checked={settings.decimalComma} onCheckedChange={(v) => setSettings({ ...settings, decimalComma: v === true })} />
                Decimal comma
              </Label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" onClick={copyForAccountant}>
                <Copy /> Copy {exportRowsList.length} rows for the Primanota
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={markSent} disabled={exportRowsList.length === 0}>
                Mark these as sent
              </Button>
            </div>
            <p className="text-xs leading-5 text-fd-muted-foreground">
              Same columns as your sheet: Date, Income, Expense, Client + Reference, VAT, Country, Invoice nr, Currency, USD rate, Income (USD), plus a Category column at the end you can drop. Income rows first, then expenses; Krankenkasse and Finanzamt rows are marked tax-relevant for the accountant to sort. Paste, send, then mark as sent so the next batch only holds what&apos;s new.
            </p>
            <div className="overflow-hidden rounded-xl border">
              <Table className="min-w-[900px] text-xs">
                <TableHeader>
                  <TableRow className="bg-fd-muted/50 hover:bg-fd-muted/50">
                    {ACCOUNTANT_COLUMNS.map((c) => (
                      <TableHead key={c} className="px-3">{c}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportRowsList.slice(0, 40).map((r) => (
                    <TableRow key={r.id}>
                      {accountantRow(r, settings.decimalComma).map((c, i) => (
                        <TableCell key={i} className={cn("max-w-[240px] truncate px-3 py-1.5", (i === 1 || i === 2) && "text-right tabular-nums")}>{c}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {exportRowsList.length > 40 ? (
                    <TableRow><TableCell colSpan={ACCOUNTANT_COLUMNS.length} className="px-3 py-2 text-fd-muted-foreground">…and {exportRowsList.length - 40} more rows in the copy</TableCell></TableRow>
                  ) : null}
                  {exportRowsList.length === 0 ? (
                    <TableRow><TableCell colSpan={ACCOUNTANT_COLUMNS.length} className="px-3 py-6 text-center text-fd-muted-foreground">Nothing new to send.</TableCell></TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </section>
        </Panel>
      ) : null}
    </FinanceShell>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Card className="fd-rise" style={{ "--i": 7 } as React.CSSProperties}>
      <CardContent className="flex flex-col gap-6">{children}</CardContent>
    </Card>
  );
}

function addDaysIso(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);
}
