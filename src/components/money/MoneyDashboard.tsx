"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
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
import { Stat } from "../Stat";
import { SyncBar } from "../SyncBar";
import { AccountsPanel } from "./AccountsPanel";
import { AttentionList } from "./AttentionList";
import { CashflowChart } from "./CashflowChart";
import { Amount, PrivacyProvider, PrivacyToggle, usePrivacy } from "./Privacy";
import { UpcomingList } from "./UpcomingList";

/**
 * /money — the one page to open when deciding about money. Reads what
 * the other pages keep (books, expenses session, ledger, subscriptions,
 * sync) and adds the balances you type in. Nothing here leaves the
 * browser except through the encrypted sync.
 */

type Props = {
  income: IncomeYear[];
  incomeMonths: IncomeMonth[];
  receivables: Receivable[];
  /** Pre-tool years + rows added from chat (src/content/books). */
  seed: BookEntry[];
  facts: Record<number, YearSettings>;
  registry: Subscription[];
  ledgerLoaded: boolean;
};

export function MoneyDashboard(props: Props) {
  return (
    <PrivacyProvider>
      <Dashboard {...props} />
    </PrivacyProvider>
  );
}

function Dashboard({ income, incomeMonths, receivables, seed, facts, registry, ledgerLoaded }: Props) {
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
  // Read each render (cheap): the SyncBar's toast re-renders us after enable/disable.
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

  function changeAccounts(next: Account[]) {
    setAccounts(next);
    saveAccounts(next);
  }

  const runway =
    k.runwayMonths === null ? "—" : hidden ? "••" : k.runwayMonths <= 0 ? "0" : k.runwayMonths >= 24 ? "24+" : k.runwayMonths.toFixed(1);

  return (
    <main className="page-fade-in mx-auto w-full max-w-[1040px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      {/* ---------- header ---------- */}
      <section className="flex flex-col gap-5 pb-10 md:pb-12">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">Private · Money</p>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">Money</h1>
            <p className="text-[0.9rem] text-muted">{dateLine}</p>
          </div>
          <div className="flex items-center gap-2 pt-2 md:pt-4">
            <PrivacyToggle />
            <SyncBar onToast={setToast} onRestored={reloadSoon} />
          </div>
        </div>
        <nav aria-label="Money pages" className="flex flex-wrap items-center gap-x-4 gap-y-1 font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
          <Link href="/books" className="transition-colors hover:text-ink">Books →</Link>
          <Link href="/for/expenses" className="transition-colors hover:text-ink">Expenses →</Link>
          <Link href="/for/clients" className="transition-colors hover:text-ink">Clients →</Link>
        </nav>
        {!ledgerLoaded ? (
          <p className="rounded-[12px] border border-rule-soft bg-card/40 px-4 py-3 text-[0.85rem] leading-[1.4rem] text-muted">
            Invoice data loads after the gate — reload the page if income and open invoices show as zero.
          </p>
        ) : null}
      </section>

      {/* ---------- hero ---------- */}
      <section className="flex flex-col gap-3 border-t border-rule pt-8">
        <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">Free to spend</p>
        {noBalances ? (
          <>
            <p className="font-display text-[3.25rem] font-bold leading-none text-faint md:text-[4.5rem]">€ —</p>
            <p className="max-w-[560px] text-[0.95rem] leading-[1.6rem] text-muted">
              Type today&apos;s balances into{" "}
              <a href="#accounts" className="text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink">
                Accounts
              </a>{" "}
              to start. The Finanzamt still gets <Amount value={k.taxOwed} className="text-ink" /> this year, so free cash is what&apos;s left after that.
            </p>
          </>
        ) : (
          <>
            <Amount value={k.free} className={`font-display text-[3.25rem] font-bold leading-none md:text-[4.5rem] ${k.free < 0 ? "text-down" : "text-ink"}`} />
            <p className="max-w-[560px] text-[0.95rem] leading-[1.6rem] text-muted">
              <Amount value={k.cash} className="text-ink" /> across {assetCount} account{assetCount === 1 ? "" : "s"}, minus{" "}
              <Amount value={k.taxOwed} className="text-ink" /> the Finanzamt still gets this year
              {k.owedToYou > 0 ? (
                <>
                  . Another <Amount value={k.owedToYou} className="text-ink" /> is invoiced and not in yet
                </>
              ) : null}
              .
            </p>
          </>
        )}
      </section>

      {/* ---------- KPI tiles ---------- */}
      <section className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-3 md:grid-cols-5">
        <Stat label="Cash" value={<Amount value={k.cash} />} sub={k.taxReserve > 0 ? <>incl. <Amount value={k.taxReserve} /> set aside for tax</> : "every asset account, in EUR"} />
        <Stat
          label="Owed to you"
          value={<Amount value={k.owedToYou} />}
          sub={receivables.length === 0 ? "no open invoices" : `${receivables.length} open invoice${receivables.length === 1 ? "" : "s"}`}
          tone={k.owedToYou > 0 ? "up" : "ink"}
        />
        <Stat
          label="Tax owed"
          value={<Amount value={k.taxOwed} />}
          sub={
            <>
              <Meter ratio={coverage} />
              <span className="mt-1 block">
                {k.taxOwed <= 0 ? "nothing left for this year" : `set-aside covers ${Math.min(999, Math.round(coverage * 100))} %`}
              </span>
            </>
          }
          tone={k.taxOwed > 0 ? "down" : "ink"}
        />
        <Stat label="Monthly burn" value={<Amount value={k.burn} />} sub="business + health, avg of last 3 full months" tone={k.burn > 0 ? "down" : "ink"} />
        <div className="col-span-2 sm:col-span-1">
        <Stat
          label="Runway"
          value={runway === "—" ? "—" : <>{runway} <span className="text-[0.9rem] font-medium text-muted">mo</span></>}
          sub={k.runwayMonths === null ? "needs three months of expenses" : "free cash ÷ monthly burn"}
          tone={k.runwayMonths === null ? "ink" : k.runwayMonths < 3 ? "down" : k.runwayMonths < 6 ? "warn" : "up"}
        />
        </div>
      </section>

      {/* ---------- attention ---------- */}
      <Section
        title="Needs a decision"
        meta={attention.length === 0 ? undefined : [now ? `${now} now` : null, soon ? `${soon} soon` : null, `${attention.length - now - soon} to note`].filter(Boolean).join(" · ")}
      >
        <AttentionList items={attention} />
      </Section>

      {/* ---------- cash flow ---------- */}
      <Section title="Cash flow" meta="last 12 months · invoices received vs business money out">
        <CashflowChart months={flow} />
      </Section>

      {/* ---------- upcoming + accounts ---------- */}
      <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
        <Section title="Next 90 days" meta="Finanzamt · invoices · renewals" className="mt-0">
          <UpcomingList items={upcoming} cashNow={k.cash} />
        </Section>
        <Section title="Accounts" meta="typed in by hand" className="mt-0" id="accounts">
          <AccountsPanel accounts={accounts} usdRate={usdRate} today={today} onChange={changeAccounts} />
        </Section>
      </div>

      {/* ---------- how ---------- */}
      <details className="group mt-14 border-t border-rule pt-6 text-[0.85rem] leading-[1.5rem] text-muted">
        <summary className="cursor-pointer list-none font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink">
          How these numbers are made <span className="ml-1 inline-block transition-transform group-open:rotate-90">→</span>
        </summary>
        <ul className="mt-3 flex max-w-[640px] flex-col gap-1.5">
          <li><span className="text-ink">Free to spend</span> = every asset balance in EUR (USD at {usdRate}) − tax owed. Debts are in net worth only.</li>
          <li><span className="text-ink">Tax owed</span> = Vorauszahlungen still unpaid this year + the projected year-end bill on top of them + VAT collected and not yet paid. Same maths as the estimate on /books.</li>
          <li><span className="text-ink">Owed to you</span> = invoices in the ledger with a due date and no paid date.</li>
          <li><span className="text-ink">Monthly burn</span> = business expenses + health/KSK/pension rows, averaged over the last three full months in the books.</li>
          <li><span className="text-ink">Cash flow</span> = invoices by the month the money landed (VAT stripped) vs business expenses by the month they were paid.</li>
          <li><span className="text-ink">Next 90 days</span> = instalments from the Vorauszahlungsbescheid, invoice due dates, and renewals stepped from each plan&apos;s last charge. Personal plans are listed but tagged.</li>
          <li>Balances stay in this browser and ride along in the encrypted sync. The eye icon (or <kbd className="rounded border border-rule px-1 font-caption text-[10px]">H</kbd>) hides every amount on this device.</li>
        </ul>
      </details>

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

function Section({ title, meta, children, className = "mt-14", id }: { title: string; meta?: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`flex min-w-0 scroll-mt-8 flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-[1.25rem] font-bold leading-tight text-ink">{title}</h2>
        {meta ? <p className="text-[0.8rem] text-muted">{meta}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Thin bar: how much of the tax owed the set-aside account covers. */
function Meter({ ratio }: { ratio: number }) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <span
      role="meter"
      aria-label="Tax set-aside coverage"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-rule"
    >
      <span className={`block h-full rounded-full ${ratio >= 1 ? "bg-up" : ratio >= 0.5 ? "bg-warn" : "bg-down"}`} style={{ width: `${pct}%` }} />
    </span>
  );
}
