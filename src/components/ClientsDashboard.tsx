"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clientRegistry, currentClients, pastClients, stageLabel, type ClientEntry } from "@/content/clients/registry";
import type { InvoiceRow, Receivable } from "@/lib/income";
import { loadBooksSettings } from "@/lib/expenses/books";
import { daysUntil } from "@/lib/expenses/subscriptions";
import { OWNER_FLAG_KEY } from "@/components/VisitTracker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Segmented, SegmentedItem } from "@/components/ui/segmented";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FinanceShell } from "./finance/FinanceShell";
import { Kpi, rise } from "./finance/Kpi";
import { Amount, PrivacyProvider, useMoney } from "./money/Privacy";

/**
 * Clients — every private client page in one place, what they still
 * owe, what each one has been billed this year, and the whole invoice
 * ledger with its status. Once unlocked, it writes each client page's
 * unlock flag into sessionStorage, so opening any of them from here
 * skips the per-page password (same tab only). It also marks this
 * browser as the owner's, so VisitTracker keeps Guil's own checks out
 * of the visit log.
 */

type Props = { receivables: Receivable[]; invoices: InvoiceRow[]; ledgerLoaded: boolean };

export function ClientsDashboard(props: Props) {
  return (
    <PrivacyProvider>
      <Clients {...props} />
    </PrivacyProvider>
  );
}

type InvoiceFilter = "open" | "year" | "all";

function Clients({ receivables, invoices, ledgerLoaded }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const reloadSoon = useCallback(() => window.setTimeout(() => window.location.reload(), 600), []);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const year = today.slice(0, 4);
  const [usdRate] = useState(() => loadBooksSettings().usdRate);
  const [filter, setFilter] = useState<InvoiceFilter>("open");
  const money = useMoney();

  useEffect(() => {
    for (const c of clientRegistry) window.sessionStorage.setItem(c.storageKey, "1");
    try {
      window.localStorage.setItem(OWNER_FLAG_KEY, "1");
    } catch {
      // Storage disabled — visits from this browser will just be logged.
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const current = currentClients();
  const past = pastClients();
  const toEur = (total: number, currency: "EUR" | "USD") => (currency === "USD" ? total * usdRate : total);
  const owed = receivables.reduce((t, r) => t + toEur(r.total, r.currency), 0);
  const overdue = receivables.filter((r) => r.dueAt < today);
  const overdueSum = overdue.reduce((t, r) => t + toEur(r.total, r.currency), 0);
  const thisYear = invoices.filter((i) => i.issuedAt.startsWith(year));
  const billedYear = thisYear.reduce((t, i) => t + toEur(i.total, i.currency), 0);
  // Per client: billed this year and open, keyed by registry slug.
  const perClient = useMemo(() => {
    const m = new Map<string, { billed: number; open: number; count: number }>();
    for (const i of invoices) {
      if (!i.clientSlug) continue;
      const cur = m.get(i.clientSlug) ?? { billed: 0, open: 0, count: 0 };
      if (i.issuedAt.startsWith(year)) {
        cur.billed += toEur(i.total, i.currency);
        cur.count++;
      }
      if (i.outstanding && i.dueAt) cur.open += toEur(i.total, i.currency);
      m.set(i.clientSlug, cur);
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, year, usdRate]);

  const listed = useMemo(() => {
    const rows = [...invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
    if (filter === "open") return rows.filter((i) => i.outstanding);
    if (filter === "year") return rows.filter((i) => i.issuedAt.startsWith(year));
    return rows;
  }, [invoices, filter, year]);

  return (
    <FinanceShell
      active="clients"
      title="Clients"
      subtitle={`${current.length} current · ${past.length} past · open any page from here without its password`}
      toast={toast}
      onToast={setToast}
      onRestored={reloadSoon}
    >
      {!ledgerLoaded ? (
        <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-fd-muted-foreground">Invoice data loads after the gate — reload the page if the invoices show as empty.</p>
      ) : null}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Owed to you" value={receivables.length === 0 ? <span className="text-fd-muted-foreground">—</span> : <Amount value={owed} />} tone={receivables.length > 0 ? "up" : undefined} style={rise(1)}>
          {receivables.length === 0 ? "no open invoices" : `${receivables.length} open invoice${receivables.length === 1 ? "" : "s"}${receivables.some((r) => r.currency === "USD") ? ` · USD at ${usdRate}` : ""}`}
        </Kpi>
        <Kpi label="Overdue" value={overdue.length === 0 ? <span className="text-fd-muted-foreground">€0</span> : <Amount value={overdueSum} />} tone={overdue.length > 0 ? "down" : undefined} style={rise(2)}>
          {overdue.length === 0 ? "everyone is on time" : `${overdue.length} invoice${overdue.length === 1 ? "" : "s"} · ${overdue.map((r) => r.client).join(", ")}`}
        </Kpi>
        <Kpi label={`Billed in ${year}`} value={<Amount value={billedYear} />} style={rise(3)}>
          {`${thisYear.length} invoice${thisYear.length === 1 ? "" : "s"} · gross, by issue date`}
        </Kpi>
        <Kpi label="Active clients" value={String(current.length)} style={rise(4)}>
          {`${current.filter((c) => c.stage === "active").length} in delivery · ${current.filter((c) => c.stage === "proposal" || c.stage === "accepted").length} in the pipeline`}
        </Kpi>
      </section>

      <ClientGroup label="Current" clients={current} index={5} perClient={perClient} year={year} />

      <Card className="fd-rise gap-3" style={rise(6)}>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Invoices</CardTitle>
            <CardDescription>From the ledger · newest first · click through to the client page</CardDescription>
          </div>
          <Segmented value={filter} onValueChange={(v) => setFilter(v as InvoiceFilter)} aria-label="Which invoices">
            <SegmentedItem value="open">Open · {invoices.filter((i) => i.outstanding).length}</SegmentedItem>
            <SegmentedItem value="year">{year} · {thisYear.length}</SegmentedItem>
            <SegmentedItem value="all">All · {invoices.length}</SegmentedItem>
          </Segmented>
        </CardHeader>
        <CardContent className="px-3">
          {listed.length === 0 ? (
            <p className="px-3 py-4 text-sm text-fd-muted-foreground">{filter === "open" ? "Nothing outstanding." : "No invoices here."}</p>
          ) : (
            <Table containerLabel="Invoices">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-3">Invoice</TableHead>
                  <TableHead className="px-3">Client</TableHead>
                  <TableHead className="px-3">Issued</TableHead>
                  <TableHead className="px-3">Status</TableHead>
                  <TableHead className="px-3 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listed.map((i) => {
                  const st = status(i, today);
                  return (
                    <TableRow key={`${i.number}-${i.issuedAt}`}>
                      <TableCell className="px-3 font-medium tabular-nums">{i.number}</TableCell>
                      <TableCell className="max-w-[240px] truncate px-3">
                        {i.clientSlug ? (
                          <Link href={`/for/${i.clientSlug}`} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                            {i.client} <ArrowUpRight className="size-3 text-fd-muted-foreground/60" aria-hidden />
                          </Link>
                        ) : (
                          i.client
                        )}
                      </TableCell>
                      <TableCell className="px-3 text-fd-muted-foreground">{prettyDay(i.issuedAt)}</TableCell>
                      <TableCell className="px-3">
                        <Badge className={cn("border-transparent", st.cls)}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="px-3 text-right">
                        <Amount value={i.total} decimals={2} currency={i.currency} className={cn("font-semibold", st.kind === "overdue" && "text-fd-down")} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {listed.length > 0 ? (
            <p className="px-3 pt-3 text-xs text-fd-muted-foreground">
              {listed.length} invoice{listed.length === 1 ? "" : "s"} · {money.eur(listed.reduce((t, i) => t + toEur(i.total, i.currency), 0))} gross
              {listed.some((i) => i.currency === "USD") ? ` · USD at ${usdRate}` : ""}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <ClientGroup label="Past" clients={past} index={7} perClient={perClient} year={year} muted />
    </FinanceShell>
  );
}

function status(i: InvoiceRow, today: string): { kind: "paid" | "due" | "overdue" | "legacy"; label: string; cls: string } {
  if (i.paidAt) return { kind: "paid", label: `paid ${prettyDay(i.paidAt)}`, cls: "bg-fd-up/12 text-fd-up" };
  if (!i.dueAt) return { kind: "legacy", label: "paid · untracked", cls: "bg-fd-muted text-fd-muted-foreground" };
  const d = daysUntil(i.dueAt, today);
  if (d < 0) return { kind: "overdue", label: `${-d} d overdue`, cls: "bg-fd-down/12 text-fd-down" };
  if (d === 0) return { kind: "due", label: "due today", cls: "bg-fd-warn/15 text-fd-warn" };
  return { kind: "due", label: `due in ${d} d`, cls: "bg-fd-muted text-fd-muted-foreground" };
}

function prettyDay(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

type PerClient = Map<string, { billed: number; open: number; count: number }>;

function ClientGroup({ label, clients, index, perClient, year, muted }: { label: string; clients: ClientEntry[]; index: number; perClient: PerClient; year: string; muted?: boolean }) {
  if (clients.length === 0) return null;
  return (
    <section className="fd-rise flex flex-col gap-3" style={rise(index)}>
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-lg font-semibold tracking-tight">{label}</h2>
        <p className="text-xs text-fd-muted-foreground">
          {clients.length} {clients.length === 1 ? "client" : "clients"}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => (
          <li key={c.slug}>
            <ClientCard client={c} money={perClient.get(c.slug)} year={year} muted={muted} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ClientCard({ client, money, year, muted }: { client: ClientEntry; money?: { billed: number; open: number; count: number }; year: string; muted?: boolean }) {
  const stage = stageLabel(client) ?? (client.stage === "closed" ? "Closed" : "Active");
  const tone = client.paused ? "bg-fd-warn/15 text-fd-warn" : client.stage === "delivered" ? "bg-fd-warn/15 text-fd-warn" : client.stage === "active" ? "bg-fd-up/12 text-fd-up" : client.stage === "closed" ? "bg-fd-muted text-fd-muted-foreground" : "bg-primary/10 text-primary";
  return (
    <Link href={client.href} className="group block h-full rounded-2xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
      <Card className={cn("h-full gap-4 py-5 transition-[box-shadow,transform] group-hover:-translate-y-0.5 group-hover:shadow-md", muted && "bg-fd-card/60")}>
        <CardHeader className="px-5">
          <CardTitle className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
            <span>{client.name}</span>
            <Badge className={cn("border-transparent font-medium", tone)}>{stage}</Badge>
          </CardTitle>
          <CardDescription className="line-clamp-3 leading-5">{client.summary}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex flex-col gap-2 px-5 text-xs text-fd-muted-foreground">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {money && money.count > 0 ? (
              <span>
                Billed {year} <Amount value={money.billed} className="font-medium text-foreground" />
              </span>
            ) : (
              <span>Nothing billed in {year}</span>
            )}
            {money && money.open > 0 ? (
              <span>
                open <Amount value={money.open} className="font-medium text-fd-warn" />
              </span>
            ) : null}
          </p>
          <span className="flex items-center justify-between">
            <span className="truncate">{client.href}</span>
            <ArrowUpRight className="size-4 shrink-0 transition-colors group-hover:text-foreground" aria-hidden />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
