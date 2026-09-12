"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Copy, Trash2 } from "lucide-react";
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
import { SyncBar } from "./SyncBar";
import { Stat, signTone } from "./Stat";
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

type Tab = "overview" | "entries" | "subscriptions" | "accountant";
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
  const [tab, setTab] = useState<Tab>("overview");
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

  return (
    <main className="page-fade-in mx-auto w-full max-w-[1040px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      <section className="flex flex-col gap-6 pb-10 md:pb-14">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
          Private · Books
        </p>
        <div className="flex items-start justify-between gap-4">
          <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
            Books
          </h1>
          <div className="pt-2 md:pt-4">
            <SyncBar onToast={setToast} onRestored={reloadSoon} />
          </div>
        </div>
        <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
          Income from the invoice ledger, expenses from the N26 imports, the Finanzamt estimate, and the copy
          for the accountant.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">Year</span>
          {allYears.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => switchYear(y)}
              className={`rounded-full border px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] transition-colors ${
                y === year ? "border-ink bg-ink text-bg" : "border-rule text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {y}
            </button>
          ))}
          <Link href="/for/expenses" className="ml-4 font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink">
            Import an N26 export →
          </Link>
          <Link href="/money" className="ml-2 font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink">
            Money overview →
          </Link>
        </div>
        {!ledgerLoaded ? (
          <p className="rounded-[12px] border border-rule-soft bg-card/40 px-4 py-3 text-[0.85rem] leading-[1.4rem] text-muted">
            Invoice data loads after the gate — reload the page if income shows as zero.
          </p>
        ) : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addQuick();
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 rounded-full border border-rule bg-bg pl-5 pr-1.5 transition-colors focus-within:border-ink">
            <input
              type="text"
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              placeholder="Add an expense: Mobbin 119.88 yearly"
              aria-label="Quick add an expense"
              className="h-12 w-full bg-transparent text-[0.95rem] text-ink placeholder:text-faint focus:outline-none"
            />
            <button
              type="submit"
              disabled={!quickPreview}
              className="h-9 shrink-0 rounded-full border border-ink bg-ink px-4 font-caption text-[10px] font-bold uppercase tracking-[1px] text-bg transition-colors hover:bg-transparent hover:text-ink disabled:opacity-30 disabled:hover:bg-ink disabled:hover:text-bg"
            >
              Add
            </button>
          </div>
          <p className="min-h-[1.2rem] px-5 text-[0.8rem] text-muted">
            {quickPreview
              ? `${quickPreview.party} · €${formatEur(quickPreview.amount)} · ${CATEGORY_LABELS[quickPreview.category]} · ${prettyDate(quickPreview.date)}${quickPreview.note ? ` · “${quickPreview.note}”` : ""} — Enter to add`
              : quick.trim()
                ? "Type an amount to add it"
                : "Merchant, amount, optional note or date (12.09.2026). Category comes from the rules; the next N26 import replaces the row with the bank line."}
          </p>
        </form>
      </section>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule md:grid-cols-4">
        <Stat label="Revenue, net" value={`€${formatEur(totals.income)}`} sub={`${allRows.filter((r) => r.kind === "income").length} invoices`} tone="up" />
        <Stat label="Expenses" value={`€${formatEur(totals.expense)}`} sub={`${yearEntries.filter((e) => e.kind === "expense").length} rows · ${totals.income > 0 ? `${Math.round((totals.expense / totals.income) * 100)} % of revenue` : "no revenue yet"}`} tone="down" />
        <Stat label="Profit" value={`${totals.income - totals.expense < 0 ? "−" : ""}€${formatEur(Math.abs(totals.income - totals.expense))}`} sub="before Sonderausgaben" tone={signTone(totals.income - totals.expense)} />
        <Stat label="Tax-relevant" value={`€${formatEur(totals.tax)}`} sub={`${yearEntries.filter((e) => e.kind === "tax").length} rows · Finanzamt, health, KSK`} tone="warn" />
      </div>

      <nav className="mt-12 mb-10 flex gap-6 overflow-x-auto border-b border-rule [scrollbar-width:none]">
        {(
          [
            ["overview", "Tax estimate"],
            ["entries", `Entries · ${allRows.length}`],
            ["subscriptions", `Subscriptions · ${subs.filter((s) => s.verdict === "business" && !s.cancelledAt).length}${soon.length > 0 ? ` · ${soon.length} yearly renewing` : ""}`],
            ["accountant", `For the accountant${exportRowsList.length > 0 ? ` · ${exportRowsList.length} new` : ""}`],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 font-caption text-[11px] font-semibold uppercase tracking-[1.5px] transition-colors ${
              tab === key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <>
          {seedExpensesHidden ? (
            <p className="mb-8 rounded-[12px] border border-rule-soft bg-card/40 px-4 py-3 text-[0.85rem] leading-[1.4rem] text-muted">
              This year has an N26 import, so the expense rows transcribed from the old sheet are hidden to avoid double counting. Its income rows still count.
            </p>
          ) : null}
          <TaxEstimate year={year} income={inc} entries={yearEntries} elsewhere={elsewhere} settings={settings} setSettings={setSettings} facts={facts[year]} />
        </>
      ) : null}

      {tab === "entries" ? (
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["all", "income", "expense", "tax"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] transition-colors ${
                    filter === f ? "border-ink bg-ink text-bg" : "border-rule text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {f === "all" ? "All" : f === "tax" ? "Tax-relevant" : f}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAdding((a) => !a)}
                className="rounded-full border border-ink px-3 py-1 font-caption text-[10px] font-bold uppercase tracking-[1px] text-ink transition-colors hover:bg-ink hover:text-bg"
              >
                {adding ? "Cancel" : "+ Add a row"}
              </button>
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full rounded-full border border-rule bg-transparent px-4 py-2 text-[0.9rem] text-ink placeholder:text-faint focus:border-ink focus:outline-none md:w-[240px]"
            />
          </div>

          {adding ? (
            <form onSubmit={addManual} className="grid grid-cols-2 gap-3 rounded-[14px] border border-rule px-4 py-4 md:grid-cols-4">
              <label className="flex flex-col gap-1 text-[0.75rem] text-muted">
                Date
                <input name="date" type="date" required defaultValue={`${year}-01-01`} className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1 text-[0.75rem] text-muted">
                Kind
                <select name="kind" className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="tax">Tax-relevant</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[0.75rem] text-muted">
                Amount (EUR)
                <input name="amount" type="text" inputMode="decimal" required placeholder="12.99" className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1 text-[0.75rem] text-muted">
                VAT on receipt
                <select name="vat" className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none">
                  <option value="">unknown</option>
                  <option value="19">19 %</option>
                  <option value="7">7 %</option>
                  <option value="0">0 %</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[0.75rem] text-muted md:col-span-1">
                Vendor / client
                <input name="party" type="text" required className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1 text-[0.75rem] text-muted md:col-span-2">
                Reference
                <input name="reference" type="text" className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1 text-[0.75rem] text-muted">
                Category
                <select name="category" className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none">
                  {[...BUSINESS_CATEGORIES, ...TAX_CATEGORIES].map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="col-span-2 md:col-span-4">
                <button type="submit" className="rounded-full border border-ink bg-ink px-5 py-2 font-caption text-[11px] font-bold uppercase tracking-[1px] text-bg transition-colors hover:bg-transparent hover:text-ink">
                  Add
                </button>
              </div>
            </form>
          ) : null}

          <ul className="flex flex-col overflow-hidden rounded-[14px] border border-rule">
            {visible.map((r) => (
              <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 border-b border-rule px-4 py-3 last:border-b-0 md:grid-cols-[88px_minmax(0,1fr)_100px_200px_150px_32px] md:items-center">
                <p className="font-caption text-[11px] font-medium uppercase tracking-[1px] text-muted">{prettyDate(r.date)}</p>
                <p className={`justify-self-end font-display text-[1rem] font-bold tabular-nums md:col-start-3 ${r.kind === "income" ? "text-up" : r.kind === "tax" ? "text-warn" : "text-down"}`}>
                  {r.kind === "income" ? "+" : "−"}€{formatEur(r.amount)}
                </p>
                <div className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
                  <p className="truncate text-[0.95rem] font-medium text-ink">
                    {r.party}
                    <span className="ml-2 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-faint">
                      {r.source}{r.sentAt ? " · sent" : ""}
                    </span>
                  </p>
                  <p className="truncate text-[0.8rem] text-muted">{[r.reference, r.note].filter(Boolean).join(" · ") || CATEGORY_LABELS[r.category]}</p>
                </div>
                {r.source === "ledger" || r.source === "seed" ? (
                  <p className="text-[0.8rem] text-faint md:col-start-4">{r.kind === "income" ? (r.vat === 19 ? "19 % MwSt" : "no VAT") : CATEGORY_LABELS[r.category]}{r.currency === "USD" ? ` · $${formatEur(r.original ?? 0)}` : ""}</p>
                ) : r.kind === "income" ? (
                  <span className="hidden md:col-start-4 md:block" />
                ) : (
                  <select
                    value={r.category}
                    onChange={(e) => patchEntry(r.id, { category: e.target.value as Category })}
                    className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.8rem] text-ink focus:border-ink focus:outline-none md:col-start-4"
                  >
                    {(r.kind === "tax" ? TAX_CATEGORIES : BUSINESS_CATEGORIES).map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                )}
                {r.source === "ledger" || r.source === "seed" ? (
                  <span className="hidden md:col-start-5 md:block" />
                ) : (
                  <div className="flex gap-1.5 md:col-start-5">
                    <select
                      value={r.vat ?? ""}
                      title="VAT on the receipt"
                      onChange={(e) => patchEntry(r.id, { vat: e.target.value === "" ? undefined : Number(e.target.value) })}
                      className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.8rem] text-ink focus:border-ink focus:outline-none"
                    >
                      <option value="">VAT ?</option>
                      <option value="19">19 %</option>
                      <option value="7">7 %</option>
                      <option value="0">0 %</option>
                    </select>
                    <input
                      type="text"
                      defaultValue={r.note ?? ""}
                      placeholder="Note"
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v !== (r.note ?? "")) patchEntry(r.id, { note: v || undefined });
                      }}
                      className="w-full rounded-[8px] border border-rule bg-transparent px-2 py-1 text-[0.8rem] text-ink placeholder:text-faint focus:border-ink focus:outline-none"
                    />
                  </div>
                )}
                {r.source === "manual" ? (
                  <button
                    type="button"
                    aria-label="Delete row"
                    onClick={() => removeEntry(r.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rule text-muted transition-colors hover:border-[#d14343] hover:text-[#d14343] md:col-start-6"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="hidden md:col-start-6 md:block" />
                )}
              </li>
            ))}
            {visible.length === 0 ? (
              <li className="px-4 py-10 text-center text-[0.9rem] text-muted">
                Nothing here yet. <Link href="/for/expenses" className="underline underline-offset-4">Import an N26 export</Link> or add a row.
              </li>
            ) : null}
          </ul>
          <p className="text-[0.8rem] text-muted">
            N26 rows are edited on the expenses page (verdict, tax bucket); here you set VAT on the receipt and notes. Ledger and seed rows come from the repo.
          </p>
        </section>
      ) : null}

      {tab === "subscriptions" ? <SubscriptionsTab subs={subs} today={today} /> : null}

      {tab === "accountant" ? (
        <section className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <label className="flex items-center gap-2 text-[0.9rem] text-ink">
              <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
              Only rows not yet sent
            </label>
            <label className="flex items-center gap-2 text-[0.9rem] text-ink">
              <input type="checkbox" checked={settings.decimalComma} onChange={(e) => setSettings({ ...settings, decimalComma: e.target.checked })} className="h-4 w-4 accent-[var(--color-accent)]" />
              Decimal comma
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={copyForAccountant} className="cta-pill group inline-flex h-14 items-center gap-4 pr-6">
              <span className="flex h-14 w-14 items-center justify-center text-bg">
                <Copy className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="font-caption text-[13px] font-bold uppercase tracking-[1px]">Copy {exportRowsList.length} rows for the Primanota</span>
            </button>
            <button
              type="button"
              onClick={markSent}
              disabled={exportRowsList.length === 0}
              className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink disabled:opacity-40"
            >
              Mark these as sent
            </button>
          </div>
          <p className="text-[0.85rem] leading-[1.45rem] text-muted">
            Same columns as your sheet: Date, Income, Expense, Client + Reference, VAT, Country, Invoice nr, Currency, USD rate, Income (USD), plus a Category column at the end you can drop. Income rows first, then expenses; Krankenkasse and Finanzamt rows are marked tax-relevant for the accountant to sort. Paste, send, then mark as sent so the next batch only holds what&apos;s new.
          </p>
          <div className="overflow-x-auto rounded-[14px] border border-rule">
            <table className="w-full min-w-[900px] border-collapse text-left text-[0.8rem]">
              <thead>
                <tr className="border-b border-rule bg-card/40">
                  {ACCOUNTANT_COLUMNS.map((c) => (
                    <th key={c} className="whitespace-nowrap px-3 py-2 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exportRowsList.slice(0, 40).map((r) => (
                  <tr key={r.id} className="border-b border-rule-soft last:border-b-0">
                    {accountantRow(r, settings.decimalComma).map((c, i) => (
                      <td key={i} className={`max-w-[240px] truncate px-3 py-1.5 text-body ${i === 1 || i === 2 ? "text-right tabular-nums" : ""}`}>{c}</td>
                    ))}
                  </tr>
                ))}
                {exportRowsList.length > 40 ? (
                  <tr><td colSpan={ACCOUNTANT_COLUMNS.length} className="px-3 py-2 text-muted">…and {exportRowsList.length - 40} more rows in the copy</td></tr>
                ) : null}
                {exportRowsList.length === 0 ? (
                  <tr><td colSpan={ACCOUNTANT_COLUMNS.length} className="px-3 py-6 text-center text-muted">Nothing new to send.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-6">
          <div className="rounded-full border border-rule bg-bg px-5 py-3 text-[0.85rem] text-ink" style={{ boxShadow: "var(--shadow-card)" }}>
            {toast}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function addDaysIso(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);
}
