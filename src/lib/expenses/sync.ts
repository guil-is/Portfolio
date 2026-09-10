/**
 * Encrypted sync engine. The browser keeps the passphrase-derived keys
 * (so you type the passphrase once per device), and:
 *
 *   - on load and every few seconds while a books page is open, pushes
 *     the backup envelope (gzipped, AES-GCM) when anything changed;
 *   - before every push, pulls if the server has a newer revision and
 *     merges it in (newest row wins — see restoreBackup);
 *   - on a new device, pulls the vault, decrypts, merges, pushes.
 *
 * The API (/api/books-sync) only ever sees ciphertext and a bearer
 * token derived from the passphrase. State for this device lives in
 * localStorage under `books:v1:sync`, which the backup skips.
 */

import { collectBackup, restoreBackup, type Backup } from "./backup";
import { deriveKeys, exportKey, fingerprint, fromBase64, importKey, open, randomBytes, seal, toBase64 } from "./crypto";

export const SYNC_STATE_KEY = "books:v1:sync";
const API = "/api/books-sync";

export type SyncState = {
  salt: string;
  keyJwk: JsonWebKey;
  authToken: string;
  /** Server revision this device last pulled or pushed. */
  rev: number;
  /** Fingerprint of the envelope entries at the last successful push. */
  pushedHash?: string;
  lastSyncAt?: string;
  device: string;
};

export type SyncStatus =
  | { kind: "off" }
  | { kind: "idle"; lastSyncAt?: string; rev: number; pulled?: boolean }
  | { kind: "syncing" }
  | { kind: "error"; message: string; lastSyncAt?: string };

export class SyncError extends Error {
  constructor(
    message: string,
    public readonly code: "locked" | "wrong-passphrase" | "unavailable" | "offline" | "conflict" | "other",
  ) {
    super(message);
  }
}

export function loadSyncState(): SyncState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SYNC_STATE_KEY);
    return raw ? (JSON.parse(raw) as SyncState) : null;
  } catch {
    return null;
  }
}

export function saveSyncState(s: SyncState | null): void {
  if (s) window.localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(s));
  else window.localStorage.removeItem(SYNC_STATE_KEY);
}

function deviceName(): string {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "browser";
  return `${browser} on ${os}`;
}

async function api(path: string, init: RequestInit & { token?: string; rev?: number } = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);
  if (init.rev !== undefined) headers.set("If-Match", String(init.rev));
  if (init.body) headers.set("Content-Type", "application/json");
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new SyncError("Offline — will retry", "offline");
  }
  if (res.status === 401) throw new SyncError("Page is locked", "locked");
  if (res.status === 403) throw new SyncError("Wrong passphrase for this vault", "wrong-passphrase");
  if (res.status === 503) throw new SyncError((await res.json().catch(() => ({}))).error ?? "Sync unavailable", "unavailable");
  return res;
}

type Meta = { exists: false } | { exists: true; salt: string; rev: number; updatedAt: string; bytes: number };

export async function vaultMeta(): Promise<Meta> {
  const res = await api("?meta=1");
  if (!res.ok) throw new SyncError("Couldn't reach the vault", "other");
  return (await res.json()) as Meta;
}

/** Hash the envelope's entries only, so a new `exportedAt` alone doesn't count as a change. */
async function envelopeHash(b: Backup): Promise<string> {
  return fingerprint(JSON.stringify(b.entries));
}

async function pull(state: SyncState, key: CryptoKey): Promise<{ backup: Backup; rev: number } | null> {
  const res = await api("", { token: state.authToken });
  if (res.status === 404) return null;
  if (!res.ok) throw new SyncError("Couldn't read the vault", "other");
  const doc = (await res.json()) as { iv: string; ciphertext: string; rev: number };
  let json: string;
  try {
    json = await open(key, { iv: doc.iv, ciphertext: doc.ciphertext });
  } catch {
    throw new SyncError("Wrong passphrase for this vault", "wrong-passphrase");
  }
  return { backup: JSON.parse(json) as Backup, rev: doc.rev };
}

async function push(state: SyncState, key: CryptoKey, backup: Backup, rev: number | undefined): Promise<number> {
  const sealed = await seal(key, JSON.stringify(backup));
  const res = await api("", {
    method: "PUT",
    token: state.authToken,
    rev,
    body: JSON.stringify({ salt: state.salt, iv: sealed.iv, ciphertext: sealed.ciphertext, device: state.device }),
  });
  if (res.status === 409) throw new SyncError("Newer copy on the server", "conflict");
  if (!res.ok) throw new SyncError("Couldn't write the vault", "other");
  return ((await res.json()) as { rev: number }).rev;
}

/**
 * One sync pass. Pull + merge when the server moved on, then push when
 * our data differs from what we last pushed. Returns the new state.
 */
export type SyncResult = { state: SyncState; pulled: boolean };

export async function syncOnce(state: SyncState, opts: { force?: boolean } = {}): Promise<SyncResult> {
  const key = await importKey(state.keyJwk);
  let next = { ...state };
  let pulled = false;
  const meta = await vaultMeta();
  const serverRev = meta.exists ? meta.rev : 0;

  if (meta.exists && serverRev > next.rev) {
    const remote = await pull(next, key);
    if (remote) {
      restoreBackup(remote.backup, "merge");
      next.rev = remote.rev;
      pulled = true;
    }
  }

  const local = collectBackup();
  const hash = await envelopeHash(local);
  if (opts.force || hash !== next.pushedHash) {
    try {
      next.rev = await push(next, key, local, meta.exists ? next.rev : undefined);
    } catch (e) {
      if (!(e instanceof SyncError) || e.code !== "conflict") throw e;
      // Someone pushed between our meta check and our write: take theirs, merge, push again.
      const remote = await pull(next, key);
      if (remote) {
        restoreBackup(remote.backup, "merge");
        next.rev = remote.rev;
        pulled = true;
      }
      const merged = collectBackup();
      next.rev = await push(next, key, merged, next.rev);
      next.pushedHash = await envelopeHash(merged);
      next.lastSyncAt = new Date().toISOString();
      saveSyncState(next);
      return { state: next, pulled };
    }
    next.pushedHash = hash;
  }
  next.lastSyncAt = new Date().toISOString();
  next = { ...next };
  saveSyncState(next);
  return { state: next, pulled };
}

/**
 * First run on a device: derive keys from the passphrase. If the vault
 * exists, the passphrase must open it (wrong one → error, nothing
 * changes locally). If not, this device creates it.
 */
export async function setUpSync(passphrase: string): Promise<SyncState> {
  if (passphrase.length < 8) throw new SyncError("Use at least 8 characters", "other");
  const meta = await vaultMeta();
  const salt = meta.exists ? fromBase64(meta.salt) : randomBytes(16);
  const keys = await deriveKeys(passphrase, salt);
  const state: SyncState = {
    salt: toBase64(salt),
    keyJwk: await exportKey(keys.aesKey),
    authToken: keys.authToken,
    rev: 0,
    device: deviceName(),
  };
  if (meta.exists) {
    // Proves the passphrase before we keep anything.
    const key = await importKey(state.keyJwk);
    const remote = await pull(state, key);
    if (remote) {
      restoreBackup(remote.backup, "merge");
      state.rev = remote.rev;
    }
  }
  saveSyncState(state);
  return (await syncOnce(state, { force: true })).state;
}

export function forgetSync(): void {
  saveSyncState(null);
}
