# Making an invoice

One prompt → one PDF. Tell Claude something like:

> "Invoice Justice for the June 1–5 period"
> "Invoice TEDxBerlin €1,500 for the Day 1 aftermovie, due in 14 days"
> "New invoice: Acme Inc (US), 12h of motion design at $120/h"

Claude fills in a spec and runs the CLI. Everything static — issuer block,
bank details, crypto wallet, repeat-client addresses — lives in
`src/content/invoices/config.ts`; edit that file when details change.

## The two shapes

**EU / German client → EUR invoice.** Tax mode `de-19` (19% MwSt) for
German clients, `reverse-charge` for EU business clients outside Germany.
Payment profile `n26-eur` (German IBAN).

**Client outside the EU → USD invoice.** Tax mode `outside-eu` (VAT
exempt, §3a UStG — the note renders automatically). Payment profiles
`wise-usd-local` + `wise-usd-intl` (the same Wise account details a
Wise-generated invoice shows) and optionally `crypto-usdc`. No Wise API
involved — the PDF is generated locally either way.

## CLI

```sh
# From a retainer period in src/content/clients/justice.ts:
npm run invoice -- --justice 2026-05-25            # weekStart of the period
npm run invoice -- --justice 2026-05-25 --issued 2026-05-30 --number INV-26014

# From an ad-hoc spec JSON:
npm run invoice -- path/to/spec.json [-o out.pdf]

# What number comes next in the sequence:
npm run invoice -- --next-number

# Payment radar: outstanding + overdue invoices, most-overdue first:
npm run invoice -- --status
```

## Payment tracking

Each ledger entry carries `dueAt` (payment due) and, once paid, `paidAt`.
`--status` lists every entry with a `dueAt` and no `paidAt`, flags the
overdue ones, and totals what's outstanding per currency. Entries with no
`dueAt` are treated as legacy/untracked and stay off the radar — every
invoice issued through the CLI now includes `dueAt`, so new ones track
automatically.

**When a payment lands:** add `paidAt: "YYYY-MM-DD"` to that ledger entry
(and, for Justice, set `paidAt` in the `hoursLog` period too). It drops off
the radar.

PDFs land in `invoices/` (gitignored). Invoice number defaults to the
next in the ledger sequence; due date defaults to issue date + 7 days.

**Invoices must fit one page.** The layout condenses automatically as
line items grow, but if the CLI still warns about a spill, shorten
descriptions or merge related line items and regenerate. The header
avatar is `public/invoice-avatar.png` (referenced by `logoPath` in
`config.ts`) — overwrite that file to change it.

## Spec JSON

Matches `InvoiceSpec` in `src/lib/invoice.ts`. `billTo` may be a preset
key from `config.ts` (`justice`, `myosin`, `tedxberlin`) or an inline
object. Lines are `qty` × `unitPrice`, or a fixed `amount`.

**Always set the service date to when the work actually happened.** This
is the Leistungsdatum/-zeitraum §14 UStG requires, and it is the easiest
field to get wrong: leaving it out says nothing, and copying the issue
date into it says nothing twice. When the work spanned more than a day —
which it usually did — set `serviceDate` to the start and `serviceEndDate`
to the end, and the invoice prints "Service period · July 8 – August 11,
2026". A single `serviceDate` is right only for genuine same-day work.
The CLI warns when the field is missing or equals the issue date; Justice
retainer invoices derive the period from the hours-log block.

```json
{
  "issuedAt": "2026-06-23",
  "serviceDate": "2026-06-08",
  "serviceEndDate": "2026-06-19",
  "currency": "EUR",
  "taxMode": "de-19",
  "billTo": "tedxberlin",
  "lines": [{ "description": "TedX Berlin Aftermovie", "amount": 1000 }],
  "note": "Optional line rendered above payment details."
}
```

Omitted fields: `number` (auto), `dueAt` (issued + 7d), `paymentProfiles`
(EUR → `n26-eur`; USD → Wise + crypto).

## Archiving (Google Drive)

Issued invoices must be kept for 10 years (GoBD). The archive is the
Google Drive folder `Invoices/Invoices <year>/`. Two things keep it full,
and both are idempotent (an invoice number already in the year folder is
never uploaded twice, whatever the old file was called):

1. **`npm run invoice`** uploads the PDF through the Drive API right after
   rendering, whenever the `GDRIVE_*` credentials below are set. Works on
   the Mac and in any Claude session whose environment has them.
2. **The `archive-invoices` GitHub workflow** re-syncs every spec in
   `src/content/invoices/issued.ts` on each push to `main` that touches
   that file (and on demand from the Actions tab). So from a Claude
   session with no credentials, registering the spec in `issued.ts` and
   pushing is enough: CI renders the same PDF and archives it. The spec
   in `issued.ts` must match the PDF that was emailed, which it has to
   anyway for the client-page download.

`npm run invoice:archive` runs the same sync locally (`-- INV-26020` for
one invoice, `--dry-run` to only render and list).

The old route, `INVOICE_ARCHIVE_DIR` pointed at the Google Drive for
desktop mirror, still works as a fallback on the Mac but is no longer
needed.

### One-time setup (about 10 minutes, once)

1. [console.cloud.google.com](https://console.cloud.google.com): create a
   project (e.g. `guil-invoices`), then **APIs & Services → Library →
   Google Drive API → Enable**.
2. **APIs & Services → OAuth consent screen** (Google Auth Platform):
   External, any app name, your email. Under **Audience**, set the
   publishing status to **In production**. This matters: while the app
   is in "Testing", Google expires refresh tokens after 7 days. The app
   stays unverified, which is fine because you are its only user; the
   consent page shows a warning you click through once.
3. **Credentials → Create credentials → OAuth client ID → Desktop app**.
   Copy the client ID and secret into `.env.local`:
   ```sh
   GDRIVE_CLIENT_ID=….apps.googleusercontent.com
   GDRIVE_CLIENT_SECRET=…
   ```
4. Run `npm run gdrive:auth`. It prints a URL: open it, pick your
   account, "Advanced → Go to the app", allow Drive access. The script
   catches the redirect, verifies the account, and prints a
   `GDRIVE_REFRESH_TOKEN=…` line. Add it to `.env.local`.

   **No local machine (cloud Claude session only)?** Same thing in two
   halves: `npm run gdrive:auth -- --url` prints the consent URL. After
   approving, the browser lands on a `127.0.0.1` address that fails to
   load; that is expected. Copy that address and run
   `npm run gdrive:auth -- --code '<address>'` to get the token line.
5. Add the same three values as **GitHub repository secrets**
   (`Settings → Secrets and variables → Actions`): `GDRIVE_CLIENT_ID`,
   `GDRIVE_CLIENT_SECRET`, `GDRIVE_REFRESH_TOKEN`. Then run the
   "Invoices — Archive to Google Drive" workflow once by hand to
   backfill anything missing from `issued.ts`.

The folder id of the `Invoices` root lives in `config.ts`
(`driveArchive.rootFolderId`); override with `GDRIVE_INVOICES_FOLDER_ID`
if it ever moves. If the token is ever revoked (the CLI will say
`invalid_grant`), rerun step 4.

## Pre-reform invoices to review

Three 2026 invoices predate the `INV-260XX` scheme (ThriveCoin — Daniel
Jacobs, daniel@thrivecoin.com). They're recorded in the ledger under their
original date-based numbers and the PDFs live in the Drive archive. Keep
those PDFs **unaltered** — a validly issued invoice stays valid regardless
of format, and editing an issued tax document is worse than leaving a known
quirk. All three are §3a place-of-supply (US client, no German VAT).

**Checklist to work through at the office:**

- [ ] **Duplicate invoice number 260309.** Two ThriveCoin invoices carry it:
  Feb 1–7 ($1,750, issued 09.03.2026) and March ($945, issued 30.03.2026).
  §14 UStG requires unique sequential numbers. Decide with the accountant
  whether to issue a documented correction / corrected copy for records.
- [ ] **March invoice's VAT note is wrong.** The PDF prints "§19 UStG" — a
  mistake; it should be §3a like every other 2026 invoice. Confirm whether a
  corrected copy is needed for your records.

| # | Number | Client | Date | Amount | Note on PDF |
| --- | --- | --- | --- | --- | --- |
| Jan | 260131 | ThriveCoin | 31.01.2026 | $7,000 | §3a Abs. 2 ✓ |
| Feb | 260309 | ThriveCoin | 09.03.2026 | $1,750 | (no VAT note) |
| Mar | 260309 | ThriveCoin | 30.03.2026 | $945 | §19 ✗ (should be §3a) |

## After issuing — bookkeeping (Claude: do this in the same session)

1. Register the spec in `src/content/invoices/issued.ts` — this makes
   the PDF downloadable from the client page and is what the Drive
   archive syncs from.
2. Append an entry to `src/content/invoices/ledger.ts` — this drives
   `--next-number`, so skipping it breaks the sequence.
3. Archive: if the CLI printed `archived Drive → …`, done. Otherwise push
   to `main`; the archive-invoices workflow uploads it. Do not paste PDFs
   through the Drive connector; that path stalls.
4. Create the payment follow-up in Google Calendar (via the Calendar
   connector): an all-day event on the day after `dueAt`, titled
   `💸 Follow up: <client> <number> (<total>)`, marked Free. The
   description names who to nudge and reminds to set `paidAt` when paid.
   Pass all-day dates as UTC midnight or the date shifts back a day.
5. Justice retainer invoices only: also set `invoice: { number, issuedAt }`
   on the period in `src/content/clients/justice.ts` and bump its
   `lastUpdated` (see CLAUDE.md "Hours log updates").
6. When payment lands later: set `paidAt` in both places and delete or
   tick off the follow-up event.
