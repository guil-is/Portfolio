"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { collectBackup } from "@/lib/expenses/backup";
import { fingerprint } from "@/lib/expenses/crypto";
import { forgetSync, loadSyncState, setUpSync, syncOnce, SyncError, type SyncState, type SyncStatus } from "@/lib/expenses/sync";
import { BackupBar } from "./BackupBar";

/**
 * Sync strip for /books, plus a headless <SyncAgent /> for the
 * expenses page. Pushes whenever the local envelope changes (checked
 * every few seconds, debounced), pulls on load, on focus and every
 * minute. Nothing runs until a passphrase has been entered on this
 * device.
 */

const CHECK_MS = 4000;
const QUIET_MS = 1500;
const PULL_MS = 60_000;

export function useSync(onChange?: (status: SyncStatus) => void) {
  const [state, setState] = useState<SyncState | null>(() => loadSyncState());
  const [status, setStatus] = useState<SyncStatus>(() => (loadSyncState() ? { kind: "idle", lastSyncAt: loadSyncState()?.lastSyncAt, rev: loadSyncState()?.rev ?? 0 } : { kind: "off" }));
  const running = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const report = useCallback(
    (s: SyncStatus) => {
      setStatus(s);
      onChange?.(s);
    },
    [onChange],
  );

  const run = useCallback(
    async (opts: { force?: boolean } = {}) => {
      const cur = stateRef.current;
      if (!cur || running.current) return;
      running.current = true;
      report({ kind: "syncing" });
      try {
        const { state: next, pulled } = await syncOnce(cur, opts);
        stateRef.current = next;
        setState(next);
        report({ kind: "idle", lastSyncAt: next.lastSyncAt, rev: next.rev, pulled });
      } catch (e) {
        const msg = e instanceof SyncError ? e.message : "Sync failed";
        report({ kind: "error", message: msg, lastSyncAt: cur.lastSyncAt });
      } finally {
        running.current = false;
      }
    },
    [report],
  );

  // Change detection: fingerprint the envelope every few seconds; when it
  // drifts from what was last pushed and stays quiet briefly, sync.
  useEffect(() => {
    if (!state) return;
    let quiet: number | undefined;
    let lastSeen = state.pushedHash;
    const tick = async () => {
      const cur = stateRef.current;
      if (!cur || running.current) return;
      const hash = await fingerprint(JSON.stringify(collectBackup().entries));
      if (hash !== cur.pushedHash && hash !== lastSeen) {
        lastSeen = hash;
        window.clearTimeout(quiet);
        quiet = window.setTimeout(() => void run(), QUIET_MS);
      } else if (hash !== cur.pushedHash && !quiet) {
        quiet = window.setTimeout(() => void run(), QUIET_MS);
      }
    };
    const check = window.setInterval(() => void tick(), CHECK_MS);
    const pull = window.setInterval(() => void run(), PULL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void run();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    void run();
    return () => {
      window.clearInterval(check);
      window.clearInterval(pull);
      window.clearTimeout(quiet);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
    // `state` identity changes on every sync; only re-arm when sync turns on/off.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(state), run]);

  const enable = useCallback(
    async (passphrase: string) => {
      report({ kind: "syncing" });
      try {
        const next = await setUpSync(passphrase);
        stateRef.current = next;
        setState(next);
        report({ kind: "idle", lastSyncAt: next.lastSyncAt, rev: next.rev });
        return true;
      } catch (e) {
        report({ kind: "error", message: e instanceof SyncError ? e.message : "Couldn't set up sync" });
        return false;
      }
    },
    [report],
  );

  const disable = useCallback(() => {
    forgetSync();
    stateRef.current = null;
    setState(null);
    report({ kind: "off" });
  }, [report]);

  return { state, status, run, enable, disable };
}

/** Invisible: keeps the expenses page syncing while you triage. */
export function SyncAgent() {
  useSync();
  return null;
}

function ago(iso: string | undefined): string {
  if (!iso) return "never";
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

export function SyncBar({ onToast, onRestored }: { onToast: (msg: string) => void; onRestored: () => void }) {
  const { state, status, run, enable, disable } = useSync();
  const [open, setOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [, bump] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  // Re-render the "x min ago" every half minute while open.
  useEffect(() => {
    if (!open) return;
    const t = window.setInterval(() => bump((n) => n + 1), 30_000);
    return () => window.clearInterval(t);
  }, [open]);

  // A pull merged another device's edits into localStorage — the page's
  // state is stale, so reload and let the tabs show what came in.
  useEffect(() => {
    if (status.kind === "idle" && status.pulled) onRestored();
  }, [status, onRestored]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = await enable(pass);
    setBusy(false);
    if (ok) {
      setPass("");
      setOpen(false);
      onToast("Sync is on — the books follow this passphrase to every device");
      onRestored();
    }
  }

  const btn = "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] transition-colors";
  const quiet = `${btn} border-rule text-muted hover:border-ink hover:text-ink disabled:opacity-40`;
  const strong = `${btn} border-ink bg-ink text-bg hover:bg-transparent hover:text-ink disabled:opacity-40`;

  const off = !state;
  const syncing = status.kind === "syncing";
  const errored = status.kind === "error";
  const iconTone = off || errored ? "text-warn" : "text-up";
  const label = off ? "Sync is off" : syncing ? "Syncing…" : errored ? status.message : `Synced ${ago(status.kind === "idle" ? status.lastSyncAt : state.lastSyncAt)}`;

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Sync: ${label}`}
        title={label}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
          open ? "border-ink bg-ink text-bg" : `border-rule bg-bg hover:border-ink ${iconTone}`
        }`}
      >
        {syncing ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> : off || errored ? <CloudOff className="h-4 w-4" aria-hidden /> : <Cloud className="h-4 w-4" aria-hidden />}
        {(off || errored) && !open ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-warn" aria-hidden /> : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-12 z-40 w-[min(92vw,380px)] rounded-[14px] border border-rule bg-bg p-4 text-[0.8rem] text-muted"
          style={{ boxShadow: "var(--shadow-card)" }}
          role="dialog"
          aria-label="Sync"
        >
          {off ? (
            <div className="flex flex-col gap-3">
              <p className="flex items-start gap-2 text-ink">
                <CloudOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-hidden />
                <span>
                  <span className="font-medium">Sync is off.</span>{" "}The books only live in this browser. Choose a passphrase and they&apos;ll follow it to every device, encrypted before they leave.
                </span>
              </p>
              <form onSubmit={submit} className="flex flex-col gap-2">
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Passphrase — same one on each device"
                  autoComplete="off"
                  minLength={8}
                  required
                  autoFocus
                  className="h-9 w-full rounded-full border border-rule bg-bg px-4 text-[0.85rem] text-ink placeholder:text-faint focus:border-ink focus:outline-none"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button type="submit" disabled={busy || pass.length < 8} className={strong}>
                    <Cloud className="h-3 w-3" aria-hidden /> {busy ? "Setting up…" : "Turn on sync"}
                  </button>
                  {errored ? <span className={/configured|unavailable/i.test(status.message) ? "text-muted" : "text-down"}>{status.message}</span> : null}
                </div>
              </form>
              <p className="text-[0.75rem]">Nobody can recover the passphrase — not the site, not Sanity, not me. Write it in your password manager. If a vault already exists, the passphrase must open it.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="flex items-start gap-2">
                {syncing ? <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden /> : errored ? <CloudOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-hidden /> : <Cloud className="mt-0.5 h-3.5 w-3.5 shrink-0 text-up" aria-hidden />}
                <span>
                  {syncing ? (
                    "Syncing…"
                  ) : errored ? (
                    <>
                      <span className="text-ink">{status.message}.</span> Last synced {ago(status.lastSyncAt)}.
                    </>
                  ) : (
                    <>
                      <span className="text-ink">Synced {ago(status.kind === "idle" ? status.lastSyncAt : state.lastSyncAt)}.</span> Encrypted with your passphrase · {state.device}
                    </>
                  )}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void run({ force: true })} disabled={syncing} className={quiet}>
                  <RefreshCw className="h-3 w-3" aria-hidden /> Sync now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Forget the passphrase on this device? The books stay here and in the vault; you'll enter the passphrase again to sync.")) disable();
                  }}
                  className={quiet}
                >
                  Forget on this device
                </button>
              </div>
            </div>
          )}
          <details className="mt-3 border-t border-rule-soft pt-3 text-[0.75rem]">
            <summary className="cursor-pointer text-faint">Backup file</summary>
            <div className="mt-2">
              <BackupBar onToast={onToast} onRestored={onRestored} />
            </div>
          </details>
        </div>
      ) : null}
    </div>
  );
}
