#!/usr/bin/env tsx
/**
 * One-off diagnostic: fetch the raw projectDetails from a given
 * project and dump it so we can see what block types are actually
 * stored in Sanity.
 *
 * Usage via env (set by the GitHub workflow):
 *   SLUG=<project-slug>   default "the-daoist"
 *   SANITY_*              required
 */
import { createClient } from "next-sanity";

const {
  SLUG,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_AUTH_TOKEN,
} = process.env;

const slug = SLUG || "the-daoist";

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_AUTH_TOKEN) {
  console.error("Missing SANITY_* env vars");
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function main() {
  const doc = await client.fetch<{
  _id: string;
  projectDetails?: Array<Record<string, unknown>>;
} | null>(
  `*[_type == "project" && slug.current == $slug][0] {
    _id,
    projectDetails
  }`,
  { slug },
);

if (!doc) {
  console.log(`No project with slug "${slug}"`);
  process.exit(0);
}

console.log(`Doc: ${doc._id}`);
console.log(`projectDetails: ${doc.projectDetails?.length ?? 0} blocks\n`);

const typeCount: Record<string, number> = {};
(doc.projectDetails ?? []).forEach((b, i) => {
  const t = (b._type as string) ?? "unknown";
  typeCount[t] = (typeCount[t] ?? 0) + 1;
  const preview =
    t === "videoEmbed"
      ? `url=${b.url}`
      : t === "image"
        ? `asset=${JSON.stringify(b.asset ?? {}).slice(0, 80)}`
        : t === "block"
          ? (b.children as Array<{ text?: string }> | undefined)
              ?.map((c) => c.text)
              .join(" ")
              .slice(0, 80)
          : "";
  console.log(`  [${i.toString().padStart(2)}] _type=${t}  ${preview}`);
});

console.log(`\nBlock type counts:`, typeCount);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
