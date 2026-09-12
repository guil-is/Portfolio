"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Ban, ExternalLink, EyeOff, RotateCcw, Search } from "lucide-react";
import { formatEur } from "@/lib/expenses/triage";
import { CATEGORY_LABELS, type Category } from "@/lib/expenses/types";
import { loadSubsMeta, saveSubsMeta, type SubMeta, type SubRating } from "@/lib/expenses/books";
import {
  applySubsMeta,
  daysUntil,
  RATING_LABELS,
  RENEWAL_BUCKET_LABELS,
  renewalBucket,
  sortSubscriptions,
  websiteFor,
  type RenewalBucket,
  type SubSort,
  type TrackedSubscription,
} from "@/lib/expenses/subscriptions";
import { prettyDate } from "./ExpenseSwipeDeck";
import { Stat } from "./Stat";

/**
 * Subscriptions tab on /books. Layout borrowed from the recurring
 * views in Rocket Money / Monarch / Copilot: a summary strip, a search
 * box with filter chips and a sort menu, then rows grouped by when they
 * renew (or by how much you need them), each with a cleaned-up merchant
 * name, the price and cadence, the next charge, and a compact rating.
 * Ratings and "not a subscription" live in localStorage.
 */

type View = "all" | "monthly" | "yearly" | "unrated" | "cut" | "unseen" | "personal" | "undecided" | "cancelled" | "ignored";

const SORTS: [SubSort, string][] = [
  ["renewal", "Next renewal"],
  ["cost", "Most expensive"],
  ["rating", "Most needed"],
  ["name", "Name"],
];

const RATINGS: SubRating[] = [3, 2, 1];
const RATING_SHORT: Record<SubRating, string> = { 3: "Essential", 2: "Useful", 1: "Cut" };
const RATING_ON: Record<SubRating, string> = {
  3: "bg-up/15 text-up",
  2: "bg-ink/10 text-ink",
  1: "bg-down/15 text-down",
};

const RENEWAL_ORDER: RenewalBucket[] = ["week", "month", "quarter", "later"];

type Group = { key: string; label: string; rows: TrackedSubscription[]; hint: string };

export function SubscriptionsTab({ subs: tracked, today }: { subs: TrackedSubscription[]; today: string }) {
  const [meta, setMeta] = useState<Record<string, SubMeta>>(() => loadSubsMeta());
  const [sort, setSort] = useState<SubSort>("renewal");
  const [view, setView] = useState<View>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");

  function patch(key: string, p: SubMeta) {
    const next = { ...meta, [key]: { ...meta[key], ...p } };
    setMeta(next);
    saveSubsMeta(next);
  }

  const all = useMemo(() => applySubsMeta(tracked, meta), [tracked, meta]);
  // Totals and groups are about business plans; personal and undecided
  // charges are shown so nothing recurring hides, but don't count.
  const live = all.filter((s) => !s.ignored && !s.cancelledAt);
  const active = live.filter((s) => s.verdict === "business");
  const personal = live.filter((s) => s.verdict === "personal");
  const undecided = live.filter((s) => s.verdict === "undecided");
  const personalYearly = personal.reduce((t, s) => t + s.yearly, 0);
  const cancelled = all.filter((s) => !s.ignored && s.cancelledAt);
  const ignored = all.filter((s) => s.ignored);
  const cancelledThisYear = cancelled.filter((s) => s.cancelledAt!.startsWith(today.slice(0, 4)));
  const saved = cancelledThisYear.reduce((t, s) => t + s.yearly, 0);
  const rebilled = cancelled.filter((s) => s.chargedAfterCancel);
  const categories = [...new Set(active.map((s) => s.category))].sort((a, b) =>
    CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b]),
  );

  const yearly = active.reduce((t, s) => t + s.yearly, 0);
  const soon = active.filter((s) => daysUntil(s.nextRenewal, today) <= 30);
  const soonTotal = soon.reduce((t, s) => t + s.amount, 0);
  const soonYearly = soon.filter((s) => s.interval === "yearly");
  const cut = active.filter((s) => s.rating === 1);
  const cutTotal = cut.reduce((t, s) => t + s.yearly, 0);
  const unrated = active.filter((s) => !s.rating);
  const unseen = active.filter((s) => s.unseen);

  const q = query.trim().toLowerCase();
  const visible = sortSubscriptions(
    all
      .filter((s) => {
        const on = !s.ignored && !s.cancelledAt;
        const biz = on && s.verdict === "business";
        switch (view) {
          case "ignored":
            return s.ignored;
          case "cancelled":
            return !s.ignored && Boolean(s.cancelledAt);
          case "personal":
            return on && s.verdict === "personal";
          case "undecided":
            return on && s.verdict === "undecided";
          case "monthly":
          case "yearly":
            return biz && s.interval === view;
          case "unrated":
            return biz && !s.rating;
          case "cut":
            return biz && s.rating === 1;
          case "unseen":
            return biz && s.unseen;
          default:
            return on;
        }
      })
      .filter((s) => category === "all" || s.category === category)
      .filter((s) => !q || `${s.name} ${s.raw ?? ""} ${s.note ?? ""}`.toLowerCase().includes(q)),
    sort,
  );

  // Section the list the way the sort reads: by renewal window, or by rating.
  const groups = useMemo<Group[]>(() => {
    if (view === "cancelled") {
      const rows = [...visible].sort((a, b) => (b.cancelledAt ?? "").localeCompare(a.cancelledAt ?? ""));
      return rows.length > 0 ? [{ key: "cancelled", label: "Cancelled", rows, hint: `€${formatEur(rows.reduce((t, s) => t + s.yearly, 0))} a year no longer paid` }] : [];
    }
    if (sort === "renewal") {
      return RENEWAL_ORDER.map((b) => {
        const rows = visible.filter((s) => renewalBucket(daysUntil(s.nextRenewal, today)) === b);
        const due = rows.reduce((t, s) => t + s.amount, 0);
        return { key: b, label: RENEWAL_BUCKET_LABELS[b], rows, hint: `€${formatEur(due)} due` };
      }).filter((g) => g.rows.length > 0);
    }
    if (sort === "rating") {
      const levels: [string, string, (s: TrackedSubscription) => boolean][] = [
        ["3", RATING_LABELS[3], (s) => s.rating === 3],
        ["2", RATING_LABELS[2], (s) => s.rating === 2],
        ["1", RATING_LABELS[1], (s) => s.rating === 1],
        ["0", "Unrated", (s) => !s.rating],
      ];
      return levels
        .map(([key, label, test]) => {
          const rows = visible.filter(test);
          return { key, label, rows, hint: `€${formatEur(rows.reduce((t, s) => t + s.yearly, 0))} a year` };
        })
        .filter((g) => g.rows.length > 0);
    }
    return visible.length > 0 ? [{ key: "all", label: "", rows: visible, hint: "" }] : [];
  }, [visible, sort, view, today]);

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] transition-colors ${
      on ? "border-ink bg-ink text-bg" : "border-rule text-muted hover:border-ink hover:text-ink"
    }`;
  const toggle = (v: View) => setView(view === v ? "all" : v);

  const chips: [View, string, number | null][] = [
    ["all", "All", active.length],
    ["monthly", "Monthly", active.filter((s) => s.interval === "monthly").length],
    ["yearly", "Yearly", active.filter((s) => s.interval === "yearly").length],
    ["unrated", "Unrated", unrated.length],
    ["cut", "Could cut", cut.length],
    ["unseen", "Not in the books", unseen.length],
    ["undecided", "Undecided", undecided.length],
    ["personal", "Personal", personal.length],
    ["cancelled", "Cancelled", cancelled.length],
    ["ignored", "Hidden", ignored.length],
  ];

  return (
    <section className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule md:grid-cols-5">
        <Stat label="Per year, business" value={`€${formatEur(yearly)}`} sub={`${active.length} plans · €${formatEur(yearly / 12)} a month${personal.length > 0 ? ` · personal €${formatEur(personalYearly)}/yr on top` : ""}`} tone="down" />
        <Stat
          label="Next 30 days"
          value={`€${formatEur(soonTotal)}`}
          sub={soon.length === 0 ? "nothing due" : `${soon.length} charge${soon.length === 1 ? "" : "s"}${soonYearly.length > 0 ? ` · ${soonYearly.length} yearly: ${soonYearly.map((s) => s.name).join(", ")}` : ""}`}
          tone={soonYearly.length > 0 ? "warn" : "ink"}
        />
        <button type="button" onClick={() => toggle("cut")} className="flex h-full flex-col text-left transition-colors hover:bg-card/40">
          <Stat
            label="Could cut"
            value={`€${formatEur(cutTotal)}`}
            sub={cut.length > 0 ? `${cut.length} plan${cut.length === 1 ? "" : "s"} · ${Math.round((cutTotal / Math.max(1, yearly)) * 100)} % of the total` : "rate a plan “Cut” to see it here"}
            tone={cut.length > 0 ? "up" : "ink"}
          />
        </button>
        <button type="button" onClick={() => toggle("cancelled")} className="flex h-full flex-col text-left transition-colors hover:bg-card/40">
          <Stat
            label={`Cancelled in ${today.slice(0, 4)}`}
            value={`€${formatEur(saved)}`}
            sub={
              rebilled.length > 0
                ? `${rebilled.map((s) => s.name).join(", ")} charged again — check`
                : cancelledThisYear.length > 0
                  ? `${cancelledThisYear.length} plan${cancelledThisYear.length === 1 ? "" : "s"} · a year's worth saved`
                  : "mark a plan cancelled to count it"
            }
            tone={rebilled.length > 0 ? "warn" : saved > 0 ? "up" : "ink"}
          />
        </button>
        <button type="button" onClick={() => toggle("unrated")} className="flex h-full flex-col text-left transition-colors hover:bg-card/40">
          <Stat
            label="Unrated"
            value={String(unrated.length)}
            sub={unrated.length > 0 ? "tap to rate them" : "every plan is rated"}
            tone={unrated.length > 0 ? "warn" : "ink"}
          />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex h-9 flex-1 items-center gap-2 rounded-full border border-rule px-3 focus-within:border-ink">
            <Search className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plans"
              className="h-full w-full bg-transparent text-[0.85rem] text-ink placeholder:text-faint focus:outline-none"
            />
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "all")}
            className="h-9 rounded-full border border-rule bg-transparent px-3 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted focus:border-ink focus:outline-none"
          >
            <option value="all">Every category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <label className="flex h-9 items-center gap-2 rounded-full border border-rule px-3 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted focus-within:border-ink">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SubSort)}
              className="bg-transparent font-caption text-[10px] font-semibold uppercase tracking-[1px] text-ink focus:outline-none"
            >
              {SORTS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {chips
            .filter(([key, , n]) => key === "all" || key === "monthly" || key === "yearly" || (n ?? 0) > 0)
            .map(([key, label, n]) => (
              <button key={key} type="button" onClick={() => (key === "all" ? setView("all") : toggle(key))} className={`${chip(view === key)} ${key === "undecided" && view !== key ? "border-warn/60 text-warn" : ""}`}>
                {label}
                {n !== null ? <span className="ml-1.5 opacity-60">{n}</span> : null}
              </button>
            ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((g) => (
          <div key={g.key} className="flex flex-col gap-2">
            {g.label ? (
              <p className="flex items-baseline justify-between px-1 font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
                <span>
                  {g.label} <span className="ml-1 text-faint">{g.rows.length}</span>
                </span>
                <span className="tabular-nums text-faint">{g.hint}</span>
              </p>
            ) : null}
            <ul className="flex flex-col overflow-hidden rounded-[14px] border border-rule">
              {g.rows.map((s) => (
                <Row
                  key={s.key}
                  s={s}
                  today={today}
                  yearlyTotal={yearly}
                  onRate={(r) => patch(s.key, { rating: r })}
                  onHide={() => patch(s.key, { ignored: !s.ignored })}
                  onCancel={() => patch(s.key, { cancelledAt: s.cancelledAt ? null : today })}
                />
              ))}
            </ul>
          </div>
        ))}
        {groups.length === 0 ? (
          <p className="rounded-[14px] border border-rule px-4 py-10 text-center text-[0.9rem] text-muted">
            {tracked.length === 0 ? "No recurring charges found yet — import a year of N26 and they appear here." : "Nothing matches."}
          </p>
        ) : null}
      </div>

      <p className="text-[0.8rem] leading-[1.4rem] text-muted">
        Detected from every bank row in the books and the expenses session: a merchant charged at a steady cadence (monthly or yearly, amounts within 15 % of each other; two charges show as “confirm”). Personal and undecided charges are listed so nothing recurring hides, but only business plans count in the totals — decide the undecided ones on the expenses page. Known plans with a price step or a cancellation live in <code>src/content/books/subscriptions.ts</code> and override the detection. Ratings, cancellations and hidden rows stay in this browser. A cancelled plan that gets charged again is flagged — either the cancellation didn&apos;t take or you resubscribed; press the arrow to track it again.
      </p>
    </section>
  );
}

function Row({
  s,
  today,
  yearlyTotal,
  onRate,
  onHide,
  onCancel,
}: {
  s: TrackedSubscription;
  today: string;
  yearlyTotal: number;
  onRate: (r: SubRating | undefined) => void;
  onHide: () => void;
  onCancel: () => void;
}) {
  const cancelled = Boolean(s.cancelledAt);
  const days = daysUntil(s.nextRenewal, today);
  // Only yearly renewals get a colour — those are the decisions. Monthly
  // charges come round every month; shouting about them is noise.
  const dueTone = s.interval === "yearly" && days <= 7 ? "text-down" : s.interval === "yearly" && days <= 30 ? "text-warn" : "text-ink";
  const stepUp = s.nextAmount !== undefined && s.nextAmount > s.amount;
  const stepDown = s.nextAmount !== undefined && s.nextAmount < s.amount;
  const share = Math.round((s.yearly / Math.max(1, yearlyTotal)) * 100);
  const when = days <= 0 ? "today" : days === 1 ? "tomorrow" : days <= 30 ? `in ${days} days` : "";

  return (
    <li className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-rule px-4 py-3 last:border-b-0 md:grid-cols-[auto_minmax(0,1fr)_170px_130px_auto_auto] md:gap-x-4 ${s.ignored || (cancelled && !s.chargedAfterCancel) ? "opacity-60" : ""}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card font-display text-[0.95rem] font-bold text-ink" aria-hidden>
        {s.name.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-2 text-[0.95rem] font-medium text-ink">
          <a href={websiteFor(s)} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1.5 hover:underline">
            <span className="truncate">{s.name}</span>
            <ExternalLink className="h-3 w-3 shrink-0 text-faint" aria-hidden />
          </a>
          {s.chargedAfterCancel ? (
            <span className="shrink-0 rounded-full bg-down/15 px-2 py-0.5 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-down">charged again</span>
          ) : s.verdict === "undecided" && !cancelled ? (
            <Link href="/books?tab=import" className="shrink-0 rounded-full bg-warn/15 px-2 py-0.5 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-warn hover:underline">undecided · triage</Link>
          ) : s.verdict === "personal" && !cancelled ? (
            <span className="shrink-0 rounded-full bg-card px-2 py-0.5 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-muted">personal</span>
          ) : cancelled ? (
            <span className="shrink-0 rounded-full bg-card px-2 py-0.5 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-muted">cancelled</span>
          ) : s.unseen ? (
            <span className="shrink-0 rounded-full bg-warn/15 px-2 py-0.5 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-warn">not in the books</span>
          ) : null}
        </p>
        <p className="truncate text-[0.8rem] text-muted">
          {CATEGORY_LABELS[s.category]}
          {s.source === "detected" ? (
            <span className={`ml-2 font-caption text-[9px] font-semibold uppercase tracking-[1px] ${s.tentative ? "text-warn" : "text-faint"}`}>
              {s.charges} charges{s.tentative ? " · confirm" : ""}
            </span>
          ) : null}
          {s.raw ? <span className="text-faint"> · {s.raw}</span> : null}
          {s.note ? <span> · {s.note}</span> : null}
        </p>
      </div>

      <div className="col-span-3 min-w-0 text-[0.8rem] md:col-span-1">
        {cancelled ? (
          <p className={s.chargedAfterCancel ? "text-down" : "text-muted"}>Cancelled {prettyDate(s.cancelledAt!)}</p>
        ) : (
          <p className={dueTone}>
            {when ? <span className="font-medium">{when}</span> : null}
            {when ? " · " : "Renews "}
            {prettyDate(s.nextRenewal)}
          </p>
        )}
        <p className={`truncate text-[0.75rem] ${s.chargedAfterCancel ? "text-down" : "text-faint"}`}>{s.lastCharge ? `Last charged ${prettyDate(s.lastCharge)}` : "Not charged yet"}</p>
      </div>

      <div className="col-start-3 row-start-1 text-right md:col-start-4 md:row-auto">
        <p className="font-display text-[1rem] font-bold tabular-nums text-ink">
          €{formatEur(s.amount)}
          <span className="ml-1 font-caption text-[9px] font-semibold uppercase tracking-[1px] text-faint">/{s.interval === "monthly" ? "mo" : "yr"}</span>
        </p>
        <p className={`text-[0.75rem] tabular-nums ${cancelled ? "text-up" : stepUp ? "text-warn" : stepDown ? "text-up" : "text-muted"}`} title={s.nextAmount !== undefined && s.nextAmount !== s.amount ? `€${formatEur(s.nextAmount)} from the next term` : undefined}>
          {cancelled ? `saves €${formatEur(s.yearly)}/yr` : `${stepUp ? "↑ " : stepDown ? "↓ " : ""}€${formatEur(s.yearly)}/yr${s.verdict === "business" ? ` · ${share} %` : ""}`}
        </p>
      </div>

      <div className="col-span-2 flex items-center gap-2 md:col-span-1 md:col-start-5" role="radiogroup" aria-label={`How needed is ${s.name}`}>
        <span className={`inline-flex overflow-hidden rounded-full border border-rule ${s.verdict !== "business" ? "invisible" : ""}`}>
          {RATINGS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={s.rating === r}
              title={RATING_LABELS[r]}
              onClick={() => onRate(s.rating === r ? undefined : r)}
              className={`px-2.5 py-1 font-caption text-[9px] font-semibold uppercase tracking-[1px] transition-colors ${
                s.rating === r ? RATING_ON[r] : "text-faint hover:bg-card/60 hover:text-ink"
              }`}
            >
              {RATING_SHORT[r]}
            </button>
          ))}
        </span>
      </div>

      <span className="flex items-center justify-self-end md:col-start-6">
        {s.ignored ? null : (
          <button
            type="button"
            title={cancelled ? "Resubscribed — track it again" : "I cancelled this"}
            onClick={onCancel}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-card/60 ${cancelled ? "text-ink" : "text-faint hover:text-down"}`}
          >
            {cancelled ? <RotateCcw className="h-3.5 w-3.5" aria-hidden /> : <Ban className="h-3.5 w-3.5" aria-hidden />}
          </button>
        )}
        <button
          type="button"
          title={s.ignored ? "Track again" : "Not a subscription — hide it"}
          onClick={onHide}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-faint transition-colors hover:bg-card/60 hover:text-ink"
        >
          {s.ignored ? <RotateCcw className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
        </button>
      </span>
    </li>
  );
}
