"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  clientRegistry,
  currentClients,
  pastClients,
  stageLabel,
  type ClientEntry,
} from "@/content/clients/registry";

// Master dashboard for every private /for/ page. Once this page is unlocked
// (via its own PasswordGate), it writes each client page's unlock flag into
// sessionStorage, so navigating to any of them from here skips the per-page
// password. Same-tab navigation only — sessionStorage is per-tab, so a card
// opened in a brand-new tab would still prompt.
export function ClientsDashboard() {
  useEffect(() => {
    for (const c of clientRegistry) {
      window.sessionStorage.setItem(c.storageKey, "1");
    }
  }, []);

  const current = currentClients();
  const past = pastClients();

  return (
    <main className="page-fade-in mx-auto w-full max-w-[880px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      <section className="flex flex-col gap-6 pb-10 md:pb-14">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
          Private · Client index
        </p>
        <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[4rem]">
          Clients
        </h1>
        <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
          Every private client page in one place. Open any of them from here
          without re-entering a password.
        </p>
      </section>

      <div className="flex flex-col gap-16">
        {current.length > 0 ? (
          <ClientGroup label="Current" clients={current} />
        ) : null}
        {past.length > 0 ? (
          <ClientGroup label="Past" clients={past} />
        ) : null}
      </div>
    </main>
  );
}

function ClientGroup({
  label,
  clients,
}: {
  label: string;
  clients: ClientEntry[];
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
          {label}
        </h2>
        <p className="font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
          {clients.length} {clients.length === 1 ? "client" : "clients"}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-rule bg-rule sm:grid-cols-2">
        {clients.map((c) => (
          <li key={c.slug}>
            <ClientCard client={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ClientCard({ client }: { client: ClientEntry }) {
  return (
    <Link
      href={client.href}
      className="group flex h-full min-h-[132px] flex-col justify-between gap-6 bg-bg px-5 py-5 transition-colors hover:bg-card md:px-6 md:py-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="font-display text-[1.25rem] font-bold leading-tight text-ink md:text-[1.4rem]">
            {client.name}
          </h3>
          {stageLabel(client) ? (
            <span className="inline-flex items-center rounded-[6px] border border-rule-soft bg-card/50 px-2 py-[2px] font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">
              {stageLabel(client)}
            </span>
          ) : null}
        </div>
        <span
          aria-hidden
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule text-muted transition-colors group-hover:border-ink group-hover:text-ink"
        >
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-45"
            strokeWidth={2}
          />
        </span>
      </div>
      <p className="text-[0.9rem] leading-[1.5rem] text-muted">
        {client.summary}
      </p>
    </Link>
  );
}
