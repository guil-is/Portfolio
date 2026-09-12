"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Privacy mode for the money page: one toggle hides every amount (they
 * render as bullets, not blurred digits, so nothing readable is in the
 * DOM). Per device, remembered in localStorage; the H key flips it.
 */

const KEY = "money:v1:hidden";

const PrivacyContext = createContext<{ hidden: boolean; toggle: () => void }>({ hidden: false, toggle: () => {} });

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });
  const toggle = useCallback(() => {
    setHidden((h) => {
      try {
        window.localStorage.setItem(KEY, h ? "0" : "1");
      } catch {
        // fine — the toggle still works for this session
      }
      return !h;
    });
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "h" || e.key === "H") toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);
  return <PrivacyContext.Provider value={{ hidden, toggle }}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}

export function PrivacyToggle() {
  const { hidden, toggle } = usePrivacy();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={hidden}
      title={hidden ? "Show amounts (H)" : "Hide amounts (H)"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        hidden ? "border-ink bg-ink text-bg" : "border-rule bg-bg text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {hidden ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
    </button>
  );
}

const fmt0 = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const fmt2 = new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatAmount(value: number, opts: { decimals?: 0 | 2; currency?: "EUR" | "USD"; signed?: boolean } = {}): string {
  const { decimals = 0, currency = "EUR", signed = false } = opts;
  const abs = Math.abs(value);
  const n = decimals === 2 ? fmt2.format(abs) : fmt0.format(Math.round(abs));
  const sym = currency === "USD" ? "$" : "€";
  const sign = value < 0 ? "−" : signed && value > 0 ? "+" : "";
  return `${sign}${sym}${n}`;
}

/** An amount that respects privacy mode. */
export function Amount({
  value,
  decimals = 0,
  currency = "EUR",
  signed = false,
  className = "",
}: {
  value: number;
  decimals?: 0 | 2;
  currency?: "EUR" | "USD";
  signed?: boolean;
  className?: string;
}) {
  const { hidden } = usePrivacy();
  if (hidden) {
    return (
      <span className={`tabular-nums ${className}`} aria-label="amount hidden">
        {currency === "USD" ? "$" : "€"}
        <span className="tracking-[2px]">••••</span>
      </span>
    );
  }
  return <span className={`tabular-nums ${className}`}>{formatAmount(value, { decimals, currency, signed })}</span>;
}
