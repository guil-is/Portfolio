#!/usr/bin/env tsx
/**
 * Migrate the homepage marquee logos into Sanity: for each logo in
 * public/logos/, find (or create) the matching `client` doc, upload the
 * SVG as its `logo` image, and set `featured: true` so the marquee
 * (src/app/page.tsx) picks it up from the CMS.
 *
 * Idempotent: docs that already have a logo are skipped unless
 * FORCE=true, so re-running is safe and won't clobber logos curated in
 * Studio (e.g. Safe, added by hand).
 *
 * Run:
 *   SANITY_PROJECT_ID=... SANITY_DATASET=production SANITY_AUTH_TOKEN=... \
 *     npx tsx scripts/sanity/upload-marquee-logos.ts          # dry run
 *   ... DRY_RUN=false npx tsx scripts/sanity/upload-marquee-logos.ts
 *   ... DRY_RUN=false FORCE=true ...                          # re-upload all
 *
 * Once every marquee logo lives in Sanity, the static fallback list in
 * src/content/site.ts can be deleted.
 */
import { createClient } from "next-sanity";
import { readFileSync } from "node:fs";
import path from "node:path";

const { DRY_RUN, FORCE, SANITY_PROJECT_ID, SANITY_DATASET, SANITY_AUTH_TOKEN } =
  process.env;

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_AUTH_TOKEN) {
  console.error("Missing SANITY_* env vars");
  process.exit(1);
}

const dryRun = (DRY_RUN ?? "true").toLowerCase() !== "false";
const force = (FORCE ?? "false").toLowerCase() === "true";

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: SANITY_AUTH_TOKEN,
  useCdn: false,
});

/** Marquee logos and the client-doc fields used if the doc must be
 * created. Names must match the Sanity `client` docs (case-insensitive)
 * and the static list in src/content/site.ts. */
const LOGOS: Array<{
  name: string;
  file: string;
  description: string;
  href?: string;
}> = [
  { name: "N26", file: "Logo_n26.svg", description: "Europe’s leading mobile bank", href: "https://n26.com" },
  { name: "JKR Global", file: "Logo_jkr.svg", description: "Brand and design agency behind major global rebrands", href: "https://www.jkrglobal.com" },
  { name: "Optimism", file: "Logo_optimism.svg", description: "Ethereum L2 built on the Optimistic Rollup", href: "https://www.optimism.io" },
  { name: "Celo", file: "CELO.svg", description: "Mobile-first blockchain for financial inclusion", href: "https://celo.org" },
  { name: "Gitcoin", file: "Logo_gitcoin.svg", description: "Funding open source and public goods with quadratic mechanisms", href: "https://www.gitcoin.co" },
  { name: "Native Instruments", file: "Logo_native instruments.svg", description: "Music production hardware and software", href: "https://www.native-instruments.com" },
  { name: "ENS", file: "Logo_ens.svg", description: "Ethereum Name Service: decentralized naming for wallets and websites", href: "https://ens.domains" },
  { name: "Polygon", file: "P_olygon.svg", description: "Ethereum scaling with zero-knowledge proofs", href: "https://polygon.technology" },
  { name: "Ethereum Foundation", file: "ethereum foundation.svg", description: "Supporting the Ethereum ecosystem and protocol development", href: "https://ethereum.foundation" },
  // Safe was added by hand in Studio; listed here only so FORCE=true can
  // replace its logo with the optically-padded repo version if needed.
  { name: "Safe", file: "Logo_safe.svg", description: "Smart account infrastructure securing onchain assets (via Studio Huit)", href: "https://safe.global" },
];

type ExistingDoc = { _id: string; name: string; hasLogo: boolean };

async function run() {
  console.log(
    `${dryRun ? "[dry-run] " : ""}Uploading marquee logos to ${SANITY_PROJECT_ID}/${SANITY_DATASET}${force ? " (FORCE)" : ""}\n`,
  );

  for (const logo of LOGOS) {
    const filePath = path.join("public", "logos", logo.file);
    let buffer: Buffer;
    try {
      buffer = readFileSync(filePath);
    } catch {
      console.error(`✗ ${logo.name}: missing file ${filePath}`);
      continue;
    }

    const existing = await client.fetch<ExistingDoc | null>(
      `*[_type == "client" && lower(name) == $name][0]{ _id, name, "hasLogo": defined(logo) }`,
      { name: logo.name.toLowerCase() },
    );

    if (existing?.hasLogo && !force) {
      console.log(`• ${logo.name}: already has a logo — skipped (FORCE=true to replace)`);
      continue;
    }

    if (dryRun) {
      console.log(
        `→ ${logo.name}: would ${existing ? "patch" : "create"} + upload ${logo.file} (${buffer.byteLength} bytes), featured: true`,
      );
      continue;
    }

    const asset = await client.assets.upload("image", buffer, {
      filename: logo.file,
      contentType: "image/svg+xml",
    });
    const logoField = {
      _type: "image" as const,
      asset: { _type: "reference" as const, _ref: asset._id },
    };

    if (existing) {
      await client
        .patch(existing._id)
        .set({ logo: logoField, featured: true })
        .commit();
      console.log(`✓ ${logo.name}: logo attached to existing doc (${existing._id})`);
    } else {
      const doc = await client.create({
        _type: "client",
        name: logo.name,
        description: logo.description,
        ...(logo.href ? { href: logo.href } : {}),
        logo: logoField,
        featured: true,
      });
      console.log(`✓ ${logo.name}: created client doc (${doc._id})`);
    }
  }

  console.log(
    dryRun
      ? "\nDry run only — re-run with DRY_RUN=false to apply."
      : "\nDone. Check the homepage marquee; then the static list in src/content/site.ts can go.",
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
