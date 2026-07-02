"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CircleDashed,
  FileSignature,
  ListChecks,
  Loader,
} from "lucide-react";
import { AgreementSignature } from "@/components/AgreementSignature";
import type { SignedAgreement } from "@/lib/signed-agreement";
import {
  spa,
  milestonesComplete,
  totalOutstanding,
  totalPaid,
  type MilestoneStatus,
  type PaymentStatus,
  type ProjectMilestone,
} from "@/content/clients/spa";
import type { SowSection } from "@/content/clients/types";

type TabKey = "progress" | "agreement";

export function SpaClientPage({
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
  const [tab, setTab] = useState<TabKey>("progress");

  // Deep-link support — /for/spa#agreement or #progress map to tabs.
  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === "agreement" || hash === "progress") setTab(hash);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Reflect the active tab in the URL hash so refresh/share preserves it.
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
      <Tabs tab={tab} setTab={setTab} />
      <div className="mt-12 md:mt-16">
        {tab === "progress" ? (
          <ProgressView />
        ) : (
          <AgreementView initialSignature={initialSignature} />
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
      <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
        Private · {spa.clientName}
      </p>
      <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
        WinWin 2026 × Guil
      </h1>
      <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
        A shared workspace for the WinWin 2026 identity, invitation, and
        website: the agreement to sign, and a live view of where the project
        stands.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------
function Tabs({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  const items: Array<{ key: TabKey; label: string; Icon: typeof ListChecks }> =
    [
      { key: "progress", label: "Progress", Icon: ListChecks },
      { key: "agreement", label: "Agreement", Icon: FileSignature },
    ];
  return (
    <div
      role="tablist"
      aria-label="Client page sections"
      className="flex overflow-x-auto border-b border-rule [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
  );
}

// ---------------------------------------------------------------------
// Progress view — fixed-fee, phased project tracker.
// ---------------------------------------------------------------------
function ProgressView() {
  const { project, milestones, payments } = spa;
  const paid = totalPaid(spa);
  const outstanding = totalOutstanding(spa);
  const done = milestonesComplete(spa);

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <p className="self-end font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
          {done} of {milestones.length} phases complete
        </p>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-3">
          <Stat
            label="Project fee"
            value={formatEur(project.feeEur)}
            sub={`${project.name} · net`}
          />
          <Stat
            label="Paid"
            value={formatEur(paid)}
            sub={`Target delivery ${project.targetDelivery}`}
          />
          <Stat
            label={outstanding <= 0 ? "Status" : "Outstanding"}
            value={outstanding <= 0 ? "Paid in full" : formatEur(outstanding)}
          />
        </div>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
          Phases
        </h2>
        <ol className="flex flex-col">
          {milestones.map((m, i) => (
            <MilestoneRow
              key={m.title}
              milestone={m}
              isLast={i === milestones.length - 1}
            />
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
          Payment schedule
        </h2>
        <ul className="flex flex-col">
          {payments.map((p) => (
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
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="font-display text-[1.125rem] font-bold tabular-nums leading-none text-ink">
                  {formatEur(p.amountEur)}
                </p>
                <PaymentPill status={p.status} />
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[0.85rem] leading-[1.5rem] text-muted">
          All amounts net. VAT reverse charge applies for EU business clients.
          Phase 4 is a working estimate, confirmed before that phase begins.
        </p>
      </section>
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
}) {
  return (
    <div className="flex flex-col bg-bg px-5 py-5 md:px-6 md:py-6">
      <p className="font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-[1.35rem] font-bold leading-none text-ink md:text-[1.75rem]">
        {value}
      </p>
      <p className="mt-2 font-caption text-[11px] leading-[1.4] text-muted">
        {sub ?? " "}
      </p>
    </div>
  );
}

const MILESTONE_META: Record<
  MilestoneStatus,
  { label: string; tone: PillTone }
> = {
  upcoming: { label: "Upcoming", tone: "muted" },
  in_progress: { label: "In progress", tone: "active" },
  delivered: { label: "Delivered", tone: "neutral" },
  approved: { label: "Approved", tone: "positive" },
};

function MilestoneRow({
  milestone,
  isLast,
}: {
  milestone: ProjectMilestone;
  isLast: boolean;
}) {
  const done =
    milestone.status === "delivered" || milestone.status === "approved";
  const active = milestone.status === "in_progress";
  const meta = MILESTONE_META[milestone.status];

  return (
    <li className="relative flex gap-5 pb-10 last:pb-0">
      {!isLast ? (
        <span
          aria-hidden
          className="absolute left-[13px] top-8 bottom-0 w-px bg-rule"
        />
      ) : null}
      <span
        aria-hidden
        className={[
          "relative z-10 mt-0.5 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-ink bg-ink text-bg"
            : active
              ? "border-ink bg-bg text-ink"
              : "border-rule bg-bg text-muted",
        ].join(" ")}
      >
        {done ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : active ? (
          <Loader className="h-3.5 w-3.5" strokeWidth={2} />
        ) : (
          <CircleDashed className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5 pt-0.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
            {milestone.label}
          </p>
          <StatusPill label={meta.label} tone={meta.tone} />
          {milestone.date ? (
            <p className="font-caption text-[10px] font-medium uppercase tracking-[1px] text-muted">
              {formatLongDate(milestone.date)}
            </p>
          ) : null}
        </div>
        <h3 className="font-display text-[1.15rem] font-bold leading-tight text-ink md:text-[1.3rem]">
          {milestone.title}
        </h3>
        {milestone.description ? (
          <p className="text-[0.95rem] leading-[1.6rem] text-muted">
            {milestone.description}
          </p>
        ) : null}
      </div>
    </li>
  );
}

type PillTone = "muted" | "active" | "neutral" | "positive";

function StatusPill({ label, tone }: { label: string; tone: PillTone }) {
  const toneClass = {
    muted: "border-rule-soft bg-card/50 text-muted",
    neutral: "border-rule bg-card/60 text-ink",
    active: "border-ink/40 bg-ink/5 text-ink",
    positive: "border-[#16a34a]/40 bg-[#16a34a]/10 text-[#16a34a]",
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

function PaymentPill({ status }: { status: PaymentStatus }) {
  if (status === "paid") return <StatusPill label="Paid" tone="positive" />;
  if (status === "invoiced")
    return <StatusPill label="Invoiced" tone="active" />;
  return <StatusPill label="Due" tone="muted" />;
}

function formatEur(n: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
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
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
  const { sow } = spa;
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
        <AgreementSection key={s.heading} section={s} />
      ))}

      <section className="mt-4 border-t border-rule-soft pt-10">
        <AgreementSignature
          clientSlug="spa"
          acknowledgments={sow.acknowledgments}
          documentVersion={sow.version}
          initialSignature={initialSignature}
        />
      </section>
    </article>
  );
}

function AgreementSection({ section }: { section: SowSection }) {
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
