#!/usr/bin/env tsx
/**
 * One-off: create a Regens Unite project entry in Sanity so it can be
 * toggled on as an Active Project on the homepage. No case study body
 * for now — it will fall back to linking the external regensunite.earth
 * URL. When a case study is written later, just add `projectDetails` on
 * the document and the section will start linking internally.
 */
import { createClient } from "next-sanity";
import { readFileSync } from "node:fs";
import path from "node:path";

const {
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

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function uploadLocalImage(relativePath: string): Promise<string> {
  const diskPath = path.resolve("public", relativePath);
  const buffer = readFileSync(diskPath);
  const filename = path.basename(diskPath);
  if (dryRun) return `DRY_RUN_ASSET_${filename}`;
  const asset = await client.assets.upload("image", buffer, { filename });
  console.log(`  uploaded ${filename} → ${asset._id}`);
  return asset._id;
}

function imageRef(assetId: string): Record<string, unknown> {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
  };
}

async function main() {
  const existing = await client.fetch(
    `*[_type == "project" && slug.current == "regens-unite"][0]._id`,
  );
  if (existing) {
    console.log(`Regens Unite already exists: ${existing}`);
    console.log("Skipping creation to avoid duplicates.");
    return;
  }

  console.log(
    `Creating Regens Unite project entry ${dryRun ? "(DRY RUN)" : ""}…\n`,
  );

  console.log("Uploading grid image:");
  const gridImg = await uploadLocalImage("projects/Regens-Unite.jpg");

  const blurb =
    "A movement of events and educational media bridging the gaps between the broad range of sectors working on regenerative solutions, connecting expertise with innovation.";

  const doc = {
    _type: "project",
    name: "Regens Unite",
    slug: { _type: "slug", current: "regens-unite" },
    client: "Regens Unite",
    services:
      "Creative Direction, Brand, Event Design, Media Production",
    summary: blurb,
    link: "https://regensunite.earth",
    featured: false,
    sortOrder: 10,
    gridImage: imageRef(gridImg),
    isActiveProject: true,
    activeRole: "co-founder & creative director",
    activeBlurb: blurb,
  };

  console.log("\nDocument to create:");
  console.log(`  name: ${doc.name}`);
  console.log(`  slug: ${(doc.slug as { current: string }).current}`);
  console.log(`  sortOrder: ${doc.sortOrder}`);
  console.log(`  isActiveProject: ${doc.isActiveProject}`);
  console.log(`  activeRole: ${doc.activeRole}`);
  console.log(`  link: ${doc.link}`);
  console.log(`  gridImage: ${gridImg}`);
  console.log();

  if (dryRun) {
    console.log("DRY RUN — not creating document.");
    return;
  }

  const created = await client.create(doc);
  console.log(`\nCreated: ${created._id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
