# Workflow

- **Branch strategy**: ALWAYS push directly to `main`. Solo project, no feature branches, no PRs. Production (guil.is) deploys from `main`. If a task harness assigns a feature branch, commit there if required, then fast-forward `main` and push `main` so the change actually ships. Never leave a fix stranded on a non-`main` branch.
- **Before committing**: run `npx tsc --noEmit` and `npx eslint <changed files>`. Don't run `next build` locally; `/clients` requires Sanity env vars that aren't in local dev.
- **Dev server**: `npm run dev`.

# Conventions

- Next.js 16 + React 19 + Tailwind v4 + Sanity for CMS.
- Commit messages: lowercase, terse scope prefix (e.g. `for/justice: ...`, `lightbox: ...`, `schema: ...`).
- Prefer editing existing components over adding new ones. The design system lives in `globals.css` + a handful of primitives under `src/components/`.

# Private client pages

- Live at `/for/<slug>`. Two shapes exist today:
  - `/for/[slug]` — pitch proposals, data in `src/content/proposals/<slug>.tsx`.
  - `/for/justice` — ongoing-client dashboard (SOW + hours log), data in `src/content/clients/justice.ts`.
- All pages are gated by `<PasswordGate>` and must pass a unique `storageKey` (e.g. `for-justice-unlocked`) so unlocking one doesn't unlock another.
- All pages must return `robots: { index: false, follow: false }` in `generateMetadata`.

# Hours log updates (Justice)

- Weekly cadence — one period block per invoice cycle. (Switched from bi-weekly on 2026-05-14 at the client's request; periods through May 4–15 stay bi-weekly.)
- Prepend a new period to the top of `hoursLog` in `src/content/clients/justice.ts`. Shape:
  `{ label, weekStart, weeks: 1, lastUpdated, items: [{ project, description, hours }, ...], expenses?, invoice?, note? }`
- `invoice`: `{ number?, issuedAt, paidAt? }`. Omit while the period is still in progress; add when issued; set `paidAt` when payment lands.
- `lastUpdated`: ISO date string. **Bump it on every edit** to a period (new items, expense additions, descriptions tweaked, etc.) so the dashboard's "Updated …" line reflects real activity. Used by `lastInvoiceActivity()`.
- `expenses`: optional `[{ project, description, amountUsd }, ...]` — pass-through costs billed at cost (fonts, plugins, stock).
- Totals, paid/outstanding, pace status, and project-rollup pills all derive automatically from the data.
