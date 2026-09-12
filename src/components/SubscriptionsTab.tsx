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
import { cn } from "@/lib/utils";
import { prettyDate } from "./ExpenseSwipeDeck";
import { StatStrip, StatTile } from "./finance/Kpi";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";

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
  3: "bg-fd-card text-fd-up shadow-sm",
  2: "bg-fd-card text-foreground shadow-sm",
  1: "bg-fd-card text-fd-down shadow-sm",
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
      <StatStrip className="md:grid-cols-5">
        <StatTile label="Per year, business" value={`€${formatEur(yearly)}`} sub={`${active.length} plans · €${formatEur(yearly / 12)} a month${personal.length > 0 ? ` · personal €${formatEur(personalYearly)}/yr on top` : ""}`} tone="down" />
        <StatTile
          label="Next 30 days"
          value={`€${formatEur(soonTotal)}`}
          sub={soon.length === 0 ? "nothing due" : `${soon.length} charge${soon.length === 1 ? "" : "s"}${soonYearly.length > 0 ? ` · ${soonYearly.length} yearly: ${soonYearly.map((s) => s.name).join(", ")}` : ""}`}
          tone={soonYearly.length > 0 ? "warn" : undefined}
        />
        <StatTile
          label="Could cut"
          value={`€${formatEur(cutTotal)}`}
          sub={cut.length > 0 ? `${cut.length} plan${cut.length === 1 ? "" : "s"} · ${Math.round((cutTotal / Math.max(1, yearly)) * 100)} % of the total` : "rate a plan “Cut” to see it here"}
          tone={cut.length > 0 ? "up" : undefined}
          onClick={() => toggle("cut")}
          active={view === "cut"}
        />
        <StatTile
          label={`Cancelled in ${today.slice(0, 4)}`}
          value={`€${formatEur(saved)}`}
          sub={
            rebilled.length > 0
              ? `${rebilled.map((s) => s.name).join(", ")} charged again — check`
              : cancelledThisYear.length > 0
                ? `${cancelledThisYear.length} plan${cancelledThisYear.length === 1 ? "" : "s"} · a year's worth saved`
                : "mark a plan cancelled to count it"
          }
          tone={rebilled.length > 0 ? "warn" : saved > 0 ? "up" : undefined}
          onClick={() => toggle("cancelled")}
          active={view === "cancelled"}
        />
        <StatTile label="Unrated" value={String(unrated.length)} sub={unrated.length > 0 ? "tap to rate them" : "every plan is rated"} tone={unrated.length > 0 ? "warn" : undefined} onClick={() => toggle("unrated")} active={view === "unrated"} />
      </StatStrip>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fd-muted-foreground" aria-hidden />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search plans" className="h-9 pl-9" />
          </div>
          <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as Category | "all")} aria-label="Category">
            <NativeSelectOption value="all">Every category</NativeSelectOption>
            {categories.map((c) => (
              <NativeSelectOption key={c} value={c}>{CATEGORY_LABELS[c]}</NativeSelectOption>
            ))}
          </NativeSelect>
          <NativeSelect value={sort} onChange={(e) => setSort(e.target.value as SubSort)} aria-label="Sort">
            {SORTS.map(([key, label]) => (
              <NativeSelectOption key={key} value={key}>Sort · {label}</NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {chips
            .filter(([key, , n]) => key === "all" || key === "monthly" || key === "yearly" || (n ?? 0) > 0)
            .map(([key, label, n]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={view === key ? "default" : "outline"}
                onClick={() => (key === "all" ? setView("all") : toggle(key))}
                className={cn("h-7 rounded-full px-3 text-xs", key === "undecided" && view !== key && "border-fd-warn/60 text-fd-warn")}
              >
                {label}
                {n !== null ? <span className="opacity-60">{n}</span> : null}
              </Button>
            ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((g) => (
          <div key={g.key} className="flex flex-col gap-2">
            {g.label ? (
              <p className="flex items-baseline justify-between px-1 text-[11px] font-semibold uppercase tracking-wide text-fd-muted-foreground">
                <span>
                  {g.label} <span className="ml-1 opacity-60">{g.rows.length}</span>
                </span>
                <span className="tabular-nums opacity-60">{g.hint}</span>
              </p>
            ) : null}
            <ul className="flex flex-col divide-y overflow-hidden rounded-xl border">
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
          <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-fd-muted-foreground">
            {tracked.length === 0 ? "No recurring charges found yet — import a year of N26 and they appear here." : "Nothing matches."}
          </p>
        ) : null}
      </div>

      <p className="text-xs leading-5 text-fd-muted-foreground">
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
  const dueTone = s.interval === "yearly" && days <= 7 ? "text-fd-down" : s.interval === "yearly" && days <= 30 ? "text-fd-warn" : "";
  const stepUp = s.nextAmount !== undefined && s.nextAmount > s.amount;
  const stepDown = s.nextAmount !== undefined && s.nextAmount < s.amount;
  const share = Math.round((s.yearly / Math.max(1, yearlyTotal)) * 100);
  const when = days <= 0 ? "today" : days === 1 ? "tomorrow" : days <= 30 ? `in ${days} days` : "";

  return (
    <li className={cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 md:grid-cols-[auto_minmax(0,1fr)_170px_130px_auto_auto] md:gap-x-4", (s.ignored || (cancelled && !s.chargedAfterCancel)) && "opacity-60")}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fd-muted text-sm font-semibold" aria-hidden>
        {s.name.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
          <a href={websiteFor(s)} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1.5 hover:underline">
            <span className="truncate">{s.name}</span>
            <ExternalLink className="size-3 shrink-0 text-fd-muted-foreground/60" aria-hidden />
          </a>
          {s.chargedAfterCancel ? (
            <Badge className="border-transparent bg-fd-down/12 text-fd-down">charged again</Badge>
          ) : s.verdict === "undecided" && !cancelled ? (
            <Badge asChild className="border-transparent bg-fd-warn/15 text-fd-warn">
              <Link href="/books?tab=import">undecided · triage</Link>
            </Badge>
          ) : s.verdict === "personal" && !cancelled ? (
            <Badge variant="secondary">personal</Badge>
          ) : cancelled ? (
            <Badge variant="secondary">cancelled</Badge>
          ) : s.unseen ? (
            <Badge className="border-transparent bg-fd-warn/15 text-fd-warn">not in the books</Badge>
          ) : null}
        </p>
        <p className="truncate text-xs text-fd-muted-foreground">
          {CATEGORY_LABELS[s.category]}
          {s.source === "detected" ? (
            <span className={cn("ml-2 text-[10px] font-semibold uppercase tracking-wide", s.tentative ? "text-fd-warn" : "opacity-70")}>
              {s.charges} charges{s.tentative ? " · confirm" : ""}
            </span>
          ) : null}
          {s.raw ? <span className="opacity-70"> · {s.raw}</span> : null}
          {s.note ? <span> · {s.note}</span> : null}
        </p>
      </div>

      <div className="col-span-3 min-w-0 text-xs md:col-span-1">
        {cancelled ? (
          <p className={s.chargedAfterCancel ? "text-fd-down" : "text-fd-muted-foreground"}>Cancelled {prettyDate(s.cancelledAt!)}</p>
        ) : (
          <p className={dueTone}>
            {when ? <span className="font-medium">{when}</span> : null}
            {when ? " · " : "Renews "}
            {prettyDate(s.nextRenewal)}
          </p>
        )}
        <p className={cn("truncate text-[11px]", s.chargedAfterCancel ? "text-fd-down" : "text-fd-muted-foreground/70")}>{s.lastCharge ? `Last charged ${prettyDate(s.lastCharge)}` : "Not charged yet"}</p>
      </div>

      <div className="col-start-3 row-start-1 text-right md:col-start-4 md:row-auto">
        <p className="text-base font-semibold tabular-nums">
          €{formatEur(s.amount)}
          <span className="ml-1 text-[10px] font-medium text-fd-muted-foreground">/{s.interval === "monthly" ? "mo" : "yr"}</span>
        </p>
        <p className={cn("text-[11px] tabular-nums", cancelled ? "text-fd-up" : stepUp ? "text-fd-warn" : stepDown ? "text-fd-up" : "text-fd-muted-foreground")} title={s.nextAmount !== undefined && s.nextAmount !== s.amount ? `€${formatEur(s.nextAmount)} from the next term` : undefined}>
          {cancelled ? `saves €${formatEur(s.yearly)}/yr` : `${stepUp ? "↑ " : stepDown ? "↓ " : ""}€${formatEur(s.yearly)}/yr${s.verdict === "business" ? ` · ${share} %` : ""}`}
        </p>
      </div>

      <div className="col-span-2 flex items-center gap-2 md:col-span-1 md:col-start-5" role="radiogroup" aria-label={`How needed is ${s.name}`}>
        <span className={cn("inline-flex rounded-lg bg-fd-muted p-[2px]", s.verdict !== "business" && "invisible")}>
          {RATINGS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={s.rating === r}
              title={RATING_LABELS[r]}
              onClick={() => onRate(s.rating === r ? undefined : r)}
              className={cn("rounded-md px-2 py-1 text-[11px] font-medium transition-colors", s.rating === r ? RATING_ON[r] : "text-fd-muted-foreground hover:text-foreground")}
            >
              {RATING_SHORT[r]}
            </button>
          ))}
        </span>
      </div>

      <span className="flex items-center justify-self-end md:col-start-6">
        {s.ignored ? null : (
          <Button type="button" variant="ghost" size="icon-sm" title={cancelled ? "Resubscribed — track it again" : "I cancelled this"} onClick={onCancel} className={cancelled ? "" : "text-fd-muted-foreground/70 hover:text-fd-down"}>
            {cancelled ? <RotateCcw aria-hidden /> : <Ban aria-hidden />}
          </Button>
        )}
        <Button type="button" variant="ghost" size="icon-sm" title={s.ignored ? "Track again" : "Not a subscription — hide it"} onClick={onHide} className="text-fd-muted-foreground/70">
          {s.ignored ? <RotateCcw aria-hidden /> : <EyeOff aria-hidden />}
        </Button>
      </span>
    </li>
  );
}
