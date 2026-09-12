"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { KIND_LABELS, KIND_ORDER, inEur, isAsset, newAccountId, type Account, type AccountKind } from "@/lib/money/accounts";
import { Amount, usePrivacy } from "./Privacy";

/**
 * Balances you keep by hand. Click a balance to type the current figure;
 * the row shows how old it is. Grouped by kind, net worth at the foot.
 */

function ago(iso: string, today: string): string {
  if (!iso) return "never entered";
  const days = Math.round((Date.parse(today) - Date.parse(iso.slice(0, 10))) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? "" : "s"} ago`;
}

export function AccountsPanel({
  accounts,
  usdRate,
  today,
  onChange,
}: {
  accounts: Account[];
  usdRate: number;
  today: string;
  onChange: (next: Account[]) => void;
}) {
  const { hidden } = usePrivacy();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  function startEdit(a: Account) {
    setEditing(a.id);
    setDraft(a.balance ? String(a.balance) : "");
  }

  function commit(a: Account) {
    const v = Number(draft.replace(/\s/g, "").replace(",", "."));
    if (Number.isFinite(v)) onChange(accounts.map((x) => (x.id === a.id ? { ...x, balance: v, updatedAt: new Date().toISOString() } : x)));
    setEditing(null);
  }

  function remove(a: Account) {
    if (window.confirm(`Remove ${a.name}? The balance history isn't kept.`)) onChange(accounts.filter((x) => x.id !== a.id));
  }

  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim();
    if (!name) return;
    onChange([
      ...accounts,
      { id: newAccountId(name), name, kind: String(f.get("kind")) as AccountKind, currency: String(f.get("currency")) as "EUR" | "USD", balance: 0, updatedAt: "" },
    ]);
    e.currentTarget.reset();
    setAdding(false);
  }

  const assets = accounts.filter((a) => isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const debts = accounts.filter((a) => !isAsset(a.kind)).reduce((t, a) => t + inEur(a, usdRate), 0);
  const kinds = KIND_ORDER.filter((k) => accounts.some((a) => a.kind === k));
  const stale = (a: Account) => !a.updatedAt || (Date.parse(today) - Date.parse(a.updatedAt.slice(0, 10))) / 86_400_000 > 30;

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col overflow-hidden rounded-[14px] border border-rule">
        {kinds.map((kind) => (
          <li key={kind} className="border-b border-rule last:border-b-0">
            <p className="bg-card/40 px-4 py-1.5 font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">{KIND_LABELS[kind]}</p>
            <ul>
              {accounts
                .filter((a) => a.kind === kind)
                .map((a) => (
                  <li key={a.id} className="group flex items-center gap-3 border-t border-rule-soft px-4 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9rem] text-ink">{a.name}</span>
                      <span className={`block text-[0.75rem] ${stale(a) ? "text-warn" : "text-muted"}`}>
                        {a.currency === "USD" && !hidden && a.balance ? `€${inEur(a, usdRate).toLocaleString("en", { maximumFractionDigits: 0 })} · ` : ""}
                        updated {ago(a.updatedAt, today)}
                      </span>
                    </span>
                    {editing === a.id ? (
                      <input
                        autoFocus
                        type="text"
                        inputMode="decimal"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={() => commit(a)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commit(a);
                          if (e.key === "Escape") setEditing(null);
                        }}
                        placeholder="0.00"
                        className="w-[120px] rounded-[8px] border border-ink bg-bg px-2 py-1 text-right text-[0.9rem] tabular-nums text-ink focus:outline-none"
                      />
                    ) : (
                      <button type="button" onClick={() => startEdit(a)} title="Enter today's balance" className="rounded-[8px] px-2 py-1 text-right transition-colors hover:bg-card/60">
                        <Amount value={a.kind === "debt" ? -a.balance : a.balance} decimals={2} currency={a.currency} className={`font-display text-[1rem] font-bold ${a.kind === "debt" ? "text-down" : "text-ink"}`} />
                      </button>
                    )}
                    <button type="button" onClick={() => remove(a)} title="Remove account" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-faint opacity-0 transition-opacity hover:text-down group-hover:opacity-100 focus:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1 text-[0.85rem]">
        <span className="text-muted">
          Net worth <span className="text-faint">· assets {hidden ? "€••••" : `€${Math.round(assets).toLocaleString("en")}`}{debts > 0 ? `, debts ${hidden ? "€••••" : `€${Math.round(debts).toLocaleString("en")}`}` : ""}</span>
        </span>
        <Amount value={assets - debts} className="font-display text-[1.1rem] font-bold text-ink" />
      </div>

      {adding ? (
        <form onSubmit={add} className="flex flex-wrap items-end gap-2 rounded-[14px] border border-rule px-4 py-3">
          <label className="flex flex-1 flex-col gap-1 text-[0.75rem] text-muted">
            Name
            <input name="name" type="text" required autoFocus placeholder="ING · Savings" className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-[0.75rem] text-muted">
            Kind
            <select name="kind" defaultValue="cash" className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none">
              {KIND_ORDER.map((k) => (
                <option key={k} value={k}>{KIND_LABELS[k]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[0.75rem] text-muted">
            Currency
            <select name="currency" defaultValue="EUR" className="rounded-[8px] border border-rule bg-bg px-2 py-1.5 text-[0.85rem] text-ink focus:border-ink focus:outline-none">
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <button type="submit" className="rounded-full border border-ink bg-ink px-4 py-1.5 font-caption text-[10px] font-bold uppercase tracking-[1px] text-bg transition-colors hover:bg-transparent hover:text-ink">Add</button>
          <button type="button" onClick={() => setAdding(false)} className="rounded-full border border-rule px-4 py-1.5 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted transition-colors hover:border-ink hover:text-ink">Cancel</button>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 self-start rounded-full border border-rule px-3 py-1 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted transition-colors hover:border-ink hover:text-ink">
          <Plus className="h-3 w-3" aria-hidden /> Add account
        </button>
      )}
    </div>
  );
}
