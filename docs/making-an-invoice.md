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
```

PDFs land in `invoices/` (gitignored). Invoice number defaults to the
next in the ledger sequence; due date defaults to issue date + 7 days.

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

## After issuing — bookkeeping (Claude: do this in the same session)

1. Append an entry to `src/content/invoices/ledger.ts` — this drives
   `--next-number`, so skipping it breaks the sequence.
2. Justice retainer invoices only: also set `invoice: { number, issuedAt }`
   on the period in `src/content/clients/justice.ts` and bump its
   `lastUpdated` (see CLAUDE.md "Hours log updates").
3. When payment lands later: set `paidAt` in both places.
