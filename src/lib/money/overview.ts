/**
 * The money page's numbers, as pure functions over what the other pages
 * already keep: the year picture (books + ledger + tax), tracked
 * subscriptions, unpaid invoices, and the balances you typed in.
 */

import type { BookEntry } from "@/lib/expenses/books";
import { CATEGORY_LABELS, type Category } from "@/lib/expenses/types";
import type { YearPicture } from "@/lib/expenses/estimate";
import { daysUntil, nextRenewalFrom, type TrackedSubscription } from "@/lib/expenses/subscriptions";
import type { IncomeMonth, Receivable } from "@/lib/income";
import { inEur, isAsset, type Account } from "./accounts";
import { daysSince, EXPECTED_KIND_LABELS, type Expected } from "./expected";

const DAY = 86_400_000;

export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY).toISOString().slice(0, 10);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/* ---------- headline numbers ---------- */

export type Kpis = {
  /** Every asset account, in EUR (tax set-aside included). */
  cash: number;
  /** Accounts marked as tax set-aside. */
  taxReserve: number;
  /** Assets minus debts, every kind. */
  netWorth: number;
  /** Everything owed to you, in EUR: unpaid invoices + open expected money. */
  owedToYou: number;
  owedInvoices: number;
  owedExpected: number;
  /** Instalments still to pay + projected year-end income-tax bill + VAT still to pay. */
  taxOwed: number;
  /** Cash minus tax owed. */
  free: number;
  /** Average business outgoings per month over the last three full months (expenses + health/KSK/pension). */
  burn: number;
  /** Months the free cash covers at that burn; null when burn is unknown. */
  runwayMonths: number | null;
  /** Accounts never updated or older than 30 days. */
  staleAccounts: Account[];
};

export function kpis(input: {
  accounts: Account[];
  usdRate: number;
  picture: YearPicture;
  receivables: Receivable[];
  expected?: Expected[];
  /** Every book row, all years. */
  entries: BookEntry[];
  today: string;
}): Kpis {
  const { accounts, usdRate, picture, receivables, entries, today } = input;
  const expected = (input.expected ?? []).filter((e) => e.status === "open");
  const assets = accounts.filter((a) => isAsset(a.kind));
  const cash = assets.reduce((t, a) => t + inEur(a, usdRate), 0);
  const taxReserve = assets.filter((a) => a.kind === "tax").reduce((t, a) => t + inEur(a, usdRate), 0);
  const debts = accounts.filter((a) => !isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const owedInvoices = receivables.reduce((t, r) => t + (r.currency === "USD" ? r.total * usdRate : r.total), 0);
  const owedExpected = expected.reduce((t, e) => t + (e.currency === "USD" ? e.amount * usdRate : e.amount), 0);
  const owedToYou = owedInvoices + owedExpected;
  const taxOwed = picture.stillDue + Math.max(0, picture.projected.incomeTaxDue) + Math.max(0, picture.soFar.vatDue);
  const burn = monthlyBurn(entries, today);
  const free = cash - taxOwed;
  const stale = accounts.filter((a) => !a.updatedAt || daysUntil(a.updatedAt.slice(0, 10), today) < -30);
  return {
    cash,
    taxReserve,
    netWorth: cash - debts,
    owedToYou,
    owedInvoices,
    owedExpected,
    taxOwed,
    free,
    burn,
    runwayMonths: burn > 0 ? free / burn : null,
    staleAccounts: stale,
  };
}

/** Business expenses + health/KSK/pension per month, averaged over the last three full months. */
export function monthlyBurn(entries: BookEntry[], today: string): number {
  const months: string[] = [];
  const d = new Date(`${today.slice(0, 7)}-01T00:00:00Z`);
  for (let i = 1; i <= 3; i++) {
    const m = new Date(d);
    m.setUTCMonth(m.getUTCMonth() - i);
    months.push(m.toISOString().slice(0, 7));
  }
  const total = entries
    .filter((e) => months.includes(monthKey(e.date)) && (e.kind === "expense" || (e.kind === "tax" && e.category === "health")))
    .reduce((t, e) => t + e.amount, 0);
  return total / 3;
}

/* ---------- cash flow by month ---------- */

export type CashflowMonth = { month: string; income: number; expenses: number };

/** The last `count` calendar months ending this month: money received vs business expenses booked. */
export function cashflowMonths(input: { incomeMonths: IncomeMonth[]; entries: BookEntry[]; usdRate: number; today: string; count?: number }): CashflowMonth[] {
  const { incomeMonths, entries, usdRate, today } = input;
  const count = input.count ?? 12;
  const keys: string[] = [];
  const d = new Date(`${today.slice(0, 7)}-01T00:00:00Z`);
  for (let i = count - 1; i >= 0; i--) {
    const m = new Date(d);
    m.setUTCMonth(m.getUTCMonth() - i);
    keys.push(m.toISOString().slice(0, 7));
  }
  const income = new Map(incomeMonths.map((m) => [m.month, m.eurNet + m.usd * usdRate]));
  const manual = new Map<string, number>();
  const expenses = new Map<string, number>();
  for (const e of entries) {
    const k = monthKey(e.date);
    if (e.kind === "expense") expenses.set(k, (expenses.get(k) ?? 0) + e.amount);
    else if (e.kind === "income" && e.source !== "ledger") manual.set(k, (manual.get(k) ?? 0) + (e.vat === 19 ? e.amount / 1.19 : e.amount));
  }
  return keys.map((month) => ({
    month,
    income: (income.get(month) ?? 0) + (manual.get(month) ?? 0),
    expenses: expenses.get(month) ?? 0,
  }));
}

/* ---------- what's coming ---------- */

export type UpcomingKind = "tax" | "invoice" | "subscription" | "expected";

export type UpcomingItem = {
  id: string;
  date: string;
  label: string;
  detail?: string;
  /** Signed: money in positive, money out negative. EUR. */
  amount: number;
  kind: UpcomingKind;
  href?: string;
  overdue?: boolean;
  /** Subscriptions only — the list rolls monthly plans up per month. */
  interval?: "monthly" | "yearly";
  personal?: boolean;
  /** Expected money: uncertain, entered by hand. `refId` is the record to close. */
  expected?: boolean;
  refId?: string;
};

export function upcomingItems(input: {
  picture: YearPicture;
  subs: TrackedSubscription[];
  receivables: Receivable[];
  expected?: Expected[];
  usdRate: number;
  today: string;
  horizonDays?: number;
}): UpcomingItem[] {
  const { picture, subs, receivables, usdRate, today } = input;
  const horizon = addDays(today, input.horizonDays ?? 90);
  const out: UpcomingItem[] = [];
  for (const e of input.expected ?? []) {
    if (e.status !== "open" || e.expectedBy > horizon) continue;
    const late = e.expectedBy < today;
    out.push({
      id: `exp-${e.id}`,
      refId: e.id,
      date: e.expectedBy,
      label: `${e.from} · ${e.label}`,
      detail: `${EXPECTED_KIND_LABELS[e.kind].toLowerCase()} · filed ${daysSince(e.filedAt, today)} days ago${e.reference ? ` · ${e.reference}` : ""}${late ? " · later than expected" : " · expected, not certain"}`,
      amount: e.currency === "USD" ? e.amount * usdRate : e.amount,
      kind: "expected",
      expected: true,
      overdue: late,
    });
  }
  for (const s of picture.unpaid) {
    if (s.due > horizon) continue;
    out.push({
      id: `tax-${s.due}`,
      date: s.due,
      label: "Finanzamt · ESt-Vorauszahlung",
      detail: s.due < today ? "overdue — Säumniszuschlag accrues monthly" : "quarterly instalment set by the Bescheid",
      amount: -s.amount,
      kind: "tax",
      href: "/books",
      overdue: s.due < today,
    });
  }
  for (const r of receivables) {
    if (r.dueAt > horizon) continue;
    out.push({
      id: `inv-${r.number}`,
      date: r.dueAt,
      label: `${r.client} · ${r.number}`,
      detail: r.dueAt < today ? `${-daysUntil(r.dueAt, today)} days overdue` : `invoice due${r.currency === "USD" ? ` · $${r.total.toLocaleString("en", { minimumFractionDigits: 2 })}` : ""}`,
      amount: r.currency === "USD" ? r.total * usdRate : r.total,
      kind: "invoice",
      href: r.clientSlug ? `/for/${r.clientSlug}` : "/for/clients",
      overdue: r.dueAt < today,
    });
  }
  for (const s of subs) {
    if (s.ignored || s.cancelledAt) continue;
    let next = s.nextRenewal;
    let guard = 0;
    while (next <= horizon && guard++ < 4) {
      out.push({
        id: `sub-${s.key}-${next}`,
        date: next,
        label: s.name,
        detail: `${s.interval} renewal${s.verdict === "personal" ? " · personal" : ""}`,
        amount: -s.amount,
        kind: "subscription",
        href: "/books",
        interval: s.interval,
        personal: s.verdict === "personal",
      });
      next = nextRenewalFrom(next, s.interval, addDays(next, 1));
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.amount - b.amount);
}

/* ---------- what needs a decision ---------- */

export type Severity = "critical" | "warning" | "info";

export type AttentionItem = {
  id: string;
  severity: Severity;
  title: string;
  detail?: string;
  href?: string;
  amount?: number;
};

export function attentionItems(input: {
  picture: YearPicture;
  receivables: Receivable[];
  subs: TrackedSubscription[];
  expected?: Expected[];
  kpis: Kpis;
  syncOn: boolean;
  joint: boolean;
  undecided: number;
  /** Date of the newest N26 row in the books, if any. */
  lastBankRow?: string;
  today: string;
}): AttentionItem[] {
  const { picture, receivables, subs, kpis: k, syncOn, joint, undecided, lastBankRow, today } = input;
  const items: AttentionItem[] = [];
  const eur = (n: number) => `€${Math.round(n).toLocaleString("en")}`;

  for (const s of picture.overdue) {
    items.push({
      id: `overdue-tax-${s.due}`,
      severity: "critical",
      title: `Vorauszahlung due ${prettyDay(s.due)} not paid`,
      detail: "1 % Säumniszuschlag per month started — pay it with the Steuernummer and “ESt-VZ” in the reference",
      amount: -s.amount,
      href: "/books",
    });
  }
  const dueToday = picture.unpaid.filter((s) => s.due >= today && daysUntil(s.due, today) <= 3);
  for (const s of dueToday) {
    items.push({ id: `due-tax-${s.due}`, severity: "warning", title: `Vorauszahlung due ${prettyDay(s.due)}`, amount: -s.amount, href: "/books" });
  }
  for (const r of receivables) {
    const d = daysUntil(r.dueAt, today);
    const amt = r.currency === "USD" ? `$${r.total.toLocaleString("en")}` : eur(r.total);
    if (d < 0) {
      items.push({
        id: `inv-overdue-${r.number}`,
        severity: d < -14 ? "critical" : "warning",
        title: `${r.client} owes ${amt} · ${r.number} is ${-d} days overdue`,
        detail: "chase it, or note the reply on the client page",
        href: r.clientSlug ? `/for/${r.clientSlug}` : "/for/clients",
      });
    } else if (d <= 7) {
      items.push({ id: `inv-due-${r.number}`, severity: "info", title: `${r.client} · ${r.number} due in ${d} day${d === 1 ? "" : "s"} (${amt})`, href: r.clientSlug ? `/for/${r.clientSlug}` : "/for/clients" });
    }
  }
  for (const e of input.expected ?? []) {
    if (e.status !== "open") continue;
    const amt = e.currency === "USD" ? `$${e.amount.toLocaleString("en")}` : eur(e.amount);
    const waited = daysSince(e.filedAt, today);
    if (e.expectedBy < today) {
      items.push({
        id: `exp-late-${e.id}`,
        severity: "warning",
        title: `${e.from} still owes ${amt} · ${e.label}`,
        detail: `expected by ${prettyDay(e.expectedBy)}, filed ${waited} days ago — chase them${e.reference ? ` with ${e.reference}` : ""}, or mark it received / refused in the 90-day list`,
        href: "#upcoming",
      });
    } else if (waited >= 21) {
      items.push({
        id: `exp-quiet-${e.id}`,
        severity: "info",
        title: `${e.label} · ${amt} from ${e.from}: ${waited} days without news`,
        detail: `expected by ${prettyDay(e.expectedBy)} — a short chase now saves a long one later`,
        href: "#upcoming",
      });
    }
  }
  for (const s of subs) {
    if (s.ignored) continue;
    if (s.chargedAfterCancel) {
      items.push({ id: `rebilled-${s.key}`, severity: "warning", title: `${s.name} charged again after you cancelled it`, detail: "the cancellation didn't take, or you resubscribed", href: "/books" });
      continue;
    }
    if (s.cancelledAt) continue;
    const d = daysUntil(s.nextRenewal, today);
    if (s.interval === "yearly" && d <= 30) {
      items.push({ id: `renew-${s.key}`, severity: "info", title: `${s.name} renews ${prettyDay(s.nextRenewal)} for ${eur(s.amount)}`, detail: s.rating === 1 ? "you rated it “could cut” — cancel before it renews" : "yearly plan — last chance to cancel", href: "/books" });
    }
  }
  if (k.taxOwed > k.taxReserve + 1) {
    items.push({
      id: "tax-reserve",
      severity: k.taxReserve === 0 ? "info" : "warning",
      title: `Tax set-aside covers ${Math.round((k.taxReserve / Math.max(1, k.taxOwed)) * 100)} % of what's owed`,
      detail: `${eur(k.taxOwed)} owed this year vs ${eur(k.taxReserve)} in the tax account`,
      href: "/books",
    });
  }
  if (undecided > 0) {
    items.push({ id: "undecided", severity: "info", title: `${undecided} bank row${undecided === 1 ? "" : "s"} still undecided`, detail: "swipe them so the books and the estimate are complete", href: "/books?tab=import" });
  }
  if (lastBankRow && daysUntil(lastBankRow, today) < -45) {
    items.push({ id: "import", severity: "info", title: `Last bank row is from ${prettyDay(lastBankRow)}`, detail: "import a fresh N26 export so the books catch up", href: "/books?tab=import" });
  } else if (!lastBankRow) {
    items.push({ id: "import", severity: "info", title: "No bank rows in the books yet", detail: "import an N26 export to start", href: "/books?tab=import" });
  }
  if (k.staleAccounts.length > 0) {
    items.push({
      id: "stale-accounts",
      severity: "info",
      title: `${k.staleAccounts.length} balance${k.staleAccounts.length === 1 ? "" : "s"} not updated in a month`,
      detail: k.staleAccounts.map((a) => a.name).join(", "),
      href: "#accounts",
    });
  }
  if (!joint) {
    items.push({ id: "joint", severity: "info", title: "Estimate assumes single filing", detail: "you file jointly — tick “joint” on the books page and enter your partner's figures", href: "/books" });
  }
  if (!syncOn) {
    items.push({ id: "sync", severity: "warning", title: "Sync is off on this device", detail: "the books only live in this browser until you enter the passphrase", href: "/books" });
  }
  const rank: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  return items.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

function prettyDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

/* ---------- list helpers for the upcoming card ---------- */

export function monthTitle(key: string): string {
  return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function dayLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", timeZone: "UTC" });
}

export type UpcomingRow = { kind: "one"; item: UpcomingItem } | { kind: "plans"; month: string; items: UpcomingItem[] };

/** A month's rows with monthly plans rolled into one expandable row (they're background, not decisions). */
export function upcomingRows(month: string, items: UpcomingItem[]): UpcomingRow[] {
  const plans = items.filter((it) => it.kind === "subscription" && it.interval === "monthly");
  const rest = items.filter((it) => !plans.includes(it));
  const out: UpcomingRow[] = rest.map((item) => ({ kind: "one", item }));
  if (plans.length === 1) out.push({ kind: "one", item: plans[0] });
  else if (plans.length > 1) out.push({ kind: "plans", month, items: plans });
  const dateOf = (r: UpcomingRow) => (r.kind === "one" ? r.item.date : r.items[0].date);
  return out.sort((a, b) => dateOf(a).localeCompare(dateOf(b)));
}

/** Money in, money out and net over the next `days` (default 30) of upcoming items. */
export function upcomingWindow(items: UpcomingItem[], today: string, days = 30): { income: number; out: number; net: number; count: number } {
  const end = addDays(today, days);
  const inWindow = items.filter((it) => it.date <= end);
  const income = inWindow.filter((it) => it.amount > 0).reduce((t, it) => t + it.amount, 0);
  const out = inWindow.filter((it) => it.amount < 0).reduce((t, it) => t + it.amount, 0);
  return { income, out, net: income + out, count: inWindow.length };
}

/* ---------- where the money goes ---------- */

export type CategorySlice = { key: Category | "other-rest"; label: string; amount: number; share: number };

/** Business expenses by category over the last `months` full months, biggest first, the tail folded into "Everything else". */
export function categoryBreakdown(entries: BookEntry[], today: string, months = 3, top = 6): { slices: CategorySlice[]; total: number; from: string; to: string } {
  const keys: string[] = [];
  const d = new Date(`${today.slice(0, 7)}-01T00:00:00Z`);
  for (let i = 1; i <= months; i++) {
    const m = new Date(d);
    m.setUTCMonth(m.getUTCMonth() - i);
    keys.push(m.toISOString().slice(0, 7));
  }
  const sums = new Map<Category, number>();
  for (const e of entries) {
    if (e.kind !== "expense" || !keys.includes(monthKey(e.date))) continue;
    sums.set(e.category, (sums.get(e.category) ?? 0) + e.amount);
  }
  const total = [...sums.values()].reduce((t, v) => t + v, 0);
  const sorted = [...sums.entries()].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, top);
  const rest = sorted.slice(top).reduce((t, [, v]) => t + v, 0);
  const slices: CategorySlice[] = head.map(([key, amount]) => ({ key, label: CATEGORY_LABELS[key] ?? key, amount, share: total > 0 ? amount / total : 0 }));
  if (rest > 0) slices.push({ key: "other-rest", label: "Everything else", amount: rest, share: total > 0 ? rest / total : 0 });
  return { slices, total, from: keys[keys.length - 1], to: keys[0] };
}
