/**
 * Balances you type in by hand — the money page's cash picture. No bank
 * API: N26 and Wise balances are entered when you check them, and the
 * page shows how old each figure is. Stored under the books prefix so
 * the encrypted sync and the backup file carry them.
 */

export type AccountKind = "cash" | "savings" | "tax" | "investment" | "crypto" | "debt";

export type Account = {
  id: string;
  name: string;
  kind: AccountKind;
  currency: "EUR" | "USD";
  balance: number;
  /** ISO timestamp of the last balance you entered; empty = never. */
  updatedAt: string;
  note?: string;
};

export const KIND_LABELS: Record<AccountKind, string> = {
  cash: "Cash",
  savings: "Savings",
  tax: "Tax set-aside",
  investment: "Investments",
  crypto: "Crypto",
  debt: "Debt",
};

export const KIND_ORDER: AccountKind[] = ["cash", "tax", "savings", "investment", "crypto", "debt"];

const KEY = "books:v1:accounts";

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: "n26-main", name: "N26 · Main", kind: "cash", currency: "EUR", balance: 0, updatedAt: "" },
  { id: "n26-taxes", name: "N26 · Taxes space", kind: "tax", currency: "EUR", balance: 0, updatedAt: "" },
  { id: "wise-usd", name: "Wise · USD", kind: "cash", currency: "USD", balance: 0, updatedAt: "" },
];

export function loadAccounts(): Account[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Account[]) : null;
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveAccounts(accounts: Account[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(accounts));
  } catch {
    // quota / private mode — the page still works for this session
  }
}

export function isAsset(kind: AccountKind): boolean {
  return kind !== "debt";
}

/** Balance in EUR. */
export function inEur(a: Account, usdRate: number): number {
  return a.currency === "USD" ? a.balance * usdRate : a.balance;
}

export function newAccountId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "account"}-${Date.now().toString(36)}`;
}
