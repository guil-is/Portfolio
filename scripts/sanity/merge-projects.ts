#!/usr/bin/env tsx
/**
 * Merge multiple Sanity `project` documents into a single keeper.
 *
 * Usage (via env vars — GitHub Actions workflow provides them):
 *   KEEPER_SLUG=<slug>          slug of the project that survives
 *   SOURCE_SLUGS=<s1,s2,...>    comma-separated slugs to merge INTO keeper
 *   NEW_SLUG=<slug>             optional — rename keeper's slug after merge
 *   NEW_NAME=<name>             optional — rename keeper's name after merge
 *   DRY_RUN=true|false          when true, logs the plan without mutating
 *   SANITY_PROJECT_ID           required
 *   SANITY_DATASET              required
 *   SANITY_AUTH_TOKEN           required (write permission)
 *
 * What it does:
 *   1. Fetches the keeper + all source documents.
 *   2. Fetches every document that references any source (via `references()`).
 *   3. Writes a timestamped JSON backup of all affected docs to
 *      scripts/sanity/backups/ and logs the path.
 *   4. Computes a merged keeper: arrays concatenated (projectDetails,
 *      stillFrames), single-value fields preserved from keeper with
 *      fallback to sources when empty. Text fields get a clear
 *      "--- merged from X" separator so you can tidy in the Studio.
 *   5. Rewrites every inbound reference from source._id to keeper._id.
 *   6. Deletes the source documents.
 *
 * All mutations run inside a single Sanity transaction so either
 * everything commits or nothing does.
 */

import { createClient } from "next-sanity";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// ── env + arg parsing ────────────────────────────────────────────────
const {
  KEEPER_SLUG,
  SOURCE_SLUGS,
  NEW_SLUG,
  NEW_NAME,
  DRY_RUN,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_AUTH_TOKEN,
} = process.env;

function die(msg: string): never {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

if (!KEEPER_SLUG) die("Missing env KEEPER_SLUG");
if (!SOURCE_SLUGS) die("Missing env SOURCE_SLUGS");
if (!SANITY_PROJECT_ID) die("Missing env SANITY_PROJECT_ID");
if (!SANITY_DATASET) die("Missing env SANITY_DATASET");
if (!SANITY_AUTH_TOKEN) die("Missing env SANITY_AUTH_TOKEN");

const sourceSlugs = SOURCE_SLUGS.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (sourceSlugs.length === 0) die("SOURCE_SLUGS had no entries");
if (sourceSlugs.includes(KEEPER_SLUG))
  die("KEEPER_SLUG cannot also appear in SOURCE_SLUGS");

const dryRun = (DRY_RUN ?? "true").toLowerCase() !== "false";

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`Sanity merge-projects  (dryRun = ${dryRun})`);
console.log(`  keeper : ${KEEPER_SLUG}`);
console.log(`  sources: ${sourceSlugs.join(", ")}`);
if (NEW_SLUG) console.log(`  rename slug -> ${NEW_SLUG}`);
if (NEW_NAME) console.log(`  rename name -> ${NEW_NAME}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// ── client ───────────────────────────────────────────────────────────
const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: SANITY_AUTH_TOKEN,
  useCdn: false,
});

// ── types ────────────────────────────────────────────────────────────
type SanityDoc = {
  _id: string;
  _type: string;
  slug?: { current?: string };
  name?: string;
  client?: string;
  services?: string;
  summary?: string;
  gridImage?: unknown;
  mainImage?: unknown;
  heroVideo?: string;
  link?: string;
  featured?: boolean;
  projectDetails?: unknown[];
  stillFrames?: unknown[];
  sortOrder?: number;
  [k: string]: unknown;
};

// ── fetch docs ───────────────────────────────────────────────────────
async function fetchBySlug(slug: string): Promise<SanityDoc | null> {
  return client.fetch<SanityDoc | null>(
    `*[_type == "project" && slug.current == $slug][0]`,
    { slug },
  );
}

async function fetchReferrers(ids: string[]): Promise<SanityDoc[]> {
  return client.fetch<SanityDoc[]>(
    `*[references($ids) && !(_id in $ids)]`,
    { ids },
  );
}

// ── merge logic ──────────────────────────────────────────────────────
function mergeTextField(
  keeper: SanityDoc,
  sources: SanityDoc[],
  field: keyof SanityDoc,
): string | undefined {
  const keeperVal = (keeper[field] as string | undefined)?.trim() ?? "";
  const sourceVals = sources
    .map((s) => ({
      name: s.name ?? s.slug?.current ?? s._id,
      val: (s[field] as string | undefined)?.trim() ?? "",
    }))
    .filter((x) => x.val.length > 0);

  if (sourceVals.length === 0) return keeperVal || undefined;
  const parts = [
    keeperVal,
    ...sourceVals.map((x) => `--- merged from ${x.name} ---\n${x.val}`),
  ].filter(Boolean);
  return parts.join("\n\n");
}

function mergeArrayField(
  keeper: SanityDoc,
  sources: SanityDoc[],
  field: keyof SanityDoc,
): unknown[] | undefined {
  const arrays: unknown[][] = [];
  const k = keeper[field] as unknown[] | undefined;
  if (Array.isArray(k)) arrays.push(k);
  for (const s of sources) {
    const v = s[field] as unknown[] | undefined;
    if (Array.isArray(v)) arrays.push(v);
  }
  if (arrays.length === 0) return undefined;
  // Assign new _key values so Sanity doesn't complain about duplicates.
  return arrays.flat().map((item, i) => {
    if (typeof item === "object" && item !== null) {
      return { ...(item as object), _key: `merged-${Date.now()}-${i}` };
    }
    return item;
  });
}

function firstPresent<T>(...vals: (T | undefined)[]): T | undefined {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

// ── main ─────────────────────────────────────────────────────────────
async function main() {
  const keeper = await fetchBySlug(KEEPER_SLUG as string);
  if (!keeper) die(`Keeper slug "${KEEPER_SLUG}" not found`);
  console.log(`✓ Keeper: ${keeper.name} (${keeper._id})`);

  const sources: SanityDoc[] = [];
  for (const slug of sourceSlugs) {
    const doc = await fetchBySlug(slug);
    if (!doc) die(`Source slug "${slug}" not found`);
    sources.push(doc);
    console.log(`✓ Source: ${doc.name} (${doc._id})`);
  }

  const allIds = [keeper._id, ...sources.map((s) => s._id)];
  const referrers = await fetchReferrers(allIds);
  console.log(
    `✓ Found ${referrers.length} referring document(s) that link to the affected set`,
  );

  // ── backup ─────────────────────────────────────────────────────────
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve("scripts/sanity/backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `merge-projects-${timestamp}.json`);
  writeFileSync(
    backupPath,
    JSON.stringify(
      {
        timestamp,
        keeperSlug: KEEPER_SLUG,
        sourceSlugs,
        dryRun,
        keeper,
        sources,
        referrers,
      },
      null,
      2,
    ),
  );
  console.log(`✓ Backup written to ${backupPath}`);

  // ── compute merged keeper ──────────────────────────────────────────
  const mergedClient = firstPresent(
    keeper.client,
    ...sources.map((s) => s.client),
  );
  const mergedServices = mergeTextField(keeper, sources, "services");
  const mergedSummary = mergeTextField(keeper, sources, "summary");
  const mergedGridImage = firstPresent(
    keeper.gridImage,
    ...sources.map((s) => s.gridImage),
  );
  const mergedMainImage = firstPresent(
    keeper.mainImage,
    ...sources.map((s) => s.mainImage),
  );
  const mergedHeroVideo = firstPresent(
    keeper.heroVideo,
    ...sources.map((s) => s.heroVideo),
  );
  const mergedLink = firstPresent(
    keeper.link,
    ...sources.map((s) => s.link),
  );
  const mergedFeatured =
    keeper.featured === true ||
    sources.some((s) => s.featured === true) ||
    undefined;
  const mergedProjectDetails = mergeArrayField(
    keeper,
    sources,
    "projectDetails",
  );
  const mergedStillFrames = mergeArrayField(keeper, sources, "stillFrames");

  const patch: Record<string, unknown> = {};
  if (mergedClient !== undefined) patch.client = mergedClient;
  if (mergedServices !== undefined) patch.services = mergedServices;
  if (mergedSummary !== undefined) patch.summary = mergedSummary;
  if (mergedGridImage !== undefined) patch.gridImage = mergedGridImage;
  if (mergedMainImage !== undefined) patch.mainImage = mergedMainImage;
  if (mergedHeroVideo !== undefined) patch.heroVideo = mergedHeroVideo;
  if (mergedLink !== undefined) patch.link = mergedLink;
  if (mergedFeatured !== undefined) patch.featured = mergedFeatured;
  if (mergedProjectDetails !== undefined)
    patch.projectDetails = mergedProjectDetails;
  if (mergedStillFrames !== undefined) patch.stillFrames = mergedStillFrames;
  if (NEW_NAME) patch.name = NEW_NAME;
  if (NEW_SLUG) patch.slug = { _type: "slug", current: NEW_SLUG };

  console.log("\nPlanned merge into keeper:");
  console.log(
    Object.entries(patch)
      .map(([k, v]) => {
        if (Array.isArray(v)) return `  ${k}: [${v.length} items]`;
        if (typeof v === "string")
          return `  ${k}: ${v.length > 80 ? v.slice(0, 77) + "…" : v}`;
        return `  ${k}: ${JSON.stringify(v)}`;
      })
      .join("\n"),
  );

  console.log(
    `\nPlanned ref rewrites across ${referrers.length} document(s):`,
  );
  for (const ref of referrers) {
    console.log(`  ${ref._type}  ${ref._id}`);
  }

  console.log(`\nPlanned deletions (${sources.length}):`);
  for (const s of sources) {
    console.log(`  ${s._id}  ${s.slug?.current}`);
  }

  if (dryRun) {
    console.log("\nDRY RUN — no changes written. Re-run with DRY_RUN=false.");
    return;
  }

  // ── transaction ────────────────────────────────────────────────────
  const tx = client.transaction();

  // 1. Patch keeper
  tx.patch(keeper._id, (p) => p.set(patch));

  // 2. Rewrite references in every referring doc. We do this via a
  //    JSON diff — fetch the doc, walk it, swap any `_ref` pointing at
  //    a source for the keeper's _id, then replace the doc.
  const sourceIdSet = new Set(sources.map((s) => s._id));
  const keeperId = keeper._id;
  function rewriteRefs(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(rewriteRefs);
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      if (typeof obj._ref === "string" && sourceIdSet.has(obj._ref)) {
        return { ...obj, _ref: keeperId };
      }
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = rewriteRefs(v);
      }
      return out;
    }
    return value;
  }

  for (const ref of referrers) {
    const rewritten = rewriteRefs(ref) as SanityDoc;
    tx.createOrReplace(rewritten);
  }

  // 3. Delete the sources
  for (const s of sources) {
    tx.delete(s._id);
  }

  console.log("\nCommitting transaction…");
  const result = await tx.commit();
  console.log(`✓ Transaction committed. ${result.results.length} operations.`);
  console.log(`✓ Backup of pre-merge state remains at ${backupPath}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
