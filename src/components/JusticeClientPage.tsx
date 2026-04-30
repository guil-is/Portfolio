"use client";

import { useEffect, useState } from "react";
import { Clock, FileSignature, Info, ShieldAlert } from "lucide-react";
import { AgreementSignature } from "@/components/AgreementSignature";
import type { SignedAgreement } from "@/lib/signed-agreement";
import {
  justice,
  invoiceStatus,
  lastInvoiceActivity,
  lastPaidInvoice,
  paceStatus,
  periodExpenses,
  periodTotal,
  periodWeeks,
  singleProject,
  totalEarned,
  totalHours,
  totalOutstanding,
  totalPaid,
  type HoursPeriod,
  type InvoiceStatus,
  type PaceStatus,
  type SignableDocument,
  type SowSection,
} from "@/content/clients/justice";

type TabKey = "hours" | "sow" | "amendments";

export function JusticeClientPage({
  initialSignature,
  amendmentSignatures,
}: {
  initialSignature: SignedAgreement | null;
  amendmentSignatures?: Record<string, SignedAgreement | null>;
}) {
  const [tab, setTab] = useState<TabKey>("hours");
  const hasAmendments = !!justice.amendments && Object.keys(justice.amendments).length > 0;

  // Deep-link support — read the URL hash on mount and on hashchange.
  // /for/justice#amendments, #sow, or #hours map to their respective tabs.
  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === "amendments" || hash === "sow" || hash === "hours") {
        setTab(hash);
      }
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Reflect the active tab in the URL hash so a refresh / share preserves
  // it. `replaceState` instead of pushState so the browser back button
  // doesn't get cluttered with tab toggles.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const desired = `#${tab}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, "", desired);
    }
  }, [tab]);

  return (
    <main className="page-fade-in mx-auto w-full max-w-[880px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      <Header />
      <Tabs tab={tab} setTab={setTab} hasAmendments={hasAmendments} />
      <div className="mt-12 md:mt-16">
        {tab === "hours" ? (
          <HoursView />
        ) : tab === "amendments" ? (
          <AmendmentsView signatures={amendmentSignatures ?? {}} />
        ) : (
          <SowView initialSignature={initialSignature} />
        )}
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
        live log of hours billed each invoice period.
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
  hasAmendments,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  hasAmendments: boolean;
}) {
  const items: Array<{
    key: TabKey;
    label: string;
    Icon: typeof Clock;
  }> = [
    { key: "hours", label: "Billed hours", Icon: Clock },
    { key: "sow", label: "Agreement", Icon: FileSignature },
    ...(hasAmendments
      ? ([{ key: "amendments", label: "Amendments", Icon: ShieldAlert }] as const)
      : []),
  ];
  return (
    <div
      role="tablist"
      aria-label="Client page sections"
      className="flex border-b border-rule"
    >
      {items.map((item) => {
        const active = tab === item.key;
        const { Icon } = item;
        return (
          <button
            key={item.key}
            role="tab"
            aria-selected={active}
            onClick={() => setTab(item.key)}
            className={[
              "relative -mb-px inline-flex items-center gap-2 px-5 py-4 font-caption text-[12px] font-semibold uppercase tracking-[1.5px] transition-colors md:px-6",
              active ? "text-ink" : "text-muted hover:text-ink",
            ].join(" ")}
          >
            <Icon
              className="h-3.5 w-3.5"
              strokeWidth={1.75}
              aria-hidden
            />
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
  const periods = justice.hoursLog;
  const rate = justice.engagement.rateUsd;
  const hours = totalHours(periods);
  const earned = totalEarned(periods, rate);
  const paid = totalPaid(periods, rate);
  const outstanding = totalOutstanding(periods, rate);
  const lastPaid = lastPaidInvoice(periods);
  const lastActivity = lastInvoiceActivity(periods);
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        {lastActivity ? (
          <p className="self-end font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
            Updated {formatLongDate(lastActivity)}
          </p>
        ) : null}
        <SummaryStrip
          hours={hours}
          rate={rate}
          earned={earned}
          paid={paid}
          outstanding={outstanding}
          lastPaid={lastPaid}
        />
      </div>

      <section className="flex flex-col gap-12">
        {periods.map((p) => (
          <PeriodBlock key={p.weekStart} period={p} currentYear={currentYear} />
        ))}
      </section>
    </div>
  );
}

// ---------- Summary strip ----------
function SummaryStrip({
  hours,
  rate,
  earned,
  paid,
  outstanding,
  lastPaid,
}: {
  hours: number;
  rate: number;
  earned: number;
  paid: number;
  outstanding: number;
  lastPaid: { number?: string; paidAt: string } | null;
}) {
  const settled = outstanding <= 0;
  const paidSub = lastPaid
    ? `Last: ${lastPaid.number ?? formatLongDate(lastPaid.paidAt)}`
    : undefined;
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-3">
      <Stat
        label="Hours"
        value={`${hours.toFixed(1)} h`}
        sub={`${formatUsd(earned)} at $${rate}/h`}
      />
      <Stat label="Paid" value={formatUsd(paid)} sub={paidSub} />
      <Stat
        label={settled ? "Status" : "Outstanding"}
        value={settled ? "Paid in full" : formatUsd(outstanding)}
        accent={!settled}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col bg-bg px-5 py-5 md:px-6 md:py-6">
      <p className="font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-[1.35rem] font-bold leading-none text-ink md:text-[1.75rem]">
        {value}
      </p>
      {/* Always reserve the sub line so all three cells have identical
          content height — keeps the strip visually balanced. */}
      <p className="mt-2 font-caption text-[11px] leading-[1.4] text-muted">
        {sub ?? "\u00A0"}
      </p>
    </div>
  );
}

// ---------- Period block ----------
function PeriodBlock({
  period,
  currentYear,
}: {
  period: HoursPeriod;
  currentYear: number;
}) {
  const total = periodTotal(period);
  const weeks = periodWeeks(period);
  const project = singleProject(period);
  const status = invoiceStatus(period);
  const pace = paceStatus(period, justice.engagement);
  const label = displayLabel(period.label, currentYear);

  return (
    <article className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 border-b border-rule-soft pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="font-display text-[1.25rem] font-bold leading-tight text-ink md:text-[1.5rem]">
            {label}
          </h3>
          <p className="flex items-baseline gap-2">
            <span className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              Total
            </span>
            <span className="font-display text-[1.125rem] font-bold tabular-nums leading-none text-ink md:text-[1.375rem]">
              {total.toFixed(1)} h
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[10px]">
          <Pill label={`${weeks} ${weeks === 1 ? "week" : "weeks"}`} />
          {project ? <Pill label={project} /> : null}
          <InvoicePill status={status} />
          <span className="ml-auto">
            <PacePill pace={pace} />
          </span>
        </div>
      </header>

      {period.note ? (
        <p className="flex items-start gap-2 text-[0.9rem] italic leading-[1.55rem] text-muted">
          <Info
            className="mt-[3px] h-3.5 w-3.5 shrink-0 not-italic"
            strokeWidth={1.75}
            aria-hidden
          />
          <span>{period.note}</span>
        </p>
      ) : null}

      <ul className="flex flex-col">
        {period.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-6 border-b border-rule-soft py-3 last:border-b-0"
          >
            <div className="flex min-w-0 items-start gap-3">
              {project ? null : <ProjectChip name={item.project} />}
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

      {period.expenses && period.expenses.length > 0 ? (
        <div className="flex flex-col gap-2 pt-2">
          <h4 className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
            Expenses (billed at cost)
          </h4>
          <ul className="flex flex-col">
            {period.expenses.map((e, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-6 border-b border-rule-soft py-3 last:border-b-0"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {project ? null : <ProjectChip name={e.project} />}
                  <p className="text-[0.95rem] leading-[1.6rem] text-ink">
                    {e.description}
                  </p>
                </div>
                <p className="shrink-0 font-caption text-[13px] font-semibold tabular-nums text-ink">
                  ${e.amountUsd.toFixed(2)}
                </p>
              </li>
            ))}
            <li className="flex items-start justify-between gap-6 py-3">
              <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
                Expenses subtotal
              </p>
              <p className="shrink-0 font-caption text-[13px] font-semibold tabular-nums text-ink">
                ${periodExpenses(period).toFixed(2)}
              </p>
            </li>
          </ul>
        </div>
      ) : null}
    </article>
  );
}

/** Strip a trailing ", YYYY" from a label when YYYY matches the current
 * year. Keeps the year visible when a period spans an unusual year so
 * the date is never ambiguous. */
function displayLabel(label: string, currentYear: number): string {
  const suffix = `, ${currentYear}`;
  return label.endsWith(suffix) ? label.slice(0, -suffix.length) : label;
}

function Pill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "muted" | "positive" | "warning";
}) {
  const toneClass = {
    neutral:
      "border-rule-soft bg-card/50 text-muted",
    muted: "border-transparent bg-transparent text-muted",
    positive:
      "border-[#16a34a]/40 bg-[#16a34a]/10 text-[#16a34a]",
    warning:
      "border-[#f97316]/45 bg-[#f97316]/10 text-[#f97316]",
  }[tone];
  return (
    <span
      className={[
        "inline-flex items-center rounded-[6px] border px-2 py-[2px] font-caption text-[10px] font-semibold uppercase tracking-[1px]",
        toneClass,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function InvoicePill({ status }: { status: InvoiceStatus }) {
  if (status.kind === "pending") {
    return <Pill label="Pending invoice" tone="muted" />;
  }
  const id = status.number ? `${status.number} · ` : "";
  if (status.kind === "paid") {
    return <Pill label={`${id}Paid`} tone="positive" />;
  }
  return <Pill label={`${id}Awaiting payment`} tone="warning" />;
}

/**
 * Only renders when pace is exceptional. "Within target" is the
 * default expectation — showing it on every period turns the indicator
 * into decoration instead of a signal.
 */
function PacePill({ pace }: { pace: PaceStatus }) {
  if (pace.state === "on") return null;
  const sign = pace.delta > 0 ? "+" : "−";
  const abs = Math.abs(pace.delta).toFixed(1);
  const label = pace.state === "over" ? "Over" : "Under";
  return (
    <span className="font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">
      {label} target · {sign}
      {abs} h
    </span>
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

function formatLongDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------
// SOW view
// ---------------------------------------------------------------------
function SowView({
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
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
        <div className="mt-4 grid grid-cols-2 gap-6 border-y border-rule-soft py-6 md:grid-cols-3">
          <MetaCell label="Rate" value={`$${engagement.rateUsd} / hr`} />
          <MetaCell
            label="Weekly"
            value={`${engagement.weeklyHoursMin}–${engagement.weeklyHoursMax} h`}
          />
          <MetaCell label="Start" value={engagement.startDate} />
        </div>
      </header>

      {sow.sections.map((s) => (
        <SowSectionBlock key={s.heading} section={s} />
      ))}

      <section className="mt-4 border-t border-rule-soft pt-10">
        <AgreementSignature
          clientSlug="justice"
          acknowledgments={sow.acknowledgments}
          documentVersion={sow.version}
          initialSignature={initialSignature}
        />
      </section>
    </article>
  );
}

// ---------------------------------------------------------------------
// Amendments view
// ---------------------------------------------------------------------
function AmendmentsView({
  signatures,
}: {
  signatures: Record<string, SignedAgreement | null>;
}) {
  const entries = Object.entries(justice.amendments ?? {});
  if (entries.length === 0) {
    return (
      <p className="text-[0.95rem] leading-[1.7rem] text-muted">
        No amendments yet.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-20">
      {entries.map(([key, doc]) => (
        <AmendmentBlock
          key={key}
          documentKey={key}
          doc={doc}
          initialSignature={signatures[key] ?? null}
        />
      ))}
    </div>
  );
}

function AmendmentBlock({
  documentKey,
  doc,
  initialSignature,
}: {
  documentKey: string;
  doc: SignableDocument;
  initialSignature: SignedAgreement | null;
}) {
  const [legalOpen, setLegalOpen] = useState(false);
  return (
    <article className="flex flex-col gap-12">
      <header className="flex flex-col gap-5">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          Amendment · Effective {doc.effectiveDate}
        </p>
        <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.5rem]">
          {doc.title ?? "Amendment"}
        </h2>
        <p className="max-w-[640px] text-[0.95rem] italic leading-[1.7rem] text-muted">
          {doc.preamble}
        </p>
        <p className="text-[0.85rem] leading-[1.55rem] text-muted">
          Issued by Guilherme Maueler. This document constitutes the offer;
          the Client&rsquo;s electronic signature below constitutes acceptance.
        </p>
      </header>

      {doc.tldr && doc.tldr.length > 0 ? (
        <section className="flex flex-col gap-4 rounded-[16px] border border-rule bg-card/40 p-7 md:p-9">
          <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
            TL;DR — In Plain English
          </p>
          {doc.tldr.map((para, i) => (
            <p
              key={i}
              className="text-[0.95rem] leading-[1.7rem] text-ink"
            >
              {para}
            </p>
          ))}
        </section>
      ) : null}

      {doc.breakdown && doc.breakdown.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h3 className="font-display text-[1.25rem] font-bold leading-tight text-ink md:text-[1.5rem]">
            Section-by-section
          </h3>
          <ul className="flex flex-col">
            {doc.breakdown.map((row, i) => (
              <li
                key={i}
                className="grid grid-cols-1 gap-1 border-b border-rule-soft py-3 md:grid-cols-[260px_1fr] md:gap-6"
              >
                <p className="font-caption text-[12px] font-semibold uppercase tracking-[1px] text-ink">
                  {row.section}
                </p>
                <p className="text-[0.95rem] leading-[1.6rem] text-muted">
                  {row.summary}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-6 border-t border-rule-soft pt-8">
        <button
          type="button"
          onClick={() => setLegalOpen((v) => !v)}
          aria-expanded={legalOpen}
          className="group inline-flex w-full items-center justify-between gap-3 rounded-[12px] border border-rule bg-card/40 px-5 py-4 text-left transition-colors hover:border-ink hover:bg-card md:px-6 md:py-5"
        >
          <span className="flex flex-col gap-0.5">
            <span className="font-display text-[1rem] font-bold text-ink md:text-[1.125rem]">
              {legalOpen ? "Hide full legal text" : "Read the full legal text"}
            </span>
            <span className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              {legalOpen
                ? `${doc.sections.length} sections — collapse`
                : `${doc.sections.length} sections — expand to read in full`}
            </span>
          </span>
          <span
            aria-hidden
            className={`text-[1.25rem] leading-none text-muted transition-transform duration-200 group-hover:text-ink ${
              legalOpen ? "rotate-45" : ""
            }`}
          >
            +
          </span>
        </button>
        {legalOpen ? (
          <div className="flex flex-col gap-12 pt-4">
            {doc.sections.map((s) => (
              <SowSectionBlock key={s.heading} section={s} />
            ))}
            {doc.noteOnApproach ? (
              <section className="flex flex-col gap-3">
                <h2 className="font-display text-[1.25rem] font-bold leading-tight text-ink md:text-[1.5rem]">
                  Note on the Approach
                </h2>
                <p className="text-[1rem] leading-[1.75rem] text-muted">
                  {doc.noteOnApproach}
                </p>
              </section>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="border-t border-rule-soft pt-10">
        <AgreementSignature
          clientSlug="justice"
          documentKey={documentKey}
          acknowledgments={doc.acknowledgments}
          documentVersion={doc.version}
          initialSignature={initialSignature}
        />
      </section>
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
