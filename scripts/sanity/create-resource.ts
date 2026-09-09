#!/usr/bin/env tsx
/**
 * Create `resource` documents (the design library at /resources) in Sanity.
 *
 * Two modes, picked by which env vars are set:
 *
 *   Single:  TITLE, RESOURCE_URL, CATEGORY  (required)
 *            DESCRIPTION, TAGS (comma-separated)  (optional)
 *   Bulk:    ITEMS_JSON — a JSON array of
 *            { title, url, category, description?, tags?: string[] | string }
 *
 * Shared:    DRY_RUN (default "true": log the plan without writing)
 *            SANITY_PROJECT_ID / SANITY_DATASET / SANITY_AUTH_TOKEN
 *
 * CATEGORY accepts either the stored value ("icons-illustration") or the
 * display title ("Icons & Illustration"), case-insensitive. The list lives
 * in src/lib/resources.ts.
 *
 * Idempotent: a resource whose URL already exists (ignoring a trailing
 * slash) is skipped, never duplicated.
 *
 * Run from the GitHub Actions tab ("Sanity — Create resource"); the local
 * sandbox can't reach api.sanity.io (see scripts/sanity/README.md).
 */
import { createClient } from "next-sanity";
import {
  RESOURCE_CATEGORIES,
  isResourceCategory,
} from "../../src/lib/resources";

type Item = {
  title: string;
  url: string;
  category: string;
  description?: string;
  tags?: string[] | string;
};

type ResourceDoc = {
  _type: "resource";
  title: string;
  url: string;
  category: string;
  description?: string;
  tags?: string[];
};

const {
  TITLE,
  RESOURCE_URL,
  CATEGORY,
  DESCRIPTION,
  TAGS,
  ITEMS_JSON,
  DRY_RUN,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_AUTH_TOKEN,
} = process.env;

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_AUTH_TOKEN) {
  console.error("Missing SANITY_* env vars");
  process.exit(1);
}

const dryRun = (DRY_RUN ?? "true").toLowerCase() !== "false";

function resolveCategory(input: string): string | null {
  const needle = input.trim().toLowerCase();
  if (isResourceCategory(needle)) return needle;
  const byTitle = RESOURCE_CATEGORIES.find(
    (c) => c.title.toLowerCase() === needle,
  );
  return byTitle?.value ?? null;
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function splitTags(tags: Item["tags"]): string[] {
  if (!tags) return [];
  const list = Array.isArray(tags) ? tags : tags.split(",");
  return list.map((t) => t.trim().toLowerCase()).filter(Boolean);
}

function collectItems(): Item[] {
  if (ITEMS_JSON && ITEMS_JSON.trim()) {
    const parsed: unknown = JSON.parse(ITEMS_JSON);
    if (!Array.isArray(parsed)) {
      throw new Error("ITEMS_JSON must be a JSON array");
    }
    return parsed as Item[];
  }
  if (!TITLE || !RESOURCE_URL || !CATEGORY) {
    throw new Error(
      "Single mode needs TITLE, RESOURCE_URL and CATEGORY (or set ITEMS_JSON for bulk)",
    );
  }
  return [
    {
      title: TITLE,
      url: RESOURCE_URL,
      category: CATEGORY,
      description: DESCRIPTION,
      tags: TAGS,
    },
  ];
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function main() {
  const items = collectItems();
  const validCategories = RESOURCE_CATEGORIES.map((c) => c.value).join(", ");

  // Validate everything before touching the dataset.
  const prepared = items.map((item, i) => {
    const title = item.title?.trim();
    const url = item.url ? normalizeUrl(item.url) : "";
    if (!title) throw new Error(`Item ${i + 1}: missing title`);
    if (!/^https?:\/\//i.test(url)) {
      throw new Error(`Item ${i + 1} (${title}): url must start with http(s)://`);
    }
    const category = resolveCategory(item.category ?? "");
    if (!category) {
      throw new Error(
        `Item ${i + 1} (${title}): unknown category "${item.category}". One of: ${validCategories}`,
      );
    }
    const description = item.description?.trim();
    const tags = splitTags(item.tags);
    return { title, url, category, description, tags };
  });

  const existing = await client.fetch<{ url: string }[]>(
    `*[_type == "resource" && defined(url)]{ url }`,
  );
  const known = new Set(existing.map((e) => normalizeUrl(e.url)));

  let created = 0;
  let skipped = 0;

  for (const p of prepared) {
    if (known.has(p.url)) {
      console.log(`– skip  ${p.title} — already in the library (${p.url})`);
      skipped += 1;
      continue;
    }

    const doc: ResourceDoc = {
      _type: "resource",
      title: p.title,
      url: p.url,
      category: p.category,
    };
    if (p.description) doc.description = p.description;
    if (p.tags.length) doc.tags = p.tags;

    console.log(
      `${dryRun ? "· plan " : "+ create"} ${p.title}  [${p.category}]  ${p.url}` +
        (p.tags.length ? `  #${p.tags.join(" #")}` : ""),
    );
    if (!dryRun) {
      const res = await client.create(doc);
      console.log(`         → ${res._id}`);
    }
    known.add(p.url);
    created += 1;
  }

  console.log(
    `\n${dryRun ? "DRY RUN — nothing written. " : ""}${created} ${dryRun ? "to create" : "created"}, ${skipped} skipped.`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
