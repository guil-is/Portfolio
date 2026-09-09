---
name: add-resources
description: Add links to the design resources library at /resources with zero manual work — fetch each page, title it, write the why-line, categorize, rate, then write to Sanity through the "Sanity — Create resource" Action. Use whenever Guil drops one or more URLs and says add / save / resource / library, or asks to re-rank, re-categorize, describe, or remove entries.
---

# Add resources

Guil pastes links. You turn them into library entries. He never fills a
Studio form. Read `docs/resources-library.md` § "Drop links" once if
anything below is unclear.

## 1. Collect

- Pull every URL out of the message. Notes next to a link ("this one's
  essential", "for the icons category", "meh but keep") override your
  own judgment for that link.
- Normalize: strip tracking params (`utm_*`, `ref`, `fbclid`), keep the
  canonical page (a tool's home, not a blog post about it, unless the
  post itself is the resource).

## 2. Research each link

- `WebFetch` the URL. Ask for: what it is, who makes it, pricing or free
  tier, what makes it different. One call per link, no deep crawl.
- If the fetch fails or returns nothing useful, work from the domain
  and your own knowledge, and say so in the report. Don't stall on it.

## 3. Decide the entry

- **title** — the product's own name, no tagline ("Phosphor Icons",
  not "Phosphor — a flexible icon family").
- **category** — nearest fit from `RESOURCE_CATEGORIES` in
  `src/lib/resources.ts`. Use `other` only when nothing fits. If you
  think a new category is needed, propose it in the report; adding one
  is a code change, never invent a value.
- **description** — one line, under 110 characters, in Guil's voice:
  concrete, opinionated, why it earns a spot. Sounds like a designer
  telling a friend, not a landing page. Good: "Free, variable, no login.
  Still the first stop for a body face." Bad: "A comprehensive platform
  for discovering beautiful fonts."
- **tags** — 2 to 4, lowercase. Prefer the shared vocabulary so filters
  stay useful: `free`, `paid`, `freemium`, `open-source`, `figma`,
  `plugin`, `web`, `product`, `brand`, `motion`, `3d`, `ai`, `font`,
  `icons`, `reference`, `generator`, `inspiration`. Add a specific one
  when it helps ("variable", "grain").
- **rating** — the rank, 1 to 5:
  - 5 · essential: best in class, reach for it weekly
  - 4 · strong: regular use, clearly above the alternatives
  - 3 · solid: good, one of several (default when unsure)
  - 2 · situational: right tool for a narrow job
  - 1 · niche: kept for reference

## 4. Validate locally

Build the JSON array and run the script without a token. It checks
shape, categories and ratings, nothing is written:

```bash
ITEMS_JSON='[{"url":"https://...","title":"...","category":"...","description":"...","tags":["free"],"rating":4}]' \
DRY_RUN=true npx tsx scripts/sanity/create-resource.ts
```

## 5. Write through the Action

The Sanity token lives only in GitHub secrets, so writes go through the
workflow. Dispatch it on `main` with `items_json` and `dry_run: "false"`:

- GitHub MCP: `actions_run_trigger` → `run_workflow`,
  `workflow_id: "sanity-create-resource.yml"`, `ref: "main"`,
  `inputs: { items_json: <array>, dry_run: "false" }`.
- Or `gh workflow run sanity-create-resource.yml -f items_json='…' -f dry_run=false`.

Then wait ~30s and poll: `actions_list` → `list_workflow_runs` for that
workflow (newest first) until `status: completed`. On `conclusion:
failure`, pull `get_job_logs` with `failed_only: true`, fix the input,
re-dispatch. On success, read the job log to confirm the counts the
script printed.

## 6. Updates and removals

Same flow. A known URL is patched with only the fields you send, so
re-ranking is `{ "url": "...", "rating": 5 }` and re-categorizing is
`{ "url": "...", "category": "color" }`. Removing is
`{ "url": "...", "delete": true }`. Send `null` to clear description,
tags or rating. "Remove X" from Guil is explicit; do it without asking.

## 7. Report

One compact table: title · category · rating · description. Then a line
for updates/deletions/skips, and a line for anything you had to guess
(fetch failed, category was a stretch). No commit is needed for a
library change. Only code changes (a new category, page tweaks) go
through the CLAUDE.md workflow.
