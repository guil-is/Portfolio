/**
 * Browser persistence. Two things survive a reload:
 *   - merchant memory: what you taught the classifier, across files
 *   - the current session: the parsed transactions + every decision,
 *     so you can close the tab mid-triage and pick up where you left off
 * Everything stays in this browser's localStorage. Nothing is uploaded.
 */

import type { DecisionMap } from "./triage";
import type { MerchantMemory, ParseResult } from "./types";

const MEMORY_KEY = "expenses:memory:v1";
const SESSION_KEY = "expenses:session:v1";
const PREFS_KEY = "expenses:prefs:v1";

export type SavedSession = {
  fileName: string;
  fileKey: string;
  parsed: ParseResult;
  decisions: DecisionMap;
  savedAt: string;
};

export type QueueOrder = "date" | "amount" | "merchant";

export type Prefs = {
  decimalComma: boolean;
  scope: "business" | "all";
  includeTax: boolean;
  /** Swipe queue: chronological, biggest amounts first, or grouped by
   * merchant with the most repeated merchants first. */
  order: QueueOrder;
  /** "Sweep" button marks pending cards under this amount as personal. */
  sweepUnder: number;
};

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadMemory(): Record<string, MerchantMemory> {
  return read<Record<string, MerchantMemory>>(MEMORY_KEY) ?? {};
}

export function saveMemory(memory: Record<string, MerchantMemory>): void {
  write(MEMORY_KEY, memory);
}

export function clearMemory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(MEMORY_KEY);
  } catch {
    // ignore
  }
}

export function loadSession(): SavedSession | null {
  const s = read<SavedSession>(SESSION_KEY);
  return s && Array.isArray(s.parsed?.transactions) ? s : null;
}

export function saveSession(session: SavedSession): boolean {
  return write(SESSION_KEY, session);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function loadPrefs(): Prefs {
  return {
    decimalComma: false,
    scope: "business",
    includeTax: true,
    order: "date",
    sweepUnder: 10,
    ...(read<Partial<Prefs>>(PREFS_KEY) ?? {}),
  };
}

export function savePrefs(prefs: Prefs): void {
  write(PREFS_KEY, prefs);
}
