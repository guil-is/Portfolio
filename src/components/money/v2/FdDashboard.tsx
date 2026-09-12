"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Cloud,
  CloudOff,
  Eye,
  EyeOff,
  Info,
  LayoutDashboard,
  Plus,
  Receipt,
  RefreshCw,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { KIND_LABELS, KIND_ORDER, inEur, isAsset, newAccountId, type Account, type AccountKind } from "@/lib/money/accounts";
import type { AttentionItem, Severity, UpcomingItem } from "@/lib/money/overview";
import { useSync } from "../../SyncBar";
import { CashflowChart } from "../CashflowChart";
import { Amount, PrivacyProvider, usePrivacy } from "../Privacy";
import { day, monthTitle, rowsFor } from "../UpcomingList";
import { useDashboard, type DashboardProps } from "../useDashboard";

/**
 * /money/v2 — the Financial Dashboard on shadcn/ui: sidebar, white cards
 * on a grey page, one blue accent, Geist. Same hook, same numbers as
 * /money; only the layout differs.
 */

export function FdDashboard(props: DashboardProps) {
  return (
    <PrivacyProvider>
      <Shell {...props} />
    </PrivacyProvider>
  );
}

const rise = (i: number) => ({ "--i": i } as CSSProperties);

function Shell(props: DashboardProps) {
  const d = useDashboard(props);
  const { k, attention, counts } = d;
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <div className="fd min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1280px] gap-8 px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        {/* ---------- sidebar (desktop) ---------- */}
        <aside className="fd-rise sticky top-8 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col pb-16 lg:flex" style={rise(0)}>
          <Link href="/money/v2" className="flex items-center gap-2.5 px-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">G</span>
            <span className="text-sm font-semibold leading-tight">Financial<br />Dashboard</span>
          </Link>
          <nav className="mt-8 flex flex-col gap-1" aria-label="Finance pages">
            <NavItem href="/money/v2" icon={LayoutDashboard} active>Overview</NavItem>
            <NavItem href="/books" icon={BookOpen}>Books</NavItem>
            <NavItem href="/for/expenses" icon={Receipt}>Expenses</NavItem>
            <NavItem href="/for/clients" icon={Users}>Clients</NavItem>
          </nav>
          <div className="mt-auto flex flex-col gap-1">
            <SyncControl variant="row" onToast={d.setToast} onRestored={d.reloadSoon} />
            <PrivacyControl variant="row" />
            <p className="px-2.5 pt-3 text-[11px] leading-4 text-fd-muted-foreground">
              Layout v2 · <Link href="/money" className="underline underline-offset-2 hover:text-foreground">compare with v1</Link>
            </p>
          </div>
        </aside>

        {/* ---------- content ---------- */}
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="fd-rise flex flex-wrap items-center justify-between gap-3" style={rise(0)}>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl font-semibold tracking-tight lg:text-[28px]">
                <span className="lg:hidden">Financial Dashboard</span>
                <span className="hidden lg:inline">Overview</span>
              </h1>
              <p className="text-sm text-fd-muted-foreground">{d.dateLine}</p>
            </div>
            <div className="flex items-center gap-1.5 lg:hidden">
              <PrivacyControl variant="icon" />
              <SyncControl variant="icon" onToast={d.setToast} onRestored={d.reloadSoon} />
            </div>
          </header>
          <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 lg:hidden" aria-label="Finance pages">
            {[
              ["/books", "Books"],
              ["/for/expenses", "Expenses"],
              ["/for/clients", "Clients"],
              ["/money", "Layout v1"],
            ].map(([href, label]) => (
              <Button key={href} asChild variant="outline" size="sm" className="rounded-full">
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </nav>
          {!props.ledgerLoaded ? (
            <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-fd-muted-foreground">
              Invoice data loads after the gate — reload the page if income and open invoices show as zero.
            </p>
          ) : null}

          {/* hero + KPIs left, attention right */}
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
                        Type today&apos;s balances into{" "}
                        <a href="#accounts" className="font-medium text-primary underline-offset-4 hover:underline">Accounts</a> to start. The Finanzamt still gets{" "}
                        <Amount value={k.taxOwed} className="font-medium text-foreground" /> this year, so free cash is what&apos;s left after that.
                      </>
                    ) : (
                      <>
                        <Amount value={k.cash} className="font-medium text-foreground" /> across {d.assetCount} account{d.assetCount === 1 ? "" : "s"}, minus{" "}
                        <Amount value={k.taxOwed} className="font-medium text-foreground" /> the Finanzamt still gets this year
                        {k.owedToYou > 0 ? (
                          <>
                            . Another <Amount value={k.owedToYou} className="font-medium text-foreground" /> is invoiced and not in yet
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
                <Kpi
                  label="Tax set-aside"
                  value={<Amount value={k.taxReserve} />}
                  tip="Balances in accounts marked as tax set-aside, against what's still owed this year."
                  style={rise(3)}
                >
                  <Progress value={Math.min(100, d.coverage * 100)} className="bg-fd-muted" indicatorClassName={d.coverage >= 1 ? "bg-fd-up" : d.coverage >= 0.5 ? "bg-fd-warn" : "bg-fd-down"} aria-label="Tax set-aside coverage" />
                  <span>{k.taxOwed <= 0 ? "nothing left for this year" : <>covers {Math.min(999, Math.round(d.coverage * 100))} % of <Amount value={k.taxOwed} /> owed</>}</span>
                </Kpi>
                <Kpi
                  label="Monthly burn"
                  value={<Amount value={k.burn} />}
                  tip="Business expenses plus health, KSK and pension rows, averaged over the last three full months in the books."
                  style={rise(4)}
                >
                  business + health · last 3 full months
                </Kpi>
                <Kpi
                  label="Runway"
                  value={d.runway === "—" ? "—" : <>{d.runway} <span className="text-base font-medium text-fd-muted-foreground">mo</span></>}
                  tone={k.runwayMonths === null ? undefined : k.runwayMonths < 3 ? "down" : k.runwayMonths < 6 ? "warn" : "up"}
                  tip="Free cash divided by monthly burn."
                  style={rise(5)}
                >
                  {k.runwayMonths === null ? "needs three months of expenses" : "free cash ÷ monthly burn"}
                </Kpi>
                <Kpi label="Net worth" value={<Amount value={k.netWorth} />} tip="Every asset minus every debt, in EUR." style={rise(6)}>
                  {d.accounts.length} account{d.accounts.length === 1 ? "" : "s"} · assets − debts
                </Kpi>
              </div>
            </div>

            <Card className="fd-rise gap-3 lg:col-span-5" style={rise(2)}>
              <CardHeader>
                <CardTitle>Needs a decision</CardTitle>
                <CardDescription>
                  {attention.length === 0 ? "Nothing waiting on you" : [counts.now ? `${counts.now} now` : null, counts.soon ? `${counts.soon} soon` : null, counts.note ? `${counts.note} to note` : null].filter(Boolean).join(" · ")}
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
                      <li key={it.id}>
                        <AttentionRow it={it} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          {/* cash flow */}
          <Card className="fd-rise" style={rise(7)}>
            <CardHeader>
              <CardTitle>Cash flow</CardTitle>
              <CardDescription>Last 12 months · invoices received vs business money out</CardDescription>
              <CardAction>
                <Tabs value={view} onValueChange={(v) => setView(v as "chart" | "table")}>
                  <TabsList aria-label="Cash flow view">
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="table">Table</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardAction>
            </CardHeader>
            <CardContent>
              <CashflowChart months={d.flow} view={view} controls={false} />
            </CardContent>
          </Card>

          {/* upcoming + accounts */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Card className="fd-rise gap-4 lg:col-span-7" style={rise(8)}>
              <CardHeader>
                <CardTitle>Next 90 days</CardTitle>
                <CardDescription>Finanzamt · invoices · renewals</CardDescription>
              </CardHeader>
              <CardContent>
                <FdUpcoming items={d.upcoming} cashNow={k.cash} />
              </CardContent>
            </Card>
            <Card id="accounts" className="fd-rise scroll-mt-6 gap-4 lg:col-span-5" style={rise(9)}>
              <FdAccounts accounts={d.accounts} usdRate={d.usdRate} today={d.today} onChange={d.changeAccounts} />
            </Card>
          </section>

          <HowMade usdRate={d.usdRate} />
        </main>
      </div>

      {d.toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
          <div className="fd-portal rounded-xl border bg-popover px-4 py-2.5 text-sm text-popover-foreground shadow-fd">{d.toast}</div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- small pieces ---------- */

function NavItem({ href, icon: Icon, active, children }: { href: string; icon: LucideIcon; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
        active ? "bg-fd-card text-foreground shadow-fd" : "text-fd-muted-foreground hover:bg-fd-accent hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </Link>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="How this is computed" className="rounded-full text-fd-muted-foreground/70 transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
          <Info className="size-4" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left">{text}</TooltipContent>
    </Tooltip>
  );
}

function Mini({ label, value, tone }: { label: string; value: number; tone?: "up" | "down" }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">{label}</span>
      <Amount value={value} className={cn("truncate text-base font-semibold", tone === "up" && "text-fd-up", tone === "down" && "text-fd-down")} />
    </div>
  );
}

const TONE: Record<"up" | "down" | "warn", string> = { up: "text-fd-up", down: "text-fd-down", warn: "text-fd-warn" };

function Kpi({ label, value, tip, tone, children, style }: { label: string; value: ReactNode; tip?: string; tone?: "up" | "down" | "warn"; children: ReactNode; style?: CSSProperties }) {
  return (
    <Card className="fd-rise gap-3 py-5" style={style}>
      <CardHeader className="px-5">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={cn("pt-0.5 text-2xl font-semibold tracking-tight tabular-nums", tone && TONE[tone])}>{value}</CardTitle>
        {tip ? (
          <CardAction>
            <InfoTip text={tip} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-5 text-xs leading-5 text-fd-muted-foreground">{children}</CardContent>
    </Card>
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
  const cls = "group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-fd-accent";
  if (it.href?.startsWith("#")) return <a href={it.href} className={cls}>{inner}</a>;
  if (it.href) return <Link href={it.href} className={cls}>{inner}</Link>;
  return <div className={cls}>{inner}</div>;
}

/* ---------- upcoming ---------- */

function FdUpcoming({ items, cashNow }: { items: UpcomingItem[]; cashNow: number }) {
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
              {rowsFor(month, rows).map((r) => (
                <li key={r.kind === "one" ? r.item.id : `plans-${r.month}`}>{r.kind === "one" ? <FdItemRow it={r.item} /> : <FdPlansRow items={r.items} />}</li>
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

function FdItemRow({ it }: { it: UpcomingItem }) {
  const inner = (
    <>
      <span className="w-14 shrink-0 text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">{day(it.date)}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm">{it.label}</span>
          {it.overdue ? <Badge className="border-transparent bg-fd-down/12 text-fd-down">overdue</Badge> : null}
          {it.personal ? <Badge variant="outline" className="text-fd-muted-foreground">personal</Badge> : null}
        </span>
        {it.detail ? <span className="block truncate text-xs text-fd-muted-foreground">{it.detail}</span> : null}
      </span>
      <Amount value={it.amount} signed className={cn("shrink-0 text-sm font-medium", it.amount < 0 ? "text-fd-down" : "text-fd-up")} />
    </>
  );
  return it.href ? <Link href={it.href} className={ROW}>{inner}</Link> : <div className={ROW}>{inner}</div>;
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
            {day(items[0].date).slice(4)}–{day(items[items.length - 1].date).slice(4)}
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

function FdAccounts({ accounts, usdRate, today, onChange }: { accounts: Account[]; usdRate: number; today: string; onChange: (next: Account[]) => void }) {
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
    if (Number.isFinite(v)) onChange(accounts.map((x) => (x.id === a.id ? { ...x, balance: v, updatedAt: new Date().toISOString() } : x)));
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

  const assets = accounts.filter((a) => isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const debts = accounts.filter((a) => !isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const kinds = KIND_ORDER.filter((k) => accounts.some((a) => a.kind === k));
  const stale = (a: Account) => !a.updatedAt || (Date.parse(today) - Date.parse(a.updatedAt.slice(0, 10))) / 86_400_000 > 30;

  return (
    <>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Balances typed in by hand · click one to update it</CardDescription>
        <CardAction>
          <Popover open={adding} onOpenChange={setAdding}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus /> Add
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
                    <li key={a.id} className="group flex items-center gap-3 px-3 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{a.name}</span>
                        <span className={cn("block text-xs", stale(a) ? "text-fd-warn" : "text-fd-muted-foreground")}>
                          {a.currency === "USD" && !hidden && a.balance ? `€${inEur(a, usdRate).toLocaleString("en", { maximumFractionDigits: 0 })} · ` : ""}
                          updated {agoDays(a.updatedAt, today)}
                        </span>
                      </span>
                      {editing === a.id ? (
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
                          className="h-8 w-[120px] text-right tabular-nums"
                        />
                      ) : (
                        <button type="button" onClick={() => startEdit(a)} title="Enter today's balance" className="rounded-md px-2 py-1 text-right transition-colors hover:bg-fd-accent">
                          <Amount value={a.kind === "debt" ? -a.balance : a.balance} decimals={2} currency={a.currency} className={cn("text-sm font-semibold", a.kind === "debt" && "text-fd-down")} />
                        </button>
                      )}
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(a)} title="Remove account" className="text-fd-muted-foreground/60 opacity-0 hover:text-fd-down group-hover:opacity-100 focus-visible:opacity-100">
                        <Trash2 />
                      </Button>
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

/* ---------- controls ---------- */

function agoNow(iso: string | undefined): string {
  if (!iso) return "never";
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

function PrivacyControl({ variant }: { variant: "icon" | "row" }) {
  const { hidden, toggle } = usePrivacy();
  if (variant === "icon") {
    return (
      <Button variant={hidden ? "default" : "outline"} size="icon" onClick={toggle} aria-pressed={hidden} title={hidden ? "Show amounts (H)" : "Hide amounts (H)"}>
        {hidden ? <EyeOff /> : <Eye />}
      </Button>
    );
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={hidden}
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-foreground"
    >
      {hidden ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      <span className="flex-1 text-left">{hidden ? "Show amounts" : "Hide amounts"}</span>
      <kbd className="rounded border px-1.5 text-[10px] text-fd-muted-foreground">H</kbd>
    </button>
  );
}

function SyncControl({ variant, onToast, onRestored }: { variant: "icon" | "row"; onToast: (msg: string) => void; onRestored: () => void }) {
  const { state, status, run, enable, disable } = useSync();
  const [open, setOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [, bump] = useState(0);

  useEffect(() => {
    if (!open) return;
    const t = window.setInterval(() => bump((n) => n + 1), 30_000);
    return () => window.clearInterval(t);
  }, [open]);

  // A pull merged another device's edits into localStorage — reload so the page shows them.
  useEffect(() => {
    if (status.kind === "idle" && status.pulled) onRestored();
  }, [status, onRestored]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = await enable(pass);
    setBusy(false);
    if (ok) {
      setPass("");
      setOpen(false);
      onToast("Sync is on — the books follow this passphrase to every device");
      onRestored();
    }
  }

  const off = !state;
  const syncing = status.kind === "syncing";
  const errored = status.kind === "error";
  const label = off ? "Sync is off" : syncing ? "Syncing…" : errored ? status.message : `Synced ${agoNow(status.kind === "idle" ? status.lastSyncAt : state.lastSyncAt)}`;
  const icon = syncing ? <RefreshCw className="size-4 animate-spin" aria-hidden /> : off || errored ? <CloudOff className="size-4 text-fd-warn" aria-hidden /> : <Cloud className="size-4 text-fd-up" aria-hidden />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "icon" ? (
          <Button variant="outline" size="icon" aria-label={`Sync: ${label}`} title={label}>
            {icon}
          </Button>
        ) : (
          <button type="button" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-foreground">
            {icon}
            <span className="flex-1 truncate text-left">{label}</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align={variant === "icon" ? "end" : "start"} side={variant === "icon" ? "bottom" : "top"} className="w-[min(92vw,360px)] text-sm">
        {off ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <p className="leading-5">
              <span className="font-medium">Sync is off.</span>{" "}
              <span className="text-fd-muted-foreground">The books only live in this browser. Choose a passphrase and they&apos;ll follow it to every device, encrypted before they leave.</span>
            </p>
            <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passphrase — same one on each device" autoComplete="off" minLength={8} required autoFocus />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="sm" disabled={busy || pass.length < 8}>
                <Cloud /> {busy ? "Setting up…" : "Turn on sync"}
              </Button>
              {errored ? <span className={/configured|unavailable/i.test(status.message) ? "text-fd-muted-foreground" : "text-fd-down"}>{status.message}</span> : null}
            </div>
            <p className="text-xs leading-5 text-fd-muted-foreground">Nobody can recover the passphrase — not the site, not Sanity. Keep it in your password manager. If a vault already exists, the passphrase must open it.</p>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="leading-5">
              {syncing ? (
                "Syncing…"
              ) : errored ? (
                <>
                  <span className="font-medium">{status.message}.</span> <span className="text-fd-muted-foreground">Last synced {agoNow(status.lastSyncAt)}.</span>
                </>
              ) : (
                <>
                  <span className="font-medium">Synced {agoNow(status.kind === "idle" ? status.lastSyncAt : state.lastSyncAt)}.</span>{" "}
                  <span className="text-fd-muted-foreground">Encrypted with your passphrase · {state.device}</span>
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void run({ force: true })} disabled={syncing}>
                <RefreshCw /> Sync now
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm("Forget the passphrase on this device? The books stay here and in the vault; you'll enter the passphrase again to sync.")) disable();
                }}
              >
                Forget on this device
              </Button>
            </div>
            <p className="text-xs text-fd-muted-foreground">The backup file lives on the Books page.</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function HowMade({ usdRate }: { usdRate: number }) {
  return (
    <Collapsible className="fd-rise pb-10 text-sm text-fd-muted-foreground" style={rise(10)}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="text-fd-muted-foreground [&[data-state=open]>svg]:rotate-180">
          How these numbers are made <ChevronDown className="transition-transform" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-2 flex max-w-[640px] flex-col gap-1.5 px-3 text-xs leading-5">
          <li><span className="font-medium text-foreground">Free to spend</span> = every asset balance in EUR (USD at {usdRate}) − tax owed. Debts are in net worth only.</li>
          <li><span className="font-medium text-foreground">Tax owed</span> = Vorauszahlungen still unpaid this year + the projected year-end bill on top of them + VAT collected and not yet paid. Same maths as the estimate on /books.</li>
          <li><span className="font-medium text-foreground">Owed to you</span> = invoices in the ledger with a due date and no paid date.</li>
          <li><span className="font-medium text-foreground">Monthly burn</span> = business expenses + health/KSK/pension rows, averaged over the last three full months in the books.</li>
          <li><span className="font-medium text-foreground">Cash flow</span> = invoices by the month the money landed (VAT stripped) vs business expenses by the month they were paid.</li>
          <li><span className="font-medium text-foreground">Next 90 days</span> = instalments from the Vorauszahlungsbescheid, invoice due dates, and renewals stepped from each plan&apos;s last charge. Monthly plans roll up per month; personal ones are tagged.</li>
          <li>Balances stay in this browser and ride along in the encrypted sync. The eye icon (or <kbd className="rounded border px-1 text-[10px]">H</kbd>) hides every amount on this device.</li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
