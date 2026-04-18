#!/usr/bin/env tsx
/**
 * One-off: create a Clawbank project entry in Sanity from the
 * Odyssey proposal copy + uploaded images from public/odyssey/clawbank/.
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

function key() {
  return `cb-${Math.random().toString(36).slice(2, 10)}`;
}

function textBlock(text: string, style = "normal"): Record<string, unknown> {
  return {
    _type: "block",
    _key: key(),
    style,
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

function videoEmbedBlock(
  url: string,
  caption?: string,
): Record<string, unknown> {
  return {
    _type: "videoEmbed",
    _key: key(),
    url,
    ...(caption ? { caption } : {}),
  };
}

async function uploadLocalImage(
  relativePath: string,
): Promise<string> {
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

function imageBlock(
  assetId: string,
  caption?: string,
): Record<string, unknown> {
  return {
    _type: "image",
    _key: key(),
    asset: { _type: "reference", _ref: assetId },
    ...(caption ? { caption } : {}),
  };
}

async function main() {
  // Check if Clawbank already exists
  const existing = await client.fetch(
    `*[_type == "project" && slug.current == "clawbank"][0]._id`,
  );
  if (existing) {
    console.log(`Clawbank already exists: ${existing}`);
    console.log("Skipping creation to avoid duplicates.");
    return;
  }

  console.log("Creating Clawbank project entry…\n");

  // Upload images
  console.log("Uploading images:");
  const img1 = await uploadLocalImage("odyssey/clawbank/Clawbank-1.jpg");
  const img2 = await uploadLocalImage("odyssey/clawbank/Clawbank-2.jpg");
  const img3 = await uploadLocalImage("odyssey/clawbank/Clawbank-3.gif");

  // Build projectDetails body
  const body: Record<string, unknown>[] = [
    textBlock("The challenge", "h3"),
    textBlock(
      "A technically real product with no visual credibility. In crypto, perception precedes traction — they needed to look fundable before they could become fundable.",
    ),

    textBlock("What I shipped", "h3"),
    textBlock(
      "Brand identity, landing page from zero to live, design system, base marketing assets and promo videos. Zero to launch in two weeks.",
    ),
    textBlock(
      "Full brand identity from scratch: mark, typography, color, and motion language. Landing page built to serve developers and investors simultaneously. Design tokens into production CSS, structured for a team to scale from. Visual direction for product content: demo framing and video structure.",
    ),

    // Inline images
    imageBlock(img1, "Clawbank brand identity"),
    imageBlock(img2, "Clawbank landing page"),
    imageBlock(img3, "Clawbank product demo"),

    // Promo video
    videoEmbedBlock(
      "https://x.com/singularityhack/status/2044519546610995356",
      "Clawbank launch promo",
    ),

    textBlock("Impact", "h3"),
    textBlock(
      "$150K → $800K market cap in 13 days. +433% growth. #5 trending on DexScreener.",
    ),
    textBlock(
      "Design legitimacy unlocks trust, trust unlocks momentum. Fast building, lean approach.",
    ),
  ];

  // Build the document
  const doc = {
    _type: "project",
    name: "Clawbank",
    slug: { _type: "slug", current: "clawbank" },
    client: "Clawbank",
    services: "Brand Identity, Landing Page, Design System, Motion, Video",
    summary:
      "Brand identity and launch design for a crypto product — zero to live in two weeks. $150K to $800K market cap in 13 days.",
    link: "https://clawbank.co",
    featured: true,
    sortOrder: 15,
    gridImage: imageRef(img1),
    mainImage: imageRef(img2),
    projectDetails: body,
    stillFrames: [
      { ...imageRef(img1), _key: key() },
      { ...imageRef(img2), _key: key() },
      { ...imageRef(img3), _key: key() },
    ],
  };

  console.log("\nDocument summary:");
  console.log(`  name: ${doc.name}`);
  console.log(`  slug: ${doc.slug.current}`);
  console.log(`  client: ${doc.client}`);
  console.log(`  services: ${doc.services}`);
  console.log(`  summary: ${doc.summary.slice(0, 80)}…`);
  console.log(`  link: ${doc.link}`);
  console.log(`  featured: ${doc.featured}`);
  console.log(`  sortOrder: ${doc.sortOrder}`);
  console.log(`  gridImage: ${img1}`);
  console.log(`  mainImage: ${img2}`);
  console.log(`  projectDetails: ${body.length} blocks`);
  console.log(`  stillFrames: 3 images`);

  if (dryRun) {
    console.log("\nDRY RUN — document not created.");
    return;
  }

  const result = await client.create(doc);
  console.log(`\n✓ Created: ${result._id}`);
  console.log(`  View in Studio: https://guil.is/studio/structure/project;${result._id}`);
  console.log(`  Live page: https://guil.is/projects/clawbank`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
