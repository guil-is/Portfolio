/**
 * Snoozed attention items: id → ISO date the snooze ends. Under the books
 * prefix so it follows the sync. Critical items can't be snoozed.
 */

const KEY = "books:v1:money-snoozed";

export function loadSnoozed(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveSnoozed(map: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // quota / private mode
  }
}

export function snoozeUntil(today: string, days = 7): string {
  return new Date(Date.parse(today) + days * 86_400_000).toISOString().slice(0, 10);
}
