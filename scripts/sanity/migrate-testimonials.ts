#!/usr/bin/env tsx
/**
 * Migrate the local TS `siteTestimonials` array
 * (src/content/testimonials.ts) into Sanity as `testimonial`
 * documents, creating a `person` document for each unique author.
 *
 * Behaviour:
 *   - For each testimonial, derive a person slug from the author name.
 *   - If the person doc doesn't exist yet, create it (name, slug,
 *     optional link from `social.url`). Images are NOT uploaded — add
 *     them via Studio afterwards.
 *   - If a testimonial already exists whose quote string matches
 *     (ignoring leading/trailing whitespace) AND references the same
 *     person, the testimonial is skipped. This makes the script
 *     idempotent — re-running does nothing unless the local source
 *     grew a new entry.
 *   - `projectLabel` is set from the legacy `project` field. If a
 *     `projectHref` starts with `/projects/<slug>` and that slug
 *     resolves to a Sanity project doc, we link the reference too.
 *   - Org linking: the legacy `project` string is split on commas and
 *     each piece is matched (case-insensitive, trimmed) against
 *     existing `client` docs by name. Matches are added to the
 *     person's `organizations[]` (merging with any pre-existing refs)
 *     and the first match is also set as the testimonial's
 *     `organization` ref.
 *
 * Env:
 *   DRY_RUN=true|false (default true)
 *   SANITY_PROJECT_ID / SANITY_DATASET / SANITY_AUTH_TOKEN
 */
import { createClient } from "next-sanity";
import { siteTestimonials } from "../../src/content/testimonials";

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

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeName(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

type ClientDoc = { _id: string; name?: string };

async function loadClientIndex(): Promise<Map<string, string>> {
  const docs = await client.fetch<ClientDoc[]>(
    `*[_type == "client"]{ _id, name }`,
  );
  const idx = new Map<string, string>();
  for (const d of docs) {
    if (d.name) idx.set(normalizeName(d.name), d._id);
  }
  return idx;
}

async function findPersonIdBySlug(slug: string): Promise<string | null> {
  return client.fetch<string | null>(
    `*[_type == "person" && slug.current == $slug][0]._id`,
    { slug },
  );
}

async function findProjectIdBySlug(slug: string): Promise<string | null> {
  return client.fetch<string | null>(
    `*[_type == "project" && slug.current == $slug][0]._id`,
    { slug },
  );
}

async function getPersonOrgRefs(
  personId: string,
): Promise<Array<{ _ref: string; _key?: string }>> {
  const refs = await client.fetch<Array<{ _ref: string; _key?: string }>>(
    `*[_type == "person" && _id == $id][0].organizations`,
    { id: personId },
  );
  return refs ?? [];
}

async function findMatchingTestimonialId(
  personId: string,
  quote: string,
): Promise<string | null> {
  return client.fetch<string | null>(
    `*[_type == "testimonial" && person._ref == $personId && quote == $quote][0]._id`,
    { personId, quote: quote.trim() },
  );
}

async function main() {
  console.log(
    `Migrating ${siteTestimonials.length} testimonial(s) ${dryRun ? "(DRY RUN)" : ""}\n`,
  );

  const clientIndex = await loadClientIndex();
  console.log(`Loaded ${clientIndex.size} client doc(s) for org matching.\n`);

  let sortOrder = 10;
  const summary: string[] = [];

  for (const t of siteTestimonials) {
    const personSlug = toSlug(t.name);
    let personId = await findPersonIdBySlug(personSlug);
    const isNewPerson = !personId;

    if (!personId) {
      const personDoc: Record<string, unknown> = {
        _type: "person",
        name: t.name,
        slug: { _type: "slug", current: personSlug },
      };
      if (t.social?.url) personDoc.link = t.social.url;
      summary.push(`+ Person  ${t.name}  (slug: ${personSlug})`);
      if (!dryRun) {
        const created = await client.create(personDoc);
        personId = created._id;
      } else {
        personId = `DRY-RUN-person-${personSlug}`;
      }
    } else {
      summary.push(`= Person  ${t.name}  (exists, ${personId})`);
    }

    // Try to match org names against existing client docs.
    const orgParts = (t.project || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const matchedOrgIds: string[] = [];
    for (const part of orgParts) {
      const id = clientIndex.get(normalizeName(part));
      if (id) matchedOrgIds.push(id);
    }
    if (matchedOrgIds.length) {
      summary.push(
        `  ↳ matched org(s): ${matchedOrgIds.length} (${orgParts.join(" | ")})`,
      );
    } else if (orgParts.length) {
      summary.push(
        `  ↳ no org match for: ${orgParts.join(" | ")} (create client docs to auto-link later)`,
      );
    }

    // Merge org refs onto the person (dedupe by _ref).
    if (matchedOrgIds.length && !dryRun) {
      const existingRefs = isNewPerson
        ? []
        : await getPersonOrgRefs(personId);
      const existingSet = new Set(existingRefs.map((r) => r._ref));
      const newRefs = matchedOrgIds
        .filter((id) => !existingSet.has(id))
        .map((id, i) => ({
          _type: "reference",
          _ref: id,
          _key: `org-${Date.now()}-${i}`,
        }));
      if (newRefs.length) {
        await client
          .patch(personId)
          .setIfMissing({ organizations: [] })
          .append("organizations", newRefs)
          .commit({ autoGenerateArrayKeys: true });
      }
    }

    const existing = await findMatchingTestimonialId(personId, t.quote);
    if (existing) {
      summary.push(
        `= Testimonial  ${t.name}  (exists, ${existing}) — skipping`,
      );
      continue;
    }

    const projectSlugMatch = t.projectHref?.match(/^\/projects\/([\w-]+)$/);
    let projectRefId: string | null = null;
    if (projectSlugMatch) {
      projectRefId = await findProjectIdBySlug(projectSlugMatch[1]);
    }

    const testimonialDoc: Record<string, unknown> = {
      _type: "testimonial",
      quote: t.quote.trim(),
      person: { _type: "reference", _ref: personId },
      role: t.role,
      projectLabel: t.project,
      featured: true,
      sortOrder,
    };
    if (projectRefId) {
      testimonialDoc.project = { _type: "reference", _ref: projectRefId };
    }
    if (matchedOrgIds.length) {
      testimonialDoc.organization = {
        _type: "reference",
        _ref: matchedOrgIds[0],
      };
    }

    const refTags: string[] = [];
    if (projectRefId) refTags.push("→ project");
    if (matchedOrgIds.length) refTags.push("→ org");
    summary.push(
      `+ Testimonial  ${t.name} · ${t.role} · ${t.project}${refTags.length ? `  (${refTags.join(", ")})` : ""}`,
    );
    if (!dryRun) {
      await client.create(testimonialDoc);
    }
    sortOrder += 10;
  }

  console.log(summary.join("\n"));

  if (dryRun) {
    console.log("\nDRY RUN — no changes written.");
  } else {
    console.log(
      "\n✓ Migration complete. Add person profile images + any missing org links in Studio.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
