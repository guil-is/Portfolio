/**
 * Invoice maker CLI. Full workflow doc: docs/making-an-invoice.md
 *
 * Usage:
 *   npm run invoice -- <spec.json> [-o out.pdf]
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
import {
  paymentProfiles,
  billToPresets,
} from "../src/content/invoices/config";
import { nextInvoiceNumber } from "../src/content/invoices/ledger";
import {
  justice,
  periodTotal,
  type HoursPeriod,
} from "../src/content/clients/justice";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
    else if (a.startsWith("-")) fail(`Unknown flag: ${a}`);
    else args.specPath = a;
  }
  return args;
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

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.nextNumber) {
    console.log(nextInvoiceNumber());
    return;
  }

  let spec: InvoiceSpec;
  if (args.justice) spec = specFromJustice(args);
  else if (args.specPath) spec = specFromFile(args);
  else
    fail(
      "Pass a spec JSON path, --justice <weekStart>, or --next-number. See docs/making-an-invoice.md",
    );

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
  if (pages > 1) {
    console.warn(
      `⚠ Invoice spilled to ${pages} pages — invoices should be ONE page.` +
        ` Shorten descriptions or merge related line items, then regenerate.`,
    );
  }
  console.log(
    `  ${spec.billTo.name} · ${formatMoney(grandTotal(spec), spec.currency)} · due ${spec.dueAt}`,
  );
  console.log(
    `  Remember: append to src/content/invoices/ledger.ts` +
      (args.justice
        ? ` and set hoursLog invoice in src/content/clients/justice.ts`
        : ``),
  );
}

main().catch((err) => fail(String(err?.stack ?? err)));
