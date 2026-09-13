"use client";

import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronDown, Copy, PenLine, Plus, Search, Trash2 } from "lucide-react";
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
import { Segmented, SegmentedItem } from "./ui/segmented";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { cn } from "@/lib/utils";
import { Amount, PrivacyProvider, useMoney } from "./money/Privacy";
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

type BooksProps = {
  income: IncomeYear[];
  invoices: InvoiceRow[];
  /** Pre-tool years transcribed from the old sheets (src/content/books/seed.ts). */
  seed: BookEntry[];
  /** Per-year defaults read off a Bescheid (src/content/books/seed.ts). */
  facts: Record<number, YearSettings>;
  /** Known subscriptions (src/content/books/subscriptions.ts). */
  registry: Subscription[];
  ledgerLoaded: boolean;
};

export function BooksDashboard(props: BooksProps) {
  return (
    <PrivacyProvider>
      <Books {...props} />
    </PrivacyProvider>
  );
}

function Books({ income, invoices, seed, facts, registry, ledgerLoaded }: BooksProps) {
  const money = useMoney();
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
    setToast(`Added ${entry.party} · ${money.eur(entry.amount, 2)} · ${CATEGORY_LABELS[entry.category]}`);
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
        <Segmented value={String(year)} onValueChange={(v) => switchYear(Number(v))} aria-label="Year">
          {allYears.map((y) => (
            <SegmentedItem key={y} value={String(y)}>{y}</SegmentedItem>
          ))}
        </Segmented>
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
              ? `${quickPreview.party} · ${money.eur(quickPreview.amount, 2)} · ${CATEGORY_LABELS[quickPreview.category]} · ${prettyDate(quickPreview.date)}${quickPreview.note ? ` · “${quickPreview.note}”` : ""} — Enter to add`
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

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="fd-rise gap-5" style={{ "--i": 6 } as React.CSSProperties}>
        <TabsList aria-label="Books sections" className="-mx-4 h-auto w-auto max-w-[calc(100%+2rem)] flex-nowrap justify-start overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-[3px]">
          {tabItems.map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="h-8 flex-none">{label}</TabsTrigger>
          ))}
        </TabsList>
        {/* Every panel exists (so each tab's aria-controls points somewhere); only the open one renders content. */}
        {TABS.filter((t) => t !== tab).map((t) => (
          <TabsContent key={t} value={t} forceMount hidden />
        ))}

      {tab === "overview" ? (
        <TabsContent value="overview" forceMount>
        <Panel>
        <>
          {seedExpensesHidden ? (
            <p className="rounded-xl border border-dashed px-4 py-3 text-sm leading-6 text-fd-muted-foreground">
              This year has an N26 import, so the expense rows transcribed from the old sheet are hidden to avoid double counting. Its income rows still count.
            </p>
          ) : null}
          <TaxEstimate year={year} income={inc} entries={yearEntries} elsewhere={elsewhere} settings={settings} setSettings={setSettings} facts={facts[year]} onToast={setToast} />
        </>
        </Panel>
        </TabsContent>
      ) : null}

      {tab === "entries" ? (
        <TabsContent value="entries" forceMount>
        <Panel>
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Segmented value={filter} onValueChange={(v) => setFilter(v as Filter)} aria-label="Filter rows">
                  {(["all", "income", "expense", "tax"] as Filter[]).map((f) => (
                    <SegmentedItem key={f} value={f} className="capitalize">{f === "all" ? "All" : f === "tax" ? "Tax-relevant" : f}</SegmentedItem>
                  ))}
                </Segmented>
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

            <EntriesByMonth rows={visible} today={today} eur={money.eur} mask={money.mask} onPatch={patchEntry} onRemove={removeEntry} />
            <p className="text-xs leading-5 text-fd-muted-foreground">
            N26 rows are edited on the expenses page (verdict, tax bucket); here you set VAT on the receipt and notes. Ledger and seed rows come from the repo.
          </p>
          </section>
        </Panel>
        </TabsContent>
      ) : null}

      {tab === "subscriptions" ? (
        <TabsContent value="subscriptions" forceMount>
        <Panel>
          <SubscriptionsTab subs={subs} today={today} />
        </Panel>
        </TabsContent>
      ) : null}

      {tab === "import" ? (
        <TabsContent value="import" forceMount>
        <Panel>
          <ExpensesTriage embedded />
        </Panel>
        </TabsContent>
      ) : null}

      {tab === "accountant" ? (
        <TabsContent value="accountant" forceMount>
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
              <Table className="min-w-[900px] text-xs" containerLabel="Primanota rows">
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
                        <TableCell key={i} className={cn("max-w-[240px] truncate px-3 py-1.5", (i === 1 || i === 2) && "text-right tabular-nums")}>
                          {money.hidden && (i === 1 || i === 2 || i === 9) && c ? "••••" : money.mask(c)}
                        </TableCell>
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
        </TabsContent>
      ) : null}
      </Tabs>
    </FinanceShell>
  );
}

/* ---------- entries, grouped by month ---------- */

type Patch = (id: string, patch: Partial<BookEntry>) => void;

/**
 * Rows grouped by month, newest first, each month with its in/out
 * totals. The current and previous month start open, older ones fold
 * up; each row shows its category and VAT as text and turns into a
 * small form when you click the pencil.
 */
type Fmt = { eur: (n: number, d?: 0 | 2, signed?: boolean) => string; mask: (text: string) => string };

function EntriesByMonth({ rows, today, eur, mask, onPatch, onRemove }: { rows: BookEntry[]; today: string; onPatch: Patch; onRemove: (id: string) => void } & Fmt) {
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [allOpen, setAllOpen] = useState(false);
  const months = useMemo(() => {
    const map = new Map<string, BookEntry[]>();
    for (const r of rows) {
      const k = r.date.slice(0, 7);
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows]);
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-fd-muted-foreground">
        Nothing here yet. <Link href="/books?tab=import" className="underline underline-offset-4">Import an N26 export</Link> or add a row.
      </p>
    );
  }
  const thisMonth = today.slice(0, 7);
  const lastMonth = addMonthsIso(thisMonth, -1);
  const isOpen = (k: string) => open[k] ?? (allOpen || k === thisMonth || k === lastMonth || months.length <= 2);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1 text-xs text-fd-muted-foreground">
        <span>{months.length} month{months.length === 1 ? "" : "s"} · {rows.length} rows</span>
        <button
          type="button"
          onClick={() => {
            setAllOpen((a) => !a);
            setOpen({});
          }}
          className="underline underline-offset-4 hover:text-foreground"
        >
          {allOpen ? "Collapse older months" : "Expand every month"}
        </button>
      </div>
      {months.map(([month, list]) => {
        const inc = list.filter((r) => r.kind === "income").reduce((t, r) => t + r.amount, 0);
        const out = list.filter((r) => r.kind !== "income").reduce((t, r) => t + r.amount, 0);
        const o = isOpen(month);
        return (
          <Collapsible key={month} open={o} onOpenChange={(v) => setOpen((cur) => ({ ...cur, [month]: v }))} className="overflow-hidden rounded-xl border">
            <CollapsibleTrigger asChild>
              <button type="button" className={cn("flex w-full items-center gap-3 bg-fd-muted/50 px-4 py-2.5 text-left transition-colors hover:bg-fd-muted", o && "border-b")}>
                <ChevronDown className={cn("size-4 shrink-0 text-fd-muted-foreground transition-transform", !o && "-rotate-90")} aria-hidden />
                <span className="flex-1 text-sm font-medium">
                  {monthName(month)} <span className="ml-1 text-xs font-normal text-fd-muted-foreground">{list.length} row{list.length === 1 ? "" : "s"}</span>
                </span>
                <span className="flex items-center gap-3 text-xs tabular-nums">
                  {inc > 0 ? <span className="text-fd-up">+{eur(inc)}</span> : null}
                  {out > 0 ? <span className="text-fd-down">−{eur(out)}</span> : null}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="flex flex-col divide-y">
                {list.map((r) => (
                  <EntryRow key={r.id} r={r} eur={eur} mask={mask} editing={editing === r.id} onEdit={() => setEditing(editing === r.id ? null : r.id)} onPatch={onPatch} onRemove={onRemove} />
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

function EntryRow({ r, eur, mask, editing, onEdit, onPatch, onRemove }: { r: BookEntry; editing: boolean; onEdit: () => void; onPatch: Patch; onRemove: (id: string) => void } & Fmt) {
  const fixed = r.source === "ledger" || r.source === "seed";
  const editable = !fixed && r.kind !== "income";
  const meta = fixed
    ? `${r.kind === "income" ? (r.vat === 19 ? "19 % MwSt" : "no VAT") : CATEGORY_LABELS[r.category]}${r.currency === "USD" ? ` · ${mask(`$${formatEur(r.original ?? 0)}`)}` : ""}`
    : r.kind === "income"
      ? r.vat === 19
        ? "19 % MwSt"
        : "no VAT"
      : `${CATEGORY_LABELS[r.category]} · ${r.vat === undefined ? "VAT ?" : `${r.vat} % VAT`}`;
  return (
    <li className={cn("flex flex-col gap-2 px-4 py-2.5", editing && "bg-fd-muted/30")}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 md:grid-cols-[84px_minmax(0,1fr)_minmax(0,220px)_110px_auto] md:gap-x-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground md:col-start-1">{prettyDate(r.date)}</p>
        <p className={cn("justify-self-end text-base font-semibold tabular-nums md:col-start-4", r.kind === "income" ? "text-fd-up" : r.kind === "tax" ? "text-fd-warn" : "text-fd-down")}>
          {r.kind === "income" ? "+" : "−"}{eur(r.amount, 2)}
        </p>
        <div className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
          <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <span className="truncate">{r.party}</span>
            <Badge variant="outline" className="shrink-0 px-1.5 text-[10px] text-fd-muted-foreground">{r.source}{r.sentAt ? " · sent" : ""}</Badge>
          </p>
          <p className="truncate text-xs text-fd-muted-foreground">{[r.reference, r.note].filter(Boolean).join(" · ") || CATEGORY_LABELS[r.category]}</p>
        </div>
        <p className="col-span-2 truncate text-xs text-fd-muted-foreground md:col-span-1 md:col-start-3 md:row-start-1">{meta}</p>
        <span className="hidden items-center justify-end gap-0.5 md:col-start-5 md:row-start-1 md:flex">
          {editable ? (
            <Button type="button" variant="ghost" size="icon-sm" aria-label={editing ? "Done editing" : `Edit ${r.party}`} aria-pressed={editing} onClick={onEdit} className={cn("text-fd-muted-foreground/70", editing && "text-foreground")}>
              <PenLine />
            </Button>
          ) : null}
          {r.source === "manual" ? (
            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${r.party}`} onClick={() => onRemove(r.id)} className="text-fd-muted-foreground/70 hover:text-fd-down">
              <Trash2 />
            </Button>
          ) : null}
        </span>
      </div>
      {editable || r.source === "manual" ? (
        <div className="flex items-center gap-1 md:hidden">
          {editable ? (
            <Button type="button" variant="ghost" size="sm" onClick={onEdit} aria-pressed={editing} className="h-7 px-2 text-xs text-fd-muted-foreground">
              <PenLine /> {editing ? "Done" : "Edit"}
            </Button>
          ) : null}
          {r.source === "manual" ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(r.id)} className="h-7 px-2 text-xs text-fd-muted-foreground hover:text-fd-down">
              <Trash2 /> Delete
            </Button>
          ) : null}
        </div>
      ) : null}
      {editing && editable ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)]">
          <Label className="flex-col items-start gap-1 text-[11px] text-fd-muted-foreground">
            Category
            <NativeSelect value={r.category} onChange={(e) => onPatch(r.id, { category: e.target.value as Category })} className="h-8 w-full text-xs">
              {(r.kind === "tax" ? TAX_CATEGORIES : BUSINESS_CATEGORIES).map((c) => (
                <NativeSelectOption key={c} value={c}>{CATEGORY_LABELS[c]}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Label>
          <Label className="flex-col items-start gap-1 text-[11px] text-fd-muted-foreground">
            VAT on the receipt
            <NativeSelect value={r.vat ?? ""} onChange={(e) => onPatch(r.id, { vat: e.target.value === "" ? undefined : Number(e.target.value) })} className="h-8 w-full text-xs">
              <NativeSelectOption value="">unknown</NativeSelectOption>
              <NativeSelectOption value="19">19 %</NativeSelectOption>
              <NativeSelectOption value="7">7 %</NativeSelectOption>
              <NativeSelectOption value="0">0 %</NativeSelectOption>
            </NativeSelect>
          </Label>
          <Label className="col-span-2 flex-col items-start gap-1 text-[11px] text-fd-muted-foreground md:col-span-1">
            Note
            <Input
              type="text"
              defaultValue={r.note ?? ""}
              placeholder="What it was for"
              autoFocus
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (r.note ?? "")) onPatch(r.id, { note: v || undefined });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") (e.target as HTMLInputElement).blur();
                if (e.key === "Enter") onEdit();
              }}
              className="h-8 w-full text-xs"
            />
          </Label>
        </div>
      ) : null}
    </li>
  );
}

function monthName(key: string): string {
  return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

function addMonthsIso(key: string, n: number): string {
  const d = new Date(`${key}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
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
