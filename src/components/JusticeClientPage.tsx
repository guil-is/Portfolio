"use client";

import { useState } from "react";
import {
  justice,
  weekTotal,
  totalHours,
  totalEarned,
  type HoursWeek,
  type SowSection,
} from "@/content/clients/justice";

type TabKey = "hours" | "sow";

export function JusticeClientPage() {
  const [tab, setTab] = useState<TabKey>("hours");

  return (
    <main className="page-fade-in mx-auto w-full max-w-[880px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      <Header />
      <Tabs tab={tab} setTab={setTab} />
      <div className="mt-12 md:mt-16">
        {tab === "hours" ? <HoursView /> : <SowView />}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------
function Header() {
  return (
    <section className="flex flex-col gap-6 pb-10 md:pb-14">
      <div className="flex items-center gap-4">
        <span
          className="text-[2.25rem] leading-none md:text-[2.75rem]"
          role="img"
          aria-label="Lobster"
        >
          🦞
        </span>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
          Private · {justice.clientName}
        </p>
      </div>
      <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
        Justice × Guil
      </h1>
      <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
        A shared workspace for our engagement — the scope we agreed on, and a
        live log of hours billed each week.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------
function Tabs({
  tab,
  setTab,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
}) {
  const items: Array<{ key: TabKey; label: string }> = [
    { key: "hours", label: "Billed hours" },
    { key: "sow", label: "Agreement" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Client page sections"
      className="flex border-b border-rule"
    >
      {items.map((item) => {
        const active = tab === item.key;
        return (
          <button
            key={item.key}
            role="tab"
            aria-selected={active}
            onClick={() => setTab(item.key)}
            className={[
              "relative -mb-px px-5 py-4 font-caption text-[12px] font-semibold uppercase tracking-[1.5px] transition-colors md:px-6",
              active ? "text-ink" : "text-muted hover:text-ink",
            ].join(" ")}
          >
            {item.label}
            <span
              className={[
                "pointer-events-none absolute inset-x-0 bottom-0 h-[2px] transition-opacity",
                active ? "bg-ink opacity-100" : "opacity-0",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// Hours view
// ---------------------------------------------------------------------
function HoursView() {
  const weeks = justice.hoursLog;
  const total = totalHours(weeks);
  const earned = totalEarned(weeks, justice.engagement.rateUsd);
  const latest = weeks[0];
  const latestHours = latest ? weekTotal(latest) : 0;

  return (
    <div className="flex flex-col gap-14">
      <p className="max-w-[620px] text-[0.95rem] italic leading-[1.7rem] text-muted">
        This page is updated weekly. Each entry is submitted with the invoice
        for that period.
      </p>

      <SummaryStrip
        total={total}
        earned={earned}
        latestLabel={latest?.label}
        latestHours={latestHours}
      />

      <section className="flex flex-col gap-12">
        {weeks.map((w) => (
          <WeekBlock key={w.weekStart} week={w} />
        ))}
      </section>
    </div>
  );
}

function SummaryStrip({
  total,
  earned,
  latestLabel,
  latestHours,
}: {
  total: number;
  earned: number;
  latestLabel?: string;
  latestHours: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule">
      <Stat label="Engagement total" value={`${total.toFixed(1)} h`} />
      <Stat label="Billable" value={formatUsd(earned)} />
      <Stat
        label={latestLabel ? `Latest · ${latestLabel}` : "Latest week"}
        value={`${latestHours.toFixed(1)} h`}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 bg-bg px-5 py-5 md:px-6 md:py-6">
      <p className="font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      <p className="font-display text-[1.35rem] font-bold leading-none text-ink md:text-[1.75rem]">
        {value}
      </p>
    </div>
  );
}

function WeekBlock({ week }: { week: HoursWeek }) {
  const total = weekTotal(week);
  return (
    <article className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule-soft pb-4">
        <h3 className="font-display text-[1.25rem] font-bold leading-tight text-ink md:text-[1.5rem]">
          {week.label}
        </h3>
        <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
          Total&nbsp;<span className="text-ink">{total.toFixed(1)} h</span>
        </p>
      </div>

      <ul className="flex flex-col">
        {week.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-6 border-b border-rule-soft py-3 last:border-b-0"
          >
            <div className="flex min-w-0 items-start gap-3">
              <ProjectChip name={item.project} />
              <p className="text-[0.95rem] leading-[1.6rem] text-ink">
                {item.description}
              </p>
            </div>
            <p className="shrink-0 font-caption text-[13px] font-semibold tabular-nums text-ink">
              {item.hours.toFixed(1)}&nbsp;h
            </p>
          </li>
        ))}
      </ul>

      {week.note ? (
        <p className="text-[0.9rem] italic leading-[1.55rem] text-muted">
          {week.note}
        </p>
      ) : null}
    </article>
  );
}

function ProjectChip({ name }: { name: string }) {
  return (
    <span className="mt-[3px] inline-flex shrink-0 items-center rounded-[6px] border border-rule-soft bg-card/50 px-2 py-[2px] font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">
      {name}
    </span>
  );
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

// ---------------------------------------------------------------------
// SOW view
// ---------------------------------------------------------------------
function SowView() {
  const { sow, engagement } = justice;
  return (
    <article className="flex flex-col gap-14">
      <header className="flex flex-col gap-5">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          Statement of Work · Effective {sow.effectiveDate}
        </p>
        <p className="max-w-[640px] text-[1rem] italic leading-[1.75rem] text-ink">
          {sow.preamble}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-6 border-y border-rule-soft py-6 md:grid-cols-4">
          <MetaCell label="Rate" value={`$${engagement.rateUsd} / hr`} />
          <MetaCell
            label="Weekly"
            value={`${engagement.weeklyHoursMin}–${engagement.weeklyHoursMax} h`}
          />
          <MetaCell label="Active project" value={engagement.currentProject} />
          <MetaCell label="Start" value={engagement.startDate} />
        </div>
      </header>

      {sow.sections.map((s) => (
        <SowSectionBlock key={s.heading} section={s} />
      ))}

      <footer className="mt-4 border-t border-rule-soft pt-10">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          Parties
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {sow.signatories.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-6 border-b border-rule-soft py-2 last:border-b-0">
              <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
                {k}
              </p>
              <p className="text-[0.95rem] leading-[1.6rem] text-ink">{v}</p>
            </div>
          ))}
        </div>
      </footer>
    </article>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      <p className="font-display text-[1rem] font-bold leading-tight text-ink md:text-[1.125rem]">
        {value}
      </p>
    </div>
  );
}

function SowSectionBlock({ section }: { section: SowSection }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
        {section.heading}
      </h2>
      <div className="flex flex-col gap-4">
        {section.blocks.map((b, i) => {
          if (b.type === "p") {
            return (
              <p
                key={i}
                className="text-[1rem] leading-[1.75rem] text-ink"
              >
                {b.text}
              </p>
            );
          }
          if (b.type === "ul") {
            return (
              <ul key={i} className="flex flex-col gap-2 pl-5">
                {b.items.map((it, j) => (
                  <li
                    key={j}
                    className="list-disc text-[1rem] leading-[1.75rem] text-ink marker:text-muted"
                  >
                    {it}
                  </li>
                ))}
              </ul>
            );
          }
          // type === "kv"
          return (
            <dl
              key={i}
              className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 border-y border-rule-soft py-4"
            >
              {b.rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
                    {k}
                  </dt>
                  <dd className="text-[1rem] leading-[1.6rem] text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          );
        })}
      </div>
    </section>
  );
}
