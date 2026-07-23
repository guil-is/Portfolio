"use client";

import { useEffect, useState } from "react";
import { FileSignature, ListChecks } from "lucide-react";
import { AgreementSignature } from "@/components/AgreementSignature";
import { DefinitionList } from "@/components/DefinitionList";
import { Timeline } from "@/components/Timeline";
import type { SignedAgreement } from "@/lib/signed-agreement";
import {
  e2c,
  CLIENT_ENTITY,
  currentPhase,
  phaseStatus,
  type PhaseStatus,
} from "@/content/clients/e2c";
import type { SowSection } from "@/content/clients/types";

type TabKey = "agreement" | "progress";

export function E2cClientPage({
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
  const [tab, setTab] = useState<TabKey>("agreement");

  // Deep-link support — /for/e2c#agreement or #progress map to tabs.
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
        Private · {e2c.clientName}
      </p>
      <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
        E2C Cookbook × Guil
      </h1>
      <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
        {e2c.subtitle} The agreement to approve, and a live view of where
        the work stands.
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
    </div>
  );
}

// ---------------------------------------------------------------------
// Progress view — four phases on the shared Timeline, driven by the
// single `currentPhase` value in the data file.
// ---------------------------------------------------------------------
function ProgressView() {
  const { phases } = e2c;
  const current = currentPhase(e2c);
  const currentIndex = current ? e2c.currentPhase + 1 : phases.length;

  return (
    <div className="flex flex-col gap-14">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-3">
        <Stat
          label="Current phase"
          value={`${currentIndex} of ${phases.length}`}
          sub={current ? current.title : "All phases complete"}
        />
        <Stat
          label="Final delivery"
          value={e2c.finalDelivery}
          sub="Print PDF and web PDF"
        />
        <Stat
          label="Launch event"
          value={e2c.launchEvent}
          sub="One week of buffer after delivery"
        />
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
          Phases
        </h2>
        <Timeline
          entries={phases.map((phase, i) => {
            const status = phaseStatus(e2c, i);
            const meta = PHASE_META[status];
            return {
              eyebrow: `${phase.label} · ${phase.window}`,
              badge: <StatusPill label={meta.label} tone={meta.tone} />,
              state: meta.state,
              content: (
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h3 className="font-display text-[1.15rem] font-bold leading-tight text-ink md:text-[1.3rem]">
                    {phase.title}
                  </h3>
                  <p className="text-[0.95rem] leading-[1.6rem] text-muted">
                    {phase.description}
                  </p>
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
                </div>
              ),
            };
          })}
        />
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
  PhaseStatus,
  { label: string; tone: PillTone; state: "done" | "active" | "upcoming" }
> = {
  upcoming: { label: "Upcoming", tone: "muted", state: "upcoming" },
  in_progress: { label: "In progress", tone: "info", state: "active" },
  done: { label: "Done", tone: "positive", state: "done" },
};

// Status color language: grey = not yet, blue = in motion, green = done.
type PillTone = "muted" | "info" | "positive";

function StatusPill({ label, tone }: { label: string; tone: PillTone }) {
  const toneClass = {
    muted: "border-rule-soft bg-card/50 text-muted",
    info: "border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6]",
    positive: "border-accent/40 bg-accent/10 text-accent",
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

// ---------------------------------------------------------------------
// Agreement view — the signable Service Agreement.
// ---------------------------------------------------------------------
function AgreementView({
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
  const { sow } = e2c;
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
          clientSlug="e2c"
          acknowledgments={sow.acknowledgments}
          documentVersion={sow.version}
          initialSignature={initialSignature}
          clientEntity={CLIENT_ENTITY}
        />
      </section>
    </article>
  );
}

function AgreementSection({ section }: { section: SowSection }) {
  // The Timeline section renders its date/milestone rows as a vertical
  // timeline on the page; the same rows still print as a plain kv list in
  // the signed PDF, so the record stays complete and deterministic.
  const isTimeline = section.heading === "Timeline";
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
          if (isTimeline) {
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
