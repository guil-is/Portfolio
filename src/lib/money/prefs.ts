/**
 * Small per-person preferences for the money page (a runway target, the
 * USD rate source). Under the books prefix so the encrypted sync and the
 * backup carry them like everything else.
 */

export type MoneyPrefs = {
  /** Months of burn the free cash should cover. */
  runwayGoalMonths: number;
};

const KEY = "books:v1:money-prefs";

export const DEFAULT_PREFS: MoneyPrefs = { runwayGoalMonths: 6 };

export function loadPrefs(): MoneyPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return { ...DEFAULT_PREFS, ...(raw ? (JSON.parse(raw) as Partial<MoneyPrefs>) : {}) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: MoneyPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // quota / private mode
  }
}
