# Design resources library

An unlisted link directory at **guil.is/resources**: tools, type, references
and rabbit holes, grouped by category, with search and filter pills.

## Unlisted, not gated

- `robots: { index: false }` in the page metadata, `/resources` disallowed in
  `src/app/robots.ts`, not in the sitemap, not in the site nav.
- No password. Anyone with the link can open it. To gate it, wrap the page
  body in `<PasswordGate storageKey="resources-unlocked">` like the `/for/*`
  pages.

## Drop links

The default way in. Paste URLs into a Claude Code session, optionally with a
note ("essential", "for icons", "meh but keep"). The `/add-resources` skill
fetches each page, names it, writes the one-liner, picks the category, rates
it, and writes to Sanity through the "Sanity — Create resource" Action. It
reports back a table. Nothing to fill in.

The same skill handles "rank X higher", "move X to color", "rewrite the
line for X", "remove X".

Why a push: the Sanity write token lives only in GitHub secrets, the GitHub
App behind Claude's MCP tools can't dispatch workflows, and the sandbox can't
reach `api.sanity.io`. So the skill writes the batch to
`.github/triggers/resources.json`, validates it locally (the script runs
without a token in dry-run mode), commits only that file, pushes `main`, and
polls the run. The "Sanity — Create resource" Action fires on any push that
touches the file. The file's `batch` label keeps every push a diff.

```json
{ "batch": "2026-09-09 3 links", "dry_run": false, "items": [ … ] }
```

## Sanity connector (claude.ai and Claude Code)

The direct path, no push and no Action. Sanity's remote MCP server at
`https://mcp.sanity.io` (OAuth, sign in with the Sanity account) lets Claude
query, create, patch, publish and delete documents. Once it is added as a
custom connector in claude.ai it also shows up in Claude Code web sessions.

- claude.ai: Settings → Connectors → Add custom connector → name "Sanity",
  URL `https://mcp.sanity.io` → Connect, sign in. Then create a Project with
  the instructions in `docs/resources-claude-ai-project.md` and drop links
  into its chats.
- Claude Code (local): `claude mcp add Sanity -t http https://mcp.sanity.io --scope user`.
- Created documents are drafts. Every write ends with a publish or the page
  never shows it. Patches land on a draft too. Removal is unpublish, then
  discard the draft (the connector has no delete). Verified end to end on
  2026-09-09 from a Claude Code web session: create, publish, read back,
  unpublish, discard.
- The server reads the **deployed** schema. The "Sanity — Deploy schema"
  Action runs `sanity schemas deploy` whenever `sanity/**`, `sanity.config.ts`
  or `src/lib/resources.ts` change on `main` (or on a push of
  `.github/triggers/deploy-schema.json`, or by hand). So a new category
  reaches the connector with the same push that adds it to the code. It
  needs the `SANITY_DEPLOY_TOKEN` repository secret (a token with the
  "Deploy Studio" permission; the Editor token is refused).

`/add-resources` prefers the connector when it is present and falls back to
the trigger file below.

## Other ways in

1. **Studio**: guil.is/studio → **Resources** → new document → publish. The
   page revalidates within ~60s.
2. **GitHub Actions by hand**: run "Sanity — Create resource". Fill the single
   fields for one link, or paste a JSON array into `items_json`. Leave
   `dry_run` on for the first run, read the plan, re-run with it off.
   Locally, `gh workflow run sanity-create-resource.yml -f items_json='…' -f dry_run=false`.

Item shapes for `items_json` (matched on URL, trailing slash ignored):

```json
[
  { "url": "https://fonts.google.com", "title": "Google Fonts", "category": "typography", "description": "Free, variable, no login.", "tags": ["free", "variable"], "rating": 5 },
  { "url": "https://mobbin.com", "rating": 4 },
  { "url": "https://example.com/old-tool", "delete": true }
]
```

- New URL: needs `title` + `category`, creates the document.
- Known URL: patches only the fields present. `null` clears `description`,
  `tags` or `rating`.
- `delete: true`: removes the document.
- `category` takes the stored value or the display title, case-insensitive.

Script: `scripts/sanity/create-resource.ts`.

## Rating

`rating` is the rank, an integer 1–5. It sorts entries inside their category
(highest first, then A–Z) and renders as five dots on the row.

| | |
| --- | --- |
| 5 | essential: best in class, reach for it weekly |
| 4 | strong: regular use, clearly above the alternatives |
| 3 | solid: good, one of several (default when unsure) |
| 2 | situational: right tool for a narrow job |
| 1 | niche: kept for reference |

## Fields

| Field | Notes |
| --- | --- |
| **Title** | Required. Shown in display type. |
| **URL** | Required, http(s). The row links here and the domain shows next to the title. The favicon is fetched from the domain. |
| **Category** | Required, one of the list below. Drives grouping + filter pills. |
| **Why it's here** | Optional one-liner under the title. |
| **Tags** | Optional, free-form, lowercase. Rendered as `#tag` and searchable. |
| **Rating** | Optional 1–5. Sorts within the category, shown as dots. See above. |

## Categories

Defined once in `src/lib/resources.ts` (`RESOURCE_CATEGORIES`) and imported by
both the Studio schema and the page, in this render order:

typography · color · icons-illustration · inspiration · ui-kits ·
mockups-stock · motion-video · ai · tools-plugins · reading · reference · other

To add one, append to the list. Never change an existing `value`: documents
store it verbatim. A document whose value no longer exists in the list
renders under "Other" rather than disappearing.

## Files

- `src/app/resources/page.tsx` — server page, fetch + hero + noindex metadata.
- `src/components/ResourceLibrary.tsx` — client list: search (`/` focuses,
  Esc clears), category pills, grouped rows, empty states.
- `src/lib/resources.ts` — taxonomy + helpers.
- `src/lib/queries.ts` — `getAllResources()`.
- `sanity/schemas/resource.ts` — document type.
- `scripts/sanity/create-resource.ts` + `.github/workflows/sanity-create-resource.yml`
  — the write path (create / update / delete, dry-run by default).
- `.github/triggers/resources.json` — the last batch pushed; changing it on
  `main` runs the Action.
- `.claude/skills/add-resources/SKILL.md` — the drop-links skill.
- `docs/resources-claude-ai-project.md` — paste-ready instructions for a
  claude.ai Project with the Sanity connector.
- `.github/workflows/sanity-deploy-schema.yml` — keeps the deployed schema
  (what the connector sees) in step with the code.
