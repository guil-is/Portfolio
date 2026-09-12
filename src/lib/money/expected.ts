/**
 * Money you expect that isn't a client invoice: an insurance claim, a
 * refund, a deposit coming back, a tax refund, money you lent. Entered
 * by hand on the money page, stored under the books prefix so the
 * encrypted sync and the backup file carry it. Closed by hand too —
 * incoming bank rows never reach the books, so nothing matches them.
 */

export type ExpectedKind = "claim" | "refund" | "deposit" | "tax" | "loan" | "other";

export type ExpectedStatus = "open" | "received" | "rejected";

export type Expected = {
  id: string;
  kind: ExpectedKind;
  /** What it is: "Emergency dentist, Lisbon". */
  label: string;
  /** Who owes it: "Allianz Travel". */
  from: string;
  amount: number;
  currency: "EUR" | "USD";
  /** ISO date you filed / asked / paid the deposit. */
  filedAt: string;
  /** ISO date you expect it by; the list and the reminders key off it. */
  expectedBy: string;
  /** Claim number, ticket, IBAN reference. */
  reference?: string;
  note?: string;
  status: ExpectedStatus;
  /** ISO date it landed (or was refused). */
  closedAt?: string;
};

export const EXPECTED_KIND_LABELS: Record<ExpectedKind, string> = {
  claim: "Insurance claim",
  refund: "Refund",
  deposit: "Deposit coming back",
  tax: "Tax refund",
  loan: "Money lent",
  other: "Other",
};

export const EXPECTED_KINDS: ExpectedKind[] = ["claim", "refund", "deposit", "tax", "loan", "other"];

/** Typical wait, in days, from filing to money — the default for "expected by". */
const TYPICAL_DAYS: Record<ExpectedKind, number> = { claim: 28, refund: 14, deposit: 30, tax: 42, loan: 30, other: 21 };

const KEY = "books:v1:expected";

export function loadExpected(): Expected[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Expected[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveExpected(list: Expected[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // quota / private mode — the page still works for this session
  }
}

export function defaultExpectedBy(filedAt: string, kind: ExpectedKind): string {
  return new Date(Date.parse(filedAt) + TYPICAL_DAYS[kind] * 86_400_000).toISOString().slice(0, 10);
}

export function newExpectedId(): string {
  return `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Days since filing, for the "no reply yet" nudge. */
export function daysSince(iso: string, today: string): number {
  return Math.round((Date.parse(today) - Date.parse(iso)) / 86_400_000);
}
