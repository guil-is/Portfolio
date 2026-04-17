#!/usr/bin/env tsx
/**
 * Migrate rich project content from src/content/projects.ts into
 * Sanity. For each local project whose matching Sanity doc is empty
 * on `projectDetails` and/or `stillFrames`, this script:
 *
 *   1. Parses the local HTML body into Portable Text blocks via
 *      @sanity/block-tools (with JSDOM as the DOM implementation).
 *   2. For every inline <img> inside the HTML, downloads the source
 *      bytes (remote URL or local /public path), uploads to Sanity's
 *      asset pipeline, and swaps the URL for an asset reference on
 *      the resulting block.
 *   3. Does the same for each entry in `stillFrames`.
 *   4. Appends any `features` rows as image blocks with captions at
 *      the end of projectDetails.
 *   5. Applies all patches in a single Sanity transaction and saves
 *      a pre-migration JSON backup next to the script.
 *
 * Usage (via env — the GitHub Actions workflow provides all of these):
 *   SLUGS=<slug1,slug2,...>     projects to migrate, or "all"
 *   FIELDS=<f1,f2,...>          optional: restrict to "projectDetails",
 *                               "stillFrames", "features"; default all
 *   DRY_RUN=true|false          default true
 *   SANITY_PROJECT_ID           required
 *   SANITY_DATASET              required
 *   SANITY_AUTH_TOKEN           required (Editor)
 *
 * Safety behavior:
 *   - Per-project errors are isolated: one failure logs and skips,
 *     others continue.
 *   - Existing Sanity values are never overwritten; fields already
 *     populated in Sanity are left alone.
 *   - Backup of the matched docs' full current state is written to
 *     scripts/sanity/backups/ and uploaded as a GitHub Actions
 *     artifact.
 */

import { createClient } from "next-sanity";
import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { JSDOM } from "jsdom";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pastProjects, type PastProject } from "../../src/content/projects";

// ── env ──────────────────────────────────────────────────────────────
const {
  SLUGS,
  FIELDS,
  DRY_RUN,
  FORCE,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_AUTH_TOKEN,
} = process.env;

function die(msg: string): never {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

if (!SLUGS) die("Missing env SLUGS (use 'all' to migrate everything)");
if (!SANITY_PROJECT_ID) die("Missing env SANITY_PROJECT_ID");
if (!SANITY_DATASET) die("Missing env SANITY_DATASET");
if (!SANITY_AUTH_TOKEN) die("Missing env SANITY_AUTH_TOKEN");

const dryRun = (DRY_RUN ?? "true").toLowerCase() !== "false";
const force = (FORCE ?? "false").toLowerCase() === "true";

const allowedFields = new Set(
  (
    FIELDS ??
    "projectDetails,stillFrames,features,gridImage,mainImage,heroVideo,link"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const slugFilter =
  SLUGS.toLowerCase() === "all"
    ? null
    : new Set(
        SLUGS.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`Sanity migrate-project-content  (dryRun = ${dryRun}, force = ${force})`);
console.log(`  slugs : ${slugFilter ? [...slugFilter].join(", ") : "all"}`);
console.log(`  fields: ${[...allowedFields].join(", ")}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// ── client ───────────────────────────────────────────────────────────
const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: SANITY_AUTH_TOKEN,
  useCdn: false,
});

// ── block-tools schema ───────────────────────────────────────────────
// block-tools needs a compiled Sanity schema describing the target
// array field so it can validate block structure. We describe a
// minimal schema mirroring project.projectDetails here rather than
// importing the real schema (which pulls in sanity UI deps).
const defaultSchema = Schema.compile({
  name: "default",
  types: [
    {
      type: "object",
      name: "projectDoc",
      fields: [
        {
          title: "Body",
          name: "body",
          type: "array",
          of: [
            { type: "block" },
            {
              type: "image",
              fields: [{ name: "caption", title: "Caption", type: "string" }],
            },
            {
              type: "object",
              name: "videoEmbed",
              fields: [
                { name: "url", title: "URL", type: "url" },
                { name: "caption", title: "Caption", type: "string" },
              ],
            },
          ],
        },
      ],
    },
  ],
});

const blockContentType = (defaultSchema as unknown as {
  get: (name: string) => {
    fields: Array<{ name: string; type: unknown }>;
  };
})
  .get("projectDoc")
  .fields.find((f) => f.name === "body")!.type;

// ── image upload ─────────────────────────────────────────────────────
const uploadCache = new Map<string, string>();

async function fetchBytes(url: string): Promise<{
  buffer: Buffer;
  filename: string;
}> {
  if (url.startsWith("/")) {
    const diskPath = path.resolve("public", url.replace(/^\//, ""));
    const buffer = readFileSync(diskPath);
    const filename = path.basename(diskPath);
    return { buffer, filename };
  }
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} fetching ${url}`);
  }
  const arr = await resp.arrayBuffer();
  const filename =
    decodeURIComponent(url.split("/").pop() ?? "image").replace(/\?.*$/, "") ||
    "image";
  return { buffer: Buffer.from(arr), filename };
}

async function uploadImage(url: string): Promise<string> {
  const cached = uploadCache.get(url);
  if (cached) return cached;
  if (dryRun) {
    const placeholder = `DRY_RUN_ASSET_FOR_${url}`;
    uploadCache.set(url, placeholder);
    return placeholder;
  }
  const { buffer, filename } = await fetchBytes(url);
  const asset = await client.assets.upload("image", buffer, { filename });
  uploadCache.set(url, asset._id);
  return asset._id;
}

/**
 * Convert a provider embed URL (youtube.com/embed/ID, player.vimeo.com/
 * video/ID, etc.) back to a canonical share URL so the live site's
 * <VideoEmbed> component can parse it consistently. Pass-through for
 * URLs that are already canonical.
 */
function normalizeEmbedUrl(src: string): string {
  try {
    const u = new URL(src);
    // youtube.com/embed/VIDEOID → youtube.com/watch?v=VIDEOID
    const ytEmbed = u.pathname.match(/^\/embed\/([A-Za-z0-9_-]+)/);
    if (u.hostname.includes("youtube.com") && ytEmbed) {
      return `https://www.youtube.com/watch?v=${ytEmbed[1]}`;
    }
    // player.vimeo.com/video/VIDEOID → vimeo.com/VIDEOID
    const vmEmbed = u.pathname.match(/^\/video\/(\d+)/);
    if (u.hostname.includes("vimeo.com") && vmEmbed) {
      return `https://vimeo.com/${vmEmbed[1]}`;
    }
    return src;
  } catch {
    return src;
  }
}

function imageBlock(assetId: string, caption?: string): Record<string, unknown> {
  return {
    _type: "image",
    _key: `img-${Math.random().toString(36).slice(2, 10)}`,
    asset: { _type: "reference", _ref: assetId },
    ...(caption ? { caption } : {}),
  };
}

// ── HTML → blocks ────────────────────────────────────────────────────
async function convertHtmlToBlocks(html: string): Promise<unknown[]> {
  // 1. First pass: let block-tools convert text content. For
  //    <figure>/<img> we emit a PLACEHOLDER image block with the
  //    original src stored in `_sanityAsset`. We swap the placeholder
  //    for a real asset ref in the second pass.
  //
  // block-tools' strict types require `ArbitraryTypedObject` with a
  // required `_type`. Our placeholder image block sets `_type` but
  // TypeScript can't prove that through the object literal spread —
  // we widen rules to the loose runtime shape via a local cast.
  const rules = [
    {
      // <figure> wrapping an <iframe> — YouTube / Vimeo embed. Must
      // come BEFORE the image-figure rule so iframe-carrying figures
      // aren't mis-parsed as images.
      deserialize(el: Element, _next: unknown, block: (b: object) => object) {
        if (el.tagName?.toLowerCase() !== "figure") return undefined;
        const iframe = el.querySelector("iframe");
        if (!iframe) return undefined;
        const src = iframe.getAttribute("src");
        if (!src) return undefined;
        const caption =
          el.querySelector("figcaption")?.textContent?.trim() || undefined;
        return block({
          _type: "videoEmbed",
          url: normalizeEmbedUrl(src),
          ...(caption ? { caption } : {}),
        });
      },
    },
    {
      deserialize(el: Element, _next: unknown, block: (b: object) => object) {
        if (el.tagName?.toLowerCase() !== "figure") return undefined;
        const img = el.querySelector("img");
        if (!img) return undefined;
        const src = img.getAttribute("src");
        if (!src) return undefined;
        const rawAlt = img.getAttribute("alt");
        const caption =
          el.querySelector("figcaption")?.textContent?.trim() ||
          (rawAlt && rawAlt !== "__wf_reserved_inherit" ? rawAlt : undefined);
        return block({
          _type: "image",
          _sanityAsset: `image@${src}`,
          ...(caption ? { caption } : {}),
        });
      },
    },
    {
      // Raw <img> (no surrounding figure)
      deserialize(el: Element, _next: unknown, block: (b: object) => object) {
        if (el.tagName?.toLowerCase() !== "img") return undefined;
        const src = el.getAttribute("src");
        if (!src) return undefined;
        return block({
          _type: "image",
          _sanityAsset: `image@${src}`,
        });
      },
    },
  ];

  const blocks = htmlToBlocks(
    html,
    blockContentType as Parameters<typeof htmlToBlocks>[1],
    {
      parseHtml: (h: string) => new JSDOM(h).window.document,
      rules: rules as unknown as Parameters<typeof htmlToBlocks>[2]["rules"],
    } as Parameters<typeof htmlToBlocks>[2],
  );

  // 2. Second pass: walk blocks, upload any image with _sanityAsset,
  //    replace with a real asset ref.
  const out: unknown[] = [];
  for (const block of blocks) {
    const maybeImg = block as unknown as Record<string, unknown>;
    if (
      maybeImg._type === "image" &&
      typeof maybeImg._sanityAsset === "string"
    ) {
      const url = (maybeImg._sanityAsset as string).replace(/^image@/, "");
      try {
        const assetId = await uploadImage(url);
        const rebuilt: Record<string, unknown> = {
          _type: "image",
          _key: `img-${Math.random().toString(36).slice(2, 10)}`,
          asset: { _type: "reference", _ref: assetId },
        };
        if (typeof maybeImg.caption === "string") rebuilt.caption = maybeImg.caption;
        out.push(rebuilt);
      } catch (err) {
        console.warn(
          `  ⚠ Skipped inline image ${url}: ${(err as Error).message}`,
        );
      }
    } else if (maybeImg._type === "videoEmbed") {
      // Pass through, ensure _key
      out.push({
        ...maybeImg,
        _key: maybeImg._key ?? `vid-${Math.random().toString(36).slice(2, 10)}`,
      });
    } else {
      // Ensure each block has a _key
      if (!maybeImg._key) {
        maybeImg._key = `blk-${Math.random().toString(36).slice(2, 10)}`;
      }
      out.push(maybeImg);
    }
  }
  return out;
}

// ── per-project migration ────────────────────────────────────────────
type SanityProjectDoc = {
  _id: string;
  _type: string;
  slug?: { current?: string };
  projectDetails?: unknown[];
  stillFrames?: unknown[];
  gridImage?: unknown;
  mainImage?: unknown;
  heroVideo?: string;
  link?: string;
  [k: string]: unknown;
};

async function migrateProject(local: PastProject): Promise<{
  slug: string;
  skipped?: string;
  patch?: Record<string, unknown>;
  sanityDoc?: SanityProjectDoc;
}> {
  const sanity = await client.fetch<SanityProjectDoc | null>(
    `*[_type == "project" && slug.current == $slug][0]`,
    { slug: local.slug },
  );
  if (!sanity) return { slug: local.slug, skipped: "no matching Sanity doc" };

  const patch: Record<string, unknown> = {};

  // projectDetails
  if (
    allowedFields.has("projectDetails") &&
    local.projectDetails &&
    (force || !sanity.projectDetails || sanity.projectDetails.length === 0)
  ) {
    console.log(`  • Parsing projectDetails HTML (${local.projectDetails.length} chars)`);
    const blocks = await convertHtmlToBlocks(local.projectDetails);
    if (blocks.length > 0) {
      const counts: Record<string, number> = {};
      for (const b of blocks as Array<Record<string, unknown>>) {
        const t = (b._type as string) ?? "unknown";
        counts[t] = (counts[t] ?? 0) + 1;
      }
      console.log(
        `    → parsed block types: ${JSON.stringify(counts)}`,
      );
      patch.projectDetails = blocks;
    }
  }

  // features — append as image+caption blocks to projectDetails.
  //   If projectDetails was patched above, append to that array.
  //   Else if local projectDetails existed but nothing new was
  //   produced, skip. Else build a new array with just the features.
  if (
    allowedFields.has("features") &&
    local.features &&
    local.features.length > 0
  ) {
    const featureBlocks: unknown[] = [];
    for (const f of local.features) {
      if (!f.image) continue;
      try {
        const assetId = await uploadImage(f.image);
        featureBlocks.push(imageBlock(assetId, f.caption));
      } catch (err) {
        console.warn(
          `  ⚠ Skipped feature image ${f.image}: ${(err as Error).message}`,
        );
      }
    }
    if (featureBlocks.length > 0) {
      const existingProjectDetails = Array.isArray(patch.projectDetails)
        ? (patch.projectDetails as unknown[])
        : [];
      // Only write features to Sanity if there's nothing there yet.
      if (
        !sanity.projectDetails ||
        sanity.projectDetails.length === 0 ||
        existingProjectDetails.length > 0
      ) {
        patch.projectDetails = [...existingProjectDetails, ...featureBlocks];
      }
    }
  }

  // stillFrames
  if (
    allowedFields.has("stillFrames") &&
    local.stillFrames &&
    local.stillFrames.length > 0 &&
    (force || !sanity.stillFrames || sanity.stillFrames.length === 0)
  ) {
    const frames: unknown[] = [];
    for (const url of local.stillFrames) {
      try {
        const assetId = await uploadImage(url);
        frames.push(imageBlock(assetId));
      } catch (err) {
        console.warn(
          `  ⚠ Skipped stillFrame ${url}: ${(err as Error).message}`,
        );
      }
    }
    if (frames.length > 0) patch.stillFrames = frames;
  }

  // gridImage — single image asset ref. Upload the local URL if the
  // Sanity field is empty (or force=true).
  if (
    allowedFields.has("gridImage") &&
    local.gridImage &&
    (force || !sanity.gridImage)
  ) {
    try {
      const assetId = await uploadImage(local.gridImage);
      patch.gridImage = {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      };
    } catch (err) {
      console.warn(
        `  ⚠ Skipped gridImage ${local.gridImage}: ${(err as Error).message}`,
      );
    }
  }

  // mainImage — same pattern.
  if (
    allowedFields.has("mainImage") &&
    local.mainImage &&
    (force || !sanity.mainImage)
  ) {
    try {
      const assetId = await uploadImage(local.mainImage);
      patch.mainImage = {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      };
    } catch (err) {
      console.warn(
        `  ⚠ Skipped mainImage ${local.mainImage}: ${(err as Error).message}`,
      );
    }
  }

  // heroVideo — simple string copy, no upload.
  if (
    allowedFields.has("heroVideo") &&
    local.heroVideo &&
    (force || !sanity.heroVideo)
  ) {
    patch.heroVideo = local.heroVideo;
  }

  // link — simple string copy, no upload.
  if (
    allowedFields.has("link") &&
    local.link &&
    (force || !sanity.link)
  ) {
    patch.link = local.link;
  }

  return { slug: local.slug, patch, sanityDoc: sanity };
}

// ── main ─────────────────────────────────────────────────────────────
async function main() {
  const candidates = pastProjects.filter((p) => {
    if (!slugFilter) return true;
    return slugFilter.has(p.slug);
  });
  console.log(`Matched ${candidates.length} local project(s) to consider.\n`);

  const preMigrationSnapshots: SanityProjectDoc[] = [];
  const patches: {
    slug: string;
    _id: string;
    patch: Record<string, unknown>;
  }[] = [];
  const skipped: { slug: string; reason: string }[] = [];

  for (const local of candidates) {
    console.log(`→ ${local.slug}`);
    try {
      const result = await migrateProject(local);
      if (result.skipped) {
        console.log(`  skipped — ${result.skipped}`);
        skipped.push({ slug: result.slug, reason: result.skipped });
        continue;
      }
      if (!result.patch || Object.keys(result.patch).length === 0) {
        console.log(`  nothing to patch (already populated in Sanity)`);
        skipped.push({ slug: result.slug, reason: "already populated" });
        continue;
      }
      if (result.sanityDoc) preMigrationSnapshots.push(result.sanityDoc);
      patches.push({
        slug: local.slug,
        _id: result.sanityDoc!._id,
        patch: result.patch,
      });
      console.log(
        `  will patch: ${Object.entries(result.patch)
          .map(([k, v]) =>
            Array.isArray(v) ? `${k}[${v.length}]` : `${k}`,
          )
          .join(", ")}`,
      );
    } catch (err) {
      const msg = (err as Error).message;
      console.error(`  FAILED: ${msg}`);
      skipped.push({ slug: local.slug, reason: `error: ${msg}` });
    }
  }

  // Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve("scripts/sanity/backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(
    backupDir,
    `migrate-content-${timestamp}.json`,
  );
  writeFileSync(
    backupPath,
    JSON.stringify(
      {
        timestamp,
        dryRun,
        slugsRequested: slugFilter ? [...slugFilter] : "all",
        fields: [...allowedFields],
        preMigrationSnapshots,
        plannedPatches: patches,
        skipped,
      },
      null,
      2,
    ),
  );
  console.log(`\n✓ Backup written to ${backupPath}`);

  // Summary
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Summary:`);
  console.log(`  to patch: ${patches.length}`);
  console.log(`  skipped : ${skipped.length}`);
  if (patches.length === 0) {
    console.log(`\nNothing to do.`);
    return;
  }

  if (dryRun) {
    console.log(
      `\nDRY RUN — no changes written. Re-run with DRY_RUN=false to commit.`,
    );
    return;
  }

  // Apply
  const tx = client.transaction();
  for (const p of patches) {
    tx.patch(p._id, (builder) => builder.set(p.patch));
  }
  console.log(`\nCommitting transaction…`);
  const result = await tx.commit();
  console.log(`✓ Committed ${result.results.length} operations.`);
  console.log(`✓ Pre-migration backup at ${backupPath}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
