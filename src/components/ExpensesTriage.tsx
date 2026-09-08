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
import { Copy, Download, FileUp, RotateCcw } from "lucide-react";
import { parseStatementCsv } from "@/lib/expenses/parse";
import {
  buildItems,
  byCategory,
  byMonth,
  formatEur,
  makeDecision,
  pendingItems,
  summarize,
  type DecisionMap,
  type Item,
} from "@/lib/expenses/triage";
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
  type Category,
  type DecidedVerdict,
  type Decision,
  type MerchantMemory,
  type ParseResult,
} from "@/lib/expenses/types";
import { ExpenseSwipeDeck, kindLabel, prettyDate, type DecideOptions } from "./ExpenseSwipeDeck";

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

export function ExpensesTriage() {
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

  return (
    <main className="page-fade-in mx-auto w-full max-w-[960px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      <section className="flex flex-col gap-6 pb-10 md:pb-14">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
          Private · Tax expenses
        </p>
        <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
          Expenses
        </h1>
        <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
          Drop the N26 export for the year. The rules sort what they can, you swipe through the rest,
          then copy the business rows straight into the tax sheet. Nothing leaves this browser.
        </p>
      </section>

      {!loaded ? (
        <section className="flex flex-col gap-6">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[20px] border border-dashed px-6 py-12 text-center transition-colors ${
              dragOver ? "border-ink bg-card/60" : "border-rule hover:border-ink hover:bg-card/40"
            }`}
          >
            <input
              type="file"
              accept=".csv,.pdf,text/csv,application/pdf"
              multiple
              onChange={onInputChange}
              className="sr-only"
              disabled={busy}
            />
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-rule text-muted">
              <FileUp className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="font-display text-[1.25rem] font-bold text-ink">
              {busy ? "Reading…" : "Drop the N26 CSV here"}
            </span>
            <span className="max-w-[420px] text-[0.9rem] leading-[1.5rem] text-muted">
              N26 web app → Transactions → Download → CSV, full year. A PDF statement works too,
              but the CSV is cleaner. Several files at once are fine.
            </span>
          </label>

          {error ? (
            <p className="rounded-[12px] border border-[#d14343]/40 bg-[#d14343]/5 px-4 py-3 text-[0.9rem] leading-[1.5rem] text-[#d14343]">
              {error}
            </p>
          ) : null}

          {resumable ? (
            <div className="flex flex-col gap-4 rounded-[14px] border border-rule px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
                  Pick up where you left off
                </p>
                <p className="mt-1 truncate text-[0.95rem] text-ink">{resumable.fileName}</p>
                <p className="text-[0.85rem] text-muted">
                  {resumable.parsed.transactions.length} entries · {Object.keys(resumable.decisions ?? {}).length} decided by you · saved{" "}
                  {prettyDate(resumable.savedAt.slice(0, 10))}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resume}
                  className="rounded-full border border-ink bg-ink px-5 py-2 font-caption text-[11px] font-bold uppercase tracking-[1px] text-bg transition-colors hover:bg-transparent hover:text-ink"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearSession();
                    setResumable(null);
                  }}
                  className="rounded-full border border-rule px-5 py-2 font-caption text-[11px] font-bold uppercase tracking-[1px] text-muted transition-colors hover:border-ink hover:text-ink"
                >
                  Discard
                </button>
              </div>
            </div>
          ) : null}

          {memoryCount > 0 ? (
            <p className="text-[0.85rem] text-muted">
              You&apos;ve taught it {memoryCount} merchant{memoryCount === 1 ? "" : "s"} so far.{" "}
              <button type="button" onClick={forget} className="underline underline-offset-4 hover:text-ink">
                Forget them
              </button>
            </p>
          ) : null}
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule md:grid-cols-4">
              <Stat label="Outgoing" value={`€${formatEur(summary.total)}`} sub={`${summary.count} entries`} />
              <Stat label="Business" value={`€${formatEur(summary.business)}`} sub={`${summary.businessCount} entries`} accent />
              <Stat label="To decide" value={String(summary.pendingCount)} sub={`€${formatEur(summary.pending)}`} />
              <Stat label="Personal" value={`€${formatEur(summary.personal)}`} sub={`+ tax-relevant €${formatEur(summary.tax)}, internal €${formatEur(summary.skip)}`} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <p className="min-w-0 truncate text-[0.85rem] text-muted">
                {FORMAT_LABEL[loaded.parsed.format]} · {loaded.fileName}
                {loaded.parsed.incomingCount > 0 ? ` · ${loaded.parsed.incomingCount} incoming ignored` : ""}
              </p>
              <div className="flex gap-4">
                <button type="button" onClick={startOver} className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink">
                  Load another file
                </button>
                {memoryCount > 0 ? (
                  <button type="button" onClick={forget} className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink">
                    Forget {memoryCount} merchant{memoryCount === 1 ? "" : "s"}
                  </button>
                ) : null}
              </div>
            </div>
            {loaded.parsed.warnings.length > 0 ? (
              <ul className="flex flex-col gap-1 rounded-[12px] border border-rule-soft bg-card/40 px-4 py-3 text-[0.85rem] leading-[1.4rem] text-muted">
                {loaded.parsed.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
          </section>

          <nav className="mt-12 mb-10 flex gap-6 border-b border-rule">
            {(
              [
                ["swipe", `Swipe${pending.length > 0 ? ` · ${pending.length}` : ""}`],
                ["all", `All entries · ${items.length}`],
                ["export", "Export"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`-mb-px border-b-2 pb-3 font-caption text-[11px] font-semibold uppercase tracking-[1.5px] transition-colors ${
                  tab === key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {tab === "swipe" && queue.length > 0 ? (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="mr-2 font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
                Order
              </span>
              {(
                [
                  ["date", "Oldest first"],
                  ["amount", "Biggest first"],
                  ["merchant", "By merchant"],
                ] as [QueueOrder, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, order: key })}
                  className={`rounded-full border px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] transition-colors ${
                    prefs.order === key ? "border-ink bg-ink text-bg" : "border-rule text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="ml-2 text-[0.8rem] text-muted">
                {prefs.order === "amount"
                  ? `€${formatEur(summary.pending)} still to decide — the big ones go first`
                  : prefs.order === "merchant"
                    ? "Repeat offenders first — one swipe clears the whole merchant"
                    : ""}
              </span>
            </div>
          ) : null}

          {tab === "swipe" && smallPending.length > 0 ? (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[14px] border border-rule-soft bg-card/40 px-4 py-3">
              <p className="text-[0.85rem] leading-[1.4rem] text-body">
                {smallPending.length} card{smallPending.length === 1 ? "" : "s"} under{" "}
                <select
                  value={prefs.sweepUnder}
                  onChange={(e) => setPrefs({ ...prefs, sweepUnder: Number(e.target.value) })}
                  className="rounded-[6px] border border-rule bg-bg px-1.5 py-0.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      €{n}
                    </option>
                  ))}
                </select>{" "}
                — €{formatEur(smallPending.reduce((t, i) => t + Math.abs(i.tx.amount), 0))} in total, mostly coffee.
              </p>
              <button
                type="button"
                onClick={sweepSmall}
                className="rounded-full border border-ink px-4 py-1.5 font-caption text-[10px] font-bold uppercase tracking-[1px] text-ink transition-colors hover:bg-ink hover:text-bg"
              >
                Mark them all personal
              </button>
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
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-6">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-rule bg-bg px-5 py-3 text-[0.85rem] text-ink" style={{ boxShadow: "var(--shadow-card)" }}>
            <span>{toast.text}</span>
            {toast.undo ? (
              <button type="button" onClick={undo} className="inline-flex items-center gap-1 font-caption text-[10px] font-bold uppercase tracking-[1px] text-muted hover:text-ink">
                <RotateCcw className="h-3 w-3" /> Undo
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 bg-bg px-5 py-5">
      <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">{label}</p>
      <p className={`font-display text-[1.5rem] font-bold leading-tight ${accent ? "text-accent" : "text-ink"}`}>{value}</p>
      <p className="text-[0.75rem] leading-[1.1rem] text-muted">{sub}</p>
    </div>
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
    <section className="flex flex-col items-start gap-8 rounded-[20px] border border-rule px-6 py-10 md:px-10">
      <div className="flex flex-col gap-3">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">All sorted</p>
        <h2 className="font-display text-[2rem] font-bold leading-[1.05] text-ink md:text-[2.75rem]">
          €{formatEur(summary.business)} of business expenses across {summary.businessCount} entries.
        </h2>
        <p className="max-w-[560px] text-[0.95rem] leading-[1.7rem] text-muted">
          {rows} rows are ready for the sheet. Copy them, paste into Google Sheets, and check the
          category column on anything the rules decided on their own.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={onCopy} className="cta-pill group inline-flex h-14 items-center gap-4 pr-6">
          <span className="flex h-14 w-14 items-center justify-center text-bg">
            <Copy className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="font-caption text-[13px] font-bold uppercase tracking-[1px]">Copy for Google Sheets</span>
        </button>
        <button type="button" onClick={onReview} className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink">
          Review all entries
        </button>
        {onUndo ? (
          <button type="button" onClick={onUndo} className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink">
            Undo last
          </button>
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "business", "personal", "tax", "skip"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] transition-colors ${
                filter === f ? "border-ink bg-ink text-bg" : "border-rule text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {f === "all" ? "All" : f === "pending" ? "Ask me" : VERDICT_LABEL[f]} · {counts[f]}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search merchant or reference"
          className="w-full rounded-full border border-rule bg-transparent px-4 py-2 text-[0.9rem] text-ink placeholder:text-faint focus:border-ink focus:outline-none md:w-[280px]"
        />
      </div>
      <p className="font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
        {visible.length} entries · €{formatEur(total)} · table edits change one row only, swipes teach the tool
      </p>
      <ul className="flex flex-col overflow-hidden rounded-[14px] border border-rule">
        {visible.map((i) => (
          <li
            key={i.tx.id}
            className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 border-b border-rule px-4 py-4 last:border-b-0 md:grid-cols-[92px_minmax(0,1fr)_100px_140px_200px] md:items-center ${
              !i.decision ? "bg-card/30" : ""
            }`}
          >
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1px] text-muted md:col-start-1">
              {prettyDate(i.tx.date)}
            </p>
            <p className="justify-self-end font-display text-[1rem] font-bold text-ink md:col-start-3 md:justify-self-end">
              €{formatEur(Math.abs(i.tx.amount))}
            </p>
            <div className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
              <p className="truncate text-[0.95rem] font-medium text-ink">
                {i.tx.partner}
                <span className="ml-2 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-faint">
                  {kindLabel(i.tx.kind, i.tx.type)}
                  {i.decision ? ` · ${i.decision.by}` : ""}
                </span>
              </p>
              <p className="truncate text-[0.8rem] text-muted">
                {i.tx.reference || i.auto.reason}
              </p>
            </div>
            <select
              value={i.decision?.verdict ?? "pending"}
              onChange={(e) => onVerdict(i, e.target.value as DecidedVerdict | "pending")}
              className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.8rem] text-ink focus:border-ink focus:outline-none md:col-start-4"
            >
              {(["pending", "business", "personal", "tax", "skip"] as const).map((v) => (
                <option key={v} value={v}>
                  {VERDICT_LABEL[v]}
                </option>
              ))}
            </select>
            {i.decision?.verdict === "business" ? (
              <div className="flex flex-col gap-1.5 md:col-start-5">
                <select
                  value={i.decision.category}
                  onChange={(e) => onPatch(i, { category: e.target.value as Category })}
                  className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.8rem] text-ink focus:border-ink focus:outline-none"
                >
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  defaultValue={i.decision.note ?? ""}
                  placeholder="Note"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== (i.decision?.note ?? "")) onPatch(i, { note: v || undefined });
                  }}
                  className="rounded-[8px] border border-rule bg-transparent px-2 py-1 text-[0.8rem] text-ink placeholder:text-faint focus:border-ink focus:outline-none"
                />
              </div>
            ) : (
              <p className="text-[0.8rem] text-faint md:col-start-5">
                {i.decision ? CATEGORY_LABELS[i.decision.category] : "Swipe to decide"}
              </p>
            )}
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="px-4 py-10 text-center text-[0.9rem] text-muted">Nothing here.</li>
        ) : null}
      </ul>
    </section>
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
          <p className="rounded-[12px] border border-rule-soft bg-card/40 px-4 py-3 text-[0.85rem] leading-[1.4rem] text-muted">
            {pendingCount} entr{pendingCount === 1 ? "y is" : "ies are"} still undecided and not in this export. Swipe them first, or set them in All entries.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={onCopy} className="cta-pill group inline-flex h-14 items-center gap-4 pr-6">
            <span className="flex h-14 w-14 items-center justify-center text-bg">
              <Copy className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="font-caption text-[13px] font-bold uppercase tracking-[1px]">
              Copy {rows.length} rows
            </span>
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-2 font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
          >
            <Download className="h-4 w-4" /> Download CSV
          </button>
          <p className="font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
            Total €{formatEur(total, prefs.decimalComma)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-rule">
        <table className="w-full min-w-[720px] border-collapse text-left text-[0.8rem]">
          <thead>
            <tr className="border-b border-rule bg-card/40">
              {cols.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">
                  {COLUMN_LABELS[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 40).map((r, idx) => (
              <tr key={idx} className="border-b border-rule-soft last:border-b-0">
                {cols.map((c) => (
                  <td key={c} className={`max-w-[260px] truncate px-3 py-1.5 text-body ${c === "amount" ? "text-right tabular-nums" : ""}`}>
                    {c === "amount" ? formatEur(r.amount, prefs.decimalComma) : String(r[c])}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length > 40 ? (
              <tr>
                <td colSpan={cols.length} className="px-3 py-2 text-muted">
                  …and {rows.length - 40} more rows in the copy
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
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
    <div className="flex flex-col gap-3">
      <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">{title}</p>
      <ul className="flex flex-col divide-y divide-rule-soft rounded-[14px] border border-rule px-4">
        {rows.length === 0 ? <li className="py-3 text-[0.85rem] text-muted">Nothing yet.</li> : null}
        {rows.map(([label, count, total]) => (
          <li key={label} className="flex items-baseline justify-between gap-4 py-2.5 text-[0.85rem]">
            <span className="min-w-0 truncate text-body">
              {label} <span className="text-faint">×{count}</span>
            </span>
            <span className="tabular-nums text-ink">€{formatEur(total, decimalComma)}</span>
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
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
      />
      <span className="flex flex-col">
        <span className="text-[0.9rem] text-ink">{label}</span>
        <span className="text-[0.8rem] text-muted">{hint}</span>
      </span>
    </label>
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
