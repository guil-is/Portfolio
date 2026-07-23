"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Download,
  FileSignature,
  FileText,
  ListChecks,
  TriangleAlert,
} from "lucide-react";
import { AgreementSignature } from "@/components/AgreementSignature";
import { DefinitionList } from "@/components/DefinitionList";
import { Timeline } from "@/components/Timeline";
import type { SignedAgreement } from "@/lib/signed-agreement";
import type { SignableClientSlug } from "@/content/clients/signable";
import type { SignableDocument, SowSection } from "@/content/clients/types";

/**
 * Shared, data-driven client dashboard: agreement tab (signable SOW) plus
 * an optional progress tab (stats, pending actions, phase timeline,
 * payment schedule). New clients get one of these + a content file — see
 * docs/client-lifecycle.md § "Accepted → agreement" — instead of a
 * bespoke component. The page composes `ClientPageData` from the client's
 * content file and passes it down; everything here renders from data.
 *
 * Generalized from E2cClientPage (phases on the shared Timeline) and
 * SpaClientPage (payments, pending actions). Justice remains bespoke
 * (hours log + amendments).
 */

export type ClientPageStat = {
  label: string;
  /** One line, always: long values truncate rather than wrap. */
  value: string;
  sub?: string;
};

export type ClientPagePhaseStatus = "upcoming" | "in_progress" | "done";

export type ClientPagePhase = {
  /** Uppercase caption, e.g. "Phase 1 · Week 1" or "Phase 0 · Before 28 July". */
  eyebrow: string;
  title: string;
  description?: string;
  /** Concrete deliverables inside the phase, rendered as bullets. */
  items?: string[];
  status: ClientPagePhaseStatus;
  /** Override the status pill text (e.g. "Approved", "Delivered"). */
  statusLabel?: string;
  /** ISO date shown beside the pill, e.g. when the phase was approved. */
  date?: string;
};

export type ClientPagePaymentStatus = "due" | "invoiced" | "paid" | "overdue";

export type ClientPagePayment = {
  label: string;
  description: string;
  amount: number;
  status: ClientPagePaymentStatus;
  /** ISO date paid, if paid. */
  date?: string;
  /** Registered in invoices/issued.ts → renders a PDF download link. */
  invoiceNumber?: string;
};

export type ClientPageAction = {
  /** What the client needs to do, phrased to them ("Fill in..."). */
  text: string;
  /** Optional human-readable deadline, e.g. "By Friday, July 4". */
  due?: string;
  /** `label` must be a phrase inside `text`; it renders underlined and
   * linked to `href` (in-page hash or full URL). */
  link?: { label: string; href: string };
};

export type ClientPageData = {
  /** Must be registered in signable.ts — typed so tsc enforces it. */
  slug: SignableClientSlug;
  clientName: string;
  /** Hero heading, e.g. "E2C Cookbook × Guil". */
  heroTitle: string;
  intro: string;
  /** Tab shown on load when there's no #hash. Defaults to "agreement". */
  defaultTab?: TabKey;
  stats?: ClientPageStat[];
  pendingActions?: ClientPageAction[];
  phases?: ClientPagePhase[];
  /** Heading over the phase timeline. Defaults to "Phases". */
  phasesHeading?: string;
  payments?: {
    items: ClientPagePayment[];
    currency?: "EUR" | "USD";
    /** Summary row under the schedule, e.g. { label: "Total · net", amount: 11800 }. */
    total?: { label: string; amount: number };
    /** Small print under the schedule (tax treatment, estimates). */
    note?: string;
  };
  /** Renders a right-aligned link in the tab row (frozen proposal page). */
  proposalHref?: string;
  sow: SignableDocument;
  /** Legal entity recorded on the signature, when known up front. */
  clientEntity?: string;
  /** Block signing until an entity is provided. */
  requireEntity?: boolean;
  /** SOW section heading whose kv rows render as a vertical Timeline on
   * the page (they still print as plain kv in the signed PDF). */
  timelineSection?: string;
};

type TabKey = "agreement" | "progress";

export function ClientPage({
  data,
  initialSignature,
}: {
  data: ClientPageData;
  initialSignature: SignedAgreement | null;
}) {
  const hasProgress = Boolean(
    data.stats?.length ||
      data.pendingActions?.length ||
      data.phases?.length ||
      data.payments?.items.length,
  );
  const [tab, setTab] = useState<TabKey>(data.defaultTab ?? "agreement");

  // Deep-link support — #agreement / #progress map to tabs.
  useEffect(() => {
    if (!hasProgress) return;
    function syncFromHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === "agreement" || hash === "progress") setTab(hash);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [hasProgress]);

  // Reflect the active tab in the URL hash so refresh/share preserves it.
  useEffect(() => {
    if (!hasProgress || typeof window === "undefined") return;
    const desired = `#${tab}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, "", desired);
    }
  }, [tab, hasProgress]);

  return (
    <main className="page-fade-in mx-auto w-full max-w-[880px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      <Header data={data} />
      {hasProgress ? (
        <Tabs tab={tab} setTab={setTab} proposalHref={data.proposalHref} />
      ) : null}
      <div className="mt-12 md:mt-16">
        {hasProgress && tab === "progress" ? (
          <ProgressView data={data} />
        ) : (
          <AgreementView data={data} initialSignature={initialSignature} />
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------
function Header({ data }: { data: ClientPageData }) {
  return (
    <section className="flex flex-col gap-6 pb-10 md:pb-14">
      <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
        Private · {data.clientName}
      </p>
      <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
        {data.heroTitle}
      </h1>
      <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
        {data.intro}
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
  proposalHref,
}: {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  proposalHref?: string;
}) {
  const items: Array<{ key: TabKey; label: string; Icon: typeof ListChecks }> =
    [
      { key: "agreement", label: "Agreement", Icon: FileSignature },
      { key: "progress", label: "Progress", Icon: ListChecks },
    ];
  return (
    <div className="flex items-stretch border-b border-rule">
      <div
        role="tablist"
        aria-label="Client page sections"
        className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                "relative -mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-4 font-caption text-[12px] font-semibold uppercase tracking-[1.5px] transition-colors md:px-6",
                active ? "text-ink" : "text-muted hover:text-ink",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
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

      {/* The proposal is a separate frozen document, so it opens on its own
          page rather than swapping tab content. Same password gate. */}
      {proposalHref ? (
        <Link
          href={proposalHref}
          className="group ml-auto inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-4 font-caption text-[12px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink md:px-6"
        >
          <FileText className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Proposal
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.75}
            aria-hidden
          />
        </Link>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------
// Progress view
// ---------------------------------------------------------------------
function ProgressView({ data }: { data: ClientPageData }) {
  return (
    <div className="flex flex-col gap-14">
      {data.stats?.length || data.pendingActions?.length ? (
        <div className="flex flex-col gap-8">
          {data.stats?.length ? (
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-3">
              {data.stats.map((s) => (
                <Stat key={s.label} {...s} />
              ))}
            </div>
          ) : null}
          {data.pendingActions?.length ? (
            <PendingList slug={data.slug} items={data.pendingActions} />
          ) : null}
        </div>
      ) : null}

      {data.phases?.length ? (
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
            {data.phasesHeading ?? "Phases"}
          </h2>
          <Timeline
            entries={data.phases.map((phase) => {
              const meta = PHASE_META[phase.status];
              return {
                eyebrow: phase.eyebrow,
                badge: (
                  <>
                    <StatusPill
                      label={phase.statusLabel ?? meta.label}
                      tone={meta.tone}
                    />
                    {phase.date ? (
                      <span className="font-caption text-[10px] font-medium uppercase tracking-[1px] text-muted">
                        {formatLongDate(phase.date)}
                      </span>
                    ) : null}
                  </>
                ),
                state: meta.state,
                content: (
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h3 className="font-display text-[1.15rem] font-bold leading-tight text-ink md:text-[1.3rem]">
                      {phase.title}
                    </h3>
                    {phase.description ? (
                      <p className="text-[0.95rem] leading-[1.6rem] text-muted">
                        {phase.description}
                      </p>
                    ) : null}
                    {phase.items?.length ? (
                      <ul className="mt-1 flex flex-col gap-1.5 pl-5">
                        {phase.items.map((item) => (
                          <li
                            key={item}
                            className="list-disc text-[0.95rem] leading-[1.6rem] text-ink marker:text-muted"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ),
              };
            })}
          />
        </section>
      ) : null}

      {data.payments?.items.length ? (
        <PaymentsSection payments={data.payments} />
      ) : null}
    </div>
  );
}

function PaymentsSection({
  payments,
}: {
  payments: NonNullable<ClientPageData["payments"]>;
}) {
  const currency = payments.currency ?? "EUR";
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
        Payment schedule
      </h2>
      <ul className="flex flex-col">
        {payments.items.map((p) => (
          <li
            key={p.label}
            className="flex items-start justify-between gap-6 border-b border-rule-soft py-4 last:border-b-0"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-caption text-[12px] font-semibold uppercase tracking-[1px] text-ink">
                {p.label}
              </p>
              <p className="text-[0.9rem] leading-[1.5rem] text-muted">
                {p.description}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <div className="flex items-center gap-3">
                <PaymentPill status={p.status} />
                <p className="font-display text-[1.125rem] font-bold tabular-nums leading-none text-ink">
                  {formatMoney(p.amount, currency)}
                </p>
              </div>
              {p.invoiceNumber ? (
                <a
                  href={`/api/invoice/${p.invoiceNumber}`}
                  className="inline-flex items-center gap-1.5 font-caption text-[10px] font-medium uppercase tracking-[1px] text-muted transition-colors hover:text-ink"
                >
                  <Download className="h-3 w-3" strokeWidth={2} aria-hidden />
                  {p.invoiceNumber} · PDF
                </a>
              ) : null}
              {p.date ? (
                <p className="font-caption text-[10px] font-medium uppercase tracking-[1px] text-muted">
                  {formatLongDate(p.date)}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {payments.total ? (
        <div className="flex items-baseline justify-between gap-6 border-t border-rule pt-4">
          <p className="font-caption text-[11px] font-semibold uppercase tracking-[1px] text-muted">
            {payments.total.label}
          </p>
          <p className="font-display text-[1.25rem] font-bold tabular-nums leading-none text-ink">
            {formatMoney(payments.total.amount, currency)}
          </p>
        </div>
      ) : null}
      {payments.note ? (
        <p className="text-[0.85rem] leading-[1.5rem] text-muted">
          {payments.note}
        </p>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------
// Pending actions — open items pending on the client, each in its own
// card. Checking one strikes it through (persisted in this browser via
// localStorage) and emails Guil a heads-up so he can verify it's done
// and remove it from the data. The data file stays the source of truth
// for what appears.
//
// Same-tab pub-sub + useSyncExternalStore, mirroring PasswordGate, so the
// stored state hydrates safely without effects.
// ---------------------------------------------------------------------
const pendingKey = (slug: string, text: string) =>
  `for-${slug}-pending:${text}`;
const pendingListeners = new Set<() => void>();
function subscribePending(cb: () => void) {
  pendingListeners.add(cb);
  return () => {
    pendingListeners.delete(cb);
  };
}
function notifyPending() {
  for (const cb of pendingListeners) cb();
}

function PendingList({
  slug,
  items,
}: {
  slug: string;
  items: ClientPageAction[];
}) {
  return (
    <section aria-label="Pending from you" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <TriangleAlert
          className="h-4 w-4 text-[#f59e0b]"
          strokeWidth={2}
          aria-hidden
        />
        <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
          Pending from you
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <PendingItem key={item.text} slug={slug} item={item} />
        ))}
      </ul>
    </section>
  );
}

function PendingItem({ slug, item }: { slug: string; item: ClientPageAction }) {
  const isChecked = useSyncExternalStore(
    subscribePending,
    () => {
      try {
        return window.localStorage.getItem(pendingKey(slug, item.text)) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );

  function toggle() {
    const nowChecked = !isChecked;
    try {
      if (nowChecked) {
        window.localStorage.setItem(pendingKey(slug, item.text), "1");
      } else {
        window.localStorage.removeItem(pendingKey(slug, item.text));
      }
    } catch {
      // localStorage unavailable — the check just won't stick.
    }
    notifyPending();
    // Notify Guil only on check, not uncheck — fire-and-forget.
    if (nowChecked) {
      void fetch("/api/pending-action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientSlug: slug,
          text: item.text,
          due: item.due ?? null,
        }),
      }).catch(() => {});
    }
  }

  return (
    <li className="flex items-center justify-between gap-6 rounded-[14px] border border-rule bg-card/40 px-5 py-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={isChecked}
          aria-label={`Mark done: ${item.text}`}
          onClick={toggle}
          className={[
            "inline-flex h-[16px] w-[16px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border transition-colors",
            isChecked
              ? "border-ink bg-ink text-bg"
              : "border-rule text-transparent hover:border-ink",
          ].join(" ")}
        >
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
        </button>
        <p
          className={[
            "text-[0.95rem] leading-[1.5rem] transition-colors",
            isChecked ? "text-muted line-through" : "text-ink",
          ].join(" ")}
        >
          <ActionText item={item} />
        </p>
      </div>
      {item.due ? (
        <p className="shrink-0 font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
          {item.due}
        </p>
      ) : null}
    </li>
  );
}

// Renders the action text with the link phrase (if any) underlined and
// linked in place, instead of a separate button below.
function ActionText({ item }: { item: ClientPageAction }) {
  if (!item.link) return item.text;
  const idx = item.text.indexOf(item.link.label);
  if (idx === -1) return item.text;
  return (
    <>
      {item.text.slice(0, idx)}
      <a
        href={item.link.href}
        className="underline decoration-rule underline-offset-4 transition-colors hover:decoration-ink"
      >
        {item.link.label}
      </a>
      {item.text.slice(idx + item.link.label.length)}
    </>
  );
}

// ---------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------
function Stat({ label, value, sub }: ClientPageStat) {
  return (
    <div className="flex flex-col bg-bg px-5 py-5 md:px-6 md:py-6">
      <p className="font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      {/* One line, always: long values truncate rather than wrap. */}
      <p className="mt-2 truncate font-display text-[1.35rem] font-bold leading-[1.15] text-ink md:text-[1.75rem]">
        {value}
      </p>
      <p className="mt-2 truncate font-caption text-[11px] leading-[1.4] text-muted">
        {sub ?? " "}
      </p>
    </div>
  );
}

const PHASE_META: Record<
  ClientPagePhaseStatus,
  { label: string; tone: PillTone; state: "done" | "active" | "upcoming" }
> = {
  upcoming: { label: "Upcoming", tone: "muted", state: "upcoming" },
  in_progress: { label: "In progress", tone: "info", state: "active" },
  done: { label: "Done", tone: "positive", state: "done" },
};

// Status color language: grey = not yet, blue = in motion, green = done,
// red = needs attention. Green rides the theme accent so it adapts to dark.
type PillTone = "muted" | "info" | "positive" | "danger";

function StatusPill({ label, tone }: { label: string; tone: PillTone }) {
  const toneClass = {
    muted: "border-rule-soft bg-card/50 text-muted",
    info: "border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6]",
    positive: "border-accent/40 bg-accent/10 text-accent",
    danger: "border-[#d14343]/40 bg-[#d14343]/10 text-[#d14343]",
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

function PaymentPill({ status }: { status: ClientPagePaymentStatus }) {
  if (status === "paid") return <StatusPill label="Paid" tone="positive" />;
  if (status === "invoiced") return <StatusPill label="Invoiced" tone="info" />;
  if (status === "overdue") return <StatusPill label="Overdue" tone="danger" />;
  return <StatusPill label="Due" tone="muted" />;
}

function formatMoney(n: number, currency: "EUR" | "USD"): string {
  return new Intl.NumberFormat(currency === "EUR" ? "en-IE" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatLongDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------
// Agreement view — the signable Service Agreement.
// ---------------------------------------------------------------------
function AgreementView({
  data,
  initialSignature,
}: {
  data: ClientPageData;
  initialSignature: SignedAgreement | null;
}) {
  const { sow } = data;
  return (
    <article className="flex flex-col gap-14">
      <header className="flex flex-col gap-5">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          {sow.title ?? "Service Agreement"} · Effective {sow.effectiveDate}
        </p>
        <h2 className="font-display text-[2rem] font-bold leading-tight text-ink md:text-[2.75rem]">
          {sow.title ?? "Service Agreement"}
        </h2>
        <p className="max-w-[640px] text-[1rem] italic leading-[1.75rem] text-ink">
          {sow.preamble}
        </p>
      </header>

      {sow.sections.map((s) => (
        <AgreementSection
          key={s.heading}
          section={s}
          asTimeline={
            !!data.timelineSection && s.heading === data.timelineSection
          }
        />
      ))}

      <section className="mt-4 border-t border-rule-soft pt-10">
        <AgreementSignature
          clientSlug={data.slug}
          acknowledgments={sow.acknowledgments}
          documentVersion={sow.version}
          initialSignature={initialSignature}
          clientEntity={data.clientEntity}
          requireEntity={data.requireEntity}
        />
      </section>
    </article>
  );
}

function AgreementSection({
  section,
  asTimeline,
}: {
  section: SowSection;
  asTimeline: boolean;
}) {
  // When `asTimeline`, the section's date/milestone kv rows render as a
  // vertical timeline on the page; the same rows still print as a plain
  // kv list in the signed PDF, so the record stays complete and
  // deterministic.
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
        {section.heading}
      </h2>
      <div className="flex flex-col gap-4">
        {section.blocks.map((b, i) => {
          if (b.type === "p") {
            return (
              <p key={i} className="text-[1rem] leading-[1.75rem] text-ink">
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
          if (asTimeline) {
            return (
              <Timeline
                key={i}
                entries={b.rows.map(([when, what]) => ({
                  eyebrow: when,
                  content: (
                    <span className="text-[1rem] leading-[1.6rem] text-ink">
                      {what}
                    </span>
                  ),
                }))}
              />
            );
          }
          return <DefinitionList key={i} rows={b.rows} />;
        })}
      </div>
    </section>
  );
}
