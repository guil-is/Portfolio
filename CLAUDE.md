# Workflow

- **Branch strategy**: solo project — push directly to `main`. No feature branches, no PRs, unless explicitly asked. Production (guil.is) deploys from `main`.
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

- Bi-weekly cadence — one period block per invoice cycle.
- Prepend a new period to the top of `hoursLog` in `src/content/clients/justice.ts`. Shape:
  `{ label, weekStart, weeks: 2, items: [{ project, description, hours }, ...], invoice?, note? }`
- `invoice`: `{ number?, issuedAt, paidAt? }`. Omit while the period is still in progress; add when issued; set `paidAt` when payment lands.
- Totals, paid/outstanding, pace status, and project-rollup pills all derive automatically from the data.
