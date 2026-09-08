/**
 * Headless tax-expenses classifier. Same parser + rules as /for/expenses,
 * minus the swipe UI — useful for a quick look at an export or for
 * checking the rules after editing them. Full workflow: docs/tax-expenses.md
 *
 * Usage:
 *   npm run expenses -- <export.csv>                summary + the entries it can't decide
 *   npm run expenses -- <export.csv> -o sheet.tsv   also write the business rows as TSV
 *   npm run expenses -- <export.csv> --all          list every row with its verdict
 */

import { readFileSync, writeFileSync } from "node:fs";
import {
  buildItems,
  byCategory,
  CATEGORY_LABELS,
  exportRows,
  formatEur,
  pendingItems,
  parseStatementCsv,
  summarize,
  toTsv,
} from "../src/lib/expenses";

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

type Args = { file?: string; out?: string; all?: boolean };

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || a === "--out") args.out = argv[++i] ?? fail("Missing value after -o");
    else if (a === "--all") args.all = true;
    else if (a.startsWith("-")) fail(`Unknown flag: ${a}`);
    else args.file = a;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.file) fail("Usage: npm run expenses -- <export.csv> [-o sheet.tsv] [--all]");
if (args.file.toLowerCase().endsWith(".pdf")) {
  fail("PDF statements are read in the browser at /for/expenses. Export a CSV for the CLI.");
}

const text = readFileSync(args.file, "utf8");
const parsed = parseStatementCsv(text);
for (const w of parsed.warnings) console.log(`! ${w}`);
if (parsed.transactions.length === 0) fail("No outgoing transactions found.");

const items = buildItems(parsed.transactions, {});
const s = summarize(items);
const pad = (v: string, n: number) => v.length >= n ? v.slice(0, n) : v.padEnd(n);
const money = (n: number) => `€${formatEur(Math.abs(n))}`.padStart(11);

console.log(
  `\n${parsed.format} · ${s.count} outgoing entries (${parsed.incomingCount} incoming ignored)\n`,
);
console.log(`  business  ${money(s.business)}  ${s.businessCount} entries (auto)`);
console.log(`  personal  ${money(s.personal)}`);
console.log(`  tax       ${money(s.tax)}   Finanzamt / insurance, listed separately`);
console.log(`  skipped   ${money(s.skip)}   internal moves`);
console.log(`  to decide ${money(s.pending)}  ${s.pendingCount} entries → swipe them at /for/expenses`);

const cats = byCategory(items);
if (cats.length > 0) {
  console.log("\nBusiness by category (auto):");
  for (const c of cats) {
    console.log(`  ${pad(CATEGORY_LABELS[c.category], 26)} ${money(c.total)}  ×${c.count}`);
  }
}

const rows = args.all ? items : pendingItems(items);
if (rows.length > 0) {
  console.log(args.all ? "\nAll entries:" : "\nCan't decide on its own:");
  for (const i of rows) {
    const v = i.decision ? i.decision.verdict : "?";
    console.log(
      `  ${i.tx.date}  ${money(i.tx.amount)}  ${pad(v, 9)} ${pad(i.tx.partner, 28)} ${i.auto.reason}`,
    );
  }
}

if (args.out) {
  const tsv = toTsv(
    exportRows(items, { scope: "business", includeTax: true, decimalComma: false }),
    { scope: "business", includeTax: true, decimalComma: false },
  );
  writeFileSync(args.out, tsv + "\n");
  console.log(`\n✓ Wrote ${args.out} (business rows only — undecided entries are not in it)`);
}
