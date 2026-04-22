"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  /**
   * `exact` = only active when pathname === href.
   * Default matches pathname or its parents (e.g. /projects/foo under /).
   */
  match?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", match: (p) => p === "/" },
  {
    label: "Work",
    href: "/#work",
    match: (p) => p.startsWith("/projects/"),
  },
  { label: "About", href: "/#about", match: () => false },
  {
    label: "Clients",
    href: "/clients",
    match: (p) => p.startsWith("/clients"),
  },
  {
    label: "Get in touch",
    href: "https://cal.com/guil-is",
    external: true,
    match: () => false,
  },
];

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on escape + on pathname change + on outside click
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll on mobile while the menu is open.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop — mobile only. Closes the menu when tapped. */}
      {open ? (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
        />
      ) : null}

      <div ref={panelRef} className="relative z-50">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-bg/80 text-ink/80 backdrop-blur transition-colors hover:bg-ink/5 hover:text-ink"
        >
          {open ? (
            <X className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Menu className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>

        {open ? (
          <div
            role="menu"
            aria-label="Site navigation"
            className="absolute right-0 top-12 min-w-[220px] overflow-hidden rounded-[18px] border border-rule bg-bg p-2 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
          >
            <ul className="flex flex-col py-1">
              {NAV_ITEMS.map((item) => {
                const active = item.match
                  ? item.match(pathname)
                  : pathname === item.href;
                const className = `flex items-center gap-3 rounded-lg px-4 py-2 font-display text-[1.25rem] transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`;
                const inner = (
                  <>
                    <span
                      aria-hidden
                      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                        active ? "bg-ink" : "bg-transparent"
                      }`}
                    />
                    {item.label}
                  </>
                );
                return (
                  <li key={item.href}>
                    {item.external ? (
                      <a
                        role="menuitem"
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link
                        role="menuitem"
                        href={item.href}
                        className={className}
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-1 border-t border-rule-soft px-2 pt-2">
              <ThemeToggleRow />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function ThemeToggleRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const isDark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center justify-between rounded-lg px-2 py-2 font-caption text-[12px] font-medium uppercase tracking-[1px] text-muted transition-colors hover:text-ink"
      aria-label="Toggle color theme"
    >
      <span>{mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"}</span>
      {mounted ? (
        isDark ? (
          <Sun className="h-3.5 w-3.5" strokeWidth={1.75} />
        ) : (
          <Moon className="h-3.5 w-3.5" strokeWidth={1.75} />
        )
      ) : (
        <span className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
