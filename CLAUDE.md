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
