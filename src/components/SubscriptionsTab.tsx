"use client";

import { useMemo, useState } from "react";
import { ExternalLink, EyeOff, RotateCcw } from "lucide-react";
import { formatEur } from "@/lib/expenses/triage";
import { CATEGORY_LABELS, type Category } from "@/lib/expenses/types";
import { loadSubsMeta, saveSubsMeta, type SubMeta, type SubRating } from "@/lib/expenses/books";
import {
  applySubsMeta,
  RATING_LABELS,
  sortSubscriptions,
  websiteFor,
  type SubSort,
  type TrackedSubscription,
} from "@/lib/expenses/subscriptions";
import { prettyDate } from "./ExpenseSwipeDeck";
import { Stat } from "./Stat";

/**
 * Subscriptions tab on /for/books: every recurring charge, sortable by
 * what renews next, what costs most, or how much you need it. Ratings
 * and "not a subscription" live in localStorage next to the books.
 */

type Cadence = "all" | "monthly" | "yearly";
type Show = "active" | "unseen" | "ignored";

const SORTS: [SubSort, string][] = [
  ["renewal", "Next renewal"],
  ["cost", "Most expensive"],
  ["rating", "Most needed"],
  ["name", "A–Z"],
];

const RATINGS: SubRating[] = [3, 2, 1];

const RATING_TONE: Record<SubRating, string> = {
  3: "border-up text-up",
  2: "border-ink text-ink",
  1: "border-down text-down",
};

const DAY = 86_400_000;

export function SubscriptionsTab({ subs: tracked, today }: { subs: TrackedSubscription[]; today: string }) {
  const [meta, setMeta] = useState<Record<string, SubMeta>>(() => loadSubsMeta());
  const [sort, setSort] = useState<SubSort>("renewal");
  const [cadence, setCadence] = useState<Cadence>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [show, setShow] = useState<Show>("active");

  function patch(key: string, p: SubMeta) {
    const next = { ...meta, [key]: { ...meta[key], ...p } };
    setMeta(next);
    saveSubsMeta(next);
  }

  const all = useMemo(() => applySubsMeta(tracked, meta), [tracked, meta]);
  const active = all.filter((s) => !s.ignored);
  const ignored = all.filter((s) => s.ignored);
  const categories = [...new Set(active.map((s) => s.category))].sort((a, b) =>
    CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b]),
  );

  const yearly = active.reduce((t, s) => t + s.yearly, 0);
  const soon = active.filter((s) => s.nextRenewal <= addDaysIso(today, 30));
  const soonTotal = soon.reduce((t, s) => t + (s.interval === "yearly" ? s.yearly : s.amount), 0);
  const cut = active.filter((s) => s.rating === 1);
  const cutTotal = cut.reduce((t, s) => t + s.yearly, 0);
  const unrated = active.filter((s) => !s.rating).length;
  const maxYearly = Math.max(1, ...active.map((s) => s.yearly));

  const visible = sortSubscriptions(
    all
      .filter((s) => (show === "ignored" ? s.ignored : show === "unseen" ? !s.ignored && s.unseen : !s.ignored))
      .filter((s) => cadence === "all" || s.interval === cadence)
      .filter((s) => category === "all" || s.category === category),
    sort,
  );

  const pill = (on: boolean) =>
    `rounded-full border px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] transition-colors ${
      on ? "border-ink bg-ink text-bg" : "border-rule text-muted hover:border-ink hover:text-ink"
    }`;

  return (
    <section className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule md:grid-cols-4">
        <Stat label="Recurring per year" value={`€${formatEur(yearly)}`} sub={`${active.length} subscriptions · €${formatEur(yearly / 12)} a month`} tone="down" />
        <Stat
          label="Renewing in 30 days"
          value={`€${formatEur(soonTotal)}`}
          sub={soon.map((s) => s.name).join(", ") || "nothing due"}
          tone={soon.length > 0 ? "warn" : "ink"}
        />
        <Stat
          label="Could cut"
          value={`€${formatEur(cutTotal)}`}
          sub={cut.length > 0 ? `${cut.length} rated “could cut” · ${Math.round((cutTotal / Math.max(1, yearly)) * 100)} % of the total` : "nothing rated “could cut” yet"}
          tone={cut.length > 0 ? "up" : "ink"}
        />
        <Stat
          label="Unrated"
          value={String(unrated)}
          sub={unrated > 0 ? "rate them below to see what you can drop" : "every plan has a rating"}
          tone={unrated > 0 ? "warn" : "ink"}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">Sort</span>
          {SORTS.map(([key, label]) => (
            <button key={key} type="button" onClick={() => setSort(key)} className={pill(sort === key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">Show</span>
          {(
            [
              ["all", "All"],
              ["monthly", "Monthly"],
              ["yearly", "Yearly"],
            ] as [Cadence, string][]
          ).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setCadence(key)} className={pill(cadence === key)}>
              {label}
            </button>
          ))}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "all")}
            className="rounded-full border border-rule bg-transparent px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted focus:border-ink focus:outline-none"
          >
            <option value="all">Every category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <span className="mx-1 h-4 w-px bg-rule" />
          <button type="button" onClick={() => setShow(show === "unseen" ? "active" : "unseen")} className={pill(show === "unseen")}>
            Not seen in the books · {active.filter((s) => s.unseen).length}
          </button>
          {ignored.length > 0 ? (
            <button type="button" onClick={() => setShow(show === "ignored" ? "active" : "ignored")} className={pill(show === "ignored")}>
              Ignored · {ignored.length}
            </button>
          ) : null}
        </div>
      </div>

      <ul className="flex flex-col overflow-hidden rounded-[14px] border border-rule">
        {visible.map((s) => {
          const days = Math.round((Date.parse(s.nextRenewal) - Date.parse(today)) / DAY);
          const dueTone = days <= 7 ? "text-down" : days <= 30 ? "text-warn" : "text-muted";
          const stepUp = s.nextAmount !== undefined && s.nextAmount > s.amount;
          const stepDown = s.nextAmount !== undefined && s.nextAmount < s.amount;
          return (
            <li
              key={s.key}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 border-b border-rule px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1fr)_150px_150px_auto_32px] md:items-center ${
                s.ignored ? "opacity-50" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-[0.95rem] font-medium text-ink">
                  <a href={websiteFor(s)} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 hover:underline">
                    <span className="truncate">{s.name}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-faint" aria-hidden />
                  </a>
                </p>
                <p className="flex flex-wrap items-baseline gap-x-2 text-[0.8rem] text-muted">
                  {CATEGORY_LABELS[s.category]}
                  <span className="font-caption text-[9px] font-semibold uppercase tracking-[1px] text-faint">
                    {s.source === "registry" ? "known plan" : `${s.charges} charges`}
                  </span>
                  {s.unseen ? <span className="font-caption text-[9px] font-semibold uppercase tracking-[1px] text-warn">not seen in the books</span> : null}
                </p>
                {s.note ? <p className="truncate text-[0.8rem] text-muted">{s.note}</p> : null}
              </div>

              <div className="justify-self-end text-right md:col-start-2" title={s.nextAmount !== undefined && s.nextAmount !== s.amount ? `€${formatEur(s.nextAmount)} from the next term` : undefined}>
                <p className="font-display text-[1rem] font-bold tabular-nums text-ink">
                  €{formatEur(s.amount)}
                  <span className="ml-1 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-faint">/{s.interval === "monthly" ? "mo" : "yr"}</span>
                </p>
                <p className={`text-[0.75rem] tabular-nums ${stepUp ? "text-warn" : stepDown ? "text-up" : "text-muted"}`}>
                  {stepUp ? "↑ " : stepDown ? "↓ " : ""}€{formatEur(s.yearly)}/yr · {Math.round((s.yearly / Math.max(1, yearly)) * 100)} %
                </p>
                <span className="mt-1 block h-[3px] w-full overflow-hidden rounded-full bg-rule-soft">
                  <span className="block h-full rounded-full bg-down/70" style={{ width: `${Math.max(3, (s.yearly / maxYearly) * 100)}%` }} />
                </span>
              </div>

              <div className="col-span-2 text-[0.8rem] md:col-span-1 md:col-start-3">
                <p className={dueTone}>
                  {prettyDate(s.nextRenewal)}
                </p>
                <p className="text-[0.75rem] text-faint">
                  {days <= 30 ? <span className={dueTone}>in {days} day{days === 1 ? "" : "s"} · </span> : null}
                  {s.lastCharge ? `last ${prettyDate(s.lastCharge)}` : "not charged yet"}
                </p>
              </div>

              <div className="col-span-2 flex gap-1 md:col-span-1 md:col-start-4" role="radiogroup" aria-label={`How needed is ${s.name}`}>
                {RATINGS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={s.rating === r}
                    title={RATING_LABELS[r]}
                    onClick={() => patch(s.key, { rating: s.rating === r ? undefined : r })}
                    className={`rounded-full border px-2 py-0.5 font-caption text-[9px] font-semibold uppercase tracking-[1px] transition-colors ${
                      s.rating === r ? RATING_TONE[r] : "border-rule text-faint hover:border-ink hover:text-ink"
                    }`}
                  >
                    {RATING_LABELS[r]}
                  </button>
                ))}
              </div>

              <button
                type="button"
                title={s.ignored ? "Track again" : "Not a subscription — hide it"}
                onClick={() => patch(s.key, { ignored: !s.ignored })}
                className="inline-flex h-8 w-8 items-center justify-center justify-self-end rounded-full border border-rule text-muted transition-colors hover:border-ink hover:text-ink md:col-start-5"
              >
                {s.ignored ? <RotateCcw className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
              </button>
            </li>
          );
        })}
        {visible.length === 0 ? (
          <li className="px-4 py-10 text-center text-[0.9rem] text-muted">
            {tracked.length === 0 ? "No recurring charges found yet — import a year of N26 and they appear here." : "Nothing matches these filters."}
          </li>
        ) : null}
      </ul>

      <p className="text-[0.8rem] leading-[1.4rem] text-muted">
        Detected from the books: a merchant charged at a steady cadence (3+ monthly or 2 yearly charges within 15 % of each other). Known plans with a price step or a planned cancellation live in <code>src/content/books/subscriptions.ts</code> and override the detection. Ratings and hidden rows stay in this browser.
      </p>
    </section>
  );
}

function addDaysIso(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY).toISOString().slice(0, 10);
}
