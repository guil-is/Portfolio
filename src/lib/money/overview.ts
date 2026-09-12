/**
 * The money page's numbers, as pure functions over what the other pages
 * already keep: the year picture (books + ledger + tax), tracked
 * subscriptions, unpaid invoices, and the balances you typed in.
 */

import type { BookEntry } from "@/lib/expenses/books";
import type { YearPicture } from "@/lib/expenses/estimate";
import { daysUntil, nextRenewalFrom, type TrackedSubscription } from "@/lib/expenses/subscriptions";
import type { IncomeMonth, Receivable } from "@/lib/income";
import { inEur, isAsset, type Account } from "./accounts";

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
  /** Unpaid tracked invoices, in EUR. */
  owedToYou: number;
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
  /** Every book row, all years. */
  entries: BookEntry[];
  today: string;
}): Kpis {
  const { accounts, usdRate, picture, receivables, entries, today } = input;
  const assets = accounts.filter((a) => isAsset(a.kind));
  const cash = assets.reduce((t, a) => t + inEur(a, usdRate), 0);
  const taxReserve = assets.filter((a) => a.kind === "tax").reduce((t, a) => t + inEur(a, usdRate), 0);
  const debts = accounts.filter((a) => !isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const owedToYou = receivables.reduce((t, r) => t + (r.currency === "USD" ? r.total * usdRate : r.total), 0);
  const taxOwed = picture.stillDue + Math.max(0, picture.projected.incomeTaxDue) + Math.max(0, picture.soFar.vatDue);
  const burn = monthlyBurn(entries, today);
  const free = cash - taxOwed;
  const stale = accounts.filter((a) => !a.updatedAt || daysUntil(a.updatedAt.slice(0, 10), today) < -30);
  return {
    cash,
    taxReserve,
    netWorth: cash - debts,
    owedToYou,
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

export type UpcomingKind = "tax" | "invoice" | "subscription";

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
};

export function upcomingItems(input: {
  picture: YearPicture;
  subs: TrackedSubscription[];
  receivables: Receivable[];
  usdRate: number;
  today: string;
  horizonDays?: number;
}): UpcomingItem[] {
  const { picture, subs, receivables, usdRate, today } = input;
  const horizon = addDays(today, input.horizonDays ?? 90);
  const out: UpcomingItem[] = [];
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
    items.push({ id: "undecided", severity: "info", title: `${undecided} bank row${undecided === 1 ? "" : "s"} still undecided`, detail: "swipe them so the books and the estimate are complete", href: "/for/expenses" });
  }
  if (lastBankRow && daysUntil(lastBankRow, today) < -45) {
    items.push({ id: "import", severity: "info", title: `Last bank row is from ${prettyDay(lastBankRow)}`, detail: "import a fresh N26 export so the books catch up", href: "/for/expenses" });
  } else if (!lastBankRow) {
    items.push({ id: "import", severity: "info", title: "No bank rows in the books yet", detail: "import an N26 export to start", href: "/for/expenses" });
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
