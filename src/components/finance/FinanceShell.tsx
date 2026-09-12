"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { BookOpen, Cloud, CloudOff, Eye, EyeOff, LayoutDashboard, RefreshCw, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PrivacyProvider, usePrivacy } from "@/components/money/Privacy";
import { useSync } from "@/components/SyncBar";
import { rise } from "./Kpi";

/**
 * The frame every finance page shares: sidebar (Overview, Books,
 * Clients), page header with actions, one sync instance, privacy mode,
 * a toast. Pages render their content inside; nothing here touches the
 * numbers.
 *
 * One login for the app: whichever gate let you in, the shell marks the
 * other pages' gates as open for this tab (sessionStorage, like the
 * clients index does for the client pages).
 */

export type ShellSection = "overview" | "books" | "clients";

export type SubnavItem = { key: string; label: string; active: boolean; onSelect: () => void };

const NAV: { key: ShellSection; href: string; label: string; icon: LucideIcon }[] = [
  { key: "overview", href: "/money", label: "Overview", icon: LayoutDashboard },
  { key: "books", href: "/books", label: "Books", icon: BookOpen },
  { key: "clients", href: "/for/clients", label: "Clients", icon: Users },
];

const GATE_KEYS = ["for-expenses-unlocked", "for-clients-unlocked"];

export function FinanceShell(props: {
  active: ShellSection;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  subnav?: SubnavItem[];
  toast?: string | null;
  onToast: (msg: string) => void;
  onRestored: () => void;
  children: ReactNode;
}) {
  return (
    <PrivacyProvider>
      <Frame {...props} />
    </PrivacyProvider>
  );
}

function Frame({ active, title, subtitle, actions, subnav, toast, onToast, onRestored, children }: Parameters<typeof FinanceShell>[0]) {
  const sync = useSync();

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

  return (
    <div className="fd min-h-screen bg-background text-foreground">
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
                <NavItem href={n.href} icon={n.icon} active={active === n.key}>
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
          </div>
        </aside>

        {/* ---------- content ---------- */}
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="fd-rise flex flex-wrap items-start justify-between gap-3" style={rise(0)}>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="text-2xl font-semibold tracking-tight lg:text-[28px]">{title}</h1>
              {subtitle ? <p className="text-sm text-fd-muted-foreground">{subtitle}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <span className="ml-1 flex items-center gap-1.5 lg:hidden">
                <PrivacyControl variant="icon" />
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
          {children}
        </main>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
          <div className="fd-portal rounded-xl border bg-popover px-4 py-2.5 text-sm text-popover-foreground shadow-fd">{toast}</div>
        </div>
      ) : null}
    </div>
  );
}

function NavItem({ href, icon: Icon, active, children }: { href: string; icon: LucideIcon; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
        active ? "bg-fd-card text-foreground shadow-fd" : "text-fd-muted-foreground hover:bg-fd-accent hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {children}
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

function PrivacyControl({ variant }: { variant: "icon" | "row" }) {
  const { hidden, toggle } = usePrivacy();
  if (variant === "icon") {
    return (
      <Button variant={hidden ? "default" : "outline"} size="icon-sm" onClick={toggle} aria-pressed={hidden} title={hidden ? "Show amounts (H)" : "Hide amounts (H)"}>
        {hidden ? <EyeOff /> : <Eye />}
      </Button>
    );
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={hidden}
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-foreground"
    >
      {hidden ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      <span className="flex-1 text-left">{hidden ? "Show amounts" : "Hide amounts"}</span>
      <kbd className="rounded border px-1.5 text-[10px] text-fd-muted-foreground">H</kbd>
    </button>
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
          <button type="button" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-foreground">
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (window.confirm("Forget the passphrase on this device? The books stay here and in the vault; you'll enter the passphrase again to sync.")) disable();
                }}
              >
                Forget on this device
              </Button>
            </div>
            <p className="text-xs text-fd-muted-foreground">The backup file lives on the Books page, under the accountant tab.</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
