"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { downloadBackup, hasBooksData, lastBackupAt, parseBackup, restoreBackup, summarizeBackup } from "@/lib/expenses/backup";
import { prettyDate } from "./ExpenseSwipeDeck";

/**
 * "Books live in this browser" strip with Back up / Restore. Nags when
 * the last backup is older than a month or there's never been one.
 */

const STALE_DAYS = 30;

export function BackupBar({ onRestored, onToast }: { onRestored: () => void; onToast: (msg: string) => void }) {
  const [last, setLast] = useState<string | null>(() => lastBackupAt());
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const hasData = hasBooksData();
  const ageDays = last ? Math.floor((Date.now() - Date.parse(last)) / 86_400_000) : null;
  const stale = hasData && (ageDays === null || ageDays >= STALE_DAYS);

  function backUp() {
    const b = downloadBackup();
    setLast(b.exportedAt);
    onToast(`Backup saved · ${Object.keys(b.entries).length} keys`);
  }

  async function restore(f: File) {
    setBusy(true);
    try {
      const b = parseBackup(await f.text());
      const s = summarizeBackup(b);
      const what = [
        s.years.length > 0 ? `${s.years.join(", ")} · ${s.rows} rows` : "no book years",
        s.ratings > 0 ? `${s.ratings} subscription ratings` : null,
        s.hasSession ? "an expenses session" : null,
      ]
        .filter(Boolean)
        .join(" · ");
      const merge = window.confirm(
        `Restore the backup from ${prettyDate(s.exportedAt.slice(0, 10))}?\n\n${what}\n\nOK merges it into what's here (newest row wins). Cancel to stop.`,
      );
      if (!merge) return;
      restoreBackup(b, "merge");
      setLast(b.exportedAt);
      onToast("Backup restored — reloading");
      onRestored();
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Couldn't read that file");
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  }

  const btn = "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] transition-colors";

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] border px-4 py-2.5 text-[0.8rem] ${stale ? "border-warn/50 bg-warn/5 text-ink" : "border-rule-soft bg-card/40 text-muted"}`}>
      <span className="mr-auto">
        Books live in this browser.{" "}
        {last ? (
          <>
            Last backup {prettyDate(last.slice(0, 10))}
            {ageDays !== null && ageDays > 0 ? <span className={stale ? "text-warn" : ""}> · {ageDays} day{ageDays === 1 ? "" : "s"} ago</span> : null}.
          </>
        ) : hasData ? (
          <span className="text-warn">Never backed up — a cleared cache loses everything.</span>
        ) : (
          "Nothing to back up yet."
        )}
      </span>
      <button type="button" onClick={backUp} disabled={!hasData} className={`${btn} ${stale ? "border-ink bg-ink text-bg hover:bg-transparent hover:text-ink" : "border-rule text-muted hover:border-ink hover:text-ink"} disabled:opacity-40`}>
        <Download className="h-3 w-3" aria-hidden /> Back up
      </button>
      <button type="button" onClick={() => file.current?.click()} disabled={busy} className={`${btn} border-rule text-muted hover:border-ink hover:text-ink disabled:opacity-40`}>
        <Upload className="h-3 w-3" aria-hidden /> Restore
      </button>
      <input
        ref={file}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void restore(f);
        }}
      />
    </div>
  );
}
