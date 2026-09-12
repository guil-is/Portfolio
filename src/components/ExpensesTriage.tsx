"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Link from "next/link";
import { Ban, Briefcase, Copy, Download, FileUp, Landmark, RotateCcw, User } from "lucide-react";
import { parseStatementCsv } from "@/lib/expenses/parse";
import {
  buildItems,
  byCategory,
  byMonth,
  formatEur,
  makeDecision,
  pendingItems,
  summarize,
  taxBucket,
  type DecisionMap,
  type Item,
} from "@/lib/expenses/triage";
import { syncItemsIntoBooks } from "@/lib/expenses/books";
import {
  exportColumns,
  exportRows,
  COLUMN_LABELS,
  toCsv,
  toTsv,
  type ExportOptions,
} from "@/lib/expenses/export";
import {
  clearMemory,
  clearSession,
  loadMemory,
  loadPrefs,
  loadSession,
  saveMemory,
  savePrefs,
  saveSession,
  type Prefs,
  type QueueOrder,
  type SavedSession,
} from "@/lib/expenses/storage";
import { contentKey } from "@/lib/expenses/text";
import {
  BUSINESS_CATEGORIES,
  CATEGORY_LABELS,
  TAX_CATEGORIES,
  type Category,
  type DecidedVerdict,
  type Decision,
  type MerchantMemory,
  type ParseResult,
} from "@/lib/expenses/types";
import { ExpenseSwipeDeck, kindLabel, prettyDate, type DecideOptions } from "./ExpenseSwipeDeck";
import { cn } from "@/lib/utils";
import { StatStrip, StatTile } from "./finance/Kpi";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Switch } from "./ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { SyncAgent } from "./SyncBar";

/**
 * /for/expenses — turns an N26 export into the expenses list for the tax
 * sheet. Drop the CSV (or PDF statement), the rules sort what they can,
 * you swipe through the rest, then copy the result straight into Google
 * Sheets. Everything runs in the browser; nothing leaves this tab.
 */

type Loaded = { parsed: ParseResult; fileName: string; fileKey: string };
type Tab = "swipe" | "all" | "export";
type Snapshot = { decisions: DecisionMap; memory: Record<string, MerchantMemory>; deferred: string[] };
type Filter = "all" | "pending" | "business" | "personal" | "tax" | "skip";

const FORMAT_LABEL: Record<ParseResult["format"], string> = {
  "n26-2024": "N26 export",
  "n26-legacy": "N26 export (older layout)",
  "generic-csv": "CSV (columns guessed)",
  pdf: "PDF statement",
};

const VERDICT_LABEL: Record<DecidedVerdict | "pending", string> = {
  business: "Business",
  personal: "Personal",
  tax: "Tax-relevant",
  skip: "Skip",
  pending: "Ask me",
};

/** `embedded`: rendered inside the Books page (no page header, no own sync agent). */
export function ExpensesTriage({ embedded = false }: { embedded?: boolean } = {}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [decisions, setDecisions] = useState<DecisionMap>({});
  const [memory, setMemory] = useState<Record<string, MerchantMemory>>(() => loadMemory());
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [deferred, setDeferred] = useState<string[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [tab, setTab] = useState<Tab>("swipe");
  const [toast, setToast] = useState<{ text: string; undo?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumable, setResumable] = useState<SavedSession | null>(() => loadSession());
  const [streak, setStreak] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const celebrated = useRef<string | null>(null);

  const items = useMemo(
    () => (loaded ? buildItems(loaded.parsed.transactions, memory, decisions) : []),
    [loaded, memory, decisions],
  );
  const summary = useMemo(() => summarize(items), [items]);
  const pending = useMemo(() => pendingItems(items), [items]);
  const queue = useMemo(() => {
    const deferredSet = new Set(deferred);
    const fresh = pending.filter((i) => !deferredSet.has(i.tx.id));
    if (prefs.order === "amount") {
      fresh.sort(
        (a, b) => Math.abs(b.tx.amount) - Math.abs(a.tx.amount) || a.tx.date.localeCompare(b.tx.date),
      );
    } else if (prefs.order === "merchant") {
      // Most repeated merchant first (then the biggest), cards of one
      // merchant kept together in date order.
      const groups = new Map<string, { count: number; total: number }>();
      for (const i of fresh) {
        const g = groups.get(i.key) ?? { count: 0, total: 0 };
        g.count++;
        g.total += Math.abs(i.tx.amount);
        groups.set(i.key, g);
      }
      fresh.sort((a, b) => {
        const ga = groups.get(a.key)!;
        const gb = groups.get(b.key)!;
        return (
          gb.count - ga.count ||
          gb.total - ga.total ||
          a.key.localeCompare(b.key) ||
          a.tx.date.localeCompare(b.tx.date)
        );
      });
    }
    const later = deferred
      .map((id) => pending.find((i) => i.tx.id === id))
      .filter((i): i is Item => !!i);
    return [...fresh, ...later];
  }, [pending, deferred, prefs.order]);

  const smallPending = useMemo(
    () => pending.filter((i) => Math.abs(i.tx.amount) < prefs.sweepUnder),
    [pending, prefs.sweepUnder],
  );

  // Persist the session so a closed tab picks up where it left off.
  useEffect(() => {
    if (!loaded) return;
    saveSession({
      fileName: loaded.fileName,
      fileKey: loaded.fileKey,
      parsed: loaded.parsed,
      decisions,
      savedAt: new Date().toISOString(),
    });
  }, [loaded, decisions]);

  useEffect(() => {
    saveMemory(memory);
  }, [memory]);

  // Every decided business / tax row lands in the books (the dashboard
  // at /books reads them); personal, skipped and undecided rows are
  // taken out again.
  useEffect(() => {
    if (!loaded) return;
    syncItemsIntoBooks(items);
  }, [loaded, items]);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Confetti once per file when the queue empties after real swiping.
  useEffect(() => {
    if (!loaded || tab !== "swipe" || pending.length > 0 || history.length === 0) return;
    if (celebrated.current === loaded.fileKey) return;
    celebrated.current = loaded.fileKey;
    void fireConfetti();
  }, [loaded, tab, pending.length, history.length]);

  const ingest = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const results: ParseResult[] = [];
      const keyParts: string[] = [];
      for (const file of files) {
        if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
          const { parseStatementPdf } = await import("@/lib/expenses/pdf");
          results.push(await parseStatementPdf(await file.arrayBuffer()));
          keyParts.push(`${file.name}:${file.size}:${file.lastModified}`);
        } else {
          const text = await file.text();
          results.push(parseStatementCsv(text));
          keyParts.push(contentKey(text));
        }
      }
      const seen = new Set<string>();
      const merged: ParseResult = {
        transactions: [],
        format: results[0].format,
        incomingCount: 0,
        skippedRows: 0,
        warnings: [],
      };
      for (const r of results) {
        for (const tx of r.transactions) {
          if (seen.has(tx.id)) continue;
          seen.add(tx.id);
          merged.transactions.push(tx);
        }
        merged.incomingCount += r.incomingCount;
        merged.skippedRows += r.skippedRows;
        for (const w of r.warnings) if (!merged.warnings.includes(w)) merged.warnings.push(w);
      }
      merged.transactions.sort((a, b) => a.date.localeCompare(b.date));
      if (merged.transactions.length === 0) {
        setError(merged.warnings[0] ?? "No outgoing payments found in that file.");
        return;
      }
      const fileName = files.map((f) => f.name).join(", ");
      setLoaded({ parsed: merged, fileName, fileKey: keyParts.join("+") });
      setDecisions({});
      setDeferred([]);
      setHistory([]);
      setStreak(0);
      setTab("swipe");
      setResumable(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    } finally {
      setBusy(false);
    }
  }, []);

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    void ingest(files);
  }

  function onDrop(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    setDragOver(false);
    void ingest(Array.from(e.dataTransfer.files ?? []));
  }

  function resume() {
    if (!resumable) return;
    setLoaded({ parsed: resumable.parsed, fileName: resumable.fileName, fileKey: resumable.fileKey });
    setDecisions(resumable.decisions ?? {});
    setDeferred([]);
    setHistory([]);
    setStreak(0);
    setTab("swipe");
    setResumable(null);
  }

  function pushSnapshot() {
    setHistory((h) => [...h.slice(-49), { decisions, memory, deferred }]);
  }

  function decide(item: Item, verdict: DecidedVerdict, opts: DecideOptions) {
    pushSnapshot();
    const decision = makeDecision(verdict, opts.category, opts.note);
    setDecisions((d) => ({ ...d, [item.tx.id]: decision }));
    setDeferred((d) => d.filter((id) => id !== item.tx.id));
    setStreak((s) => s + 1);
    if (opts.applyToSimilar) {
      const similar = pending.filter((i) => i !== item && i.key === item.key).length;
      setMemory((m) => ({
        ...m,
        [item.key]: {
          verdict,
          category: decision.category,
          updatedAt: decision.at ?? new Date().toISOString(),
          label: item.tx.partner,
        },
      }));
      if (similar > 0) {
        setToast({
          text: `${VERDICT_LABEL[verdict]} — applied to ${similar} more from ${item.tx.partner}`,
          undo: true,
        });
      }
    }
  }

  /** Mark every pending card under the threshold as personal in one go. */
  function sweepSmall() {
    const small = pending.filter((i) => Math.abs(i.tx.amount) < prefs.sweepUnder);
    if (small.length === 0) return;
    pushSnapshot();
    const decision = makeDecision("personal", "personal");
    setDecisions((d) => {
      const next = { ...d };
      for (const i of small) next[i.tx.id] = decision;
      return next;
    });
    setDeferred((d) => d.filter((id) => !small.some((i) => i.tx.id === id)));
    setToast({
      text: `${small.length} card${small.length === 1 ? "" : "s"} under €${prefs.sweepUnder} marked personal`,
      undo: true,
    });
  }

  function later(item: Item) {
    setDeferred((d) => [...d.filter((id) => id !== item.tx.id), item.tx.id]);
    setStreak(0);
  }

  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setDecisions(last.decisions);
    setMemory(last.memory);
    setDeferred(last.deferred);
    setStreak(0);
    setToast(null);
  }

  function setRowVerdict(item: Item, value: DecidedVerdict | "pending") {
    setDecisions((d) => {
      if (value === "pending") return { ...d, [item.tx.id]: null };
      const current = item.decision;
      const category =
        value === "business"
          ? current?.verdict === "business"
            ? current.category
            : BUSINESS_CATEGORIES.includes(item.auto.category)
              ? item.auto.category
              : "other"
          : value === "tax"
            ? current?.verdict === "tax"
              ? current.category
              : TAX_CATEGORIES.includes(item.auto.category)
                ? item.auto.category
                : "taxother"
            : "other";
      return { ...d, [item.tx.id]: { ...makeDecision(value, category, current?.note), by: "you" } };
    });
  }

  function patchRow(item: Item, patch: Partial<Decision>) {
    if (!item.decision) return;
    const base: Decision = { ...item.decision, by: "you", at: new Date().toISOString() };
    setDecisions((d) => ({ ...d, [item.tx.id]: { ...base, ...patch } }));
  }

  function startOver() {
    if (
      history.length > 0 &&
      !window.confirm("Drop this file and its decisions? What you taught the tool about merchants stays.")
    ) {
      return;
    }
    clearSession();
    setLoaded(null);
    setDecisions({});
    setDeferred([]);
    setHistory([]);
    setStreak(0);
    setError(null);
    setResumable(null);
  }

  function forget() {
    const n = Object.keys(memory).length;
    if (n === 0) return;
    if (!window.confirm(`Forget the ${n} merchant${n === 1 ? "" : "s"} you taught the tool? Rows decided from memory go back to the rules.`)) {
      return;
    }
    clearMemory();
    setMemory({});
  }

  const exportOpts = useMemo<ExportOptions>(
    () => ({ scope: prefs.scope, includeTax: prefs.includeTax, decimalComma: prefs.decimalComma }),
    [prefs.scope, prefs.includeTax, prefs.decimalComma],
  );
  const rows = useMemo(() => exportRows(items, exportOpts), [items, exportOpts]);

  async function copySheet() {
    const tsv = toTsv(rows, exportOpts);
    try {
      await navigator.clipboard.writeText(tsv);
      setToast({ text: `Copied ${rows.length} rows — paste into your sheet with ⌘V` });
    } catch {
      setToast({ text: "Clipboard blocked — use Download instead" });
    }
  }

  function downloadCsv() {
    const csv = toCsv(rows, exportOpts);
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const year = items[0]?.tx.date.slice(0, 4) ?? "";
    a.href = url;
    a.download = `expenses-${year || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const memoryCount = Object.keys(memory).length;

  const Root = embedded ? "div" : "main";
  return (
    <Root className={embedded ? "flex flex-col gap-2" : "page-fade-in mx-auto w-full max-w-[1040px] px-6 pt-10 pb-40 md:px-10 md:pt-16"}>
      {embedded ? (
        <p className="max-w-[620px] text-sm leading-6 text-fd-muted-foreground">
          Drop the N26 export for the year. The rules sort what they can, you swipe through the rest, and every business or tax-relevant row lands in the books. Nothing leaves this browser.
        </p>
      ) : (
        <>
          <SyncAgent />
          <section className="flex flex-col gap-6 pb-10 md:pb-14">
            <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
              Private · Tax expenses
            </p>
            <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
              Expenses
            </h1>
            <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
              Drop the N26 export for the year. The rules sort what they can, you swipe through the rest,
              and every business or tax-relevant row lands in the books. Nothing leaves this browser.
            </p>
          </section>
        </>
      )}

      {!loaded ? (
        <section className={`flex flex-col gap-6 ${embedded ? "pt-4" : ""}`}>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cn(
              "flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-12 text-center transition-colors",
              dragOver ? "border-primary bg-primary/5" : "hover:border-foreground/40 hover:bg-fd-muted/40",
            )}
          >
            <input
              type="file"
              accept=".csv,.pdf,text/csv,application/pdf"
              multiple
              onChange={onInputChange}
              className="sr-only"
              disabled={busy}
            />
            <span className="flex size-14 items-center justify-center rounded-full bg-fd-muted text-fd-muted-foreground">
              <FileUp className="size-5" strokeWidth={2} />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              {busy ? "Reading…" : "Drop the N26 CSV here"}
            </span>
            <span className="max-w-[420px] text-sm leading-6 text-fd-muted-foreground">
              N26 web app → Transactions → Download → CSV, full year. A PDF statement works too,
              but the CSV is cleaner. Several files at once are fine.
            </span>
          </label>

          {error ? (
            <p className="rounded-xl border border-fd-down/40 bg-fd-down/5 px-4 py-3 text-sm leading-6 text-fd-down">
              {error}
            </p>
          ) : null}

          {resumable ? (
            <div className="flex flex-col gap-4 rounded-xl border bg-fd-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-fd-muted-foreground">
                  Pick up where you left off
                </p>
                <p className="mt-1 truncate text-sm font-medium">{resumable.fileName}</p>
                <p className="text-xs text-fd-muted-foreground">
                  {resumable.parsed.transactions.length} entries · {Object.keys(resumable.decisions ?? {}).length} decided by you · saved{" "}
                  {prettyDate(resumable.savedAt.slice(0, 10))}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={resume}>Resume</Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    clearSession();
                    setResumable(null);
                  }}
                >
                  Discard
                </Button>
              </div>
            </div>
          ) : null}

          {memoryCount > 0 ? (
            <p className="text-xs text-fd-muted-foreground">
              You&apos;ve taught it {memoryCount} merchant{memoryCount === 1 ? "" : "s"} so far.{" "}
              <button type="button" onClick={forget} className="underline underline-offset-4 hover:text-foreground">
                Forget them
              </button>
            </p>
          ) : null}
        </section>
      ) : (
        <>
          <section className={`flex flex-col gap-6 ${embedded ? "pt-4" : ""}`}>
            <StatStrip className="md:grid-cols-4">
              <StatTile label="Outgoing" value={`€${formatEur(summary.total)}`} sub={`${summary.count} entries`} />
              <StatTile label="Business" value={`€${formatEur(summary.business)}`} sub={`${summary.businessCount} entries`} tone="up" />
              <StatTile label="To decide" value={String(summary.pendingCount)} sub={`€${formatEur(summary.pending)}`} tone={summary.pendingCount > 0 ? "warn" : undefined} />
              <StatTile label="Personal" value={`€${formatEur(summary.personal)}`} sub={`+ tax-relevant €${formatEur(summary.tax)}, internal €${formatEur(summary.skip)}`} />
            </StatStrip>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <p className="min-w-0 truncate text-xs text-fd-muted-foreground">
                {FORMAT_LABEL[loaded.parsed.format]} · {loaded.fileName}
                {loaded.parsed.incomingCount > 0 ? ` · ${loaded.parsed.incomingCount} incoming ignored` : ""}
              </p>
              <div className="flex flex-wrap gap-1">
                {embedded ? null : (
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/books">Books &amp; tax →</Link>
                  </Button>
                )}
                <Button type="button" variant="ghost" size="sm" onClick={startOver}>Load another file</Button>
                {memoryCount > 0 ? (
                  <Button type="button" variant="ghost" size="sm" onClick={forget}>
                    Forget {memoryCount} merchant{memoryCount === 1 ? "" : "s"}
                  </Button>
                ) : null}
              </div>
            </div>
            {loaded.parsed.warnings.length > 0 ? (
              <ul className="flex flex-col gap-1 rounded-xl border border-dashed px-4 py-3 text-sm leading-6 text-fd-muted-foreground">
                {loaded.parsed.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
          </section>

          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className={embedded ? "mt-2 mb-6" : "mt-12 mb-10"}>
            <TabsList aria-label="Import sections">
              <TabsTrigger value="swipe">Swipe{pending.length > 0 ? ` · ${pending.length}` : ""}</TabsTrigger>
              <TabsTrigger value="all">All entries · {items.length}</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === "swipe" && queue.length > 0 ? (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Tabs value={prefs.order} onValueChange={(v) => setPrefs({ ...prefs, order: v as QueueOrder })}>
                <TabsList aria-label="Queue order">
                  <TabsTrigger value="date">Oldest first</TabsTrigger>
                  <TabsTrigger value="amount">Biggest first</TabsTrigger>
                  <TabsTrigger value="merchant">By merchant</TabsTrigger>
                </TabsList>
              </Tabs>
              <span className="text-xs text-fd-muted-foreground">
                {prefs.order === "amount"
                  ? `€${formatEur(summary.pending)} still to decide — the big ones go first`
                  : prefs.order === "merchant"
                    ? "Repeat offenders first — one swipe clears the whole merchant"
                    : ""}
              </span>
            </div>
          ) : null}

          {tab === "swipe" && smallPending.length > 0 ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border bg-fd-muted/40 px-4 py-3">
              <div className="flex flex-wrap items-center gap-1.5 text-sm leading-6">
                {smallPending.length} card{smallPending.length === 1 ? "" : "s"} under
                <NativeSelect value={prefs.sweepUnder} onChange={(e) => setPrefs({ ...prefs, sweepUnder: Number(e.target.value) })} className="h-7 py-0 text-xs" aria-label="Threshold">
                  {[5, 10, 20, 50].map((n) => (
                    <NativeSelectOption key={n} value={n}>€{n}</NativeSelectOption>
                  ))}
                </NativeSelect>
                — €{formatEur(smallPending.reduce((t, i) => t + Math.abs(i.tx.amount), 0))} in total, mostly coffee.
              </div>
              <Button type="button" variant="outline" size="sm" onClick={sweepSmall}>Mark them all personal</Button>
            </div>
          ) : null}

          {tab === "swipe" ? (
            queue.length > 0 ? (
              <ExpenseSwipeDeck
                queue={queue}
                items={items}
                done={items.length - pending.length}
                total={items.length}
                streak={streak}
                businessSoFar={summary.business}
                canUndo={history.length > 0}
                onDecide={decide}
                onLater={later}
                onUndo={undo}
              />
            ) : (
              <DonePanel
                summary={summary}
                rows={rows.length}
                onCopy={copySheet}
                onReview={() => setTab("all")}
                onUndo={history.length > 0 ? undo : undefined}
              />
            )
          ) : null}

          {tab === "all" ? (
            <EntriesTable
              items={items}
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
              onVerdict={setRowVerdict}
              onPatch={patchRow}
            />
          ) : null}

          {tab === "export" ? (
            <ExportPanel
              items={items}
              rows={rows}
              opts={exportOpts}
              prefs={prefs}
              setPrefs={setPrefs}
              pendingCount={summary.pendingCount}
              onCopy={copySheet}
              onDownload={downloadCsv}
            />
          ) : null}
        </>
      )}

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
          <div className="fd-portal pointer-events-auto flex items-center gap-3 rounded-xl border bg-popover px-4 py-2.5 text-sm text-popover-foreground shadow-fd">
            <span>{toast.text}</span>
            {toast.undo ? (
              <Button type="button" variant="ghost" size="sm" onClick={undo} className="h-7">
                <RotateCcw /> Undo
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Root>
  );
}

function DonePanel({
  summary,
  rows,
  onCopy,
  onReview,
  onUndo,
}: {
  summary: ReturnType<typeof summarize>;
  rows: number;
  onCopy: () => void;
  onReview: () => void;
  onUndo?: () => void;
}) {
  return (
    <section className="flex flex-col items-start gap-6 rounded-2xl border bg-fd-muted/30 px-6 py-8 md:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-fd-muted-foreground">All sorted</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          €{formatEur(summary.business)} of business expenses across {summary.businessCount} entries.
        </h2>
        <p className="max-w-[560px] text-sm leading-6 text-fd-muted-foreground">
          {rows} rows are ready for the sheet. Copy them, paste into Google Sheets, and check the
          category column on anything the rules decided on their own.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={onCopy}><Copy /> Copy for Google Sheets</Button>
        <Button type="button" variant="outline" size="sm" onClick={onReview}>Review all entries</Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/books">Open the books</Link>
        </Button>
        {onUndo ? (
          <Button type="button" variant="ghost" size="sm" onClick={onUndo}><RotateCcw /> Undo last</Button>
        ) : null}
      </div>
    </section>
  );
}

function EntriesTable({
  items,
  filter,
  setFilter,
  search,
  setSearch,
  onVerdict,
  onPatch,
}: {
  items: Item[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  search: string;
  setSearch: (s: string) => void;
  onVerdict: (item: Item, v: DecidedVerdict | "pending") => void;
  onPatch: (item: Item, patch: Partial<Decision>) => void;
}) {
  const q = search.trim().toLowerCase();
  const visible = items
    .filter((i) => {
      if (filter === "pending") return !i.decision;
      if (filter !== "all") return i.decision?.verdict === filter;
      return true;
    })
    .filter((i) => !q || `${i.tx.partner} ${i.tx.reference}`.toLowerCase().includes(q))
    .sort((a, b) => b.tx.date.localeCompare(a.tx.date));
  const counts: Record<Filter, number> = {
    all: items.length,
    pending: items.filter((i) => !i.decision).length,
    business: items.filter((i) => i.decision?.verdict === "business").length,
    personal: items.filter((i) => i.decision?.verdict === "personal").length,
    tax: items.filter((i) => i.decision?.verdict === "tax").length,
    skip: items.filter((i) => i.decision?.verdict === "skip").length,
  };
  const total = visible.reduce((s, i) => s + Math.abs(i.tx.amount), 0);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "pending", "business", "personal", "tax", "skip"] as Filter[]).map((f) => (
            <Button key={f} type="button" size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="h-7 rounded-full px-3 text-xs">
              {f === "all" ? "All" : f === "pending" ? "Ask me" : VERDICT_LABEL[f]} <span className="opacity-60">{counts[f]}</span>
            </Button>
          ))}
        </div>
        <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search merchant or reference" className="h-9 md:w-[280px]" />
      </div>
      <p className="text-xs text-fd-muted-foreground">
        {visible.length} entries · €{formatEur(total)} · table edits change one row only, swipes teach the tool
      </p>
      <ul className="flex flex-col divide-y overflow-hidden rounded-xl border">
        {visible.map((i) => (
          <li
            key={i.tx.id}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 px-4 py-3 md:grid-cols-[88px_minmax(0,1fr)_92px_auto_176px] md:items-center",
              !i.decision && "bg-fd-warn/5",
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground md:col-start-1">
              {prettyDate(i.tx.date)}
            </p>
            <p className="justify-self-end text-base font-semibold tabular-nums md:col-start-3 md:justify-self-end">
              €{formatEur(Math.abs(i.tx.amount))}
            </p>
            <div className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
              <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <span className="truncate">{i.tx.partner}</span>
                <Badge variant="outline" className="shrink-0 px-1.5 text-[10px] text-fd-muted-foreground">
                  {kindLabel(i.tx.kind, i.tx.type)}
                  {i.decision ? ` · ${i.decision.by}` : ""}
                </Badge>
              </p>
              <p className="truncate text-xs text-fd-muted-foreground">
                {i.tx.reference || i.auto.reason}
              </p>
            </div>
            <VerdictButtons
              value={i.decision?.verdict ?? "pending"}
              onChange={(v) => onVerdict(i, v)}
            />
            {i.decision?.verdict === "business" ? (
              <div className="flex flex-col gap-1.5 md:col-start-5">
                <NativeSelect value={i.decision.category} onChange={(e) => onPatch(i, { category: e.target.value as Category })} className="h-8 w-full text-xs" aria-label="Category">
                  {BUSINESS_CATEGORIES.map((c) => (
                    <NativeSelectOption key={c} value={c}>{CATEGORY_LABELS[c]}</NativeSelectOption>
                  ))}
                </NativeSelect>
                <Input
                  type="text"
                  defaultValue={i.decision.note ?? ""}
                  placeholder="Note"
                  aria-label="Note"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== (i.decision?.note ?? "")) onPatch(i, { note: v || undefined });
                  }}
                  className="h-8 text-xs"
                />
              </div>
            ) : i.decision?.verdict === "tax" ? (
              <NativeSelect value={taxBucket(i)} onChange={(e) => onPatch(i, { category: e.target.value as Category })} className="h-8 w-full text-xs md:col-start-5" aria-label="Tax bucket">
                {TAX_CATEGORIES.map((c) => (
                  <NativeSelectOption key={c} value={c}>{CATEGORY_LABELS[c]}</NativeSelectOption>
                ))}
              </NativeSelect>
            ) : (
              <span className="hidden md:col-start-5 md:block" />
            )}
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-fd-muted-foreground">Nothing here.</li>
        ) : null}
      </ul>
    </section>
  );
}

/** One click per verdict; clicking the active one again asks again. */
function VerdictButtons({
  value,
  onChange,
}: {
  value: DecidedVerdict | "pending";
  onChange: (v: DecidedVerdict | "pending") => void;
}) {
  const options: { v: DecidedVerdict; Icon: typeof Briefcase; active: string }[] = [
    { v: "business", Icon: Briefcase, active: "border-primary bg-primary text-primary-foreground" },
    { v: "personal", Icon: User, active: "border-fd-down bg-fd-down text-white" },
    { v: "tax", Icon: Landmark, active: "border-fd-warn bg-fd-warn text-white" },
    { v: "skip", Icon: Ban, active: "border-foreground bg-foreground text-background" },
  ];
  return (
    <div className="flex gap-1.5 md:col-start-4" role="group" aria-label="Verdict">
      {options.map(({ v, Icon, active }) => (
        <button
          key={v}
          type="button"
          aria-label={VERDICT_LABEL[v]}
          title={value === v ? `${VERDICT_LABEL[v]} — click again to ask me` : VERDICT_LABEL[v]}
          onClick={() => onChange(value === v ? "pending" : v)}
          className={cn("inline-flex size-8 items-center justify-center rounded-full border transition-colors", value === v ? active : "text-fd-muted-foreground hover:border-foreground/40 hover:text-foreground")}
        >
          <Icon className="size-3.5" strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}

function ExportPanel({
  items,
  rows,
  opts,
  prefs,
  setPrefs,
  pendingCount,
  onCopy,
  onDownload,
}: {
  items: Item[];
  rows: ReturnType<typeof exportRows>;
  opts: ExportOptions;
  prefs: Prefs;
  setPrefs: (p: Prefs) => void;
  pendingCount: number;
  onCopy: () => void;
  onDownload: () => void;
}) {
  const cols = exportColumns(opts);
  const cats = byCategory(items);
  const months = byMonth(items);
  const total = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Toggle
            label="Business rows only"
            checked={prefs.scope === "business"}
            onChange={(v) => setPrefs({ ...prefs, scope: v ? "business" : "all" })}
            hint="Off: every decided row with a Verdict column"
          />
          <Toggle
            label="Append tax-relevant rows"
            checked={prefs.includeTax}
            onChange={(v) => setPrefs({ ...prefs, includeTax: v })}
            hint="Finanzamt, health insurance, pension"
          />
          <Toggle
            label="Decimal comma"
            checked={prefs.decimalComma}
            onChange={(v) => setPrefs({ ...prefs, decimalComma: v })}
            hint="12,99 for a German-locale sheet"
          />
        </div>
        {pendingCount > 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-3 text-sm leading-6 text-fd-muted-foreground">
            {pendingCount} entr{pendingCount === 1 ? "y is" : "ies are"} still undecided and not in this export. Swipe them first, or set them in All entries.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={onCopy}><Copy /> Copy {rows.length} rows</Button>
          <Button type="button" variant="outline" size="sm" onClick={onDownload}><Download /> Download CSV</Button>
          <p className="ml-2 text-xs text-fd-muted-foreground">Total €{formatEur(total, prefs.decimalComma)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table className="min-w-[720px] text-xs">
          <TableHeader>
            <TableRow className="bg-fd-muted/50 hover:bg-fd-muted/50">
              {cols.map((c) => (
                <TableHead key={c} className="px-3">{COLUMN_LABELS[c]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 40).map((r, idx) => (
              <TableRow key={idx}>
                {cols.map((c) => (
                  <TableCell key={c} className={cn("max-w-[260px] truncate px-3 py-1.5", c === "amount" && "text-right tabular-nums")}>
                    {c === "amount" ? formatEur(r.amount, prefs.decimalComma) : String(r[c])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length > 40 ? (
              <TableRow>
                <TableCell colSpan={cols.length} className="px-3 py-2 text-fd-muted-foreground">…and {rows.length - 40} more rows in the copy</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Breakdown
          title="Business by category"
          rows={cats.map((c) => [CATEGORY_LABELS[c.category], c.count, c.total])}
          decimalComma={prefs.decimalComma}
        />
        <Breakdown
          title="Business by month"
          rows={months.map((m) => [m.month, m.count, m.total])}
          decimalComma={prefs.decimalComma}
        />
      </div>
    </section>
  );
}

function Breakdown({
  title,
  rows,
  decimalComma,
}: {
  title: string;
  rows: [string, number, number][];
  decimalComma: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-fd-muted-foreground">{title}</p>
      <ul className="flex flex-col divide-y rounded-xl border px-4">
        {rows.length === 0 ? <li className="py-3 text-sm text-fd-muted-foreground">Nothing yet.</li> : null}
        {rows.map(([label, count, total]) => (
          <li key={label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
            <span className="min-w-0 truncate">
              {label} <span className="text-fd-muted-foreground">×{count}</span>
            </span>
            <span className="tabular-nums font-medium">€{formatEur(total, decimalComma)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Label className="cursor-pointer items-start gap-3 font-normal">
      <Switch checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-fd-muted-foreground">{hint}</span>
      </span>
    </Label>
  );
}

async function fireConfetti() {
  try {
    const { default: confetti } = await import("canvas-confetti");
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
    window.setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.6 } }), 250);
  } catch {
    // no confetti, no problem
  }
}
