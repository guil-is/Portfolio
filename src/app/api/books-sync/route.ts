import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Encrypted sync for the books. The browser encrypts the backup
 * envelope with a passphrase-derived key and sends only ciphertext;
 * this route stores it in one Sanity document per vault.
 *
 *   GET  ?meta=1         → { exists, salt, rev, updatedAt }   (no auth: the salt isn't secret)
 *   GET                  → the full blob                       (bearer token)
 *   PUT  { … }           → store, If-Match: <rev> guards against overwriting a newer copy
 *
 * The bearer token is derived from the same passphrase in the browser.
 * The first PUT claims the vault by storing sha256(token); later calls
 * must present the same token. Wrong passphrase → wrong token → 403,
 * and even with the token the data is still ciphertext.
 */

export const runtime = "nodejs";

const GATE_COOKIE = "for-expenses-unlocked";
const VAULT = "main";
const DOC_ID = `booksSync-${VAULT}`;
const MAX_BYTES = 8 * 1024 * 1024;

type SyncDoc = {
  _id: string;
  _type: "booksSync";
  vault: string;
  salt: string;
  iv: string;
  ciphertext: string;
  authHash: string;
  rev: number;
  bytes: number;
  updatedAt: string;
  device?: string;
};

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function tokenOf(req: Request): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+([A-Za-z0-9_-]{20,200})$/.exec(h);
  return m ? m[1] : null;
}

function sameHash(a: string, b: string): boolean {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && timingSafeEqual(x, y);
}

async function gated(): Promise<boolean> {
  return (await cookies()).get(GATE_COOKIE)?.value === "1";
}

// Imported lazily: the Sanity client module throws at import time when the
// project env vars are missing (local dev), and that should be a 503, not a crash.
async function writeClient() {
  const { getSanityWriteClient } = await import("@/lib/sanity-write");
  return getSanityWriteClient();
}

async function load(): Promise<SyncDoc | null> {
  const client = await writeClient();
  return (await client.getDocument<SyncDoc>(DOC_ID)) ?? null;
}

function unavailable(e: unknown) {
  const msg = e instanceof Error ? e.message : "Sync unavailable";
  const notConfigured = /SANITY_AUTH_TOKEN|projectId/.test(msg);
  return NextResponse.json({ error: notConfigured ? "Sync isn't configured on this deployment." : msg }, { status: 503 });
}

export async function GET(req: Request) {
  if (!(await gated())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const url = new URL(req.url);
  let doc: SyncDoc | null;
  try {
    doc = await load();
  } catch (e) {
    return unavailable(e);
  }
  if (url.searchParams.get("meta") === "1") {
    return NextResponse.json(
      doc ? { exists: true, salt: doc.salt, rev: doc.rev, updatedAt: doc.updatedAt, bytes: doc.bytes } : { exists: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!doc) return NextResponse.json({ error: "No vault yet" }, { status: 404 });
  const token = tokenOf(req);
  if (!token || !sameHash(sha256(token), doc.authHash)) return NextResponse.json({ error: "Wrong passphrase" }, { status: 403 });
  return NextResponse.json(
    { salt: doc.salt, iv: doc.iv, ciphertext: doc.ciphertext, rev: doc.rev, updatedAt: doc.updatedAt, device: doc.device },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(req: Request) {
  if (!(await gated())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const token = tokenOf(req);
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });
  let body: { salt?: string; iv?: string; ciphertext?: string; device?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }
  const { salt, iv, ciphertext, device } = body;
  if (typeof salt !== "string" || typeof iv !== "string" || typeof ciphertext !== "string" || ciphertext.length === 0) {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }
  if (ciphertext.length > MAX_BYTES) return NextResponse.json({ error: "Too large" }, { status: 413 });

  let doc: SyncDoc | null;
  try {
    doc = await load();
  } catch (e) {
    return unavailable(e);
  }
  const authHash = sha256(token);
  if (doc) {
    if (!sameHash(authHash, doc.authHash)) return NextResponse.json({ error: "Wrong passphrase" }, { status: 403 });
    if (doc.salt !== salt) return NextResponse.json({ error: "Salt mismatch" }, { status: 409, headers: { "X-Rev": String(doc.rev) } });
    const ifMatch = req.headers.get("if-match");
    if (ifMatch !== null && Number(ifMatch) !== doc.rev) {
      return NextResponse.json({ error: "Newer copy on the server", rev: doc.rev }, { status: 409 });
    }
  }
  const next: SyncDoc = {
    _id: DOC_ID,
    _type: "booksSync",
    vault: VAULT,
    salt,
    iv,
    ciphertext,
    authHash,
    rev: (doc?.rev ?? 0) + 1,
    bytes: ciphertext.length,
    updatedAt: new Date().toISOString(),
    device: typeof device === "string" ? device.slice(0, 80) : undefined,
  };
  try {
    await (await writeClient()).createOrReplace(next);
  } catch (e) {
    return unavailable(e);
  }
  return NextResponse.json({ rev: next.rev, updatedAt: next.updatedAt }, { headers: { "Cache-Control": "no-store" } });
}
