"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { BookOpen, Cloud, CloudOff, Eye, EyeOff, Keyboard, LayoutDashboard, Moon, RefreshCw, Sun, SunMoon, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Segmented, SegmentedItem } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { usePrivacy } from "@/components/money/Privacy";
import { useSync } from "@/components/SyncBar";
import { Confirm } from "./Confirm";
import { rise } from "./Kpi";

/**
 * The frame every finance page shares: sidebar (Overview, Books,
 * Clients), page header with actions, one sync instance, privacy mode,
 * theme, keyboard shortcuts, a toast. Pages render their content inside;
 * nothing here touches the numbers.
 *
 * One login for the app: whichever gate let you in, the shell marks the
 * other pages' gates as open for this tab (sessionStorage, like the
 * clients index does for the client pages).
 */

export type ShellSection = "overview" | "books" | "clients";

export type SubnavItem = { key: string; label: string; active: boolean; onSelect: () => void };

/** A page-level keyboard shortcut: listed in the "?" sheet and fired by the shell. */
export type Shortcut = { key: string; label: string; run: () => void };

const NAV: { key: ShellSection; href: string; label: string; icon: LucideIcon; shortcut: string }[] = [
  { key: "overview", href: "/money", label: "Overview", icon: LayoutDashboard, shortcut: "1" },
  { key: "books", href: "/books", label: "Books", icon: BookOpen, shortcut: "2" },
  { key: "clients", href: "/for/clients", label: "Clients", icon: Users, shortcut: "3" },
];

const GATE_KEYS = ["for-expenses-unlocked", "for-clients-unlocked"];

/**
 * Pages must sit inside <PrivacyProvider> (each dashboard wraps itself),
 * so useMoney()/usePrivacy() work above the shell as well as in it.
 */
export function FinanceShell(props: {
  active: ShellSection;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Header actions on wide screens. */
  actions?: ReactNode;
  /** What replaces them below `sm` — typically one primary button plus a menu. Omit to show `actions` everywhere. */
  compactActions?: ReactNode;
  subnav?: SubnavItem[];
  shortcuts?: Shortcut[];
  toast?: string | null;
  onToast: (msg: string) => void;
  onRestored: () => void;
  children: ReactNode;
}) {
  return <Frame {...props} />;
}

function Frame({ active, title, subtitle, actions, compactActions, subnav, shortcuts, toast, onToast, onRestored, children }: Parameters<typeof FinanceShell>[0]) {
  const sync = useSync();
  const router = useRouter();
  const [help, setHelp] = useState(false);
  // The first sync after the page opens may bring newer books from the
  // vault; until it answers, a fresh device would show empty numbers.
  const [settled, setSettled] = useState(false);
  if (!settled && (sync.status.kind === "idle" || sync.status.kind === "error")) setSettled(true);
  const firstSync = !settled && sync.status.kind === "syncing";
  // A pull merged another device's edits — the overlay stays until the reload.
  const restoring = sync.status.kind === "idle" && Boolean(sync.status.pulled);

  useEffect(() => {
    try {
      for (const k of GATE_KEYS) window.sessionStorage.setItem(k, "1");
    } catch {
      // storage disabled — each page keeps its own gate
    }
  }, []);

  // A pull merged another device's edits into localStorage — reload so the page shows them.
  useEffect(() => {
    if (sync.status.kind === "idle" && sync.status.pulled) onRestored();
  }, [sync.status, onRestored]);

  // Global shortcuts: 1/2/3 switch pages, ? opens the sheet, H is handled by the privacy provider.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "?") {
        setHelp((h) => !h);
        return;
      }
      const nav = NAV.find((n) => n.shortcut === e.key);
      if (nav) {
        if (nav.key !== active) router.push(nav.href);
        return;
      }
      const page = shortcuts?.find((s) => s.key.toLowerCase() === e.key.toLowerCase());
      if (page) {
        e.preventDefault();
        page.run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, router, shortcuts]);

  return (
    <div className="fd min-h-screen bg-background text-foreground">
      <a
        href="#fd-main"
        className="sr-only z-[60] rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-[1280px] gap-8 px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        {/* ---------- sidebar (desktop) ---------- */}
        <aside className="fd-rise sticky top-8 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col pb-16 lg:flex" style={rise(0)}>
          <Link href="/money" className="flex items-center gap-2.5 px-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">G</span>
            <span className="text-sm font-semibold leading-tight">Financial<br />Dashboard</span>
          </Link>
          <nav className="mt-8 flex flex-col gap-1" aria-label="Finance pages">
            {NAV.map((n) => (
              <div key={n.key}>
                <NavItem href={n.href} icon={n.icon} active={active === n.key} shortcut={n.shortcut}>
                  {n.label}
                </NavItem>
                {active === n.key && subnav && subnav.length > 0 ? (
                  <ul className="mt-1 mb-2 ml-[19px] flex flex-col gap-0.5 border-l pl-3">
                    {subnav.map((s) => (
                      <li key={s.key}>
                        <button
                          type="button"
                          onClick={s.onSelect}
                          aria-current={s.active ? "true" : undefined}
                          className={cn(
                            "w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                            s.active ? "font-medium text-foreground" : "text-fd-muted-foreground hover:text-foreground",
                          )}
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-1">
            <SyncControl variant="row" sync={sync} onToast={onToast} onRestored={onRestored} />
            <PrivacyControl variant="row" />
            <ThemeControl variant="row" />
            <button
              type="button"
              onClick={() => setHelp(true)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-foreground"
            >
              <Keyboard className="size-4" aria-hidden />
              <span className="flex-1 text-left">Shortcuts</span>
              <kbd className="rounded border px-1.5 text-[10px] text-fd-muted-foreground">?</kbd>
            </button>
          </div>
        </aside>

        {/* ---------- content ---------- */}
        <main id="fd-main" className="flex min-w-0 flex-1 flex-col gap-5 outline-none" tabIndex={-1}>
          <header className="fd-rise flex flex-wrap items-start justify-between gap-3" style={rise(0)}>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="text-2xl font-semibold tracking-tight lg:text-[28px]">{title}</h1>
              {subtitle ? <p className="text-sm text-fd-muted-foreground">{subtitle}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {compactActions ? (
                <>
                  <span className="hidden flex-wrap items-center gap-2 sm:flex">{actions}</span>
                  <span className="flex items-center gap-2 sm:hidden">{compactActions}</span>
                </>
              ) : (
                actions
              )}
              <span className="ml-1 flex items-center gap-1.5 lg:hidden">
                <PrivacyControl variant="icon" />
                <ThemeControl variant="icon" />
                <SyncControl variant="icon" sync={sync} onToast={onToast} onRestored={onRestored} />
              </span>
            </div>
          </header>
          <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 lg:hidden" aria-label="Finance pages">
            {NAV.map((n) => (
              <Button key={n.key} asChild variant={active === n.key ? "default" : "outline"} size="sm" className="rounded-full">
                <Link href={n.href} aria-current={active === n.key ? "page" : undefined}>{n.label}</Link>
              </Button>
            ))}
          </nav>
          {firstSync && sync.status.kind === "syncing" ? (
            <p className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-2.5 text-sm text-fd-muted-foreground" role="status">
              <RefreshCw className="size-4 animate-spin" aria-hidden /> Checking the vault for newer books…
            </p>
          ) : null}
          {children}
        </main>
      </div>

      {restoring ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="fd-portal flex items-center gap-3 rounded-xl border bg-popover px-5 py-3 text-sm shadow-fd">
            <RefreshCw className="size-4 animate-spin" aria-hidden /> Restoring your books from the vault…
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
          <div className="fd-portal rounded-xl border bg-popover px-4 py-2.5 text-sm text-popover-foreground shadow-fd">{toast}</div>
        </div>
      ) : null}

      <ShortcutSheet open={help} onOpenChange={setHelp} page={shortcuts} />
    </div>
  );
}

function NavItem({ href, icon: Icon, active, shortcut, children }: { href: string; icon: LucideIcon; active?: boolean; shortcut?: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
        active ? "bg-fd-card text-foreground shadow-fd" : "text-fd-muted-foreground hover:bg-fd-accent hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden />
      <span className="flex-1">{children}</span>
      {shortcut ? <kbd className="rounded border px-1.5 text-[10px] text-fd-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{shortcut}</kbd> : null}
    </Link>
  );
}

/* ---------- controls ---------- */

function agoNow(iso: string | undefined): string {
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

const ROW_BTN = "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-foreground";

function PrivacyControl({ variant }: { variant: "icon" | "row" }) {
  const { hidden, toggle } = usePrivacy();
  if (variant === "icon") {
    return (
      <Button variant={hidden ? "default" : "outline"} size="icon-sm" onClick={toggle} aria-pressed={hidden} aria-label={hidden ? "Show amounts" : "Hide amounts"} title={hidden ? "Show amounts (H)" : "Hide amounts (H)"}>
        {hidden ? <EyeOff /> : <Eye />}
      </Button>
    );
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={hidden} className={ROW_BTN}>
      {hidden ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      <span className="flex-1 text-left">{hidden ? "Show amounts" : "Hide amounts"}</span>
      <kbd className="rounded border px-1.5 text-[10px] text-fd-muted-foreground">H</kbd>
    </button>
  );
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Theme for the app: Light, Dark, or Auto (the site's rule — dark before
 * 7 and after 19). An explicit choice sticks; "Auto" hands it back.
 */
function ThemeControl({ variant }: { variant: "icon" | "row" }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const current = mounted ? (theme ?? "system") : "system";
  const dark = mounted && resolvedTheme === "dark";
  if (variant === "icon") {
    return (
      <Button variant="outline" size="icon-sm" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Light theme" : "Dark theme"}>
        {mounted ? dark ? <Sun /> : <Moon /> : <SunMoon />}
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-1.5">
      <SunMoon className="size-4 text-fd-muted-foreground" aria-hidden />
      <Segmented value={current} onValueChange={setTheme} aria-label="Theme" className="h-7 flex-1">
        <SegmentedItem value="light" className="px-2 text-xs">Light</SegmentedItem>
        <SegmentedItem value="dark" className="px-2 text-xs">Dark</SegmentedItem>
        <SegmentedItem value="system" className="px-2 text-xs" title="Dark before 7 and after 19, like the site">Auto</SegmentedItem>
      </Segmented>
    </div>
  );
}

function ShortcutSheet({ open, onOpenChange, page }: { open: boolean; onOpenChange: (o: boolean) => void; page?: Shortcut[] }) {
  const rows: { key: string; label: string }[] = [
    ...NAV.map((n) => ({ key: n.shortcut, label: `Go to ${n.label}` })),
    { key: "H", label: "Hide or show every amount" },
    ...(page ?? []).map((s) => ({ key: s.key.toUpperCase(), label: s.label })),
    { key: "?", label: "This sheet" },
    { key: "Esc", label: "Close a menu or cancel an edit" },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>They work anywhere on the page except inside a field.</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col divide-y text-sm">
          {rows.map((r) => (
            <li key={r.key + r.label} className="flex items-center justify-between gap-4 py-2">
              <span>{r.label}</span>
              <kbd className="rounded-md border bg-fd-muted px-2 py-0.5 font-mono text-xs">{r.key}</kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function SyncControl({ variant, sync, onToast, onRestored }: { variant: "icon" | "row"; sync: ReturnType<typeof useSync>; onToast: (msg: string) => void; onRestored: () => void }) {
  const { state, status, run, enable, disable } = sync;
  const [open, setOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [, bump] = useState(0);

  useEffect(() => {
    if (!open) return;
    const t = window.setInterval(() => bump((n) => n + 1), 30_000);
    return () => window.clearInterval(t);
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const ok = await enable(pass);
    setBusy(false);
    if (ok) {
      setPass("");
      setOpen(false);
      onToast("Sync is on — the books follow this passphrase to every device");
      onRestored();
    }
  }

  const off = !state;
  const syncing = status.kind === "syncing";
  const errored = status.kind === "error";
  const label = off ? "Sync is off" : syncing ? "Syncing…" : errored ? status.message : `Synced ${agoNow(status.kind === "idle" ? status.lastSyncAt : state.lastSyncAt)}`;
  const icon = syncing ? <RefreshCw className="size-4 animate-spin" aria-hidden /> : off || errored ? <CloudOff className="size-4 text-fd-warn" aria-hidden /> : <Cloud className="size-4 text-fd-up" aria-hidden />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "icon" ? (
          <Button variant="outline" size="icon-sm" aria-label={`Sync: ${label}`} title={label}>
            {icon}
          </Button>
        ) : (
          <button type="button" className={ROW_BTN}>
            {icon}
            <span className="flex-1 truncate text-left">{label}</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align={variant === "icon" ? "end" : "start"} side={variant === "icon" ? "bottom" : "top"} className="w-[min(92vw,360px)] text-sm">
        {off ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <p className="leading-5">
              <span className="font-medium">Sync is off.</span>{" "}
              <span className="text-fd-muted-foreground">The books only live in this browser. Choose a passphrase and they&apos;ll follow it to every device, encrypted before they leave.</span>
            </p>
            <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passphrase — same one on each device" autoComplete="off" minLength={8} required autoFocus />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="sm" disabled={busy || pass.length < 8}>
                <Cloud /> {busy ? "Setting up…" : "Turn on sync"}
              </Button>
              {errored ? <span className={/configured|unavailable/i.test(status.message) ? "text-fd-muted-foreground" : "text-fd-down"}>{status.message}</span> : null}
            </div>
            <p className="text-xs leading-5 text-fd-muted-foreground">Nobody can recover the passphrase — not the site, not Sanity. Keep it in your password manager. If a vault already exists, the passphrase must open it.</p>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="leading-5">
              {syncing ? (
                "Syncing…"
              ) : errored ? (
                <>
                  <span className="font-medium">{status.message}.</span> <span className="text-fd-muted-foreground">Last synced {agoNow(status.lastSyncAt)}.</span>
                </>
              ) : (
                <>
                  <span className="font-medium">Synced {agoNow(status.kind === "idle" ? status.lastSyncAt : state.lastSyncAt)}.</span>{" "}
                  <span className="text-fd-muted-foreground">Encrypted with your passphrase · {state.device}</span>
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => void run({ force: true })} disabled={syncing}>
                <RefreshCw /> Sync now
              </Button>
              <Confirm
                title="Forget the passphrase on this device?"
                description="The books stay here and in the vault. You'll enter the passphrase again to sync from this device."
                action="Forget it"
                onConfirm={disable}
                trigger={
                  <Button type="button" variant="ghost" size="sm">
                    Forget on this device
                  </Button>
                }
              />
            </div>
            <p className="text-xs text-fd-muted-foreground">The backup file lives on the Books page, under the accountant tab.</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
