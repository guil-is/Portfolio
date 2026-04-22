#!/usr/bin/env tsx
/**
 * Create a `person` document in Sanity.
 *
 * Env vars (the GitHub Actions workflow provides them from workflow_dispatch
 * inputs):
 *   NAME      required
 *   SLUG      optional — derived from NAME if omitted
 *   LINK      optional — personal website / Twitter / LinkedIn URL
 *   TAGS      optional — comma-separated, e.g. "Design, Animation"
 *   BIO       optional — short bio text
 *   DRY_RUN   when "true" (default), logs without writing
 *   SANITY_PROJECT_ID / SANITY_DATASET / SANITY_AUTH_TOKEN  required
 *
 * Idempotent: if a person at the resolved slug already exists, the script
 * logs and exits without creating a duplicate.
 */
import { createClient } from "next-sanity";

const {
  NAME,
  SLUG,
  LINK,
  TAGS,
  BIO,
  DRY_RUN,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_AUTH_TOKEN,
} = process.env;

if (!NAME) {
  console.error("Missing env NAME");
  process.exit(1);
}
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_AUTH_TOKEN) {
  console.error("Missing SANITY_* env vars");
  process.exit(1);
}

const dryRun = (DRY_RUN ?? "true").toLowerCase() !== "false";

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const slugValue = SLUG?.trim() || toSlug(NAME);
const tags = TAGS
  ? TAGS.split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  : [];

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function main() {
  const existing = await client.fetch<string | null>(
    `*[_type == "person" && slug.current == $slug][0]._id`,
    { slug: slugValue },
  );
  if (existing) {
    console.log(`Person "${NAME}" already exists at slug ${slugValue} (${existing}).`);
    console.log("Skipping creation. Edit in Studio or remove and rerun.");
    return;
  }

  const doc: Record<string, unknown> = {
    _type: "person",
    name: NAME,
    slug: { _type: "slug", current: slugValue },
  };
  if (tags.length) doc.tags = tags;
  if (LINK) doc.link = LINK;
  if (BIO) doc.bio = BIO;

  console.log(`Creating person ${dryRun ? "(DRY RUN)" : ""}…`);
  console.log(`  name: ${NAME}`);
  console.log(`  slug: ${slugValue}`);
  if (tags.length) console.log(`  tags: ${tags.join(", ")}`);
  if (LINK) console.log(`  link: ${LINK}`);
  if (BIO) console.log(`  bio:  ${BIO.slice(0, 80)}${BIO.length > 80 ? "…" : ""}`);

  if (dryRun) {
    console.log("\nDRY RUN — not creating.");
    return;
  }

  const created = await client.create(doc);
  console.log(`\n✓ Created ${created._id}. Upload a profile image in Studio.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
