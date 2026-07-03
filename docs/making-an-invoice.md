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

```json
{
  "issuedAt": "2026-06-23",
  "serviceDate": "2026-06-19",
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

Issued invoices must be kept for 10 years (GoBD). The archive is a
Google Drive folder (`Invoices/Invoices <year>/`) that
[Google Drive for desktop](https://www.google.com/drive/download/) mirrors
to a local path, so saving a file there syncs it to Drive automatically —
no upload step.

**One-time setup on the Mac:**

1. Install Google Drive for desktop and sign in. It creates a folder like
   `~/Library/CloudStorage/GoogleDrive-<you>@gmail.com/My Drive`.
2. Find the `Invoices` folder inside it (it already exists in Drive).
3. Add the path to your shell profile (`~/.zshrc`):
   ```sh
   export INVOICE_ARCHIVE_DIR="$HOME/Library/CloudStorage/GoogleDrive-you@gmail.com/My Drive/Invoices"
   ```
   Then `source ~/.zshrc`.

With that set, every `npm run invoice` run drops a copy into
`Invoices/Invoices <year>/<number> <client>.pdf`, which Drive syncs. The
env var is read at runtime only — nothing is committed, and if it's unset
or the path is unreachable the invoice still saves to `invoices/` and the
CLI just prints a hint.

When issuing from a Claude session (not your Mac), Claude uploads the PDF
to the same Drive folder via the Drive connector instead.

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

1. Confirm the PDF is archived to Drive (`Invoices/Invoices <year>/`) —
   the CLI does this when `INVOICE_ARCHIVE_DIR` is set; from a Claude
   session, upload it via the Drive connector.
2. Append an entry to `src/content/invoices/ledger.ts` — this drives
   `--next-number`, so skipping it breaks the sequence.
3. Justice retainer invoices only: also set `invoice: { number, issuedAt }`
   on the period in `src/content/clients/justice.ts` and bump its
   `lastUpdated` (see CLAUDE.md "Hours log updates").
4. When payment lands later: set `paidAt` in both places.
