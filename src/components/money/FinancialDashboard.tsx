"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUpRight, Check, ChevronDown, HandCoins, PenLine, Plus, Trash2, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { KIND_LABELS, KIND_ORDER, inEur, isAsset, newAccountId, type Account, type AccountKind } from "@/lib/money/accounts";
import { defaultExpectedBy, EXPECTED_KIND_LABELS, EXPECTED_KINDS, newExpectedId, type Expected, type ExpectedKind } from "@/lib/money/expected";
import type { Snapshot } from "@/lib/money/history";
import { dayLabel, monthTitle, upcomingRows, type AttentionItem, type CategorySlice, type Severity, type UpcomingItem } from "@/lib/money/overview";
import { FinanceShell } from "@/components/finance/FinanceShell";
import { InfoTip, Kpi, Mini, rise } from "@/components/finance/Kpi";
import { CashflowChart } from "./CashflowChart";
import { Amount, usePrivacy } from "./Privacy";
import { useDashboard, type CashflowPeriod, type DashboardProps } from "./useDashboard";

/**
 * /money — the Financial Dashboard on shadcn/ui: sidebar, white cards on
 * a grey page, one blue accent, Geist. Numbers come from useDashboard();
 * this file is layout and interaction only. Nothing here leaves the
 * browser except through the encrypted sync.
 */

const PERIOD_LABEL: Record<CashflowPeriod, string> = { "6m": "Last 6 months", "12m": "Last 12 months", ytd: "This year so far" };

export function FinancialDashboard(props: DashboardProps) {
  const d = useDashboard(props);
  const { k, attention, counts } = d;
  const [view, setView] = useState<"chart" | "table">("chart");
  const balances = useBalanceUpdate(d.accounts, d.changeAccounts, d.setToast);

  return (
    <FinanceShell
      active="overview"
      title={
        <>
          <span className="lg:hidden">Financial Dashboard</span>
          <span className="hidden lg:inline">Overview</span>
        </>
      }
      subtitle={d.dateLine}
      toast={d.toast}
      onToast={d.setToast}
      onRestored={d.reloadSoon}
      actions={
        <>
          <Button variant={balances.updating ? "default" : "outline"} size="sm" onClick={balances.updating ? balances.save : balances.start}>
            <PenLine /> {balances.updating ? "Save balances" : "Update balances"}
          </Button>
          <ExpectingMoney today={d.today} onAdd={d.addExpected} onToast={d.setToast} />
          <Button variant="outline" size="sm" asChild>
            <Link href="/books"><Plus /> Add expense</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/books?tab=import"><Upload /> Import bank export</Link>
          </Button>
        </>
      }
    >
          {!props.ledgerLoaded ? (
            <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-fd-muted-foreground">
              Invoice data loads after the gate — reload the page if income and open invoices show as zero.
            </p>
          ) : null}

          {/* ---------- hero + KPIs left, attention right ---------- */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-7">
              <Card className="fd-rise gap-5" style={rise(1)}>
                <CardHeader>
                  <CardDescription>Free to spend</CardDescription>
                  <CardTitle className="pt-1 text-[2.75rem] font-semibold leading-none tracking-tight tabular-nums md:text-[3.5rem]">
                    {d.noBalances ? <span className="text-fd-muted-foreground/60">€ —</span> : <Amount value={k.free} className={k.free < 0 ? "text-fd-down" : ""} />}
                  </CardTitle>
                  <CardAction>
                    <InfoTip text="Every asset balance in EUR, minus the tax still owed this year. Debts only count in net worth." />
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <p className="max-w-[52ch] text-sm leading-6 text-fd-muted-foreground">
                    {d.noBalances ? (
                      <>
                        Start with{" "}
                        <button type="button" onClick={balances.start} className="font-medium text-primary underline-offset-4 hover:underline">
                          Update balances
                        </button>{" "}
                        and type today&apos;s figures. The Finanzamt still gets <Amount value={k.taxOwed} className="font-medium text-foreground" /> this year, so free cash is what&apos;s left after that.
                      </>
                    ) : (
                      <>
                        <Amount value={k.cash} className="font-medium text-foreground" /> across {d.assetCount} account{d.assetCount === 1 ? "" : "s"}, minus{" "}
                        <Amount value={k.taxOwed} className="font-medium text-foreground" /> the Finanzamt still gets this year
                        {k.owedToYou > 0 ? (
                          <>
                            . Another <Amount value={k.owedToYou} className="font-medium text-foreground" /> is {k.owedExpected > 0 && k.owedInvoices > 0 ? "invoiced or expected" : k.owedExpected > 0 ? "expected" : "invoiced"} and not in yet
                          </>
                        ) : null}
                        .
                      </>
                    )}
                  </p>
                  <div className="grid grid-cols-3 gap-3 rounded-xl bg-fd-muted/60 p-4">
                    <Mini label="Cash" value={k.cash} />
                    <Mini label="Tax owed" value={k.taxOwed} tone={k.taxOwed > 0 ? "down" : undefined} />
                    <Mini label="Owed to you" value={k.owedToYou} tone={k.owedToYou > 0 ? "up" : undefined} />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Kpi label="Net worth" value={<Amount value={k.netWorth} />} tip="Every asset minus every debt, in EUR. One snapshot a day builds the trend." style={rise(3)}>
                  <NetWorthTrend history={d.history} today={d.today} change={d.change30} />
                </Kpi>
                <Kpi
                  label="Tax set-aside"
                  value={<Amount value={k.taxReserve} />}
                  tip="Balances in accounts marked as tax set-aside, against what's still owed this year."
                  style={rise(4)}
                >
                  <Progress value={Math.min(100, d.coverage * 100)} className="bg-fd-muted" indicatorClassName={d.coverage >= 1 ? "bg-fd-up" : d.coverage >= 0.5 ? "bg-fd-warn" : "bg-fd-down"} aria-label="Tax set-aside coverage" />
                  <span>{k.taxOwed <= 0 ? "nothing left for this year" : <>covers {Math.min(999, Math.round(d.coverage * 100))} % of <Amount value={k.taxOwed} /> owed</>}</span>
                </Kpi>
                <Kpi
                  label="Monthly burn"
                  value={<Amount value={k.burn} />}
                  tip="Business expenses plus health, KSK and pension rows, averaged over the last three full months in the books."
                  style={rise(5)}
                >
                  business + health · last 3 full months
                </Kpi>
                <Kpi
                  label="Runway"
                  value={d.runway === "—" ? "—" : <>{d.runway} <span className="text-base font-medium text-fd-muted-foreground">mo</span></>}
                  tone={k.runwayMonths === null ? undefined : k.runwayMonths < 3 ? "down" : k.runwayMonths < 6 ? "warn" : "up"}
                  tip="Free cash divided by monthly burn."
                  style={rise(6)}
                >
                  {k.runwayMonths === null ? "needs three months of expenses" : "free cash ÷ monthly burn"}
                </Kpi>
              </div>
            </div>

            <Card className="fd-rise gap-3 lg:col-span-5" style={rise(2)}>
              <CardHeader>
                <CardTitle>Needs a decision</CardTitle>
                <CardDescription>
                  {attention.length === 0 ? "Nothing waiting on you" : [counts.now ? `${counts.now} now` : null, counts.soon ? `${counts.soon} soon` : null, counts.note ? `${counts.note} to note` : null].filter(Boolean).join(" · ")}
                  {d.snoozedCount > 0 ? (
                    <>
                      {attention.length ? " · " : ""}
                      <button type="button" onClick={d.unsnoozeAll} className="underline underline-offset-2 hover:text-foreground" title="Show snoozed items again">
                        {d.snoozedCount} snoozed
                      </button>
                    </>
                  ) : null}
                </CardDescription>
                <CardAction>
                  {counts.now > 0 ? (
                    <Badge className="border-transparent bg-fd-down/12 text-fd-down">{counts.now} now</Badge>
                  ) : counts.soon > 0 ? (
                    <Badge className="border-transparent bg-fd-warn/15 text-fd-warn">{counts.soon} soon</Badge>
                  ) : (
                    <Badge variant="secondary"><Check /> clear</Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-y-auto px-3 max-lg:max-h-[440px]">
                {attention.length === 0 ? (
                  <p className="px-3 py-6 text-sm text-fd-muted-foreground">Nothing needs a decision. Enjoy it.</p>
                ) : (
                  <ul className="flex flex-col">
                    {attention.map((it) => (
                      <li key={it.id} className="group relative">
                        <AttentionRow it={it} />
                        {it.severity !== "critical" ? (
                          <button
                            type="button"
                            onClick={() => d.snooze(it.id)}
                            title="Snooze for a week"
                            aria-label={`Snooze “${it.title}” for a week`}
                            className="absolute top-2 right-1.5 flex size-6 items-center justify-center rounded-md text-fd-muted-foreground/60 opacity-0 transition-opacity hover:bg-fd-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            <X className="size-3.5" aria-hidden />
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ---------- cash flow + categories ---------- */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card className="fd-rise lg:col-span-7" style={rise(7)}>
              <CardHeader>
                <CardTitle>Cash flow</CardTitle>
                <CardDescription>{PERIOD_LABEL[d.period]} · invoices received vs business money out</CardDescription>
                <CardAction className="flex flex-wrap items-center justify-end gap-2">
                  <Tabs value={d.period} onValueChange={(v) => d.setPeriod(v as CashflowPeriod)}>
                    <TabsList aria-label="Cash flow period">
                      <TabsTrigger value="6m">6M</TabsTrigger>
                      <TabsTrigger value="12m">12M</TabsTrigger>
                      <TabsTrigger value="ytd">YTD</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Tabs value={view} onValueChange={(v) => setView(v as "chart" | "table")}>
                    <TabsList aria-label="Cash flow view">
                      <TabsTrigger value="chart">Chart</TabsTrigger>
                      <TabsTrigger value="table">Table</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-fd-muted/60 p-4 sm:grid-cols-4">
                  <Mini label="Money in" value={d.flowSummary.income} tone="up" />
                  <Mini label="Business out" value={d.flowSummary.expenses} tone="down" />
                  <Mini label="Net" value={d.flowSummary.net} tone={d.flowSummary.net < 0 ? "down" : undefined} signed />
                  <Mini label="Avg per month" value={d.flowSummary.avg} tone={d.flowSummary.avg < 0 ? "down" : undefined} signed />
                </div>
                <CashflowChart months={d.flow} view={view} controls={false} />
              </CardContent>
            </Card>

            <Card className="fd-rise gap-4 lg:col-span-5" style={rise(8)}>
              <CardHeader>
                <CardTitle>Where the money goes</CardTitle>
                <CardDescription>
                  Business expenses · {monthTitle(d.categories.from).replace(/ \d{4}$/, "")} to {monthTitle(d.categories.to)}
                </CardDescription>
                <CardAction>
                  <InfoTip text="Business expense rows in the books over the last three full months, by category. Same window as monthly burn." />
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <CategoryBars slices={d.categories.slices} total={d.categories.total} />
              </CardContent>
            </Card>
          </section>

          {/* ---------- upcoming + accounts ---------- */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card id="upcoming" className="fd-rise scroll-mt-6 gap-4 lg:col-span-7" style={rise(9)}>
              <CardHeader>
                <CardTitle>Next 90 days</CardTitle>
                <CardDescription>Finanzamt · invoices · renewals · money you expect</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-3 rounded-xl bg-fd-muted/60 p-4">
                  <Mini label="In · next 30 days" value={d.window30.income} tone="up" />
                  <Mini label="Out · next 30 days" value={d.window30.out} tone="down" />
                  <Mini label="Net" value={d.window30.net} tone={d.window30.net < 0 ? "down" : undefined} signed />
                </div>
                <FdUpcoming items={d.upcoming} cashNow={k.cash} onClose={(id, status) => d.closeExpected(id, status, d.today)} />
              </CardContent>
            </Card>
            <Card id="accounts" className="fd-rise scroll-mt-6 gap-4 lg:col-span-5" style={rise(10)}>
              <FdAccounts accounts={d.accounts} usdRate={d.usdRate} today={d.today} onChange={d.changeAccounts} balances={balances} />
            </Card>
          </section>

          <HowMade usdRate={d.usdRate} />
    </FinanceShell>
  );
}

/* ---------- balance update ritual ---------- */

type BalanceUpdate = {
  updating: boolean;
  drafts: Record<string, string>;
  start: () => void;
  cancel: () => void;
  setDraft: (id: string, value: string) => void;
  save: () => void;
};

/** "Update balances": every account becomes an input, Enter hops to the next, Save stamps them all as checked today. */
function useBalanceUpdate(accounts: Account[], onChange: (next: Account[]) => void, toast: (msg: string) => void): BalanceUpdate {
  const [drafts, setDrafts] = useState<Record<string, string> | null>(null);
  const start = useCallback(() => {
    setDrafts(Object.fromEntries(accounts.map((a) => [a.id, a.balance ? String(a.balance) : ""])));
    window.setTimeout(() => {
      document.getElementById("accounts")?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelector<HTMLInputElement>("[data-balance-input]")?.focus();
    }, 50);
  }, [accounts]);
  const cancel = useCallback(() => setDrafts(null), []);
  const setDraft = useCallback((id: string, value: string) => setDrafts((cur) => (cur ? { ...cur, [id]: value } : cur)), []);
  const save = useCallback(() => {
    if (!drafts) return;
    const now = new Date().toISOString();
    let changed = 0;
    const next = accounts.map((a) => {
      const raw = drafts[a.id];
      if (raw === undefined) return a;
      const v = Number(raw.replace(/\s/g, "").replace(",", "."));
      if (!Number.isFinite(v) || raw.trim() === "") return a;
      if (v !== a.balance) changed++;
      return { ...a, balance: v, updatedAt: now };
    });
    onChange(next);
    setDrafts(null);
    toast(changed === 0 ? "Balances confirmed for today" : `${changed} balance${changed === 1 ? "" : "s"} updated`);
  }, [accounts, drafts, onChange, toast]);
  return { updating: drafts !== null, drafts: drafts ?? {}, start, cancel, setDraft, save };
}

/** Ninety days of net worth as a hairline, plus the change over the last thirty. */
function NetWorthTrend({ history, today, change }: { history: Snapshot[]; today: string; change: { delta: number; pct: number | null; since: string } | null }) {
  const cutoff = new Date(Date.parse(today) - 90 * 86_400_000).toISOString().slice(0, 10);
  const points = history.filter((s) => s.date >= cutoff).map((s) => s.netWorth);
  if (points.length < 2) {
    return <span>{history.length === 0 ? "the trend starts with your first balances" : "trend builds as you update balances"}</span>;
  }
  const w = 200;
  const h = 40;
  const pad = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - 2 * pad));
  const ys = points.map((v) => pad + (1 - (v - min) / span) * (h - 2 * pad));
  const line = xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const area = `${line} L${xs[xs.length - 1].toFixed(1)},${h} L${xs[0].toFixed(1)},${h} Z`;
  return (
    <>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-10 w-full" role="img" aria-label="Net worth over the last ninety days">
        <path d={area} fill="var(--color-primary)" opacity={0.08} />
        <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {change ? (
        <span>
          <Amount value={change.delta} signed className={cn("font-medium", change.delta < 0 ? "text-fd-down" : "text-fd-up")} />
          {change.pct !== null ? <span className={change.delta < 0 ? "text-fd-down" : "text-fd-up"}> ({change.delta < 0 ? "" : "+"}{(change.pct * 100).toFixed(1)} %)</span> : null} · since {new Date(`${change.since}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}
        </span>
      ) : (
        <span>{points.length} snapshots · change shows after a month</span>
      )}
    </>
  );
}

function CategoryBars({ slices, total }: { slices: CategorySlice[]; total: number }) {
  if (slices.length === 0) {
    return <p className="text-sm text-fd-muted-foreground">No business expenses in the books for those months yet. Import an N26 export or add rows on Books.</p>;
  }
  return (
    <>
      <ul className="flex flex-col gap-3">
        {slices.map((s) => (
          <li key={s.key} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={cn("truncate", s.key === "other-rest" && "text-fd-muted-foreground")}>{s.label}</span>
              <span className="shrink-0 tabular-nums">
                <Amount value={s.amount} className="font-medium" /> <span className="text-xs text-fd-muted-foreground">{Math.round(s.share * 100)} %</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-fd-muted" role="presentation">
              <div className={cn("h-full rounded-full", s.key === "other-rest" ? "bg-fd-muted-foreground/40" : "bg-primary")} style={{ width: `${Math.max(1, s.share * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <Separator />
      <div className="flex items-baseline justify-between px-0.5 text-sm">
        <span className="text-fd-muted-foreground">Total over three months</span>
        <span className="tabular-nums">
          <Amount value={total} className="font-semibold" /> <span className="text-xs text-fd-muted-foreground">· <Amount value={total / 3} /> a month</span>
        </span>
      </div>
    </>
  );
}

const SEV_DOT: Record<Severity, string> = { critical: "bg-fd-down", warning: "bg-fd-warn", info: "bg-fd-muted-foreground/40" };
const SEV_LABEL: Record<Severity, string> = { critical: "Now", warning: "Soon", info: "Note" };
const SEV_TEXT: Record<Severity, string> = { critical: "text-fd-down", warning: "text-fd-warn", info: "text-fd-muted-foreground" };

function AttentionRow({ it }: { it: AttentionItem }) {
  const inner = (
    <>
      <span className={cn("mt-[7px] size-2 shrink-0 rounded-full", SEV_DOT[it.severity])} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-5">
          <span className={cn("mr-1.5 align-[1px] text-[10px] font-semibold uppercase tracking-wide", SEV_TEXT[it.severity])}>{SEV_LABEL[it.severity]}</span>
          {it.title}
        </span>
        {it.detail ? <span className="block text-xs leading-5 text-fd-muted-foreground">{it.detail}</span> : null}
      </span>
      {it.amount !== undefined ? <Amount value={it.amount} className={cn("shrink-0 text-sm font-semibold", it.amount < 0 ? "text-fd-down" : "text-fd-up")} /> : null}
      {it.href ? <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-fd-muted-foreground/50 transition-colors group-hover:text-foreground" aria-hidden /> : null}
    </>
  );
  const cls = cn("flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-fd-accent", it.severity !== "critical" && "pr-9");
  if (it.href?.startsWith("#")) return <a href={it.href} className={cls}>{inner}</a>;
  if (it.href) return <Link href={it.href} className={cls}>{inner}</Link>;
  return <div className={cls}>{inner}</div>;
}

/* ---------- upcoming ---------- */

function FdUpcoming({ items, cashNow, onClose }: { items: UpcomingItem[]; cashNow: number; onClose: (id: string, status: "received" | "rejected") => void }) {
  if (items.length === 0) return <p className="text-sm text-fd-muted-foreground">Nothing known for the next three months.</p>;
  const groups = new Map<string, UpcomingItem[]>();
  for (const it of items) groups.set(it.date.slice(0, 7), [...(groups.get(it.date.slice(0, 7)) ?? []), it]);
  const net = items.reduce((t, it) => t + it.amount, 0);
  return (
    <div className="flex flex-col gap-5">
      {[...groups.entries()].map(([month, rows]) => {
        const sub = rows.reduce((t, it) => t + it.amount, 0);
        return (
          <div key={month} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between px-1 text-[11px] font-semibold uppercase tracking-wide text-fd-muted-foreground">
              <span>{monthTitle(month)}</span>
              <Amount value={sub} signed className={sub < 0 ? "text-fd-down" : "text-fd-up"} />
            </div>
            <ul className="divide-y overflow-hidden rounded-xl border">
              {upcomingRows(month, rows).map((r) => (
                <li key={r.kind === "one" ? r.item.id : `plans-${r.month}`}>
                  {r.kind === "one" ? (
                    <FdItemRow
                      it={r.item}
                      actions={
                        r.item.expected && r.item.refId ? (
                          <span className="flex shrink-0 items-center gap-0.5">
                            <Button type="button" variant="ghost" size="icon-sm" title="It landed — mark received" aria-label="Mark received" onClick={() => onClose(r.item.refId!, "received")} className="text-fd-muted-foreground/70 hover:text-fd-up">
                              <Check />
                            </Button>
                            <Button type="button" variant="ghost" size="icon-sm" title="Refused or written off" aria-label="Mark refused" onClick={() => onClose(r.item.refId!, "rejected")} className="text-fd-muted-foreground/70 hover:text-fd-down">
                              <X />
                            </Button>
                          </span>
                        ) : undefined
                      }
                    />
                  ) : (
                    <FdPlansRow items={r.items} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <Separator />
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-fd-muted-foreground">Cash after all of it, if the invoices land</span>
          <Amount value={cashNow + net} className={cn("font-semibold", cashNow + net < 0 && "text-fd-down")} />
        </div>
        <p className="text-xs text-fd-muted-foreground/70">
          Net over the period: <Amount value={net} signed />
        </p>
      </div>
    </div>
  );
}

const ROW = "flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-fd-accent";

function FdItemRow({ it, actions }: { it: UpcomingItem; actions?: ReactNode }) {
  const inner = (
    <>
      <span className="w-14 shrink-0 text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">{dayLabel(it.date)}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm">{it.label}</span>
          {it.expected ? (
            <Badge className={cn("border-transparent", it.overdue ? "bg-fd-warn/15 text-fd-warn" : "bg-fd-muted text-fd-muted-foreground")}>{it.overdue ? "late" : "expected"}</Badge>
          ) : it.overdue ? (
            <Badge className="border-transparent bg-fd-down/12 text-fd-down">overdue</Badge>
          ) : null}
          {it.personal ? <Badge variant="outline" className="text-fd-muted-foreground">personal</Badge> : null}
        </span>
        {it.detail ? <span className="block truncate text-xs text-fd-muted-foreground">{it.detail}</span> : null}
      </span>
      <Amount value={it.amount} signed className={cn("shrink-0 text-sm font-medium", it.amount < 0 ? "text-fd-down" : "text-fd-up")} />
      {actions}
    </>
  );
  return it.href ? <Link href={it.href} className={ROW}>{inner}</Link> : <div className={ROW}>{inner}</div>;
}

/* ---------- expecting money ---------- */

function ExpectingMoney({ today, onAdd, onToast }: { today: string; onAdd: (e: Expected) => void; onToast: (msg: string) => void }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ExpectedKind>("claim");
  const [filedAt, setFiledAt] = useState(today);
  const [expectedBy, setExpectedBy] = useState(() => defaultExpectedBy(today, "claim"));
  const [touched, setTouched] = useState(false);

  function changeKind(k: ExpectedKind) {
    setKind(k);
    if (!touched) setExpectedBy(defaultExpectedBy(filedAt, k));
  }
  function changeFiled(v: string) {
    setFiledAt(v);
    if (!touched && v) setExpectedBy(defaultExpectedBy(v, kind));
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amount = Number(String(f.get("amount")).replace(/\s/g, "").replace(",", "."));
    const label = String(f.get("label")).trim();
    const from = String(f.get("from")).trim();
    if (!label || !from || !Number.isFinite(amount) || amount <= 0) return;
    const currency = String(f.get("currency")) as "EUR" | "USD";
    onAdd({
      id: newExpectedId(),
      kind,
      label,
      from,
      amount,
      currency,
      filedAt: filedAt || today,
      expectedBy: expectedBy || defaultExpectedBy(filedAt || today, kind),
      reference: String(f.get("reference")).trim() || undefined,
      note: String(f.get("note")).trim() || undefined,
      status: "open",
    });
    onToast(`Expecting ${currency === "USD" ? "$" : "€"}${amount.toLocaleString("en", { minimumFractionDigits: 2 })} from ${from}`);
    setOpen(false);
    setKind("claim");
    setFiledAt(today);
    setExpectedBy(defaultExpectedBy(today, "claim"));
    setTouched(false);
  }

  const lbl = "flex-col items-start gap-1.5 text-xs text-fd-muted-foreground";
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm"><HandCoins /> Expecting money</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,420px)]">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="text-sm leading-5">
            <span className="font-medium">Money on its way that isn&apos;t an invoice.</span>{" "}
            <span className="text-fd-muted-foreground">A claim, a refund, a deposit, a tax refund. It counts as owed to you until you mark it received.</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Label className={lbl}>
              Kind
              <NativeSelect value={kind} onChange={(e) => changeKind(e.target.value as ExpectedKind)} className="h-8 w-full text-sm">
                {EXPECTED_KINDS.map((k) => (
                  <NativeSelectOption key={k} value={k}>{EXPECTED_KIND_LABELS[k]}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Label>
            <Label className={lbl}>
              From
              <Input name="from" required autoFocus placeholder="Allianz Travel" className="h-8 text-sm" />
            </Label>
          </div>
          <Label className={lbl}>
            What
            <Input name="label" required placeholder="Emergency dentist, Lisbon" className="h-8 text-sm" />
          </Label>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Label className={lbl}>
              Amount
              <Input name="amount" type="text" inputMode="decimal" required placeholder="1815.00" className="h-8 text-sm" />
            </Label>
            <Label className={lbl}>
              Currency
              <NativeSelect name="currency" defaultValue="EUR" className="h-8 text-sm">
                <NativeSelectOption value="EUR">EUR</NativeSelectOption>
                <NativeSelectOption value="USD">USD</NativeSelectOption>
              </NativeSelect>
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Label className={lbl}>
              Filed on
              <Input type="date" value={filedAt} max={today} onChange={(e) => changeFiled(e.target.value)} className="h-8 text-sm" />
            </Label>
            <Label className={lbl}>
              Expected by
              <Input
                type="date"
                value={expectedBy}
                onChange={(e) => {
                  setTouched(true);
                  setExpectedBy(e.target.value);
                }}
                className="h-8 text-sm"
              />
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Label className={lbl}>
              Reference
              <Input name="reference" placeholder="Claim no." className="h-8 text-sm" />
            </Label>
            <Label className={lbl}>
              Note
              <Input name="note" placeholder="optional" className="h-8 text-sm" />
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm"><HandCoins /> Track it</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function FdPlansRow({ items }: { items: UpcomingItem[] }) {
  const [open, setOpen] = useState(false);
  const total = items.reduce((t, it) => t + it.amount, 0);
  const personal = items.filter((it) => it.personal).length;
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button type="button" className={cn(ROW, "w-full text-left")}>
          <span className="w-14 shrink-0 text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">
            {dayLabel(items[0].date).slice(4)}–{dayLabel(items[items.length - 1].date).slice(4)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">
              {items.length} monthly plans{personal > 0 ? <span className="text-fd-muted-foreground"> · {personal} personal</span> : null}
            </span>
            <span className="block truncate text-xs text-fd-muted-foreground">{items.map((it) => it.label).join(", ")}</span>
          </span>
          <Amount value={total} signed className="shrink-0 text-sm font-medium text-fd-down" />
          <ChevronDown className={cn("size-4 shrink-0 text-fd-muted-foreground/60 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="divide-y border-t bg-fd-muted/40">
          {items.map((it) => (
            <li key={it.id}>
              <FdItemRow it={it} />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ---------- accounts ---------- */

function agoDays(iso: string, today: string): string {
  if (!iso) return "never entered";
  const days = Math.round((Date.parse(today) - Date.parse(iso.slice(0, 10))) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const m = Math.round(days / 30);
  return `${m} month${m === 1 ? "" : "s"} ago`;
}

function FdAccounts({
  accounts,
  usdRate,
  today,
  onChange,
  balances,
}: {
  accounts: Account[];
  usdRate: number;
  today: string;
  onChange: (next: Account[]) => void;
  balances: BalanceUpdate;
}) {
  const { hidden } = usePrivacy();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  function startEdit(a: Account) {
    setEditing(a.id);
    setDraft(a.balance ? String(a.balance) : "");
  }
  function commit(a: Account) {
    const v = Number(draft.replace(/\s/g, "").replace(",", "."));
    if (Number.isFinite(v) && draft.trim() !== "") onChange(accounts.map((x) => (x.id === a.id ? { ...x, balance: v, updatedAt: new Date().toISOString() } : x)));
    setEditing(null);
  }
  function remove(a: Account) {
    if (window.confirm(`Remove ${a.name}? The balance history isn't kept.`)) onChange(accounts.filter((x) => x.id !== a.id));
  }
  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim();
    if (!name) return;
    onChange([...accounts, { id: newAccountId(name), name, kind: String(f.get("kind")) as AccountKind, currency: String(f.get("currency")) as "EUR" | "USD", balance: 0, updatedAt: "" }]);
    setAdding(false);
  }
  // Enter hops to the next balance field; on the last one it saves.
  function hop(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") return balances.cancel();
    if (e.key !== "Enter") return;
    e.preventDefault();
    const inputs = [...document.querySelectorAll<HTMLInputElement>("[data-balance-input]")];
    const next = inputs[inputs.indexOf(e.currentTarget) + 1];
    if (next) next.focus();
    else balances.save();
  }

  const assets = accounts.filter((a) => isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const debts = accounts.filter((a) => !isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const kinds = KIND_ORDER.filter((k) => accounts.some((a) => a.kind === k));
  const stale = (a: Account) => !a.updatedAt || (Date.parse(today) - Date.parse(a.updatedAt.slice(0, 10))) / 86_400_000 > 30;
  const staleCount = accounts.filter(stale).length;

  return (
    <>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>
          {balances.updating ? "Type today's figures · Enter hops to the next · Esc cancels" : staleCount > 0 ? `${staleCount} balance${staleCount === 1 ? "" : "s"} older than a month` : "Balances typed in by hand · click one to update it"}
        </CardDescription>
        <CardAction className="flex items-center gap-1.5">
          {balances.updating ? (
            <>
              <Button variant="ghost" size="sm" onClick={balances.cancel}>Cancel</Button>
              <Button size="sm" onClick={balances.save}><Check /> Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={balances.start} title="Update every balance in one go">
                <PenLine /> Update
              </Button>
              <Popover open={adding} onOpenChange={setAdding}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon-sm" aria-label="Add account" title="Add account">
                    <Plus />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                  <form onSubmit={add} className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5 text-xs font-medium">
                      Name
                      <Input name="name" required autoFocus placeholder="ING · Savings" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1.5 text-xs font-medium">
                        Kind
                        <NativeSelect name="kind" defaultValue="cash" className="w-full">
                          {KIND_ORDER.map((k) => (
                            <NativeSelectOption key={k} value={k}>{KIND_LABELS[k]}</NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </label>
                      <label className="flex flex-col gap-1.5 text-xs font-medium">
                        Currency
                        <NativeSelect name="currency" defaultValue="EUR" className="w-full">
                          <NativeSelectOption value="EUR">EUR</NativeSelectOption>
                          <NativeSelectOption value="USD">USD</NativeSelectOption>
                        </NativeSelect>
                      </label>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
                      <Button type="submit" size="sm">Add account</Button>
                    </div>
                  </form>
                </PopoverContent>
              </Popover>
            </>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {kinds.map((kind) => (
            <div key={kind} className="flex flex-col gap-1">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-fd-muted-foreground">{KIND_LABELS[kind]}</p>
              <ul className="divide-y overflow-hidden rounded-xl border">
                {accounts
                  .filter((a) => a.kind === kind)
                  .map((a) => (
                    <li key={a.id} className={cn("group flex items-center gap-3 px-3 py-2.5", balances.updating && "bg-fd-muted/30")}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{a.name}</span>
                        <span className={cn("block text-xs", stale(a) && !balances.updating ? "text-fd-warn" : "text-fd-muted-foreground")}>
                          {a.currency === "USD" && !hidden && a.balance ? `€${inEur(a, usdRate).toLocaleString("en", { maximumFractionDigits: 0 })} · ` : ""}
                          {balances.updating ? a.currency : `updated ${agoDays(a.updatedAt, today)}`}
                        </span>
                      </span>
                      {balances.updating ? (
                        <Input
                          data-balance-input
                          type="text"
                          inputMode="decimal"
                          value={balances.drafts[a.id] ?? ""}
                          onChange={(e) => balances.setDraft(a.id, e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          onKeyDown={hop}
                          placeholder="0.00"
                          aria-label={`${a.name} balance`}
                          className="h-8 w-[130px] bg-fd-card text-right tabular-nums"
                        />
                      ) : editing === a.id ? (
                        <Input
                          autoFocus
                          type="text"
                          inputMode="decimal"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onFocus={(e) => e.currentTarget.select()}
                          onBlur={() => commit(a)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commit(a);
                            if (e.key === "Escape") setEditing(null);
                          }}
                          placeholder="0.00"
                          aria-label={`${a.name} balance`}
                          className="h-8 w-[130px] text-right tabular-nums"
                        />
                      ) : (
                        <button type="button" onClick={() => startEdit(a)} title="Enter today's balance" className="rounded-md px-2 py-1 text-right transition-colors hover:bg-fd-accent">
                          <Amount value={a.kind === "debt" ? -a.balance : a.balance} decimals={2} currency={a.currency} className={cn("text-sm font-semibold", a.kind === "debt" && "text-fd-down")} />
                        </button>
                      )}
                      {!balances.updating ? (
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(a)} title="Remove account" className="text-fd-muted-foreground/60 opacity-0 hover:text-fd-down group-hover:opacity-100 focus-visible:opacity-100">
                          <Trash2 />
                        </Button>
                      ) : null}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex items-baseline justify-between gap-3 px-1 text-sm">
          <span className="text-fd-muted-foreground">
            Net worth
            <span className="text-fd-muted-foreground/70"> · assets {hidden ? "€••••" : `€${Math.round(assets).toLocaleString("en")}`}{debts > 0 ? `, debts ${hidden ? "€••••" : `€${Math.round(debts).toLocaleString("en")}`}` : ""}</span>
          </span>
          <Amount value={assets - debts} className="text-base font-semibold" />
        </div>
      </CardContent>
    </>
  );
}

function HowMade({ usdRate }: { usdRate: number }) {
  return (
    <Collapsible className="fd-rise pb-10 text-sm text-fd-muted-foreground" style={rise(11)}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="text-fd-muted-foreground [&[data-state=open]>svg]:rotate-180">
          How these numbers are made <ChevronDown className="transition-transform" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-2 flex max-w-[640px] flex-col gap-1.5 px-3 text-xs leading-5">
          <li><span className="font-medium text-foreground">Free to spend</span> = every asset balance in EUR (USD at {usdRate}) − tax owed. Debts are in net worth only.</li>
          <li><span className="font-medium text-foreground">Net worth trend</span> = one snapshot a day whenever the page opens with balances or a balance changes. It rides along in the sync.</li>
          <li><span className="font-medium text-foreground">Tax owed</span> = Vorauszahlungen still unpaid this year + the projected year-end bill on top of them + VAT collected and not yet paid. Same maths as the estimate on /books.</li>
          <li><span className="font-medium text-foreground">Owed to you</span> = invoices in the ledger with a due date and no paid date, plus money you told the page to expect (claims, refunds, deposits) until you mark it received. Incoming bank rows never reach the books, so closing those is by hand.</li>
          <li><span className="font-medium text-foreground">Monthly burn</span> and <span className="font-medium text-foreground">Where the money goes</span> = business expenses (+ health/KSK/pension for burn) over the last three full months in the books.</li>
          <li><span className="font-medium text-foreground">Cash flow</span> = invoices by the month the money landed (VAT stripped) vs business expenses by the month they were paid.</li>
          <li><span className="font-medium text-foreground">Next 90 days</span> = instalments from the Vorauszahlungsbescheid, invoice due dates, and renewals stepped from each plan&apos;s last charge. Monthly plans roll up per month; personal ones are tagged.</li>
          <li>Snoozing a note hides it for a week on every synced device. Balances stay in this browser and ride along in the encrypted sync. The eye icon (or <kbd className="rounded border px-1 text-[10px]">H</kbd>) hides every amount on this device.</li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
