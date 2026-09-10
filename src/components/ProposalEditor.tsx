"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Check, Pencil, X } from "lucide-react";
import {
  normalizeText,
  occurrenceOf,
  type ProposalEdit,
  type ProposalLeaf,
} from "@/lib/proposal-edit";

/**
 * Owner edit mode for /for/[slug] proposal pages: edit the copy in place,
 * save, and the change is committed to main (see /api/proposal-edit).
 *
 * Invisible to clients. It shows up only when the browser holds the
 * passphrase (localStorage) or the URL carries ?edit, which opens the
 * passphrase prompt. In edit mode every text node that matches a string
 * in the proposal data becomes contenteditable; anything else on the
 * page (JSX copy with links, computed labels) stays as it is.
 *
 * Saved edits are kept in localStorage as a pending overlay and painted
 * on top of the page until the redeploy carrying them lands, so a reload
 * a minute after saving doesn't look like the edit vanished.
 */

const SECRET_KEY = "proposal-edit-secret";
const pendingKey = (slug: string) => `proposal-edit-pending:${slug}`;

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function notify() {
  for (const cb of listeners) cb();
}

/** null = hidden; "" = show the passphrase prompt; else the passphrase. */
function readArm(): string | null {
  try {
    const s = window.localStorage.getItem(SECRET_KEY);
    if (s) return s;
  } catch {
    // localStorage unavailable
  }
  return new URLSearchParams(window.location.search).has("edit") ? "" : null;
}

type Bound = { leaf: ProposalLeaf; index: number; span: HTMLSpanElement; node: Text };

function textNodesUnder(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p || p.closest("script, style, [data-edit-path]")) return NodeFilter.FILTER_REJECT;
      if (!n.nodeValue?.trim()) return NodeFilter.FILTER_SKIP;
      // Some blocks render twice (mobile + desktop); bind the visible one.
      return p.getClientRects().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  const out: Text[] = [];
  let n = walker.nextNode();
  while (n) {
    out.push(n as Text);
    n = walker.nextNode();
  }
  return out;
}

function indexByText(nodes: Text[]): Map<string, Text[]> {
  const map = new Map<string, Text[]>();
  for (const node of nodes) {
    const key = normalizeText(node.nodeValue ?? "");
    const list = map.get(key);
    if (list) list.push(node);
    else map.set(key, [node]);
  }
  return map;
}

function readPending(slug: string): ProposalEdit[] {
  try {
    const raw = window.localStorage.getItem(pendingKey(slug));
    return raw ? (JSON.parse(raw) as ProposalEdit[]) : [];
  } catch {
    return [];
  }
}

function writePending(slug: string, edits: ProposalEdit[]) {
  try {
    if (edits.length === 0) window.localStorage.removeItem(pendingKey(slug));
    else window.localStorage.setItem(pendingKey(slug), JSON.stringify(edits));
  } catch {
    // ignore
  }
}

/** Edits this page load painted itself, so a second pass (StrictMode)
 * doesn't mistake its own work for a landed deploy. */
const paintedThisLoad = new Set<string>();

/** Paint saved-but-not-yet-deployed edits over the page; drop the ones
 * the deploy has caught up with (their new text is already on the page)
 * and the ones whose old text is gone for another reason. */
function applyPending(slug: string, root: HTMLElement) {
  const pending = readPending(slug);
  if (pending.length === 0) return;
  const byText = indexByText(textNodesUnder(root));
  const still: ProposalEdit[] = [];
  for (const edit of pending) {
    const key = `${edit.path}\u0000${edit.next}`;
    if (paintedThisLoad.has(key)) {
      still.push(edit);
      continue;
    }
    if (byText.has(normalizeText(edit.next))) continue; // deploy landed
    const node = byText.get(normalizeText(edit.old))?.[edit.occurrence];
    if (!node) continue;
    node.nodeValue = edit.next;
    paintedThisLoad.add(key);
    still.push(edit);
  }
  writePending(slug, still);
}

export function ProposalEditor({ slug, leaves }: { slug: string; leaves: ProposalLeaf[] }) {
  const arm = useSyncExternalStore(subscribe, readArm, () => null);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(0);
  const [matched, setMatched] = useState(0);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "error"; text?: string; url?: string }>({ kind: "idle" });
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState<string | null>(null);
  const bound = useRef<Bound[]>([]);

  useEffect(() => {
    if (arm === null) return;
    const root = document.querySelector<HTMLElement>("[data-proposal-root]");
    if (root) applyPending(slug, root);
  }, [arm, slug]);

  if (arm === null) return null;

  function root(): HTMLElement | null {
    return document.querySelector<HTMLElement>("[data-proposal-root]");
  }

  function countDirty() {
    let n = 0;
    for (const b of bound.current) {
      if (normalizeText(b.span.textContent ?? "") !== normalizeText(b.leaf.value)) n++;
    }
    setDirty(n);
  }

  function startEditing() {
    const r = root();
    if (!r) return;
    const byText = indexByText(textNodesUnder(r));
    const list: Bound[] = [];
    leaves.forEach((leaf, index) => {
      const node = byText.get(normalizeText(leaf.value))?.shift();
      if (!node?.parentNode) return;
      const span = document.createElement("span");
      span.dataset.editPath = leaf.path;
      span.contentEditable = "plaintext-only";
      if (span.contentEditable !== "plaintext-only") span.contentEditable = "true";
      span.spellcheck = true;
      span.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          span.blur();
        }
      });
      span.addEventListener("input", countDirty);
      node.parentNode.insertBefore(span, node);
      span.appendChild(node);
      list.push({ leaf, index, span, node });
    });
    bound.current = list;
    setMatched(list.length);
    setDirty(0);
    setStatus({ kind: "idle" });
    setEditing(true);
  }

  function unbind(finalText: (b: Bound) => string) {
    for (const b of bound.current) {
      const text = finalText(b);
      if (b.node.parentNode === b.span) {
        b.node.nodeValue = text;
        b.span.replaceWith(b.node);
      } else {
        b.span.replaceWith(document.createTextNode(text));
      }
    }
    bound.current = [];
    setEditing(false);
    setDirty(0);
  }

  function discard() {
    unbind((b) => b.leaf.value);
    setStatus({ kind: "idle" });
  }

  async function save() {
    const edits: ProposalEdit[] = [];
    for (const b of bound.current) {
      const next = normalizeText(b.span.textContent ?? "");
      if (next && next !== normalizeText(b.leaf.value)) {
        edits.push({
          path: b.leaf.path,
          old: b.leaf.value,
          next,
          occurrence: occurrenceOf(leaves, b.index),
        });
      }
    }
    if (edits.length === 0) return;
    setStatus({ kind: "saving", text: "Committing…" });
    try {
      const res = await fetch("/api/proposal-edit", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${arm}` },
        body: JSON.stringify({ slug, edits }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; url?: string; sha?: string };
      if (!res.ok || !json.ok) {
        setStatus({ kind: "error", text: json.error ?? "Save failed." });
        return;
      }
      const byPath = new Map(edits.map((e) => [e.path, e.next]));
      unbind((b) => byPath.get(b.leaf.path) ?? b.leaf.value);
      writePending(slug, [...readPending(slug), ...edits]);
      setStatus({
        kind: "ok",
        text: `Saved ${edits.length} ${edits.length === 1 ? "change" : "changes"}. Live in about two minutes.`,
        url: json.url,
      });
    } catch {
      setStatus({ kind: "error", text: "Save failed. Check your connection." });
    }
  }

  async function unlock(e: FormEvent) {
    e.preventDefault();
    const secret = pass.trim();
    if (!secret) return;
    setPassError(null);
    try {
      const res = await fetch("/api/proposal-edit", {
        headers: { authorization: `Bearer ${secret}` },
      });
      if (res.status === 204) {
        window.localStorage.setItem(SECRET_KEY, secret);
        setPass("");
        notify();
        return;
      }
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setPassError(json.error ?? "Couldn't unlock.");
    } catch {
      setPassError("Couldn't reach the server.");
    }
  }

  function signOut() {
    try {
      window.localStorage.removeItem(SECRET_KEY);
    } catch {
      // ignore
    }
    if (editing) discard();
    notify();
    const url = new URL(window.location.href);
    if (url.searchParams.has("edit")) {
      url.searchParams.delete("edit");
      window.history.replaceState(null, "", url.toString());
    }
  }

  const shell =
    "pointer-events-auto flex items-center gap-3 rounded-full border border-rule bg-card px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]";
  const btn =
    "font-caption text-[11px] font-semibold uppercase tracking-[1.5px] transition-colors";

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2">
      <style>{`
        [data-edit-path]{outline:1px dashed color-mix(in srgb, currentColor 45%, transparent);outline-offset:3px;border-radius:2px;cursor:text}
        [data-edit-path]:focus{outline:1px solid currentColor}
      `}</style>

      {status.kind !== "idle" && status.text ? (
        <p
          className={`pointer-events-auto max-w-[320px] rounded-[12px] border border-rule bg-card px-4 py-2 text-[0.8rem] leading-[1.3rem] ${
            status.kind === "error" ? "text-[#d14343]" : "text-muted"
          }`}
        >
          {status.text}
          {status.url ? (
            <>
              {" "}
              <a href={status.url} target="_blank" rel="noopener noreferrer" className="underline">
                commit
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      {arm === "" ? (
        <form onSubmit={unlock} className={shell}>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Edit passphrase"
            autoFocus
            autoComplete="off"
            className="w-40 bg-transparent text-[0.9rem] text-ink placeholder:text-faint focus:outline-none"
          />
          <button type="submit" className={`${btn} text-ink hover:text-muted`}>
            Unlock
          </button>
          {passError ? <span className="text-[0.75rem] text-[#d14343]">{passError}</span> : null}
        </form>
      ) : editing ? (
        <div className={shell}>
          <span className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {dirty} of {matched} changed
          </span>
          <button
            type="button"
            onClick={save}
            disabled={dirty === 0 || status.kind === "saving"}
            className={`${btn} inline-flex items-center gap-1.5 text-ink hover:text-muted disabled:opacity-40`}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {status.kind === "saving" ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={discard} className={`${btn} text-muted hover:text-ink`}>
            Discard
          </button>
        </div>
      ) : (
        <div className={shell}>
          <button
            type="button"
            onClick={startEditing}
            className={`${btn} inline-flex items-center gap-1.5 text-ink hover:text-muted`}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Edit page
          </button>
          <button
            type="button"
            onClick={signOut}
            aria-label="Hide the editor"
            title="Hide the editor on this browser"
            className="text-muted transition-colors hover:text-ink"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
