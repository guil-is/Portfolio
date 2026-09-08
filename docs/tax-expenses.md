# Tax expenses from the N26 export

One page turns a year of N26 payments into the expenses list for the
Google Sheets tax doc: **guil.is/for/expenses** (password in
`src/app/for/expenses/page.tsx`, `for-expenses-unlocked` storage key).
Everything runs in the browser. The bank file is parsed locally, kept in
this browser's localStorage, and never uploaded anywhere.

## Workflow

1. **Export.** N26 web app → Transactions → Download → CSV, date range
   = the tax year. A PDF statement also works (pdf.js reads it client
   side), but the CSV has cleaner merchant and reference columns — prefer
   it. Several files at once are fine; duplicates are dropped.
2. **Drop it on the page.** Only outgoing money survives. Each entry runs
   through the rules in `src/lib/expenses/rules.ts`, one by one:
   - confident matches (Adobe, Figma, REWE, Netflix, Finanzamt, …) are
     decided on the spot — `AUTO_THRESHOLD` (0.85) in `types.ts`;
   - N26 Spaces moves and transfers to yourself are skipped;
   - everything else lands in the swipe queue with a one-line "why I'm
     asking".
3. **Swipe.** "Order" above the deck: oldest first, biggest amounts
   first, or by merchant (most repeated first — one swipe clears the
   whole merchant). The banner under it sweeps every pending card under
   €5/10/20/50 to personal in one click (undoable). Right / → = business,
   left / ← = personal, Shift + arrow or Shift + click = this one only
   (no memory, no siblings), ↑ or tap = the
   card's back (category, note, raw fields, other payments to the same
   merchant, plus "tax-relevant" and "skip" buttons), ↓ = later, U = undo.
   A decision applies to every other pending payment from the same
   merchant and is remembered for next year (switch that off on the
   card's back for one-offs). Confetti when the queue is empty.
4. **Check.** "All entries" lists everything with its verdict, category
   and who decided it (auto / you / memory). Table edits change one row
   only; swipes are what teach the tool.
5. **Export.** Copy for Google Sheets puts a TSV on the clipboard —
   paste into the sheet and it lands as columns: Date, Vendor,
   Description, Amount (EUR), Category, Note. Toggles: business rows
   only vs. everything with a Verdict column; append the tax-relevant
   rows (Finanzamt, Krankenkasse, KSK, pension — for the advisor, not
   the expense total); decimal comma for a German-locale sheet. Download
   CSV is the fallback.

Close the tab mid-way and the page offers to resume the same file with
every decision intact.

## Tax tab: what the Finanzamt will want

The **Tax** tab joins the two halves of the money picture:

- **Income** comes from the invoice ledger (`src/content/invoices/ledger.ts`),
  aggregated on the server by `src/lib/income.ts` so the ledger never
  ships to the browser. Cash basis: an invoice counts in the year
  `paidAt` lands (legacy entries without `dueAt` count on `issuedAt`;
  unpaid tracked ones show as "still unpaid, not counted"). German
  invoices are split into net + 19 % MwSt via `taxMode` on the entry
  (`entryTaxMode()` infers it from the note when unset — set it on new
  entries). USD invoices convert at the rate you type in.
- **Expenses** come from this page: business rows, the health / KSK /
  pension rows as Sonderausgaben, Finanzamt rows split by their
  reference into income-tax prepayments for the year, Umsatzsteuer
  payments, and "other" (a Nachzahlung or anything naming an earlier
  year, e.g. "EST2024" paid in February 2026 — listed, not counted).
  Every tax-relevant row is shown under the estimate with its bucket;
  change a bucket via the dropdown next to the row in All entries.
- `src/lib/tax.ts` applies the § 32a EStG tariff (2025 and 2026 encoded,
  add a year when published) and the Solidaritätszuschlag with its
  Milderungszone, then subtracts what's prepaid.

It's an estimate for planning cash, not a return: single assessment, no
church tax, no home-office share, no depreciation, no 70 % rule on
meals, and Vorsteuer is ignored on the VAT line.

## Verdicts

| Verdict | Meaning | In the export |
| --- | --- | --- |
| business | Deductible expense, with a category | yes |
| personal | Private spend | only in "everything" mode |
| tax | Not an expense, but the tax advisor wants it (Finanzamt, health insurance, KSK, pension) | when "append tax-relevant rows" is on |
| skip | Internal move, reversal | never |

Categories (`CATEGORY_LABELS` in `types.ts`): software, fonts/plugins/
stock, hardware, print & production, office & coworking, phone & internet,
travel, meals, education & events, domains & hosting, marketing, bank fees,
insurance, professional services, other.

## Tuning the rules

`src/lib/expenses/rules.ts` is an ordered list — first match wins, so
brand rules sit above keyword rules and the ambiguous marketplaces
(Amazon, PayPal, Google, Apple) come last. Each rule carries a verdict,
category, confidence and the sentence shown on the card. PayPal / Google /
Apple / Stripe are `passthrough`: if the payment reference names a
merchant with its own rule, that rule wins ("MyFonts, billed via PayPal").

Apple, Google Play, PayPal and Klarna hide the real merchant, so for
them the memory key is merchant + amount: decide one €9.99 Apple charge
and every other €9.99 Apple charge follows, while the €5.49 ones stay
separate. To see which app is behind an amount: iPhone → Settings → your
name → Media & Purchases → Purchase History, or search your mail for
"Your receipt from Apple".

Patterns run on folded text (lowercase, no diacritics). Keep `\b` word
boundaries on short names. After editing, sanity-check with the CLI:

```sh
npm run expenses -- path/to/n26-export.csv          # summary + what it can't decide
npm run expenses -- path/to/n26-export.csv --all    # every row with its verdict
npm run expenses -- path/to/n26-export.csv -o sheet.tsv
```

The CLI uses the same parser and rules without the memory, so it shows
what a first-time visitor to the page would see.

## What it can't do

- Cash: withdrawals are marked personal. Receipts paid in cash go into
  the sheet by hand.
- Home-office share, Bewirtung at 70 %, depreciation over several years:
  the tool lists the payment at full amount; the advisor applies the
  rule. Use the note field ("client dinner with Justice") so the row
  explains itself.
- Memory is per browser (localStorage). Clearing site data forgets what
  you taught it; "Forget merchants" on the page does the same on purpose.
