"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clientRegistry, currentClients, pastClients, stageLabel, type ClientEntry } from "@/content/clients/registry";
import type { Receivable } from "@/lib/income";
import { daysUntil } from "@/lib/expenses/subscriptions";
import { OWNER_FLAG_KEY } from "@/components/VisitTracker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { FinanceShell } from "./finance/FinanceShell";
import { Kpi, rise } from "./finance/Kpi";
import { Amount } from "./money/Privacy";

/**
 * Clients — every private client page in one place, plus what they
 * still owe. Once unlocked, it writes each client page's unlock flag
 * into sessionStorage, so opening any of them from here skips the
 * per-page password (same tab only). It also marks this browser as the
 * owner's, so VisitTracker keeps Guil's own checks out of the visit log.
 */
export function ClientsDashboard({ receivables, ledgerLoaded }: { receivables: Receivable[]; ledgerLoaded: boolean }) {
  const [toast, setToast] = useState<string | null>(null);
  const reloadSoon = useCallback(() => window.setTimeout(() => window.location.reload(), 600), []);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

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
  const eur = receivables.filter((r) => r.currency === "EUR").reduce((t, r) => t + r.total, 0);
  const usd = receivables.filter((r) => r.currency === "USD").reduce((t, r) => t + r.total, 0);
  const overdue = receivables.filter((r) => r.dueAt < today);

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
        <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-fd-muted-foreground">Invoice data loads after the gate — reload the page if the open invoices show as empty.</p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-2 gap-4 lg:col-span-5 lg:grid-cols-1">
          <Kpi label="Owed to you" value={receivables.length === 0 ? <span className="text-fd-muted-foreground">—</span> : <><Amount value={eur} />{usd > 0 ? <span className="text-base font-medium text-fd-muted-foreground"> + <Amount value={usd} currency="USD" /></span> : null}</>} tone={receivables.length > 0 ? "up" : undefined} style={rise(1)}>
            {receivables.length === 0 ? "no open invoices" : `${receivables.length} open invoice${receivables.length === 1 ? "" : "s"}`}
          </Kpi>
          <Kpi label="Overdue" value={overdue.length === 0 ? <span className="text-fd-muted-foreground">0</span> : String(overdue.length)} tone={overdue.length > 0 ? "down" : undefined} style={rise(2)}>
            {overdue.length === 0 ? "everyone is on time" : overdue.map((r) => r.client).join(", ")}
          </Kpi>
        </div>
        <Card className="fd-rise gap-3 lg:col-span-7" style={rise(3)}>
          <CardHeader>
            <CardTitle>Open invoices</CardTitle>
            <CardDescription>By due date · click through to the client page</CardDescription>
          </CardHeader>
          <CardContent className="px-3">
            {receivables.length === 0 ? (
              <p className="px-3 py-4 text-sm text-fd-muted-foreground">Nothing outstanding.</p>
            ) : (
              <ul className="flex flex-col">
                {receivables.map((r) => {
                  const d = daysUntil(r.dueAt, today);
                  const inner = (
                    <>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{r.client}</span>
                          <span className="shrink-0 text-xs text-fd-muted-foreground">{r.number}</span>
                          {d < 0 ? <Badge className="border-transparent bg-fd-down/12 text-fd-down">{-d} d overdue</Badge> : null}
                        </span>
                        <span className="block text-xs text-fd-muted-foreground">{d < 0 ? `was due ${prettyDay(r.dueAt)}` : d === 0 ? "due today" : `due ${prettyDay(r.dueAt)} · in ${d} day${d === 1 ? "" : "s"}`}</span>
                      </span>
                      <Amount value={r.total} decimals={2} currency={r.currency} className={cn("shrink-0 text-sm font-semibold", d < 0 && "text-fd-down")} />
                      <ArrowUpRight className="size-4 shrink-0 text-fd-muted-foreground/50 transition-colors group-hover:text-foreground" aria-hidden />
                    </>
                  );
                  const cls = "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-fd-accent";
                  return <li key={r.number}>{r.clientSlug ? <Link href={`/for/${r.clientSlug}`} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>}</li>;
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <ClientGroup label="Current" clients={current} index={4} />
      <ClientGroup label="Past" clients={past} index={5} muted />
      <Separator className="mt-6 opacity-0" />
    </FinanceShell>
  );
}

function prettyDay(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function ClientGroup({ label, clients, index, muted }: { label: string; clients: ClientEntry[]; index: number; muted?: boolean }) {
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
            <ClientCard client={c} muted={muted} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ClientCard({ client, muted }: { client: ClientEntry; muted?: boolean }) {
  const stage = stageLabel(client);
  return (
    <Link href={client.href} className="group block h-full rounded-2xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
      <Card className={cn("h-full gap-4 py-5 transition-[box-shadow,transform] group-hover:-translate-y-0.5 group-hover:shadow-md", muted && "bg-fd-card/60")}>
        <CardHeader className="px-5">
          <CardTitle className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
            <span>{client.name}</span>
            {stage ? <Badge variant="secondary" className="font-medium capitalize">{stage}</Badge> : null}
          </CardTitle>
          <CardDescription className="line-clamp-3 leading-5">{client.summary}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto flex items-center justify-between px-5 text-xs text-fd-muted-foreground">
          <span className="truncate">{client.href}</span>
          <ArrowUpRight className="size-4 shrink-0 transition-colors group-hover:text-foreground" aria-hidden />
        </CardContent>
      </Card>
    </Link>
  );
}
