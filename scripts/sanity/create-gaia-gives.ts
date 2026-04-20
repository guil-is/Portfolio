#!/usr/bin/env tsx
/**
 * One-off: create the Gaia Gives case study in Sanity.
 *
 * Skips image upload — Guil will supply the grid/hero/still frame
 * images separately and add them via the Studio or a follow-up
 * script. Body is a Portable Text array (paragraphs + h3 section
 * heads + bullet lists), matching the same shape used by
 * create-clawbank.ts.
 */
import { createClient } from "next-sanity";

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
  return `gg-${Math.random().toString(36).slice(2, 10)}`;
}

function textBlock(
  text: string,
  style: "normal" | "h2" | "h3" = "normal",
): Record<string, unknown> {
  return {
    _type: "block",
    _key: key(),
    style,
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

function bulletBlock(text: string): Record<string, unknown> {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

async function main() {
  const existing = await client.fetch(
    `*[_type == "project" && slug.current == "gaia-gives"][0]._id`,
  );
  if (existing) {
    console.log(`Gaia Gives already exists: ${existing}`);
    console.log("Skipping creation to avoid duplicates.");
    return;
  }

  console.log(
    `Creating Gaia Gives project ${dryRun ? "(DRY RUN)" : ""}…\n`,
  );

  const body: Record<string, unknown>[] = [
    textBlock(
      "The bet was simple. On-chain accountability should not require a wallet, a whitepaper, or a crypto vocabulary to feel useful. We built a Web 2.5 platform that spoke to mainstream donors while keeping the trust guarantees of the underlying tech.",
    ),

    textBlock("My role", "h3"),
    textBlock(
      "I led design across brand and product, working directly with founder and CMO Matt Gillespie on strategy and positioning, and with the CTO on rapid product iteration. I owned the visual identity, the logo, and the full UI/UX of the web app, from wireframe to pixel-perfect prototype.",
    ),

    textBlock("What I shipped", "h3"),
    bulletBlock("Brand strategy, positioning, color system, typography"),
    bulletBlock("Logo and core visual identity"),
    bulletBlock("Full web app design from wireframe to prototype"),
    bulletBlock("Product roadmap in collaboration with the CTO"),
    bulletBlock("Marketing site, social content, and pitch materials"),

    textBlock("Outcomes", "h3"),
    bulletBlock(
      "180k USD raised in pre-seed after more than 40 investor pitches",
    ),
    bulletBlock(
      "14 globally recognized nonprofits onboarded as launch partners",
    ),
    bulletBlock("Over 100k USD in donations generated through the platform"),

    textBlock("Why it mattered", "h3"),
    textBlock(
      "Most crypto-for-good projects get stuck speaking to the already-converted. Gaia Gives was a test of whether Web3 infrastructure could disappear into a donor flow that felt like any other giving platform, with transparency as a quiet feature rather than a sales pitch.",
    ),

    textBlock("Tools", "h3"),
    textBlock("Figma, Sketch, Webflow, Jira, Pitch."),
  ];

  const doc = {
    _type: "project",
    name: "Gaia Gives",
    slug: { _type: "slug", current: "gaia-gives" },
    client: "Gaia Gives",
    services: "Brand Identity, Web Design, UI/UX, Product Design, Marketing",
    summary:
      "Gaia Gives reimagined philanthropic crowdfunding by layering Web3 transparency and milestone-based fundraising onto a familiar donor experience.",
    link: "https://gaiagives.webflow.io/",
    featured: true,
    sortOrder: 20,
    isActiveProject: false,
    projectDetails: body,
    // Intentionally no gridImage / mainImage / stillFrames — Guil
    // uploads those via the Studio once he has the assets ready.
  };

  console.log("Document to create:");
  console.log(`  name: ${doc.name}`);
  console.log(`  slug: gaia-gives`);
  console.log(`  sortOrder: ${doc.sortOrder}`);
  console.log(`  link: ${doc.link}`);
  console.log(`  body blocks: ${body.length}`);
  console.log();

  if (dryRun) {
    console.log("DRY RUN — not creating document.");
    return;
  }

  const created = await client.create(doc);
  console.log(`\nCreated: ${created._id}`);
  console.log(
    "Remember to upload Grid Thumbnail + optional hero image in Studio.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
