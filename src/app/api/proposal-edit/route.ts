import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getProposal } from "@/content/proposals";
import { applyEdits, type ProposalEdit } from "@/lib/proposal-edit";

/**
 * Owner-only copy edits for /for/[slug] proposal pages.
 *
 *   GET   (bearer)                  → 204 when the passphrase is right
 *   POST  (bearer) { slug, edits }  → rewrites src/content/proposals/<slug>.tsx
 *                                     on main through the GitHub contents API
 *
 * Auth is a single passphrase (PROPOSAL_EDIT_SECRET) that never ships in
 * the bundle: the editor keeps it in localStorage and sends it as a
 * bearer token. The GitHub token (GITHUB_CONTENT_TOKEN, fine-grained,
 * contents read/write on this repo only) stays server-side. Setup and
 * the day-to-day flow: docs/editing-proposals.md.
 */

export const runtime = "nodejs";

const REPO = process.env.GITHUB_CONTENT_REPO ?? "guil-is/Portfolio";
const BRANCH = process.env.GITHUB_CONTENT_BRANCH ?? "main";
const MAX_EDITS = 200;
const MAX_LENGTH = 4000;

function sha256(s: string): Buffer {
  return createHash("sha256").update(s).digest();
}

type Auth = "ok" | "unauthorized" | "unconfigured";

function authorize(req: Request): Auth {
  const secret = process.env.PROPOSAL_EDIT_SECRET;
  if (!secret || !process.env.GITHUB_CONTENT_TOKEN) return "unconfigured";
  const m = /^Bearer\s+(.+)$/.exec(req.headers.get("authorization") ?? "");
  if (!m) return "unauthorized";
  return timingSafeEqual(sha256(m[1]!), sha256(secret)) ? "ok" : "unauthorized";
}

function deny(auth: Auth) {
  if (auth === "unconfigured") {
    return NextResponse.json(
      { error: "Editing isn't set up on this deployment yet." },
      { status: 503 },
    );
  }
  return NextResponse.json({ error: "Wrong passphrase." }, { status: 401 });
}

async function github(path: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${process.env.GITHUB_CONTENT_TOKEN}`,
      "x-github-api-version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg = typeof json.message === "string" ? json.message : res.statusText;
    throw new Error(`GitHub ${res.status}: ${msg}`);
  }
  return json;
}

export async function GET(req: Request) {
  const auth = authorize(req);
  if (auth !== "ok") return deny(auth);
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: Request) {
  const auth = authorize(req);
  if (auth !== "ok") return deny(auth);

  let body: { slug?: string; edits?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (!getProposal(slug) || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Unknown proposal." }, { status: 400 });
  }

  const raw = Array.isArray(body.edits) ? body.edits : [];
  const edits: ProposalEdit[] = [];
  for (const e of raw as Array<Record<string, unknown>>) {
    const old = typeof e?.old === "string" ? e.old : "";
    // Source literals can't hold raw newlines; a pasted paragraph break
    // becomes a space rather than breaking the file.
    const next =
      typeof e?.next === "string"
        ? e.next.replace(/ /g, " ").replace(/\s+/g, " ").trim()
        : "";
    const occurrence = Number.isInteger(e?.occurrence) ? (e.occurrence as number) : 0;
    if (!old || next === old) continue;
    if (next.length > MAX_LENGTH || occurrence < 0) {
      return NextResponse.json({ error: "An edit is too long." }, { status: 400 });
    }
    edits.push({ path: String(e?.path ?? ""), old, next, occurrence });
  }
  if (edits.length === 0) {
    return NextResponse.json({ error: "Nothing changed." }, { status: 400 });
  }
  if (edits.length > MAX_EDITS) {
    return NextResponse.json({ error: "Too many edits at once." }, { status: 400 });
  }

  const filePath = `src/content/proposals/${slug}.tsx`;
  try {
    const file = await github(
      `/repos/${REPO}/contents/${filePath}?ref=${encodeURIComponent(BRANCH)}`,
    );
    const source = Buffer.from(String(file.content ?? ""), "base64").toString("utf8");
    const { source: updated, failed } = applyEdits(source, edits);
    if (failed.length > 0) {
      return NextResponse.json(
        {
          error: `Couldn't place ${failed.length} of ${edits.length} edits in the source file. Ask Claude to apply them.`,
          failed: failed.map((f) => ({ path: f.path, old: f.old, next: f.next })),
        },
        { status: 409 },
      );
    }
    if (updated === source) {
      return NextResponse.json({ error: "Nothing changed." }, { status: 400 });
    }

    const paths = edits.map((e) => e.path).filter(Boolean);
    const shown = paths.slice(0, 6).join(", ") + (paths.length > 6 ? ", …" : "");
    const message = `${slug}: copy edits from the page${shown ? ` (${shown})` : ""}`;

    const result = await github(`/repos/${REPO}/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: Buffer.from(updated, "utf8").toString("base64"),
        sha: file.sha,
        branch: BRANCH,
      }),
    });
    const commit = (result.commit ?? {}) as { sha?: string; html_url?: string };
    return NextResponse.json({
      ok: true,
      applied: edits.length,
      sha: commit.sha ?? null,
      url: commit.html_url ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Save failed.";
    console.error("[proposal-edit]", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
