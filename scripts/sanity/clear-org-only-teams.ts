#!/usr/bin/env tsx
/**
 * Revert `populate-project-teams`: unset `team` on any project whose
 * current team is exactly one reference AND that reference points at
 * a `client` doc.
 *
 * Safe heuristic — never touches a team with:
 *   • more than one entry (manual editing has started), or
 *   • a reference that points at a `person` doc (real collaborator).
 *
 * Env:
 *   DRY_RUN=true|false (default true)
 *   SANITY_PROJECT_ID / SANITY_DATASET / SANITY_AUTH_TOKEN
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

type TeamEntry = { _key?: string; _type?: string; _ref?: string };
type ProjectDoc = {
  _id: string;
  name?: string;
  slug?: { current?: string };
  team?: TeamEntry[];
  /** Type of the single referenced doc, resolved via select(). */
  singleRefType?: string;
};

async function main() {
  const projects = await client.fetch<ProjectDoc[]>(
    `*[_type == "project" && defined(team) && count(team) == 1]{
      _id,
      name,
      slug,
      team,
      "singleRefType": team[0]->._type
    }`,
  );

  console.log(
    `Scanning ${projects.length} project(s) with a single-entry team` +
      ` ${dryRun ? "(DRY RUN)" : ""}\n`,
  );

  const toClear: ProjectDoc[] = [];
  for (const p of projects) {
    if (p.singleRefType === "client") toClear.push(p);
  }

  const summary: string[] = [];
  for (const p of projects) {
    const slug = p.slug?.current ?? "?";
    if (p.singleRefType === "client") {
      summary.push(`${slug.padEnd(32)} + clear (single org ref)`);
    } else {
      summary.push(
        `${slug.padEnd(32)} = keep (refs ${p.singleRefType ?? "?"})`,
      );
    }
  }
  console.log(summary.join("\n"));
  console.log(
    `\nTotals — clear: ${toClear.length}, keep: ${projects.length - toClear.length}\n`,
  );

  if (toClear.length === 0) {
    console.log("Nothing to clear. Done.");
    return;
  }

  // Backup pre-patch state.
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve("scripts/sanity/backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(
    backupDir,
    `clear-org-only-teams-${timestamp}.json`,
  );
  writeFileSync(
    backupPath,
    JSON.stringify({ timestamp, dryRun, cleared: toClear }, null, 2),
  );
  console.log(`✓ Backup: ${backupPath}\n`);

  if (dryRun) {
    console.log("DRY RUN — no changes written.");
    return;
  }

  const tx = client.transaction();
  for (const p of toClear) tx.patch(p._id, (pt) => pt.unset(["team"]));
  const result = await tx.commit();
  console.log(
    `✓ Committed. ${result.results.length} project(s) cleared.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
