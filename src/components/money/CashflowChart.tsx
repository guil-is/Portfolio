"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { CashflowMonth } from "@/lib/money/overview";
import { cn } from "@/lib/utils";
import { formatAmount, usePrivacy } from "./Privacy";

/**
 * Money in vs business money out, as paired columns. Inline SVG: <=24px
 * columns with a 4px rounded cap, a 2px surface gap between the pair,
 * hairline gridlines, a legend (two series), a hover tooltip per month
 * band, and a table view for the same numbers. The month in progress is
 * drawn lighter and labelled "so far" so a half month doesn't read as a
 * bad one. Keyboard: the chart is one tab stop; arrow keys walk the
 * months and a live region reads each one out.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function niceMax(v: number): number {
  if (v <= 0) return 1000;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
}

function monthLabel(key: string): string {
  return MONTHS[Number(key.slice(5, 7)) - 1] ?? key;
}

function compact(n: number): string {
  if (Math.abs(n) >= 1000) return `${Math.round(n / 100) / 10}k`;
  return String(Math.round(n));
}

export function CashflowChart({
  months,
  view,
  controls = true,
  currentMonth,
}: {
  months: CashflowMonth[];
  /** Controlled view; leave unset to let the chart's own toggle decide. */
  view?: "chart" | "table";
  /** Hide the built-in Chart/Table toggle (when the host renders its own). */
  controls?: boolean;
  /** YYYY-MM of the month in progress — drawn lighter, labelled "so far". */
  currentMonth?: string;
}) {
  const { hidden } = usePrivacy();
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(880);
  const [hover, setHover] = useState<number | null>(null);
  const [own, setOwn] = useState(false);
  const liveId = useId();
  const table = view ? view === "table" : own;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.max(320, Math.round(w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = 240;
  const pad = { top: 16, right: 8, bottom: 28, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...months.map((m) => Math.max(m.income, m.expenses)), 1));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const band = innerW / Math.max(1, months.length);
  const bar = Math.min(24, Math.max(6, (band - 12) / 2 - 1));
  const gap = 2;
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const totalIn = months.reduce((t, m) => t + m.income, 0);
  const totalOut = months.reduce((t, m) => t + m.expenses, 0);

  // Column with a 4px rounded top and a square baseline.
  const column = (x: number, v: number) => {
    const top = y(v);
    const base = y(0);
    const h = Math.max(0, base - top);
    const r = Math.min(4, h / 2, bar / 2);
    if (h <= 0) return "";
    return `M${x},${base} V${top + r} a${r},${r} 0 0 1 ${r},-${r} h${bar - 2 * r} a${r},${r} 0 0 1 ${r},${r} V${base} Z`;
  };

  const hovered = hover !== null ? months[hover] : null;
  const fmt = (n: number) => (hidden ? "€••••" : formatAmount(n, { decimals: 0 }));
  const isCurrent = (m: CashflowMonth) => m.month === currentMonth;
  const describe = (m: CashflowMonth) => `${monthLabel(m.month)} ${m.month.slice(0, 4)}${isCurrent(m) ? " so far" : ""}: in ${fmt(m.income)}, out ${fmt(m.expenses)}, net ${fmt(m.income - m.expenses)}`;

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (months.length === 0) return;
    const last = months.length - 1;
    const cur = hover ?? last;
    if (e.key === "ArrowRight") setHover(Math.min(last, cur + 1));
    else if (e.key === "ArrowLeft") setHover(Math.max(0, hover === null ? last : cur - 1));
    else if (e.key === "Home") setHover(0);
    else if (e.key === "End") setHover(last);
    else if (e.key === "Escape") setHover(null);
    else return;
    e.preventDefault();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-viz-in" aria-hidden /> Money in <span className="text-ink">{fmt(totalIn)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-viz-out" aria-hidden /> Business out <span className="text-ink">{fmt(totalOut)}</span>
          </span>
          {currentMonth && months.some(isCurrent) ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-viz-in opacity-40" aria-hidden /> {monthLabel(currentMonth)} so far
            </span>
          ) : null}
        </div>
        {controls ? (
          <button
            type="button"
            onClick={() => setOwn((t) => !t)}
            className="rounded-full border border-rule px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted transition-colors hover:border-ink hover:text-ink"
          >
            {table ? "Chart" : "Table"}
          </button>
        ) : null}
      </div>

      {table ? (
        <div className="overflow-x-auto rounded-[12px] border border-rule" tabIndex={0} role="region" aria-label="Cash flow by month">
          <table className="w-full border-collapse text-[0.85rem]">
            <thead>
              <tr className="border-b border-rule bg-card/40 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">
                <th className="px-3 py-2 text-left">Month</th>
                <th className="px-3 py-2 text-right">In</th>
                <th className="px-3 py-2 text-right">Out</th>
                <th className="px-3 py-2 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month} className="border-b border-rule-soft last:border-b-0">
                  <td className="px-3 py-1.5 text-body">
                    {monthLabel(m.month)} {m.month.slice(2, 4)}
                    {isCurrent(m) ? <span className="ml-1.5 text-[11px] text-muted">so far</span> : null}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-ink">{fmt(m.income)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-ink">{fmt(m.expenses)}</td>
                  <td className={`px-3 py-1.5 text-right tabular-nums ${m.income - m.expenses < 0 ? "text-down" : "text-up"}`}>{fmt(m.income - m.expenses)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={host}
          className="relative w-full rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          onMouseLeave={() => setHover(null)}
          tabIndex={0}
          role="img"
          aria-label={`Money in versus business money out, by month. ${months.length} months. Use the arrow keys to read each month.`}
          aria-describedby={liveId}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
        >
          <span id={liveId} className="sr-only" aria-live="polite">
            {hovered ? describe(hovered) : ""}
          </span>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block max-w-full" aria-hidden>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="var(--color-rule)" strokeWidth={1} shapeRendering="crispEdges" />
                <text x={pad.left - 8} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="var(--color-muted)" fontFamily="var(--font-caption)">
                  {hidden ? "•" : compact(t)}
                </text>
              </g>
            ))}
            {months.map((m, i) => {
              const x0 = pad.left + i * band + (band - (2 * bar + gap)) / 2;
              const on = hover === i;
              const partial = isCurrent(m);
              return (
                <g key={m.month} opacity={hover === null || on ? 1 : 0.45} style={{ transition: "opacity 120ms" }}>
                  <rect x={pad.left + i * band} y={pad.top} width={band} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
                  <path d={column(x0, m.income)} fill="var(--color-viz-in)" opacity={partial ? 0.4 : 1} pointerEvents="none" />
                  <path d={column(x0 + bar + gap, m.expenses)} fill="var(--color-viz-out)" opacity={partial ? 0.4 : 1} pointerEvents="none" />
                  <text x={pad.left + i * band + band / 2} y={height - 10} textAnchor="middle" fontSize={10} fill={on ? "var(--color-ink)" : "var(--color-muted)"} fontFamily="var(--font-caption)">
                    {monthLabel(m.month)}
                    {partial ? "·" : ""}
                  </text>
                </g>
              );
            })}
            <line x1={pad.left} x2={width - pad.right} y1={y(0)} y2={y(0)} stroke="var(--color-rule)" strokeWidth={1} shapeRendering="crispEdges" />
          </svg>
          {hovered && hover !== null ? (
            <div
              className={cn("pointer-events-none absolute top-2 z-10 rounded-[10px] border border-rule bg-bg px-3 py-2 text-[0.8rem]")}
              style={{ left: Math.min(width - 190, Math.max(0, pad.left + hover * band + band / 2 - 90)), boxShadow: "var(--shadow-card)" }}
            >
              <p className="font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">
                {monthLabel(hovered.month)} {hovered.month.slice(0, 4)}
                {isCurrent(hovered) ? " · so far" : ""}
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-muted"><span className="inline-block h-0.5 w-3 bg-viz-in" aria-hidden /> In</span>
                <span className="tabular-nums text-ink">{fmt(hovered.income)}</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 text-muted"><span className="inline-block h-0.5 w-3 bg-viz-out" aria-hidden /> Out</span>
                <span className="tabular-nums text-ink">{fmt(hovered.expenses)}</span>
              </p>
              <p className="mt-1 flex items-center justify-between gap-4 border-t border-rule-soft pt-1">
                <span className="text-muted">Net</span>
                <span className={`tabular-nums ${hovered.income - hovered.expenses < 0 ? "text-down" : "text-up"}`}>{fmt(hovered.income - hovered.expenses)}</span>
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
