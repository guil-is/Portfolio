# Workflow

- **Branch strategy**: ALWAYS push directly to `main`. Solo project, no feature branches, no PRs. Production (guil.is) deploys from `main`. If a task harness assigns a feature branch, commit there if required, then fast-forward `main` and push `main` so the change actually ships. Never leave a fix stranded on a non-`main` branch.
- **Before committing**: run `npx tsc --noEmit` and `npx eslint <changed files>`. Don't run `next build` locally; `/clients` requires Sanity env vars that aren't in local dev.
- **Dev server**: `npm run dev`.

# Conventions

- Next.js 16 + React 19 + Tailwind v4 + Sanity for CMS.
- Commit messages: lowercase, terse scope prefix (e.g. `for/justice: ...`, `lightbox: ...`, `schema: ...`).
- Prefer editing existing components over adding new ones. The design system lives in `globals.css` + a handful of primitives under `src/components/`.

# Portfolio projects

- Projects (homepage "Past work" grid + `/projects/<slug>` case studies) live in **Sanity** (the `project` doc type), managed at `/studio`. Add a new project there, not in code.
- `src/content/projects.ts` is legacy: it only backfills images/bodies for older pre-CMS projects. Don't add new projects to it.
- Full workflow + field reference: `docs/adding-a-project.md`.

# Client lifecycle (onboarding → close-out)

- **The protocol for all client admin is `docs/client-lifecycle.md`** — read it before any client-related task (new lead, proposal, agreement, payment, close-out). Skills: `/new-client` (onboarding stages), `/client-sweep` (weekly status/drift check).
- `src/content/clients/registry.ts` is the master client record: `stage` (proposal → accepted → signed → active → delivered → closed), contacts, `billingPreset`. Keep stages current — the `/for/clients` dashboard derives from them.
- New leads start as an intake file (`src/content/clients/intake/<slug>.ts`, schema + gap checks in `intake.ts`). Collect what `intakeGaps()` reports missing before crossing each gate — no agreements with placeholder legal entities, no invoicing without full billing data.
- The client `slug` is the primary key everywhere (registry, signable map, billing preset key, ledger `clientSlug`, storageKey). Never let them diverge.

# Private client pages

- Live at `/for/<slug>`. Two shapes exist today:
  - `/for/[slug]` — pitch proposals, data in `src/content/proposals/<slug>.tsx`.
  - Client dashboards (agreement + progress) — data in `src/content/clients/<slug>.ts`, rendered by the shared `ClientPage` component (`/for/e2c` is the reference). A thin `page.tsx` composes `ClientPageData` from the content file. Older clients (spa, justice, logos, huit, myosin, tedxberlin) still have bespoke components; fold them into `ClientPage` when next touched, don't copy them for new clients.
- All pages are gated by `<PasswordGate>` and must pass a unique `storageKey` (`for-<slug>-unlocked`) so unlocking one doesn't unlock another.
- All pages must return `robots: { index: false, follow: false }` in `generateMetadata`.
- Any page with a signable agreement (`<AgreementSignature>`) must have its client registered in `src/content/clients/signable.ts`, or signing returns "Unknown client". The `clientSlug` prop is typed to that map, so `tsc` fails if you forget. To surface a client on the `/for/clients` dashboard, also add it to `registry.ts`.

# WinWin cross-context memory

- WinWin/SPA lives in three places: this repo (client-facing admin), a local Claude Code folder (production files), and a claude.ai project (thinking). The shared index is a **Notion page**, "WinWin 2026 — project brain" (under "WinWin Brussels"): https://app.notion.com/p/3ac9754238ea8106b9e9c0bf7b0a0132 (page id `3ac97542-38ea-8106-b9e9-c0bf7b0a0132`). Migrated from Google Docs on 2026-07-29; the old GDoc is frozen and points here.
- Four sections, one owner each. **This repo owns "Status" and "Money".** "Production" belongs to the local WINWIN folder, "Decisions & context" to the claude.ai project.
- Routine on any session that touches SPA: (1) read the whole Notion page first via the Notion MCP (`notion-fetch`); (2) do the work; (3) edit ONLY the Status and Money sections via `notion-update-page` (`update_content` for targeted edits) — note cross-owner facts in your own section, never edit theirs; (4) bump "Last reconciled" to today.
- Keep `docs/winwin-status.md` (the repo mirror of Status + Money) in step with the Notion page and with `src/content/clients/spa.ts` + the ledger.
- If the Notion MCP is not connected in a session, say so and stop rather than guessing — the page can only be edited through it. To connect: `claude mcp add --transport http notion https://mcp.notion.com/mcp` (then authenticate).

# E2C cross-context memory

- E2C Cookbook lives in two places: this repo (agreement, phases, money) and a claude.ai project (design thinking). The shared index is a Notion page, **"E2C Cookbook — project brain"** (page id `3ac97542-38ea-817e-8255-f7e5311fd5b2`), readable and writable by both via the Notion connector.
- This repo owns the **Status**, **Money**, and **Agreement** sections of that page. **Whenever E2C state changes here** (`currentPhase` bump, agreement edit, ledger entry, payment landing), update the Notion page to match `src/content/clients/e2c.ts` + the ledger via `notion-update-page` (targeted `update_content` edits, not full replaces), and bump its "Last reconciled" line. The claude.ai project owns **Thinking** — don't overwrite it.
- Unlike the WinWin Google Doc, the Notion connector CAN edit in place. No manual paste step, and never create a second copy of the page.

# Invoices

- To make an invoice from a prompt: `npm run invoice` — full workflow in `docs/making-an-invoice.md`.
- Static data (issuer, bank/crypto details, client addresses): `src/content/invoices/config.ts`. Rule of thumb: German client → EUR + 19% MwSt + N26 IBAN; outside the EU → USD + §3a UStG exemption + Wise details.
- **After issuing**: archive the PDF to Google Drive (`Invoices/Invoices <year>/` — the CLI does this when `INVOICE_ARCHIVE_DIR` is set; from a Claude session, upload via the Drive connector), then append to `src/content/invoices/ledger.ts` (drives auto-numbering; set `clientSlug` for clients in the registry). Justice invoices also go into the `hoursLog` (below).

# Hours log updates (Justice)

- Weekly cadence — one period block per invoice cycle. (Switched from bi-weekly on 2026-05-14 at the client's request; periods through May 4–15 stay bi-weekly.)
- Prepend a new period to the top of `hoursLog` in `src/content/clients/justice.ts`. Shape:
  `{ label, weekStart, weeks: 1, lastUpdated, items: [{ project, description, hours }, ...], expenses?, invoice?, note? }`
- `invoice`: `{ number?, issuedAt, paidAt? }`. Omit while the period is still in progress; add when issued; set `paidAt` when payment lands.
- `lastUpdated`: ISO date string. **Bump it on every edit** to a period (new items, expense additions, descriptions tweaked, etc.) so the dashboard's "Updated …" line reflects real activity. Used by `lastInvoiceActivity()`.
- `expenses`: optional `[{ project, description, amountUsd }, ...]` — pass-through costs billed at cost (fonts, plugins, stock).
- Totals, paid/outstanding, pace status, and project-rollup pills all derive automatically from the data.
