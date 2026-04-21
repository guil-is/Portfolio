#!/usr/bin/env tsx
/**
 * One-off: tidy the merged `n26-business-black` project in Sanity.
 *
 * Run AFTER `sanity:merge-projects` has committed (keeper=annie-o,
 * sources=ruby-barber, new_slug=n26-business-black,
 * new_name="N26 Business Black"). Cleans up the mechanical
 * merge artefacts:
 *   • Rewrites summary (drops the "--- merged from Ruby Barber ---"
 *     separator concatenation).
 *   • Collapses services back to a single line.
 *   • Replaces projectDetails with a curated Portable Text array:
 *     intro → Annie O section (heading + copy) → Ruby Barber section
 *     (heading + her video embed + copy) → credit.
 *
 * Safety:
 *   • Bails if the project is not found.
 *   • Writes a timestamped JSON backup of the pre-tidy state before
 *     mutating.
 *   • Supports DRY_RUN=true (default) to log the plan only.
 */
import { createClient } from "next-sanity";
import { mkdirSync, writeFileSync } from "node:fs";
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

const SLUG = "n26-business-black";

function key(prefix = "bb") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function textBlock(
  text: string,
  style: "normal" | "h2" | "h3" = "normal",
): Record<string, unknown> {
  return {
    _type: "block",
    _key: key(),
    style,
    children: [{ _type: "span", _key: key("s"), text, marks: [] }],
    markDefs: [],
  };
}

function linkBlock(
  before: string,
  linkText: string,
  href: string,
  after: string,
): Record<string, unknown> {
  const linkKey = key("lk");
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    children: [
      { _type: "span", _key: key("s"), text: before, marks: [] },
      { _type: "span", _key: key("s"), text: linkText, marks: [linkKey] },
      { _type: "span", _key: key("s"), text: after, marks: [] },
    ],
    markDefs: [
      { _key: linkKey, _type: "link", href },
    ],
  };
}

function videoEmbed(url: string, caption?: string): Record<string, unknown> {
  const block: Record<string, unknown> = {
    _type: "videoEmbed",
    _key: key("v"),
    url,
  };
  if (caption) block.caption = caption;
  return block;
}

async function main() {
  const existing = await client.fetch<
    { _id: string; summary?: string; services?: string; projectDetails?: unknown[] } | null
  >(
    `*[_type == "project" && slug.current == $slug][0]{
      _id, summary, services, projectDetails
    }`,
    { slug: SLUG },
  );

  if (!existing) {
    console.error(
      `No project found at slug "${SLUG}". Did the merge-projects ` +
        `workflow run yet (with DRY_RUN=false)?`,
    );
    process.exit(1);
  }

  console.log(
    `Tidying ${SLUG} (${existing._id}) ${dryRun ? "(DRY RUN)" : ""}…\n`,
  );

  // Backup pre-tidy state
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve("scripts/sanity/backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(
    backupDir,
    `tidy-n26-business-black-${timestamp}.json`,
  );
  writeFileSync(
    backupPath,
    JSON.stringify({ timestamp, dryRun, pre: existing }, null, 2),
  );
  console.log(`✓ Backup written to ${backupPath}\n`);

  const newSummary =
    "Portraits from N26’s Business Black campaign — two entrepreneurs, two paths, one premium account.";

  const newServices = "End‑to‑end video production";

  const newProjectDetails: Record<string, unknown>[] = [
    textBlock(
      "Two portraits from N26’s Business Black campaign, shot end‑to‑end in Berlin.",
    ),

    textBlock("Annie O — Investment banker to Berlin DJ", "h3"),
    textBlock(
      "Finance to music is not exactly a well-worn path. Annie O started her career in London as an investment banker bringing in a six-figure salary. But she quickly realised that world was not for her. She quit her job and moved to Berlin to pursue her love for music and is now a successful DJ.",
    ),
    linkBlock(
      "Read more about her story here: ",
      "goo.gl/cvcLNo",
      "https://goo.gl/cvcLNo",
      "",
    ),

    textBlock("Ruby Barber — Make your business bloom", "h3"),
    videoEmbed("https://youtu.be/ybT_cc4hfDI"),
    textBlock(
      "Entrepreneur Ruby Barber’s flower studio Mary Lennox is one of the most highly-regarded in town. She says that’s because she’s always stuck to her own path—with one eye on the business and another on pushing her creative boundaries.",
    ),

    linkBlock(
      "Made in collaboration with ",
      "Tim Doldissen",
      "http://timdoldissen.com",
      ".",
    ),
  ];

  const patch = {
    summary: newSummary,
    services: newServices,
    projectDetails: newProjectDetails,
  };

  console.log("Planned patch:");
  console.log(`  summary:  ${newSummary}`);
  console.log(`  services: ${newServices}`);
  console.log(`  projectDetails: ${newProjectDetails.length} blocks`);
  for (const b of newProjectDetails) {
    const t = (b as { _type: string })._type;
    if (t === "block") {
      const style = (b as { style?: string }).style ?? "normal";
      const children = (b as { children: { text: string }[] }).children;
      const text = children.map((c) => c.text).join("");
      console.log(
        `    [${style}] ${text.length > 70 ? text.slice(0, 67) + "…" : text}`,
      );
    } else if (t === "videoEmbed") {
      console.log(`    [videoEmbed] ${(b as { url: string }).url}`);
    } else {
      console.log(`    [${t}]`);
    }
  }

  if (dryRun) {
    console.log("\nDRY RUN — no changes written.");
    return;
  }

  await client.patch(existing._id).set(patch).commit();
  console.log(`\n✓ Patched ${existing._id}.`);
  console.log(`✓ Pre-tidy backup remains at ${backupPath}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
