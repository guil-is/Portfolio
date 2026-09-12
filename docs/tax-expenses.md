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

## The books: /books

> The overview across everything — balances, tax owed, cash flow, the
> next 90 days — is the **Financial Dashboard** at `/money` (`docs/money.md`). This section is the
> books it draws on.

`/books` is the bookkeeping home and the replacement for the yearly
Google Sheet. One year at a time:

- **Income** comes from the invoice ledger (`src/content/invoices/ledger.ts`),
  read on the server by `src/lib/income.ts`. Cash basis: an invoice
  counts in the year `paidAt` lands (legacy entries without `dueAt`
  count on `issuedAt`; unpaid tracked ones are listed as outstanding).
  German invoices split into net + 19 % MwSt via `taxMode` on the entry.
  USD invoices convert at the rate you set. The page is dynamic and only
  passes ledger data down once the gate's cookie is set (PasswordGate
  writes `<storageKey>=1` on unlock), so invoice figures never sit in a
  static payload.
- **Expenses and tax-relevant rows** live in the books store
  (`src/lib/expenses/books.ts`, localStorage, one list per year). The
  expenses page writes every decided business / tax row there and
  removes rows that turn personal. Rows you add by hand (cash receipts,
  pre-ledger invoices) live there too.
- **Tax estimate** (`src/components/TaxEstimate.tsx`, maths in
  `src/lib/tax.ts`): § 32a tariff (2024–2026), Solidaritätszuschlag with
  Milderungszone, Sonderausgaben from the health/KSK/pension rows plus
  the Pauschbetrag, Finanzamt rows split into this year's prepayments /
  VAT / other, and Finanzamt payments booked in other years that name
  this one. Two columns: so far, and the same run-rate projected to
  31 December (average month × 12). Joint filing (the default — the
  2024 Bescheid is a Zusammenveranlagung) uses the Splittingtarif and
  per-year partner figures: taxable income, withheld Lohnsteuer, and
  wage-replacement benefits (Progressionsvorbehalt). `seedFacts` in
  `src/content/books/seed.ts` prefills a year from its Bescheid; typing
  a value overrides it for that year.
- **Quick add**: the box under the year row takes "Mobbin 119.88 yearly"
  or "Bäckerei 4,50 client breakfast 05.09.2026" — merchant, amount,
  optional note and date — and files it today with the category the
  rules give that merchant. When the same charge later arrives in an
  N26 import (same merchant, same amount, within a week), the bank row
  replaces the manual one and keeps its category and note.
- **Added from chat**: `src/content/books/added.ts` — a work expense
  mentioned in a session ("just got Mobbin") goes in as a row there and
  counts like a manual row. It steps aside automatically once the same
  charge (merchant, amount, within a week) exists as a bank or quick-add
  row.
- **Subscriptions** tab: recurring charges detected from every bank
  row — the books plus the expenses session's rows that never reached
  the books (personal, undecided) — 2+ monthly or 2 yearly charges of
  a merchant, amounts within 15 %; two monthly charges show as
  "confirm". Rows are keyed by the cleaned name (`subscriptionKey()`:
  "ATLASSIAN PTY LTD" and "Atlassian" are one plan) and tagged
  business / personal / undecided from the triage verdict; only
  business plans count in the totals, personal ones show their own
  yearly figure, undecided ones carry a "triage" badge that links to
  the expenses page (a merchant the rules don't know sits undecided
  and would otherwise be invisible — add a rule when that happens).
  Merged with `src/content/books/subscriptions.ts` — the registry for
  plans with a price step (`nextAmount`), a planned end (`endsAt`), or
  ones the books haven't seen twice yet. Bank descriptors are cleaned
  for display (`prettyMerchant()` in `text.ts`: "OPENAI *CHATGPT
  SUBSCR" → "OpenAI ChatGPT"; the raw name stays in the caption).
  Summary strip: per year, next 30 days, could cut, unrated (the last
  two are filters). Search box, category select and a sort menu (next
  renewal, most expensive, most needed, name); chips for monthly,
  yearly, unrated, could cut, not in the books, hidden. Rows group by
  renewal window (this week / this month / next 3 months / later) or
  by rating, with a subtotal per group. Only yearly renewals get a
  colour — monthly ones are always "soon". Every row links to the
  merchant's billing page (registry `url`, then `knownSites` in
  `subscriptions.ts`, then a web search). Per plan you rate Essential
  / Useful / Cut, mark it cancelled (the ⊘ button: dated, out of the
  totals, listed under the Cancelled chip with what it saves, and
  flagged "charged after cancelling" if the bank charges it again;
  the arrow marks it resubscribed) or hide a false detection; all
  three live in localStorage (`books:v1:subs-meta`). A registry entry can carry a default
  `rating`; omit `startedAt` when the day is unknown and the last bank
  charge is used.
- **Colours**: green = money in and credits (revenue, profit, prepaid
  tax), red = money out (expenses, tax due, subscriptions), amber =
  things to watch (tax-relevant rows, VAT still to pay, renewals
  inside 30 days, price steps, plans not seen in the books). Tokens
  `--color-up` / `--color-down` / `--color-warn` in `globals.css`.
- **Encrypted sync**: everything above lives in this browser's
  localStorage; the strip under the year picker keeps it on every
  device. You pick a passphrase once per device. The browser derives
  two keys from it (PBKDF2 310k → HKDF: an AES-GCM key and a bearer
  token, `src/lib/expenses/crypto.ts`), gzips the backup envelope,
  encrypts it, and PUTs the ciphertext to `/api/books-sync`, which
  stores it as the Sanity document `booksSync-main` (schema
  `sanity/schemas/booksSync.ts`, written with the same
  `SANITY_AUTH_TOKEN` the agreement signing uses). Sanity and the route
  only ever see ciphertext; the first PUT claims the vault by storing
  sha256(token), so a wrong passphrase is a 403 and can't overwrite it.
  The engine (`src/lib/expenses/sync.ts`, driven by `SyncBar` on
  /books and the invisible `SyncAgent` on /for/expenses) pushes
  when the local envelope changes (checked every 4 s, 1.5 s quiet),
  pulls on load, on focus and every minute, merges like Restore
  (newest row wins), and retries on a 409 if another device pushed in
  between. A pull that brought changes reloads the page. Device state
  (keys, last revision) is `books:v1:sync`; "Forget on this device"
  clears it, the books stay. Nobody can recover the passphrase — a
  vault you can't open is gone; enter a new passphrase only after
  deleting the `booksSync-main` document in Studio. Local dev has no
  token, so the strip says sync isn't configured; production has it.
- **Backup file**: still there under the strip's "Backup file"
  disclosure. **Back up** downloads `books-backup-<date>.json` (every
  `books:v1:*` and `expenses:*` key except the sync state, envelope in
  `src/lib/expenses/backup.ts`); **Restore** merges one in. The sync
  ships the same envelope — extend `entries`, don't reshape it.
- **Old years**: `seedBooks` in `src/content/books/seed.ts` holds 2024
  and 2025 transcribed from the Google Sheets. Income rows always
  count; seed expense rows hide once an N26 import exists for that year.
- **For the accountant**: copies the year's rows in the Primanota layout
  of the old sheet — Date, Income (EUR), Expense (EUR), Client +
  Reference, USt./VAT %, Country, Invoice nr, Currency, USD to EUR,
  Income (USD), Category. "Only rows not yet sent" + "Mark these as
  sent" keep the batches straight (`sentAt` per row, sent invoice
  numbers per year).

It's an estimate for planning cash, not a return: no church tax, no
home-office share, no depreciation, no 70 % rule on meals, Vorsteuer
ignored on the VAT line.

## Verdicts

| Verdict | Meaning | In the export |
| --- | --- | --- |
| business | Deductible expense, with a category | yes |
| personal | Private spend | only in "everything" mode |
| tax | Not an expense, but the tax advisor wants it (Finanzamt, health insurance, KSK, pension). Finanzamt rows get a bucket from the reference: a VAT word → VAT; a named earlier year or "Nachzahlung" → not counted; "EST"/"Vorauszahlung" → this year's prepayment; a bare tax number paid within 12 days before or 7 after 10 Mar / Jun / Sep / Dec → this year's prepayment (the § 37 quarterly dates); anything else → not counted until you set it in Entries | when "append tax-relevant rows" is on |
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
