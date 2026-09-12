/**
 * Net worth over time. One snapshot per day, written whenever the money
 * page loads with balances entered or a balance changes, so the trend
 * builds itself from the weekly balance ritual. Stored under the books
 * prefix so the encrypted sync and the backup file carry it.
 */

import { inEur, isAsset, type Account } from "./accounts";

export type Snapshot = { date: string; netWorth: number; cash: number };

const KEY = "books:v1:net-worth-history";
const MAX = 800;

export function loadHistory(): Snapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Snapshot[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function save(list: Snapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // quota / private mode — the page still works for this session
  }
}

/** Record today's figures (replacing today's earlier snapshot). Skipped until a balance has been entered. */
export function recordSnapshot(accounts: Account[], usdRate: number, today: string): Snapshot[] {
  const history = loadHistory();
  if (accounts.every((a) => !a.updatedAt)) return history;
  const cash = accounts.filter((a) => isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const debts = accounts.filter((a) => !isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const snap: Snapshot = { date: today, netWorth: Math.round(cash - debts), cash: Math.round(cash) };
  const last = history[history.length - 1];
  if (last && last.date === today && last.netWorth === snap.netWorth && last.cash === snap.cash) return history;
  const next = [...history.filter((s) => s.date !== today), snap].sort((a, b) => a.date.localeCompare(b.date)).slice(-MAX);
  save(next);
  return next;
}

/** Net worth `days` ago (the latest snapshot on or before that date), if the history reaches back that far. */
export function changeSince(history: Snapshot[], days: number, today: string): { delta: number; pct: number | null; since: string } | null {
  if (history.length < 2) return null;
  const cutoff = new Date(Date.parse(today) - days * 86_400_000).toISOString().slice(0, 10);
  const base = [...history].reverse().find((s) => s.date <= cutoff) ?? history[0];
  if (base.date === history[history.length - 1].date) return null;
  const now = history[history.length - 1].netWorth;
  return { delta: now - base.netWorth, pct: base.netWorth !== 0 ? (now - base.netWorth) / Math.abs(base.netWorth) : null, since: base.date };
}
