#!/usr/bin/env tsx
/**
 * Diagnostic + dedupe for `client` documents in Sanity.
 *
 * Behaviour:
 *   1. Fetches every `client` doc.
 *   2. Groups them by a normalised name (lowercase, collapsed whitespace,
 *      trimmed) so "JKR Global" and "jkr  global" collapse into the
 *      same group.
 *   3. Logs every group. Groups with only 1 member are printed as OK;
 *      groups with duplicates get a "kept vs. deleted" plan.
 *   4. "Keep" heuristic: prefer the doc that is `featured`, then the
 *      one with the highest field-fill score (description + href +
 *      logo), then the oldest `_createdAt`.
 *   5. Writes a JSON backup of every group that has duplicates before
 *      mutating.
 *   6. With DRY_RUN=false, deletes the losing docs in a single
 *      transaction (so either every delete commits or none does).
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

type ClientDoc = {
  _id: string;
  _createdAt?: string;
  name?: string;
  description?: string;
  href?: string;
  logo?: unknown;
  featured?: boolean;
};

function normalize(name: string | undefined): string {
  return (name ?? "").toLowerCase().trim().replace(/\s+/g, " ");
}

function score(doc: ClientDoc): number {
  let s = 0;
  if (doc.featured) s += 4;
  if (doc.description && doc.description.trim()) s += 2;
  if (doc.href && doc.href.trim()) s += 2;
  if (doc.logo) s += 2;
  return s;
}

function pickKeeper(dups: ClientDoc[]): ClientDoc {
  return [...dups].sort((a, b) => {
    const sDiff = score(b) - score(a);
    if (sDiff !== 0) return sDiff;
    // Tie-break: older (created first) wins.
    const aT = a._createdAt ?? "";
    const bT = b._createdAt ?? "";
    return aT.localeCompare(bT);
  })[0];
}

async function main() {
  const docs = await client.fetch<ClientDoc[]>(
    `*[_type == "client"] | order(name asc) {
      _id, _createdAt, name, description, href, logo, featured
    }`,
  );

  console.log(`Fetched ${docs.length} client doc(s).\n`);

  const groups = new Map<string, ClientDoc[]>();
  for (const d of docs) {
    const key = normalize(d.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }

  const duplicateGroups = Array.from(groups.entries()).filter(
    ([, arr]) => arr.length > 1,
  );

  console.log("Unique client groups:");
  for (const [key, arr] of groups) {
    const prefix = arr.length > 1 ? "!!" : "  ";
    console.log(`${prefix} ${arr[0].name ?? key}  (${arr.length})`);
  }
  console.log();

  if (duplicateGroups.length === 0) {
    console.log("No duplicates found — nothing to do.");
    return;
  }

  console.log(`Duplicate groups: ${duplicateGroups.length}\n`);

  // Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve("scripts/sanity/backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(
    backupDir,
    `dedupe-clients-${timestamp}.json`,
  );
  writeFileSync(
    backupPath,
    JSON.stringify(
      { timestamp, dryRun, duplicateGroups },
      null,
      2,
    ),
  );
  console.log(`✓ Pre-dedupe backup: ${backupPath}\n`);

  const toDelete: ClientDoc[] = [];

  for (const [key, arr] of duplicateGroups) {
    const keeper = pickKeeper(arr);
    const losers = arr.filter((d) => d._id !== keeper._id);
    console.log(`Group "${arr[0].name ?? key}":`);
    console.log(
      `  KEEP    ${keeper._id}  score=${score(keeper)} created=${keeper._createdAt ?? "?"}  featured=${keeper.featured ?? false}`,
    );
    for (const l of losers) {
      console.log(
        `  DELETE  ${l._id}  score=${score(l)} created=${l._createdAt ?? "?"}  featured=${l.featured ?? false}`,
      );
      toDelete.push(l);
    }
    console.log();
  }

  if (dryRun) {
    console.log("DRY RUN — no deletions performed.");
    return;
  }

  const tx = client.transaction();
  for (const l of toDelete) tx.delete(l._id);
  const result = await tx.commit();
  console.log(
    `✓ Transaction committed. ${result.results.length} operations. ` +
      `Deleted ${toDelete.length} duplicate client doc(s).`,
  );
  console.log(`✓ Backup remains at ${backupPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
