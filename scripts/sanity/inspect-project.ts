#!/usr/bin/env tsx
/**
 * Diagnostic: dump a project's full metadata + block type counts.
 *
 * Usage via env:
 *   SLUG=<project-slug>   default "n26-product-videos"
 *   SANITY_*              required
 */
import { createClient } from "next-sanity";

const {
  SLUG,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_AUTH_TOKEN,
} = process.env;

const slug = SLUG || "n26-product-videos";

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
  const doc = await client.fetch<Record<string, unknown> | null>(
    `*[_type == "project" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      client,
      services,
      summary,
      featured,
      sortOrder,
      heroVideo,
      link,
      "hasGridImage": defined(gridImage),
      "gridImageUrl": gridImage.asset->url,
      "hasMainImage": defined(mainImage),
      "mainImageUrl": mainImage.asset->url,
      "projectDetailsCount": count(projectDetails),
      "stillFramesCount": count(stillFrames)
    }`,
    { slug },
  );

  if (!doc) {
    console.log(`No project with slug "${slug}"`);
    process.exit(0);
  }

  console.log("Full doc metadata:");
  for (const [k, v] of Object.entries(doc)) {
    console.log(`  ${k}: ${JSON.stringify(v)}`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
