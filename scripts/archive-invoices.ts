/**
 * Sync issued invoices to the Google Drive archive.
 *
 *   npm run invoice:archive                 # every invoice in issued.ts
 *   npm run invoice:archive -- INV-26020    # just one
 *   npm run invoice:archive -- --dry-run    # render + report, no upload
 *
 * Each spec in src/content/invoices/issued.ts is re-rendered (the same
 * renderer the /api/invoice route uses, so the PDF matches what was
 * emailed) and uploaded to "Invoices/Invoices <year>/" unless a file for
 * that number is already there. Idempotent: run it as often as you like.
 * CI runs it on every push to main that touches issued.ts, so from a
 * Claude session with no Drive credentials the archive still happens —
 * just register the spec in issued.ts and push.
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFiles } from "./lib/env";
import {
  DriveClient,
  archiveFileName,
  archiveInvoicePdf,
  driveConfigFromEnv,
} from "./lib/gdrive";
import { renderInvoicePdf } from "../src/lib/invoice-pdf";
import { paymentProfiles, driveArchive } from "../src/content/invoices/config";
import { issuedInvoices } from "../src/content/invoices/issued";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadEnvFiles(repoRoot);

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const wanted = argv.filter((a) => !a.startsWith("-"));

  const numbers = (wanted.length ? wanted : Object.keys(issuedInvoices)).sort();
  for (const n of numbers) {
    if (!issuedInvoices[n]) {
      console.error(
        `✗ ${n} is not in src/content/invoices/issued.ts. Add its spec there` +
          ` first — that file is what gets archived.`,
      );
      process.exit(1);
    }
  }

  const cfg = driveConfigFromEnv(driveArchive.rootFolderId);
  if (!cfg && !dryRun) {
    console.error(
      "✗ No Drive credentials. Set GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET and" +
        " GDRIVE_REFRESH_TOKEN (npm run gdrive:auth), or pass --dry-run.",
    );
    process.exit(1);
  }
  const drive = cfg && !dryRun ? new DriveClient(cfg) : null;

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const number of numbers) {
    const spec = issuedInvoices[number];
    const profiles = spec.paymentProfiles.map((key) => {
      const p = paymentProfiles[key];
      if (!p) throw new Error(`${number}: unknown payment profile "${key}"`);
      return p;
    });
    try {
      const pdf = await renderInvoicePdf(spec, profiles);
      const name = archiveFileName(number, spec.billTo.name);
      if (!drive) {
        console.log(`  · ${name}  (${pdf.length} bytes, dry run)`);
        continue;
      }
      const result = await archiveInvoicePdf(drive, cfg!.rootFolderId, {
        number,
        clientName: spec.billTo.name,
        issuedAt: spec.issuedAt,
        pdf,
      });
      if (result.status === "uploaded") {
        uploaded++;
        console.log(`  ✓ ${result.folderName}/${result.file.name}  uploaded`);
      } else {
        skipped++;
        console.log(
          `  · ${result.folderName}/${result.file.name}  already there`,
        );
      }
    } catch (err) {
      failed++;
      console.error(`  ✗ ${number}: ${(err as Error).message}`);
    }
  }

  if (drive) {
    console.log(
      `\n${uploaded} uploaded, ${skipped} already archived, ${failed} failed.`,
    );
  }
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`✗ ${(err as Error).message}`);
  process.exit(1);
});
