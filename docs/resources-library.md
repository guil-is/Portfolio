# Design resources library

An unlisted link directory at **guil.is/resources**: tools, type, references
and rabbit holes, grouped by category, with search and filter pills.

## Unlisted, not gated

- `robots: { index: false }` in the page metadata, `/resources` disallowed in
  `src/app/robots.ts`, not in the sitemap, not in the site nav.
- No password. Anyone with the link can open it. To gate it, wrap the page
  body in `<PasswordGate storageKey="resources-unlocked">` like the `/for/*`
  pages.

## Adding a resource

Entries live in **Sanity** (`resource` doc type). Two ways in:

1. **Studio** (default): guil.is/studio → **Resources** → new document →
   publish. The page revalidates within ~60s.
2. **GitHub Actions**: run "Sanity — Create resource". Fill the single fields
   for one link, or paste a JSON array into `items_json` to add many at once.
   Leave `dry_run` on for the first run, read the plan, re-run with it off.
   Existing URLs are skipped, never duplicated. Script:
   `scripts/sanity/create-resource.ts`.

Bulk JSON shape:

```json
[
  { "title": "Google Fonts", "url": "https://fonts.google.com", "category": "typography", "description": "Free, variable, no login.", "tags": ["free", "variable"] },
  { "title": "Mobbin", "url": "https://mobbin.com", "category": "Inspiration" }
]
```

`category` takes the stored value or the display title, case-insensitive.

## Fields

| Field | Notes |
| --- | --- |
| **Title** | Required. Shown in display type. |
| **URL** | Required, http(s). The row links here and the domain shows next to the title. The favicon is fetched from the domain. |
| **Category** | Required, one of the list below. Drives grouping + filter pills. |
| **Why it's here** | Optional one-liner under the title. |
| **Tags** | Optional, free-form, lowercase. Rendered as `#tag` and searchable. |

## Categories

Defined once in `src/lib/resources.ts` (`RESOURCE_CATEGORIES`) and imported by
both the Studio schema and the page, in this render order:

typography · color · icons-illustration · inspiration · ui-kits ·
mockups-stock · motion-video · ai · tools-plugins · reading · other

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
