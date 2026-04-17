#!/usr/bin/env tsx
/**
 * Diagnostic: list all projects in Sanity, with optional slug filter.
 */
import { createClient } from "next-sanity";

const {
  SLUG,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_AUTH_TOKEN,
} = process.env;

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
  const allProjects = await client.fetch<
    Array<Record<string, unknown>>
  >(
    `*[_type == "project"] | order(sortOrder asc) {
      _id,
      name,
      "slug": slug.current,
      client,
      featured,
      sortOrder,
      "hasGridImage": defined(gridImage),
      "projectDetailsCount": count(projectDetails),
      "stillFramesCount": count(stillFrames)
    }`,
  );

  console.log(`Total projects in Sanity: ${allProjects.length}\n`);
  for (const p of allProjects) {
    const match = !SLUG || (p.name as string)?.toLowerCase().includes(SLUG.toLowerCase()) ||
      (p.slug as string)?.toLowerCase().includes(SLUG.toLowerCase());
    if (!match) continue;
    console.log(
      `  ${p._id}  slug=${p.slug}  name="${p.name}"  client=${p.client}  featured=${p.featured}  sortOrder=${p.sortOrder}  gridImage=${p.hasGridImage}  details=${p.projectDetailsCount}  stills=${p.stillFramesCount}`,
    );
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
