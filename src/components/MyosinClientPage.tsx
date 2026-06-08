"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Check,
  CircleDashed,
  FileSignature,
  FileText,
  ListChecks,
  Loader,
} from "lucide-react";
import { AgreementSignature } from "@/components/AgreementSignature";
import { BriefMediaRow } from "@/components/BriefMediaRow";
import { CtaButton } from "@/components/CtaButton";
import type { SignedAgreement } from "@/lib/signed-agreement";
import {
  myosin,
  milestonesComplete,
  totalOutstanding,
  totalPaid,
  type MilestoneStatus,
  type PaymentStatus,
  type ProjectMilestone,
} from "@/content/clients/myosin";
import type { SowSection } from "@/content/clients/types";
import { myosin as myosinProposal } from "@/content/proposals/myosin";
import type {
  Body,
  BriefBlock,
  QuoteOption,
  Scope,
  Timeline,
} from "@/content/proposals/types";

type TabKey = "progress" | "agreement" | "proposal";

export function MyosinClientPage({
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
  const [tab, setTab] = useState<TabKey>("progress");

  // Deep-link support — /for/myosin#agreement, #proposal, or #progress
  // map to their respective tabs on mount and on hashchange.
  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === "agreement" || hash === "proposal" || hash === "progress") {
        setTab(hash);
      }
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Reflect the active tab in the URL hash so a refresh / share preserves
  // it. replaceState so the back button doesn't fill with tab toggles.
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
        ) : tab === "agreement" ? (
          <AgreementView initialSignature={initialSignature} />
        ) : (
          <ProposalView />
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
          aria-label="Honeybee"
        >
          🐝
        </span>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
          Private · {myosin.clientName}
        </p>
      </div>
      <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
        Myosin × Guil
      </h1>
      <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
        A shared workspace for the Hivemind launch video: the agreement to
        sign, the proposal it is built on, and a live view of where the project
        stands.
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
  const items: Array<{
    key: TabKey;
    label: string;
    Icon: typeof ListChecks;
  }> = [
    { key: "progress", label: "Progress", Icon: ListChecks },
    { key: "agreement", label: "Agreement", Icon: FileSignature },
    { key: "proposal", label: "Proposal", Icon: FileText },
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
// Progress view — fixed-fee project tracker (the one-off equivalent of
// Justice's billed-hours log).
// ---------------------------------------------------------------------
function ProgressView() {
  const { project, milestones, payments } = myosin;
  const paid = totalPaid(myosin);
  const outstanding = totalOutstanding(myosin);
  const done = milestonesComplete(myosin);

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <p className="self-end font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
          {done} of {milestones.length} milestones complete
        </p>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-3">
          <Stat
            label="Project fee"
            value={formatUsd(project.feeUsd)}
            sub={project.name}
          />
          <Stat
            label="Paid"
            value={formatUsd(paid)}
            sub={`Target delivery ${project.targetDelivery}`}
          />
          <Stat
            label={outstanding <= 0 ? "Status" : "Outstanding"}
            value={outstanding <= 0 ? "Paid in full" : formatUsd(outstanding)}
          />
        </div>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
          Milestones
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
                  {formatUsd(p.amountUsd)}
                </p>
                <PaymentPill status={p.status} />
              </div>
            </li>
          ))}
        </ul>
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
        {sub ?? " "}
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
  if (status === "paid") {
    return <StatusPill label="Paid" tone="positive" />;
  }
  if (status === "invoiced") {
    return <StatusPill label="Invoiced" tone="active" />;
  }
  return <StatusPill label="Due" tone="muted" />;
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
// Agreement view — the signable Service Agreement.
// ---------------------------------------------------------------------
function AgreementView({
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
  const { sow } = myosin;
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
          clientSlug="myosin"
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

// ---------------------------------------------------------------------
// Proposal view — renders the Myosin proposal data in the single-column
// dashboard width (a calm, scroll-light version of /for/[slug]).
// ---------------------------------------------------------------------
function ProposalView() {
  const p = myosinProposal;
  return (
    <article className="flex flex-col gap-16">
      <header className="flex flex-col gap-5">
        {p.hero.eyebrow ? (
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {p.hero.eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-[2.25rem] font-bold leading-[1.05] text-ink md:text-[3rem]">
          {p.hero.title}
          {p.hero.titleContinuation ? (
            <span className="block font-normal text-muted">
              {p.hero.titleContinuation}
            </span>
          ) : null}
        </h2>
        <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
          {p.hero.blurb}
        </p>
      </header>

      {p.brief ? (
        <ProposalSection label={p.brief.heading ?? "The brief"}>
          <div className="flex flex-col gap-12">
            {p.brief.blocks.map((block, i) => (
              <BriefBlockView key={i} block={block} />
            ))}
          </div>
        </ProposalSection>
      ) : null}

      {p.scope ? (
        <ProposalSection label={p.scope.heading ?? "Scope of work"}>
          <ScopeView data={p.scope} />
        </ProposalSection>
      ) : null}

      {p.timeline ? (
        <ProposalSection label={p.timeline.heading ?? "Timeline"}>
          <TimelineView data={p.timeline} />
        </ProposalSection>
      ) : null}

      {p.quote ? (
        <ProposalSection label="Quote">
          <div className="flex flex-col gap-6">
            {p.quote.options.map((option, i) => (
              <QuoteCard key={option.label || i} option={option} />
            ))}
            {p.quote.footnote ? (
              <p className="max-w-[620px] text-[0.9rem] leading-[1.5rem] text-muted">
                {p.quote.footnote}
              </p>
            ) : null}
          </div>
        </ProposalSection>
      ) : null}

      {p.terms ? (
        <ProposalSection label={p.terms.heading ?? "Terms"}>
          <BulletList items={p.terms.items} />
        </ProposalSection>
      ) : null}

      <ProposalSection label="Next step">
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="font-display text-[1.75rem] font-bold leading-tight text-ink md:text-[2rem]">
              {p.nextStep.heading}
            </h3>
            <p className="mt-5 max-w-[620px] text-[1rem] leading-[1.7rem] text-ink">
              {p.nextStep.body}
            </p>
          </div>
          <div>
            <CtaButton href={p.nextStep.ctaHref} label={p.nextStep.ctaLabel} />
          </div>
        </div>
      </ProposalSection>
    </article>
  );
}

function ProposalSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col">
      <div className="mb-8 border-t border-rule-soft pt-5">
        <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
          {label}
        </p>
      </div>
      {children}
    </section>
  );
}

function Paragraphs({ body }: { body: Body }) {
  const paras = Array.isArray(body) ? body : [body];
  return (
    <div className="flex flex-col gap-4">
      {paras.map((para, i) => (
        <p key={i} className="text-[1rem] leading-[1.7rem] text-ink">
          {para}
        </p>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3 text-[1rem] leading-[1.7rem] text-ink">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="select-none text-muted">
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function BriefBlockView({ block }: { block: BriefBlock }) {
  return (
    <div>
      <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {block.label}
      </p>
      <div className="mt-4">
        {"items" in block ? (
          <BriefMediaRow items={block.items} />
        ) : "list" in block ? (
          <BulletList items={block.list} />
        ) : (
          <Paragraphs body={block.body} />
        )}
      </div>
    </div>
  );
}

function ScopeView({ data }: { data: Scope }) {
  return (
    <div className="flex flex-col gap-10">
      {data.intro ? <Paragraphs body={data.intro} /> : null}

      {data.lists && data.lists.length > 0
        ? data.lists.map((group, i) => (
            <div key={i}>
              <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                {group.label}
              </p>
              <div className="mt-4">
                <BulletList items={group.list} />
              </div>
            </div>
          ))
        : null}

      {data.provides ? (
        <div className="border-t border-rule-soft pt-6">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {data.provides.label}
          </p>
          <div className="mt-3">
            <Paragraphs body={data.provides.body} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TimelineView({ data }: { data: Timeline }) {
  return (
    <div className="flex flex-col gap-8">
      {data.intro ? <Paragraphs body={data.intro} /> : null}
      <ol className="flex flex-col">
        {data.milestones.map((m, i) => {
          const isLast = i === data.milestones.length - 1;
          const isRevision = m.kind === "revision";
          return (
            <li key={i} className="relative flex gap-5 pb-8 last:pb-0">
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute left-[5px] top-4 bottom-0 w-px bg-rule"
                />
              ) : null}
              <span
                aria-hidden
                className={`relative z-10 mt-[6px] block h-[11px] w-[11px] shrink-0 rounded-full ${
                  isRevision ? "border border-ink bg-bg" : "bg-ink"
                }`}
              />
              <div className="flex flex-col gap-1">
                <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                  {m.label}
                </p>
                <h3 className="font-display text-[1.15rem] font-bold leading-tight text-ink">
                  {m.title}
                </h3>
                {m.body ? (
                  <p className="mt-1 text-[0.95rem] leading-[1.6rem] text-muted">
                    {m.body}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      {data.note ? (
        <div className="border-t border-rule-soft pt-6">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {data.note.label}
          </p>
          <div className="mt-3">
            <Paragraphs body={data.note.body} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function QuoteCard({ option }: { option: QuoteOption }) {
  return (
    <div
      className={`flex flex-col gap-5 rounded-[16px] border bg-transparent px-8 py-7 ${
        option.recommended ? "border-ink" : "border-rule"
      }`}
    >
      <div>
        {option.label || option.recommended ? (
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {option.label}
            {option.label && option.recommended ? " · " : ""}
            {option.recommended ? "Recommended" : ""}
          </p>
        ) : null}
        <h3
          className={`font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.75rem] ${
            option.label || option.recommended ? "mt-4" : ""
          }`}
        >
          {option.title}
        </h3>
      </div>

      {option.lead ? <Paragraphs body={option.lead} /> : null}

      <BulletList items={option.includes} />

      <div className="border-t border-rule-soft pt-5">
        {option.prices.map((price, i) => (
          <div key={i} className="flex items-baseline justify-between gap-4">
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              {price.label}
            </p>
            <div className="flex items-baseline gap-3">
              {price.previous ? (
                <p className="font-display text-[1.75rem] font-normal leading-none text-muted line-through md:text-[2rem]">
                  {price.previous}
                </p>
              ) : null}
              <p className="font-display text-[1.75rem] font-bold leading-none text-ink md:text-[2rem]">
                {price.amount}
              </p>
            </div>
          </div>
        ))}
        {option.priceNote ? (
          <p className="mt-5 text-[0.9rem] leading-[1.5rem] text-ink">
            {option.priceNote}
          </p>
        ) : null}
        {option.timeline ? (
          <p className="mt-2 text-[0.85rem] leading-[1.4rem] text-muted">
            {option.timeline}
          </p>
        ) : null}
      </div>

      {option.closing ? (
        <div className="border-t border-rule-soft pt-6">
          <Paragraphs body={option.closing} />
        </div>
      ) : null}
    </div>
  );
}
