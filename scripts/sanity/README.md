# Sanity scripts

One-off mutation scripts for the Sanity dataset. Each script is
triggered from the **GitHub Actions tab** in the repo — no local
setup required.

## One-time setup

Add three **repository secrets** in GitHub
(`Settings → Secrets and variables → Actions → New repository secret`):

| Secret name          | Value                                          |
| -------------------- | ---------------------------------------------- |
| `SANITY_PROJECT_ID`  | `ilcq8ood`                                     |
| `SANITY_DATASET`     | `production`                                   |
| `SANITY_AUTH_TOKEN`  | Write token from sanity.io/manage → API → Tokens → Editor |

The token must have **Editor** permission (or higher). Keep it out of
`.env.local` on machines you don't trust; the secret lives only on
GitHub's infra.

## Running a workflow

1. GitHub → **Actions** tab
2. Pick the workflow in the left sidebar (e.g. "Sanity — Merge projects")
3. Click **Run workflow** on the right
4. Fill in the inputs
5. Leave **dry_run = true** for the first run — it logs the plan
   without mutating. Review the logs, then re-run with **dry_run = false**
   to actually commit the change.
6. Every run uploads a **pre-merge backup** as an artifact, retained
   for 90 days. Download it from the run's summary page if you ever
   need to restore.

## Available scripts

### `merge-projects.ts` — consolidate multiple project docs into one

Takes a **keeper slug** + comma-separated **source slugs**, and:

- Concatenates text fields (`summary`, `services`) from keeper and
  sources with clear `--- merged from X ---` separators so you can
  tidy in the Studio.
- Concatenates arrays (`projectDetails`, `stillFrames`) so every
  image / block / caption from every source ends up on the keeper.
- Takes the keeper's single-value fields (`gridImage`, `mainImage`,
  `heroVideo`, `link`, `client`) and falls back to the first
  non-empty source if the keeper is missing one.
- `featured = true` if any of the docs were featured.
- Rewrites every `_ref` in every other document that pointed at a
  source to point at the keeper instead.
- Deletes the source documents.
- All of the above runs in a single Sanity transaction — either
  everything commits or nothing does.

**Workflow**: `.github/workflows/sanity-merge-projects.yml`
**Inputs**: `keeper_slug`, `source_slugs`, `dry_run`

## Adding more scripts

1. Write `scripts/sanity/<name>.ts` — use the merge script as a
   template. Read inputs from `process.env`, use `next-sanity`'s
   `createClient` with `SANITY_AUTH_TOKEN`, always offer a `DRY_RUN`
   mode, always write a backup to `scripts/sanity/backups/` before
   mutating.
2. Add a script to `package.json`: `"sanity:<name>": "tsx scripts/sanity/<name>.ts"`
3. Add `.github/workflows/sanity-<name>.yml` following the merge
   workflow as a template.
4. Commit + push. The workflow appears in the Actions tab on next
   push to `main`.

## Why GitHub Actions and not local

My dev sandbox can't reach `api.sanity.io` (Sanity's edge blocks
unknown hosts). GitHub's runners can. Running mutations there also
gives us: audit trail in Actions history, artifact retention for
backups, and no secrets on personal machines.
