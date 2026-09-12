"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { AttentionItem, Severity } from "@/lib/money/overview";
import { Amount } from "./Privacy";

const DOT: Record<Severity, string> = {
  critical: "bg-down",
  warning: "bg-warn",
  info: "bg-faint",
};

const LABEL: Record<Severity, string> = {
  critical: "Now",
  warning: "Soon",
  info: "Note",
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-[14px] border border-rule px-5 py-6 text-[0.9rem] text-muted">
        <Check className="h-4 w-4 text-up" aria-hidden />
        Nothing needs a decision. Enjoy it.
      </div>
    );
  }
  return (
    <ul className="flex flex-col overflow-hidden rounded-[14px] border border-rule">
      {items.map((it) => {
        const inner = (
          <>
            <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full" aria-hidden>
              <span className={`block h-2 w-2 rounded-full ${DOT[it.severity]}`} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[0.95rem] font-medium text-ink">{it.title}</span>
                <span className={`font-caption text-[9px] font-semibold uppercase tracking-[1px] ${it.severity === "critical" ? "text-down" : it.severity === "warning" ? "text-warn" : "text-faint"}`}>{LABEL[it.severity]}</span>
              </span>
              {it.detail ? <span className="block text-[0.8rem] leading-[1.3rem] text-muted">{it.detail}</span> : null}
            </span>
            {it.amount !== undefined ? (
              <Amount value={it.amount} className={`shrink-0 font-display text-[1rem] font-bold ${it.amount < 0 ? "text-down" : "text-up"}`} />
            ) : null}
            {it.href ? <ArrowUpRight className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-ink" aria-hidden /> : null}
          </>
        );
        const cls = "group flex items-start gap-3 border-b border-rule px-4 py-3 last:border-b-0";
        return (
          <li key={it.id}>
            {it.href?.startsWith("#") ? (
              <a href={it.href} className={`${cls} transition-colors hover:bg-card/40`}>{inner}</a>
            ) : it.href ? (
              <Link href={it.href} className={`${cls} transition-colors hover:bg-card/40`}>{inner}</Link>
            ) : (
              <div className={cls}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
