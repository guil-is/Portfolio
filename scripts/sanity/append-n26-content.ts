#!/usr/bin/env tsx
/**
 * One-off: append pre-generated blocks from n26-append-blocks.json
 * to the n26-product-videos project's body in Sanity.
 */
import { createClient } from "next-sanity";
import { readFileSync } from "node:fs";

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
const slug = "n26-product-videos";

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function main() {
  const blocks = JSON.parse(
    readFileSync("scripts/sanity/n26-append-blocks.json", "utf8"),
  ) as unknown[];

  console.log(`Loaded ${blocks.length} blocks to append`);

  const doc = await client.fetch<{
    _id: string;
    projectDetails?: unknown[];
  } | null>(
    `*[_type == "project" && slug.current == $slug][0]{ _id, projectDetails }`,
    { slug },
  );

  if (!doc) {
    console.error(`No project with slug "${slug}"`);
    process.exit(1);
  }

  const existing = doc.projectDetails ?? [];
  console.log(`Existing body: ${existing.length} blocks`);
  console.log(`After append: ${existing.length + blocks.length} blocks`);

  if (dryRun) {
    console.log("\nDRY RUN — no changes written.");
    return;
  }

  await client
    .patch(doc._id)
    .set({ projectDetails: [...existing, ...blocks] })
    .commit();

  console.log("✓ Appended successfully.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
