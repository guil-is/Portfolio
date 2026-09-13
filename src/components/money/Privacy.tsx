"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Privacy mode for the finance app: one toggle hides every amount (they
 * render as bullets, not blurred digits, so nothing readable is in the
 * DOM). Per device, remembered in localStorage; the H key flips it.
 *
 * Three ways to respect it: the <Amount> component, the `eur()` formatter
 * from useMoney() for strings, and `mask()` for a sentence that already
 * carries a figure ("Logos owes €500 …").
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
      if (e.metaKey || e.ctrlKey || e.altKey) return;
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

const fmt0 = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const fmt2 = new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const HIDDEN = "€••••";

export function formatAmount(value: number, opts: { decimals?: 0 | 2; currency?: "EUR" | "USD"; signed?: boolean } = {}): string {
  const { decimals = 0, currency = "EUR", signed = false } = opts;
  const abs = Math.abs(value);
  const n = decimals === 2 ? fmt2.format(abs) : fmt0.format(Math.round(abs));
  const sym = currency === "USD" ? "$" : "€";
  const sign = value < 0 ? "−" : signed && value > 0 ? "+" : "";
  return `${sign}${sym}${n}`;
}

/** "€1,815", "$320.00", "1.815,00 €", "€ 500" → "€••••" (keeps the currency sign). */
export function maskAmounts(text: string): string {
  return text
    .replace(/([€$])\s?[−-]?\d[\d.,]*(?:\s?[kK])?/g, "$1••••")
    .replace(/[−-]?\d[\d.,]*\s?([€$])/g, "$1••••");
}

/**
 * Formatters that respect privacy mode. `eur(n)` for whole euros,
 * `eur(n, 2)` with cents, `usd()` likewise, `mask()` for prose.
 */
export function useMoney() {
  const { hidden } = usePrivacy();
  return useMemo(
    () => ({
      hidden,
      eur: (n: number, decimals: 0 | 2 = 0, signed = false) => (hidden ? (n < 0 ? `−${HIDDEN}` : HIDDEN) : formatAmount(n, { decimals, signed })),
      usd: (n: number, decimals: 0 | 2 = 0) => (hidden ? "$••••" : formatAmount(n, { decimals, currency: "USD" })),
      mask: (text: string) => (hidden ? maskAmounts(text) : text),
    }),
    [hidden],
  );
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
