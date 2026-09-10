"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { collectBackup } from "@/lib/expenses/backup";
import { fingerprint } from "@/lib/expenses/crypto";
import { forgetSync, loadSyncState, setUpSync, syncOnce, SyncError, type SyncState, type SyncStatus } from "@/lib/expenses/sync";
import { BackupBar } from "./BackupBar";

/**
 * Sync strip for /for/books, plus a headless <SyncAgent /> for the
 * expenses page. Pushes whenever the local envelope changes (checked
 * every few seconds, debounced), pulls on load, on focus and every
 * minute. Nothing runs until a passphrase has been entered on this
 * device.
 */

const CHECK_MS = 4000;
const QUIET_MS = 1500;
const PULL_MS = 60_000;

function useSync(onChange?: (status: SyncStatus) => void) {
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
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [, bump] = useState(0);

  // Re-render the "x min ago" once a minute.
  useEffect(() => {
    const t = window.setInterval(() => bump((n) => n + 1), 30_000);
    return () => window.clearInterval(t);
  }, []);

  // A pull merged another device's edits into localStorage — the page's
  // state is stale, so reload and let the tabs show what came in.
  useEffect(() => {
    if (status.kind === "idle" && status.pulled) onRestored();
  }, [status, onRestored]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = await enable(pass);
    setBusy(false);
    if (ok) {
      setPass("");
      onToast("Sync is on — the books follow this passphrase to every device");
      onRestored();
    }
  }

  const btn = "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] transition-colors";
  const quiet = `${btn} border-rule text-muted hover:border-ink hover:text-ink disabled:opacity-40`;
  const strong = `${btn} border-ink bg-ink text-bg hover:bg-transparent hover:text-ink disabled:opacity-40`;

  if (!state) {
    const unavailable = status.kind === "error" && /configured|unavailable/i.test(status.message);
    return (
      <div className="flex flex-col gap-3 rounded-[12px] border border-warn/50 bg-warn/5 px-4 py-3 text-[0.8rem] text-ink">
        <p className="flex items-center gap-2">
          <CloudOff className="h-3.5 w-3.5 text-warn" aria-hidden />
          <span>
            <span className="font-medium">Sync is off.</span> The books only live in this browser. Choose a passphrase and they&apos;ll follow it to every device, encrypted before they leave.
          </span>
        </p>
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Passphrase — same one on each device"
            autoComplete="off"
            minLength={8}
            required
            className="h-9 w-full rounded-full border border-rule bg-bg px-4 text-[0.85rem] text-ink placeholder:text-faint focus:border-ink focus:outline-none md:w-[320px]"
          />
          <button type="submit" disabled={busy || pass.length < 8} className={strong}>
            <Cloud className="h-3 w-3" aria-hidden /> {busy ? "Setting up…" : "Turn on sync"}
          </button>
          {status.kind === "error" ? <span className={unavailable ? "text-muted" : "text-down"}>{status.message}</span> : null}
        </form>
        <p className="text-[0.75rem] text-muted">
          Nobody can recover the passphrase — not the site, not Sanity, not me. Write it in your password manager. If a vault already exists, the passphrase must open it.
        </p>
        <details className="text-[0.75rem] text-muted">
          <summary className="cursor-pointer">Backup file instead</summary>
          <div className="mt-2">
            <BackupBar onToast={onToast} onRestored={onRestored} />
          </div>
        </details>
      </div>
    );
  }

  const tone = status.kind === "error" ? "border-warn/50 bg-warn/5" : "border-rule-soft bg-card/40";
  return (
    <div className={`flex flex-col gap-2 rounded-[12px] border px-4 py-2.5 text-[0.8rem] text-muted ${tone}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="mr-auto flex items-center gap-2">
          {status.kind === "syncing" ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted" aria-hidden /> : status.kind === "error" ? <CloudOff className="h-3.5 w-3.5 text-warn" aria-hidden /> : <Cloud className="h-3.5 w-3.5 text-up" aria-hidden />}
          {status.kind === "syncing" ? (
            "Syncing…"
          ) : status.kind === "error" ? (
            <span>
              <span className="text-ink">{status.message}.</span> Last synced {ago(status.lastSyncAt)}.
            </span>
          ) : (
            <span>
              Synced {ago(status.kind === "idle" ? status.lastSyncAt : state.lastSyncAt)} · encrypted with your passphrase · {state.device}
            </span>
          )}
        </span>
        <button type="button" onClick={() => void run({ force: true })} disabled={status.kind === "syncing"} className={quiet}>
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
      <details className="text-[0.75rem]">
        <summary className="cursor-pointer text-faint">Backup file</summary>
        <div className="mt-2">
          <BackupBar onToast={onToast} onRestored={onRestored} />
        </div>
      </details>
    </div>
  );
}
