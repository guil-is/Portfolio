"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Check, PartyPopper } from "lucide-react";
import { CtaButton } from "@/components/CtaButton";

/**
 * "Accept this proposal" action for /for/[slug] proposal pages. Turns the
 * client's yes into an event: a small name (+ optional note) form that
 * emails Guil via /api/accept-proposal, so acceptance stops living only
 * in chat threads. Not a signature — the signable agreement follows on
 * the client page (docs/client-lifecycle.md).
 *
 * Accepted state persists per-browser via localStorage, mirroring the
 * pending-list pattern: the repo data stays the source of truth for the
 * client's stage; this is just the visitor-facing acknowledgment.
 */

const storageKey = (slug: string) => `for-${slug}-accepted`;
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

async function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const { default: confetti } = await import("canvas-confetti");
  confetti({
    particleCount: 90,
    spread: 80,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.8 },
    scalar: 0.9,
    ticks: 200,
  });
}

export function AcceptProposal({ slug }: { slug: string }) {
  const accepted = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(storageKey(slug)) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (accepted) {
    return (
      <div className="inline-flex items-center gap-3 rounded-[14px] border border-accent/40 bg-accent/10 px-5 py-4">
        <PartyPopper className="h-4 w-4 text-accent" strokeWidth={2} aria-hidden />
        <p className="text-[0.95rem] leading-[1.5rem] text-ink">
          Accepted — thank you! Guil has been notified and will follow up
          with the agreement.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <CtaButton
        type="button"
        onClick={() => setOpen(true)}
        label="Accept this proposal"
        icon={Check}
      />
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/accept-proposal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, name: name.trim(), note: note.trim() }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      try {
        window.localStorage.setItem(storageKey(slug), "1");
      } catch {
        // localStorage unavailable — the accepted state won't persist.
      }
      notify();
      void celebrate();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[480px] flex-col gap-5 rounded-[14px] border border-rule bg-card/40 p-6"
    >
      <p className="text-[0.95rem] leading-[1.6rem] text-muted">
        Great! Leave your name so Guil knows who this is from — he&apos;ll
        follow up with the agreement.
      </p>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="accept-name"
          className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted"
        >
          Your name
        </label>
        <input
          id="accept-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          autoComplete="name"
          className="w-full border-b border-rule bg-transparent pb-2 text-[1rem] leading-[1.6] text-ink transition-colors placeholder:text-faint focus:border-ink focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="accept-note"
          className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted"
        >
          Anything to add? (optional)
        </label>
        <input
          id="accept-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. which option, timing, questions"
          className="w-full border-b border-rule bg-transparent pb-2 text-[1rem] leading-[1.6] text-ink transition-colors placeholder:text-faint focus:border-ink focus:outline-none"
        />
      </div>
      {error ? (
        <p className="text-[0.85rem] text-[#d14343]">{error}</p>
      ) : null}
      <div className="flex items-center gap-4">
        <CtaButton
          type="submit"
          disabled={!name.trim() || submitting}
          label={submitting ? "Sending…" : "Confirm"}
          icon={Check}
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
