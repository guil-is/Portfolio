---
name: add-resources
description: Add links to the design resources library at /resources with zero manual work — fetch each page, title it, write the why-line, categorize, rate, then write to Sanity through the Sanity connector when it is present, else through the "Sanity — Create resource" Action. Use whenever Guil drops one or more URLs and says add / save / resource / library, or asks to re-rank, re-categorize, describe, or remove entries.
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

## 1b. Videos, articles, roundups

A YouTube video, newsletter or "10 tools I use" post is a container, not
a resource. Extract the tool list first: the description and chapter
list, then the transcript or body. Each tool then goes through steps
2–3 on its own URL. Don't add the container itself unless Guil says to.

Remote sessions sit behind an egress allowlist: youtube.com, transcript
mirrors and most tool homepages are denied (403 on CONNECT). When the
host is blocked, don't route around it. Ask Guil to paste the tool
names or the description, then continue. In a local session WebFetch
reaches the video page directly.

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

## 4. Write: Sanity connector first

Check the tool list for the Sanity MCP (tools named `mcp__Sanity__*`,
remote server mcp.sanity.io, OAuth as Guil). When present, write
directly and skip step 5. Project `ilcq8ood`, dataset `production`,
workspace `guil-portfolio`. Verified end to end on 2026-09-09.

1. Duplicate check: `query_documents`, perspective `published`,
   `*[_type == "resource" && url == $url]`, also with and without a
   trailing slash and `www.`.
2. New URL: `create_documents` with `type: "resource"` and the fields in
   `content` (shape below). It returns a `drafts.<id>`. Then
   `publish_documents` with that id. The site renders published
   documents only, so a create without a publish is invisible.
3. Known URL: `patch_documents` on the published id with `set` for the
   changed fields (or `unset`). Patches land on a draft, so follow with
   `publish_documents`.
4. Removal: there is no delete tool. `unpublish_documents` on the
   published id, then `discard_drafts` on `drafts.<id>`.
5. Confirm with one `published` query before reporting.

```json
{ "_type": "resource", "title": "…", "url": "https://…", "category": "typography",
  "description": "…", "tags": ["free"], "rating": 4 }
```

Only ever touch `resource` documents. `category` must be a value from
`src/lib/resources.ts`. `get_schema` only knows `resource` once the
"Sanity — Deploy schema" Action has run with a Deploy Studio token; until
then the list in this file and in `src/lib/resources.ts` is the truth.

## 5. Write: trigger file (no connector)

Validate the batch first. It checks shape, categories and ratings, no
token needed, nothing is written:

```bash
ITEMS_FILE=.github/triggers/resources.json npx tsx scripts/sanity/create-resource.ts
```

The Sanity token lives only in GitHub secrets, the GitHub App behind the
MCP tools can't dispatch workflows, and the remote sandbox can't reach
Sanity. So the fallback write path is a push: the "Sanity — Create
resource" Action runs whenever `.github/triggers/resources.json` changes
on `main`.

1. Write the file. `batch` is a free label that makes every push a
   diff, even when the items repeat:

   ```json
   {
     "batch": "2026-09-09 3 links from Guil",
     "dry_run": false,
     "items": [ { "url": "...", "title": "...", "category": "...", "description": "...", "tags": ["free"], "rating": 4 } ]
   }
   ```

2. Commit only that file, message `resources: add 3 links` (or
   `resources: re-rank …`, `resources: remove …`), and push to `main`
   per the CLAUDE.md workflow (commit on the harness branch if one is
   assigned, then fast-forward `main`).

3. Poll the run: `actions_list` → `list_workflow_runs` with
   `resource_id: "sanity-create-resource.yml"`, newest first, until
   `status: completed`. Give it ~60s. On `conclusion: failure`, read
   `get_job_logs` with `failed_only: true`, fix the file, push a new
   batch. On success, `list_workflow_jobs` for the run, then
   `get_job_logs` with that `job_id` and `return_content: true` to
   confirm the counts the script printed.

A local session with the `gh` CLI can skip the commit:
`gh workflow run sanity-create-resource.yml -f items_json='…' -f dry_run=false && gh run watch`.

## 6. Updates and removals

Same flow on either path. With the connector: patch the one field, publish.
With the trigger file: a known URL is patched with only the fields you
send, so re-ranking is `{ "url": "...", "rating": 5 }` and
re-categorizing is `{ "url": "...", "category": "color" }`. Removing is
`{ "url": "...", "delete": true }`. Send `null` to clear description,
tags or rating. "Remove X" from Guil is explicit; do it without asking.

## 7. Report

One compact table: title · category · rating · description. Then a line
for updates/deletions/skips, and a line for anything you had to guess
(fetch failed, category was a stretch). No commit is needed for a
library change. Only code changes (a new category, page tweaks) go
through the CLAUDE.md workflow.
