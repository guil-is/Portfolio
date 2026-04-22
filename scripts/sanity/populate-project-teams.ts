#!/usr/bin/env tsx
/**
 * Backfill project `team[]` with an organisation reference matching
 * the project's legacy `client` string. Leaves projects with a
 * non-empty `team[]` untouched so manual edits in Studio are never
 * overwritten.
 *
 * Matching is done case-insensitively + whitespace-collapsed against
 * existing `client` docs by name. Projects whose `client` string
 * doesn't resolve are logged and skipped.
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

function normalize(s: string | undefined): string {
  return (s ?? "").toLowerCase().trim().replace(/\s+/g, " ");
}

type ProjectDoc = {
  _id: string;
  name?: string;
  slug?: { current?: string };
  client?: string;
  team?: Array<{ _key?: string; _type?: string; _ref?: string }>;
};

type ClientDoc = { _id: string; name?: string };

async function main() {
  const projects = await client.fetch<ProjectDoc[]>(
    `*[_type == "project"] | order(sortOrder asc) {
      _id, name, slug, client, team
    }`,
  );
  const clients = await client.fetch<ClientDoc[]>(
    `*[_type == "client"]{ _id, name }`,
  );

  const clientIndex = new Map<string, string>();
  for (const c of clients) {
    const k = normalize(c.name);
    if (k) clientIndex.set(k, c._id);
  }

  console.log(
    `Scanning ${projects.length} project(s) ${dryRun ? "(DRY RUN)" : ""}\n` +
      `Client index: ${clientIndex.size} entries\n`,
  );

  type Plan = {
    project: ProjectDoc;
    action: "skip-has-team" | "skip-no-client" | "skip-no-match" | "attach";
    clientId?: string;
    matchedName?: string;
  };
  const plans: Plan[] = [];

  for (const p of projects) {
    if (p.team && p.team.length > 0) {
      plans.push({ project: p, action: "skip-has-team" });
      continue;
    }
    if (!p.client || !p.client.trim()) {
      plans.push({ project: p, action: "skip-no-client" });
      continue;
    }
    const key = normalize(p.client);
    const clientId = clientIndex.get(key);
    if (!clientId) {
      plans.push({ project: p, action: "skip-no-match" });
      continue;
    }
    plans.push({
      project: p,
      action: "attach",
      clientId,
      matchedName: p.client,
    });
  }

  const summaryLines: string[] = [];
  const stats = {
    attach: 0,
    "skip-has-team": 0,
    "skip-no-client": 0,
    "skip-no-match": 0,
  };
  for (const plan of plans) {
    const p = plan.project;
    const slug = p.slug?.current ?? "?";
    const tag =
      plan.action === "attach"
        ? `+ attach "${plan.matchedName}" (${plan.clientId})`
        : plan.action === "skip-has-team"
          ? "= has team, skip"
          : plan.action === "skip-no-client"
            ? "~ no client string, skip"
            : `! no client doc match for "${p.client}", skip`;
    summaryLines.push(`${slug.padEnd(32)} ${tag}`);
    stats[plan.action]++;
  }
  console.log(summaryLines.join("\n"));
  console.log(
    `\nTotals — attach: ${stats.attach}, ` +
      `already-populated: ${stats["skip-has-team"]}, ` +
      `no-client-string: ${stats["skip-no-client"]}, ` +
      `no-client-match: ${stats["skip-no-match"]}\n`,
  );

  if (stats.attach === 0) {
    console.log("Nothing to attach. Done.");
    return;
  }

  // Backup pre-patch state of projects we're going to mutate.
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve("scripts/sanity/backups");
  mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(
    backupDir,
    `populate-project-teams-${timestamp}.json`,
  );
  writeFileSync(
    backupPath,
    JSON.stringify(
      {
        timestamp,
        dryRun,
        plans: plans.filter((p) => p.action === "attach"),
      },
      null,
      2,
    ),
  );
  console.log(`✓ Backup: ${backupPath}\n`);

  if (dryRun) {
    console.log("DRY RUN — no changes written.");
    return;
  }

  const tx = client.transaction();
  for (const plan of plans) {
    if (plan.action !== "attach" || !plan.clientId) continue;
    tx.patch(plan.project._id, (p) =>
      p.set({
        team: [
          {
            _key: `org-${plan.project._id.slice(-6)}-${Date.now().toString(36)}`,
            _type: "orgRef",
            _ref: plan.clientId,
          },
        ],
      }),
    );
  }
  const result = await tx.commit();
  console.log(
    `✓ Committed. ${result.results.length} project(s) patched.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
