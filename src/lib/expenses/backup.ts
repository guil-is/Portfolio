/**
 * Backup and restore for everything the books and expenses pages keep
 * in this browser: the per-year books, settings, subscription ratings
 * and cancellations, sent-invoice marks, the expenses session, merchant
 * memory and prefs. One JSON file, downloaded by the browser — nothing
 * is uploaded anywhere.
 *
 * The same envelope is what an encrypted sync would ship later: keep
 * `format` / `version` stable and add to `entries`, don't reshape it.
 */

export const BACKUP_FORMAT = "guil-books-backup";
export const BACKUP_VERSION = 1;

/** Every localStorage key the two pages own starts with one of these. */
const PREFIXES = ["books:v1:", "expenses:"];
const LAST_BACKUP_KEY = "books:v1:last-backup";
const IDLE_KEYS = new Set([LAST_BACKUP_KEY]);

export type Backup = {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  /** Where it came from, for the restore prompt. */
  origin: string;
  /** localStorage key → parsed JSON value. */
  entries: Record<string, unknown>;
};

function ownKeys(): string[] {
  if (typeof window === "undefined") return [];
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && PREFIXES.some((p) => k.startsWith(p)) && !IDLE_KEYS.has(k)) keys.push(k);
  }
  return keys.sort();
}

export function collectBackup(): Backup {
  const entries: Record<string, unknown> = {};
  for (const k of ownKeys()) {
    try {
      entries[k] = JSON.parse(window.localStorage.getItem(k) ?? "null");
    } catch {
      // a corrupt value isn't worth failing the whole backup
    }
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    origin: typeof window === "undefined" ? "" : window.location.host,
    entries,
  };
}

export function backupFilename(date = new Date()): string {
  return `books-backup-${date.toISOString().slice(0, 10)}.json`;
}

/** Trigger the browser download of a fresh backup and note the time. */
export function downloadBackup(): Backup {
  const backup = collectBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = backupFilename();
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  window.localStorage.setItem(LAST_BACKUP_KEY, JSON.stringify(backup.exportedAt));
  return backup;
}

export function lastBackupAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_BACKUP_KEY);
    return raw ? (JSON.parse(raw) as string) : null;
  } catch {
    return null;
  }
}

/** Is there anything worth backing up at all? */
export function hasBooksData(): boolean {
  return ownKeys().some((k) => /^books:v1:\d{4}$/.test(k) || k === "expenses:session:v1");
}

export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't JSON.");
  }
  const b = data as Partial<Backup>;
  if (!b || b.format !== BACKUP_FORMAT || typeof b.entries !== "object" || b.entries === null) {
    throw new Error("That file isn't a books backup.");
  }
  if ((b.version ?? 0) > BACKUP_VERSION) {
    throw new Error(`This backup is from a newer version (${b.version}) — update the site first.`);
  }
  return b as Backup;
}

export type BackupSummary = {
  years: number[];
  rows: number;
  ratings: number;
  hasSession: boolean;
  exportedAt: string;
};

export function summarizeBackup(b: Backup): BackupSummary {
  const years: number[] = [];
  let rows = 0;
  for (const [k, v] of Object.entries(b.entries)) {
    const m = /^books:v1:(\d{4})$/.exec(k);
    if (m && Array.isArray(v)) {
      years.push(Number(m[1]));
      rows += v.length;
    }
  }
  const meta = b.entries["books:v1:subs-meta"];
  return {
    years: years.sort(),
    rows,
    ratings: meta && typeof meta === "object" ? Object.keys(meta as object).length : 0,
    hasSession: "expenses:session:v1" in b.entries,
    exportedAt: b.exportedAt,
  };
}

type Row = { id: string; updatedAt?: string };

/** Newest `updatedAt` wins per id; rows only one side knows are kept. */
function mergeRows(mine: Row[], theirs: Row[]): Row[] {
  const byId = new Map<string, Row>(mine.map((r) => [r.id, r]));
  for (const r of theirs) {
    const cur = byId.get(r.id);
    if (!cur || (r.updatedAt ?? "") > (cur.updatedAt ?? "")) byId.set(r.id, r);
  }
  return [...byId.values()];
}

/**
 * Apply a backup on top of what's here. Book years, sent-invoice lists,
 * subscription meta and merchant memory merge; everything else (settings,
 * prefs, the expenses session) is taken from the backup when present.
 * With `replace`, the backup wins outright and local-only keys are dropped.
 */
export function restoreBackup(b: Backup, mode: "merge" | "replace"): void {
  const ls = window.localStorage;
  if (mode === "replace") {
    for (const k of ownKeys()) ls.removeItem(k);
  }
  for (const [k, v] of Object.entries(b.entries)) {
    if (!PREFIXES.some((p) => k.startsWith(p))) continue;
    const raw = ls.getItem(k);
    const cur = raw ? (JSON.parse(raw) as unknown) : null;
    let next: unknown = v;
    if (mode === "merge" && cur !== null) {
      if (/^books:v1:\d{4}$/.test(k) && Array.isArray(cur) && Array.isArray(v)) next = mergeRows(cur as Row[], v as Row[]);
      else if (k.endsWith(":sent-invoices") && Array.isArray(cur) && Array.isArray(v)) next = [...new Set([...(cur as string[]), ...(v as string[])])];
      else if (k === "books:v1:years" && Array.isArray(cur) && Array.isArray(v)) next = [...new Set([...(cur as number[]), ...(v as number[])])].sort((a, b) => b - a);
      else if ((k === "books:v1:subs-meta" || k === "expenses:memory:v1") && typeof cur === "object" && typeof v === "object" && v !== null) next = { ...(cur as object), ...(v as object) };
    }
    ls.setItem(k, JSON.stringify(next));
  }
  ls.setItem(LAST_BACKUP_KEY, JSON.stringify(b.exportedAt));
}
