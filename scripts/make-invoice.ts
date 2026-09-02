/**
 * Invoice maker CLI. Full workflow doc: docs/making-an-invoice.md
 *
 * Usage:
 *   npm run invoice -- <spec.json> [-o out.pdf]      (archives to Drive when GDRIVE_* is set)
 *   npm run invoice -- --justice <weekStart> [--number INV-26014] [--issued YYYY-MM-DD]
 *   npm run invoice -- --next-number
 *
 * A spec JSON matches `InvoiceSpec` (src/lib/invoice.ts), except `number`
 * and `dueAt` may be omitted: number defaults to the next in the ledger
 * sequence, dueAt to issuedAt + 7 days.
 *
 * `--justice <weekStart>` derives the whole spec from the matching
 * `hoursLog` period in src/content/clients/justice.ts (hours × rate,
 * expenses at cost, USD, outside-EU tax mode, Wise + crypto payment).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { InvoiceSpec } from "../src/lib/invoice";
import { grandTotal, formatMoney } from "../src/lib/invoice";
import { renderInvoicePdf } from "../src/lib/invoice-pdf";
import { loadEnvFiles } from "./lib/env";
import {
  DriveClient,
  archiveInvoicePdf,
  driveConfigFromEnv,
} from "./lib/gdrive";
import {
  paymentProfiles,
  billToPresets,
  driveArchive,
} from "../src/content/invoices/config";
import {
  nextInvoiceNumber,
  outstandingInvoices,
  outstandingByCurrency,
} from "../src/content/invoices/ledger";
import {
  justice,
  periodTotal,
  type HoursPeriod,
} from "../src/content/clients/justice";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadEnvFiles(repoRoot);

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function isoPlusDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type Args = {
  specPath?: string;
  justice?: string;
  number?: string;
  issued?: string;
  due?: string;
  out?: string;
  nextNumber?: boolean;
  status?: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i] ?? fail(`Missing value after ${a}`);
    if (a === "--justice") args.justice = next();
    else if (a === "--number") args.number = next();
    else if (a === "--issued") args.issued = next();
    else if (a === "--due") args.due = next();
    else if (a === "-o" || a === "--out") args.out = next();
    else if (a === "--next-number") args.nextNumber = true;
    else if (a === "--status") args.status = true;
    else if (a.startsWith("-")) fail(`Unknown flag: ${a}`);
    else args.specPath = a;
  }
  return args;
}

/** Payment radar: outstanding invoices, most-overdue first. */
function printStatus(): void {
  const today = todayIso();
  const outstanding = outstandingInvoices(today);
  if (outstanding.length === 0) {
    console.log("✓ No outstanding invoices — all tracked invoices are paid.");
    return;
  }
  console.log(`Outstanding invoices as of ${today}:\n`);
  for (const e of outstanding) {
    const money = `${e.total.toFixed(2)} ${e.currency}`;
    const flag =
      e.overdueDays > 0
        ? `OVERDUE ${e.overdueDays}d`
        : e.overdueDays === 0
          ? "due today"
          : `due in ${-e.overdueDays}d`;
    const mark = e.overdueDays > 0 ? "⚠" : "·";
    console.log(
      `  ${mark} ${e.number}  ${money.padStart(13)}  due ${e.dueAt}  ${flag}  — ${e.client}`,
    );
  }
  const totals = outstandingByCurrency(today);
  const summary = Object.entries(totals)
    .map(([cur, amt]) => `${amt.toFixed(2)} ${cur}`)
    .join(" + ");
  console.log(`\n  Total outstanding: ${summary}`);
}

function specFromJustice(args: Args): InvoiceSpec {
  const period: HoursPeriod | undefined = justice.hoursLog.find(
    (p) => p.weekStart === args.justice,
  );
  if (!period) {
    const known = justice.hoursLog.map((p) => p.weekStart).join(", ");
    fail(
      `No Justice period with weekStart "${args.justice}". Known: ${known}`,
    );
  }
  const rate = justice.engagement.rateUsd;
  const issuedAt = args.issued ?? todayIso();
  return {
    number: args.number ?? nextInvoiceNumber(),
    issuedAt,
    dueAt: args.due ?? isoPlusDays(issuedAt, 7),
    // The retainer period IS the Leistungszeitraum — derive it rather
    // than leaving the invoice without one. weekStart is a Monday, so the
    // period runs to the Friday of its last week; that matches the
    // period's own label (e.g. "May 25 – 29, 2026"), which is printed in
    // the note, so the header and the note can't contradict each other.
    serviceDate: period.weekStart,
    serviceEndDate: isoPlusDays(period.weekStart, ((period.weeks ?? 1) - 1) * 7 + 4),
    currency: "USD",
    taxMode: "outside-eu",
    billTo: billToPresets.justice,
    lines: [
      ...period.items.map((item) => ({
        description: `${item.project} — ${item.description}`,
        qty: item.hours,
        unitPrice: rate,
      })),
      ...(period.expenses ?? []).map((e) => ({
        description: `Expense — ${e.description}`,
        amount: e.amountUsd,
      })),
    ],
    paymentProfiles: ["wise-usd-local", "wise-usd-intl", "crypto-usdc"],
    note:
      `Design retainer, ${period.label} (${periodTotal(period)}h at $${rate}/h).` +
      ((period.expenses ?? []).length > 0 ? " Expenses billed at cost." : ""),
  };
}

function specFromFile(args: Args): InvoiceSpec {
  const raw = JSON.parse(readFileSync(resolve(args.specPath!), "utf8"));
  const issuedAt: string = raw.issuedAt ?? todayIso();
  const spec: InvoiceSpec = {
    number: args.number ?? raw.number ?? nextInvoiceNumber(),
    issuedAt,
    dueAt: args.due ?? raw.dueAt ?? isoPlusDays(issuedAt, 7),
    serviceDate: raw.serviceDate,
    serviceEndDate: raw.serviceEndDate,
    currency: raw.currency ?? "EUR",
    taxMode: raw.taxMode ?? "de-19",
    billTo:
      typeof raw.billTo === "string"
        ? (billToPresets[raw.billTo] ??
          fail(
            `Unknown billTo preset "${raw.billTo}". Known: ${Object.keys(billToPresets).join(", ")}`,
          ))
        : raw.billTo,
    lines: raw.lines,
    paymentProfiles:
      raw.paymentProfiles ??
      (raw.currency === "USD"
        ? ["wise-usd-local", "wise-usd-intl", "crypto-usdc"]
        : ["n26-eur"]),
    note: raw.note,
  };
  if (!spec.billTo?.name) fail("Spec needs billTo (preset key or object).");
  if (!Array.isArray(spec.lines) || spec.lines.length === 0)
    fail("Spec needs at least one line item.");
  return spec;
}

/**
 * The service date is the Leistungsdatum/-zeitraum §14 UStG asks for, and
 * it is the field easiest to get wrong: leaving it unset says nothing, and
 * copying the issue date into it (a tempting placeholder) says nothing
 * twice. Warn on both — loudly enough to notice, without blocking the
 * genuine same-day job.
 */
function warnOnServicePeriod(spec: InvoiceSpec): void {
  if (!spec.serviceDate) {
    console.warn(
      `⚠ No service date — §14 UStG wants the date or period the work` +
        ` happened. Set "serviceDate" (plus "serviceEndDate" if it spans` +
        ` days) and regenerate.`,
    );
    return;
  }
  if (!spec.serviceEndDate && spec.serviceDate === spec.issuedAt) {
    console.warn(
      `⚠ Service date equals the issue date. If the work actually spanned` +
        ` days, set "serviceDate" to when it started and "serviceEndDate"` +
        ` to when it finished. Ignore this for genuine same-day work.`,
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.nextNumber) {
    console.log(nextInvoiceNumber());
    return;
  }

  if (args.status) {
    printStatus();
    return;
  }

  let spec: InvoiceSpec;
  if (args.justice) spec = specFromJustice(args);
  else if (args.specPath) spec = specFromFile(args);
  else
    fail(
      "Pass a spec JSON path, --justice <weekStart>, or --next-number. See docs/making-an-invoice.md",
    );

  warnOnServicePeriod(spec);

  const profiles = spec.paymentProfiles.map(
    (key) =>
      paymentProfiles[key] ??
      fail(
        `Unknown payment profile "${key}". Known: ${Object.keys(paymentProfiles).join(", ")}`,
      ),
  );

  const pdf = await renderInvoicePdf(spec, profiles);
  const pages = (
    pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []
  ).length;
  const slug = spec.billTo.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const outPath = resolve(
    args.out ?? `${repoRoot}/invoices/${spec.number}-${slug}.pdf`,
  );
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, pdf);

  console.log(`✓ ${spec.number} → ${outPath}`);
  console.log(
    `  ${spec.billTo.name} · ${formatMoney(grandTotal(spec), spec.currency)} · due ${spec.dueAt}`,
  );
  if (pages > 1) {
    console.warn(
      `⚠ Invoice spilled to ${pages} pages — invoices should be ONE page.` +
        ` Shorten descriptions or merge related line items, then regenerate.`,
    );
  }

  // Durable archive, two routes to the same Drive folder:
  //   1. Drive API upload (GDRIVE_* creds from `npm run gdrive:auth`) —
  //      works from any machine, this is the one that matters.
  //   2. Local copy into INVOICE_ARCHIVE_DIR (Google Drive for desktop
  //      mirror) — legacy Mac path, kept as a fallback.
  // Neither failing ever fails the render; the archive-invoices workflow
  // re-syncs everything in issued.ts on push to main anyway.
  const driveCfg = driveConfigFromEnv(driveArchive.rootFolderId);
  if (driveCfg) {
    try {
      const result = await archiveInvoicePdf(
        new DriveClient(driveCfg),
        driveCfg.rootFolderId,
        {
          number: spec.number,
          clientName: spec.billTo.name,
          issuedAt: spec.issuedAt,
          pdf,
        },
      );
      const verb = result.status === "uploaded" ? "archived" : "already in";
      console.log(
        `  ${verb} Drive → ${result.folderName}/${result.file.name}` +
          (result.file.webViewLink ? `  ${result.file.webViewLink}` : ""),
      );
    } catch (err) {
      console.warn(
        `  ⚠ Drive upload failed: ${(err as Error).message}\n` +
          `    Invoice still saved at ${outPath}. Register it in issued.ts` +
          ` and push, or rerun: npm run invoice:archive -- ${spec.number}`,
      );
    }
  }

  const archiveRoot = process.env.INVOICE_ARCHIVE_DIR;
  if (archiveRoot) {
    const year = spec.issuedAt.slice(0, 4);
    const archiveDir = resolve(archiveRoot, `Invoices ${year}`);
    try {
      mkdirSync(archiveDir, { recursive: true });
      const archivePath = resolve(
        archiveDir,
        `${spec.number} ${spec.billTo.name}.pdf`,
      );
      writeFileSync(archivePath, pdf);
      console.log(`  archived → ${archivePath}`);
    } catch (err) {
      console.warn(
        `  ⚠ could not archive to ${archiveDir} (${(err as Error).message}).` +
          ` Invoice still saved at ${outPath}.`,
      );
    }
  } else if (!driveCfg) {
    console.log(
      `  (no Drive credentials — set GDRIVE_* via \`npm run gdrive:auth\`` +
        ` to auto-archive, or register the invoice in issued.ts and push` +
        ` so CI archives it)`,
    );
  }

  // Paste-ready ledger entry — includes dueAt so the invoice lands on the
  // payment radar (`--status`). Prepend it to invoiceLedger in ledger.ts.
  // (The spec also belongs in issued.ts: that makes the PDF downloadable
  // from the client page and is what the Drive archive syncs from.)
  const clientLabel = spec.billTo.name.replace(/"/g, '\\"');
  console.log(
    `\n  Remember: prepend to invoiceLedger in src/content/invoices/ledger.ts:` +
      (args.justice
        ? ` (and set hoursLog invoice in src/content/clients/justice.ts)`
        : ``),
  );
  console.log(
    [
      `  {`,
      `    number: "${spec.number}",`,
      `    client: "${clientLabel}",`,
      `    issuedAt: "${spec.issuedAt}",`,
      `    dueAt: "${spec.dueAt}",`,
      `    total: ${Number(grandTotal(spec).toFixed(2))},`,
      `    currency: "${spec.currency}",`,
      `  },`,
    ].join("\n"),
  );
}

main().catch((err) => fail(String(err?.stack ?? err)));
