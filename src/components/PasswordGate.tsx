"use client";

import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

// Local pub-sub so same-tab sessionStorage updates trigger re-reads.
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

function makeSnapshot(key: string) {
  return () => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(key) === "1";
  };
}
function getServerSnapshot() {
  return false;
}

type Props = {
  children: ReactNode;
  password: string;
  /** Unique per-page key so unlocking one client page doesn't unlock another. */
  storageKey?: string;
};

// Simple client-side password gate. Stores an "unlocked" flag in
// sessionStorage so it persists for the tab lifetime. Not real auth —
// the password ships in the client bundle. Good enough for sharing a
// hidden URL with one client.
export function PasswordGate({ children, password, storageKey = "odyssey-unlocked" }: Props) {
  const unlocked = useSyncExternalStore(subscribe, makeSnapshot(storageKey), getServerSnapshot);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (input === password) {
      window.sessionStorage.setItem(storageKey, "1");
      notify();
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[400px] flex-col gap-10"
      >
        <div className="flex flex-col gap-2">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
            Private page
          </p>
          <h1 className="font-display text-[1.75rem] font-bold leading-tight text-ink md:text-[2rem]">
            This page is locked.
          </h1>
          <p className="mt-2 text-[0.95rem] leading-[1.6rem] text-muted">
            Enter the password shared with you to continue.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label
            htmlFor="odyssey-pw"
            className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted"
          >
            Password
          </label>
          <input
            id="odyssey-pw"
            type="password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(false);
            }}
            autoFocus
            autoComplete="off"
            className="w-full border-b border-rule bg-transparent pb-2 text-[1rem] leading-[1.6] text-ink transition-colors placeholder:text-faint focus:border-ink focus:outline-none"
          />
          {error ? (
            <p className="text-[0.85rem] text-[#d14343]">
              Wrong password. Try again.
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className="cta-pill group inline-flex h-14 items-center gap-4 self-start pr-6"
        >
          <span className="flex h-14 w-14 items-center justify-center text-bg">
            <ArrowUpRight
              className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-45"
              strokeWidth={2}
            />
          </span>
          <span className="font-caption text-[13px] font-bold uppercase tracking-[1px]">
            Enter
          </span>
        </button>
      </form>
    </div>
  );
}
