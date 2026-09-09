#!/usr/bin/env tsx
/**
 * Create, update or delete `resource` documents (the design library at
 * /resources) in Sanity. The write path for the /add-resources skill.
 *
 * Input, one of (first match wins):
 *
 *   File:    ITEMS_FILE — path to JSON { batch?, dry_run?, items: [...] }
 *            (the push-triggered mode: .github/triggers/resources.json)
 *   Bulk:    ITEMS_JSON — JSON array of items (see shapes below)
 *   Single:  TITLE, RESOURCE_URL, CATEGORY (required)
 *            DESCRIPTION, TAGS (comma-separated), RATING (1–5) (optional)
 *
 * Item shapes (matched on url, trailing slash ignored):
 *
 *   { url, title, category, description?, tags?, rating? }   new url → create
 *   { url, category?, rating?, description?, ... }          known url → patch
 *                                                           only the given fields
 *   { url, delete: true }                                    known url → delete
 *
 * A field set to null is unset on update (description, tags, rating).
 * `category` takes the stored value ("icons-illustration") or the display
 * title ("Icons & Illustration"), case-insensitive. `tags` is an array or a
 * comma-separated string, lowercased. `rating` is an integer 1–5.
 *
 * Env:  DRY_RUN — "true" (default) prints the plan and writes nothing.
 *       When empty and ITEMS_FILE is set, the file's `dry_run` decides
 *       (missing = true).
 *       SANITY_PROJECT_ID / SANITY_DATASET / SANITY_AUTH_TOKEN
 *
 * Without SANITY_AUTH_TOKEN the script only validates items (dry run,
 * no duplicate check) so a session without the token can sanity-check
 * its JSON before dispatching the "Sanity — Create resource" Action.
 */
import { readFileSync } from "node:fs";
import { createClient } from "next-sanity";
import {
  RESOURCE_CATEGORIES,
  isResourceCategory,
} from "../../src/lib/resources";

type Item = {
  url: string;
  title?: string;
  category?: string;
  description?: string | null;
  tags?: string[] | string | null;
  rating?: number | string | null;
  delete?: boolean;
};

type Existing = {
  _id: string;
  url: string;
  title?: string;
  category?: string;
  description?: string;
  tags?: string[];
  rating?: number;
};

type Prepared = {
  url: string;
  title?: string;
  category?: string;
  description?: string | null;
  tags?: string[] | null;
  rating?: number | null;
  delete: boolean;
};

const {
  TITLE,
  RESOURCE_URL,
  CATEGORY,
  DESCRIPTION,
  TAGS,
  RATING,
  ITEMS_JSON,
  ITEMS_FILE,
  DRY_RUN,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_AUTH_TOKEN,
} = process.env;

type TriggerFile = { batch?: string; dry_run?: boolean; items?: unknown };

const triggerFile: TriggerFile | null = ITEMS_FILE
  ? (JSON.parse(readFileSync(ITEMS_FILE, "utf8")) as TriggerFile)
  : null;

const dryRunEnv = (DRY_RUN ?? "").trim().toLowerCase();
const dryRun = dryRunEnv
  ? dryRunEnv !== "false"
  : triggerFile
    ? triggerFile.dry_run !== false
    : true;
const hasToken = Boolean(SANITY_PROJECT_ID && SANITY_DATASET && SANITY_AUTH_TOKEN);

if (!hasToken && !dryRun) {
  console.error("Missing SANITY_* env vars — a real run needs them.");
  process.exit(1);
}

const validCategories = RESOURCE_CATEGORIES.map((c) => c.value).join(", ");

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

function splitTags(tags: string[] | string): string[] {
  const list = Array.isArray(tags) ? tags : tags.split(",");
  return Array.from(
    new Set(list.map((t) => t.trim().toLowerCase()).filter(Boolean)),
  );
}

function collectItems(): Item[] {
  if (triggerFile) {
    if (!Array.isArray(triggerFile.items)) {
      throw new Error(`${ITEMS_FILE}: "items" must be a JSON array`);
    }
    if (triggerFile.batch) console.log(`Batch: ${triggerFile.batch}\n`);
    return triggerFile.items as Item[];
  }
  if (ITEMS_JSON && ITEMS_JSON.trim()) {
    const parsed: unknown = JSON.parse(ITEMS_JSON);
    if (!Array.isArray(parsed)) throw new Error("ITEMS_JSON must be a JSON array");
    return parsed as Item[];
  }
  if (!RESOURCE_URL) {
    throw new Error(
      "Set ITEMS_FILE, ITEMS_JSON (bulk) or RESOURCE_URL + TITLE + CATEGORY (single)",
    );
  }
  return [
    {
      url: RESOURCE_URL,
      title: TITLE,
      category: CATEGORY,
      description: DESCRIPTION,
      tags: TAGS,
      rating: RATING,
    },
  ];
}

function prepare(item: Item, i: number): Prepared {
  const label = `Item ${i + 1}${item.title ? ` (${item.title})` : ""}`;
  const url = item.url ? normalizeUrl(item.url) : "";
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(`${label}: url must start with http(s)://`);
  }
  const out: Prepared = { url, delete: item.delete === true };
  if (out.delete) return out;

  if (item.title !== undefined) {
    const title = item.title?.trim();
    if (!title) throw new Error(`${label}: title is empty`);
    out.title = title;
  }
  if (item.category !== undefined) {
    const category = resolveCategory(item.category ?? "");
    if (!category) {
      throw new Error(
        `${label}: unknown category "${item.category}". One of: ${validCategories}`,
      );
    }
    out.category = category;
  }
  if (item.description !== undefined) {
    out.description =
      item.description === null ? null : item.description.trim() || null;
  }
  if (item.tags !== undefined) {
    out.tags = item.tags === null ? null : splitTags(item.tags);
    if (out.tags && out.tags.length === 0) out.tags = null;
  }
  if (item.rating !== undefined) {
    if (item.rating === null || item.rating === "") {
      out.rating = null;
    } else {
      const n = Number(item.rating);
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        throw new Error(`${label}: rating must be an integer 1–5`);
      }
      out.rating = n;
    }
  }
  return out;
}

function sameTags(a?: string[], b?: string[] | null): boolean {
  const x = a ?? [];
  const y = b ?? [];
  return x.length === y.length && x.every((t, i) => t === y[i]);
}

async function main() {
  const prepared = collectItems().map(prepare);
  const seen = new Set<string>();
  for (const p of prepared) {
    if (seen.has(p.url)) throw new Error(`Duplicate url in input: ${p.url}`);
    seen.add(p.url);
  }

  if (!hasToken) {
    console.log("No SANITY_AUTH_TOKEN: validating only, duplicate check skipped.\n");
    for (const p of prepared) {
      console.log(
        p.delete
          ? `- delete  ${p.url}`
          : `· valid   ${p.title ?? "(existing)"}  [${p.category ?? "—"}]  ${p.url}` +
              (p.rating ? `  ${p.rating}/5` : "") +
              (p.tags?.length ? `  #${p.tags.join(" #")}` : ""),
      );
    }
    console.log(`\n${prepared.length} item(s) valid. Push the trigger file to write.`);
    return;
  }

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: "2024-01-01",
    token: SANITY_AUTH_TOKEN,
    useCdn: false,
    perspective: "published",
  });

  const existing = await client.fetch<Existing[]>(
    `*[_type == "resource" && defined(url)]{ _id, url, title, category, description, tags, rating }`,
  );
  const byUrl = new Map(existing.map((e) => [normalizeUrl(e.url), e]));

  const counts = { created: 0, updated: 0, deleted: 0, unchanged: 0, missing: 0 };
  const tag = (verb: string) => (dryRun ? `· plan ${verb}` : `${verb}`);

  for (const p of prepared) {
    const found = byUrl.get(p.url);

    if (p.delete) {
      if (!found) {
        console.log(`? missing ${p.url} — nothing to delete`);
        counts.missing += 1;
        continue;
      }
      console.log(`${tag("- delete")}  ${found.title ?? p.url}  (${found._id})`);
      if (!dryRun) await client.delete(found._id);
      counts.deleted += 1;
      continue;
    }

    if (!found) {
      if (!p.title || !p.category) {
        throw new Error(
          `${p.url} is new, so it needs a title and a category to be created`,
        );
      }
      const doc: {
        _type: "resource";
        title: string;
        url: string;
        category: string;
        description?: string;
        tags?: string[];
        rating?: number;
      } = { _type: "resource", title: p.title, url: p.url, category: p.category };
      if (p.description) doc.description = p.description;
      if (p.tags?.length) doc.tags = p.tags;
      if (p.rating) doc.rating = p.rating;

      console.log(
        `${tag("+ create")}  ${p.title}  [${p.category}]  ${p.url}` +
          (p.rating ? `  ${p.rating}/5` : "") +
          (p.tags?.length ? `  #${p.tags.join(" #")}` : ""),
      );
      if (!dryRun) {
        const res = await client.create(doc);
        console.log(`           → ${res._id}`);
      }
      counts.created += 1;
      continue;
    }

    // Known url: patch only what changed.
    const set: Record<string, string | string[] | number> = {};
    const unset: string[] = [];
    if (p.title !== undefined && p.title !== found.title) set.title = p.title;
    if (p.category !== undefined && p.category !== found.category) set.category = p.category;
    if (p.description !== undefined) {
      if (p.description === null) {
        if (found.description !== undefined) unset.push("description");
      } else if (p.description !== found.description) set.description = p.description;
    }
    if (p.tags !== undefined) {
      if (p.tags === null) {
        if (found.tags?.length) unset.push("tags");
      } else if (!sameTags(found.tags, p.tags)) set.tags = p.tags;
    }
    if (p.rating !== undefined) {
      if (p.rating === null) {
        if (found.rating !== undefined) unset.push("rating");
      } else if (p.rating !== found.rating) set.rating = p.rating;
    }

    const changed = [...Object.keys(set), ...unset.map((k) => `-${k}`)];
    if (changed.length === 0) {
      console.log(`= same    ${found.title ?? p.url}`);
      counts.unchanged += 1;
      continue;
    }
    console.log(`${tag("~ update")}  ${found.title ?? p.url}  (${changed.join(", ")})`);
    if (!dryRun) {
      let patch = client.patch(found._id).set(set);
      if (unset.length) patch = patch.unset(unset);
      await patch.commit();
    }
    counts.updated += 1;
  }

  console.log(
    `\n${dryRun ? "DRY RUN — nothing written. " : ""}` +
      `${counts.created} created, ${counts.updated} updated, ${counts.deleted} deleted, ` +
      `${counts.unchanged} unchanged` +
      (counts.missing ? `, ${counts.missing} not found` : "") +
      ".",
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
