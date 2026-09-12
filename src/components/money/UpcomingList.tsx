"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { UpcomingItem } from "@/lib/money/overview";
import { Amount } from "./Privacy";

/**
 * The next 90 days as one list: instalments the Finanzamt set, invoices
 * you're waiting on, renewals. Grouped by month with a running total.
 * Monthly plans roll up into one row per month (they're background, not
 * decisions); yearly renewals, invoices and tax stay as their own rows.
 */

function monthTitle(key: string): string {
  return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

function day(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", timeZone: "UTC" });
}

type Row = { kind: "one"; item: UpcomingItem } | { kind: "plans"; month: string; items: UpcomingItem[] };

function rowsFor(month: string, items: UpcomingItem[]): Row[] {
  const plans = items.filter((it) => it.kind === "subscription" && it.interval === "monthly");
  const rest = items.filter((it) => !plans.includes(it));
  const out: Row[] = rest.map((item) => ({ kind: "one", item }));
  if (plans.length === 1) out.push({ kind: "one", item: plans[0] });
  else if (plans.length > 1) out.push({ kind: "plans", month, items: plans });
  return out.sort((a, b) => dateOf(a).localeCompare(dateOf(b)));
}

function dateOf(r: Row): string {
  return r.kind === "one" ? r.item.date : r.items[0].date;
}

const ROW = "flex items-center gap-3 px-4 py-2.5";

function ItemRow({ it }: { it: UpcomingItem }) {
  const inner = (
    <>
      <span className="w-[64px] shrink-0 font-caption text-[10px] font-medium uppercase tracking-[1px] text-muted">{day(it.date)}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[0.9rem] text-ink">{it.label}</span>
          {it.overdue ? <span className="shrink-0 rounded-full bg-down/15 px-2 py-0.5 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-down">overdue</span> : null}
          {it.personal ? <span className="shrink-0 rounded-full border border-rule px-2 py-0.5 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-muted">personal</span> : null}
        </span>
        {it.detail ? <span className="block truncate text-[0.75rem] text-muted">{it.detail}</span> : null}
      </span>
      <Amount value={it.amount} signed className={`shrink-0 text-[0.9rem] font-medium ${it.amount < 0 ? "text-down" : "text-up"}`} />
    </>
  );
  return it.href ? (
    <Link href={it.href} className={`${ROW} transition-colors hover:bg-card/40`}>{inner}</Link>
  ) : (
    <div className={ROW}>{inner}</div>
  );
}

function PlansRow({ items }: { items: UpcomingItem[] }) {
  const [open, setOpen] = useState(false);
  const total = items.reduce((t, it) => t + it.amount, 0);
  const personal = items.filter((it) => it.personal).length;
  const first = items[0].date;
  const last = items[items.length - 1].date;
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`${ROW} w-full text-left transition-colors hover:bg-card/40`}>
        <span className="w-[64px] shrink-0 font-caption text-[10px] font-medium uppercase tracking-[1px] text-muted">
          {day(first).slice(4)}–{day(last).slice(4)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9rem] text-ink">
            {items.length} monthly plans
            {personal > 0 ? <span className="text-muted"> · {personal} personal</span> : null}
          </span>
          <span className="block truncate text-[0.75rem] text-muted">{items.map((it) => it.label).join(", ")}</span>
        </span>
        <Amount value={total} signed className="shrink-0 text-[0.9rem] font-medium text-down" />
        <ChevronDown className={`h-4 w-4 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open ? (
        <ul className="border-t border-rule-soft bg-card/20">
          {items.map((it) => (
            <li key={it.id} className="border-b border-rule-soft last:border-b-0">
              <ItemRow it={it} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function UpcomingList({ items, cashNow }: { items: UpcomingItem[]; cashNow: number }) {
  if (items.length === 0) {
    return <p className="rounded-[14px] border border-rule px-5 py-6 text-[0.9rem] text-muted">Nothing known for the next three months.</p>;
  }
  const groups = new Map<string, UpcomingItem[]>();
  for (const it of items) {
    const k = it.date.slice(0, 7);
    groups.set(k, [...(groups.get(k) ?? []), it]);
  }
  const net = items.reduce((t, it) => t + it.amount, 0);
  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([month, rows]) => {
        const sub = rows.reduce((t, it) => t + it.amount, 0);
        return (
          <div key={month} className="flex flex-col gap-1.5">
            <p className="flex items-baseline justify-between px-1 font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
              <span>{monthTitle(month)}</span>
              <Amount value={sub} signed className={sub < 0 ? "text-down" : "text-up"} />
            </p>
            <ul className="flex flex-col overflow-hidden rounded-[14px] border border-rule">
              {rowsFor(month, rows).map((r) => (
                <li key={r.kind === "one" ? r.item.id : `plans-${r.month}`} className="border-b border-rule last:border-b-0">
                  {r.kind === "one" ? <ItemRow it={r.item} /> : <PlansRow items={r.items} />}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <p className="flex items-baseline justify-between px-1 text-[0.8rem] text-muted">
        <span>Cash after all of it, if the invoices land</span>
        <Amount value={cashNow + net} className={`font-medium ${cashNow + net < 0 ? "text-down" : "text-ink"}`} />
      </p>
      <p className="px-1 text-[0.75rem] text-faint">Net over the period: <Amount value={net} signed /></p>
    </div>
  );
}
