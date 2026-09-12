# Financial Dashboard: the one-page overview

**guil.is/money** — same gate, password and cookie as `/books`
(`for-expenses-unlocked`). The page to open before a money decision. It
reads what the other pages already keep (books, expenses session,
invoice ledger, subscriptions, sync) and adds one thing of its own: the
balances you type in.

## Two layouts, one set of numbers

- **`/money`** — the site's own design system (editorial: display
  type, hairlines, tokens from `globals.css`).
- **`/money/v2`** — the same page on **shadcn/ui** (Radix primitives,
  copied-in components under `src/components/ui/`): left sidebar, white
  cards on an Apple-grey page, one blue accent, Geist. Theme tokens sit
  at the end of `globals.css`; `card`, `muted` and `accent` are prefixed
  `fd-` so they don't collide with the site's tokens.

Both read `useDashboard()` (`src/components/money/useDashboard.ts`), so
they cannot disagree on a number. Keep one, delete the other; the rest
of this file applies to both.

## What's on it

- **Free to spend** — every asset balance in EUR, minus what the
  Finanzamt still gets this year. Negative means the tax bill is bigger
  than the cash. Until a balance has been entered it shows a prompt
  instead of a number.
- **Tiles** — Cash (incl. the tax set-aside), Owed to you (unpaid
  invoices in the ledger), Tax owed (unpaid Vorauszahlungen + the
  projected year-end bill on top of them + VAT collected and not yet
  paid, with a meter of how much the tax account covers), Monthly burn
  (business expenses + health/KSK/pension, average of the last three
  full months), Runway (free cash ÷ burn; red under 3 months, amber
  under 6).
- **Needs a decision** — overdue or imminent Vorauszahlungen, overdue
  and due-this-week invoices, plans charged again after you cancelled
  them, yearly renewals within 30 days, tax set-aside short of what's
  owed, undecided bank rows, a stale import, stale balances, the
  single-filing warning, sync off. Sorted now → soon → note; each row
  links to where you fix it.
- **Cash flow** — 12 months of money in (invoices by the month the money
  landed, VAT stripped, plus manual income rows) vs business money out.
  Hover a month for the numbers; **Table** shows the same as text.
- **Next 90 days** — Finanzamt instalments, invoice due dates and
  renewals, by month, with a running "cash after all of it". Monthly
  plans roll up into one row per month (click to expand); yearly
  renewals, invoices and tax stay as their own rows. Personal plans are
  listed and tagged.
- **Accounts** — balances by hand. Click a figure to type today's
  number (the old one is selected, so just type); the row says how old
  it is and turns amber after 30 days. Add or remove accounts of any
  kind (cash, tax set-aside, savings, investments, crypto, debt). USD
  converts at the rate from the books settings. Net worth at the foot.

## Where the numbers come from

| Figure | Source |
| --- | --- |
| Balances | `books:v1:accounts` in localStorage (`src/lib/money/accounts.ts`) — carried by the encrypted sync and the backup file like every other `books:v1:*` key |
| Tax owed, projection | `yearPicture()` in `src/lib/expenses/estimate.ts` — the same maths as the estimate tab on `/books` |
| Income by month, open invoices | `incomeByMonth()` and `receivables()` in `src/lib/income.ts`, from the invoice ledger, read server-side and only passed down once the gate cookie is present |
| Subscriptions | `trackSubscriptions()` over the books + the expenses session, with the tab's ratings and cancellations applied |
| Everything else | `src/lib/money/overview.ts` — `kpis`, `cashflowMonths`, `upcomingItems`, `attentionItems`; pure functions, easy to unit-test |

Pages: `src/app/money/page.tsx` → `src/components/money/MoneyDashboard.tsx`
(v1) and `src/app/money/v2/page.tsx` → `src/components/money/v2/FdDashboard.tsx`
(v2); both take their props from `src/app/money/data.ts`. Shared pieces:
`useDashboard`, `CashflowChart` (inline SVG, no chart library),
`Privacy`; v1 also uses `AttentionList`, `UpcomingList`, `AccountsPanel`. Chart colours
are the `--color-viz-in` / `--color-viz-out` tokens in `globals.css`
(validated as a colour-blind-safe pair on both surfaces); status colours
stay `--color-up/down/warn`.

## Keeping it useful

- Enter balances whenever you check the bank — weekly is plenty. The
  page nags after a month.
- Keep the books in step: import the N26 export and swipe the queue.
  Burn, cash flow and the subscriptions are only as complete as the
  books.
- Set `paidAt` (and `taxMode`) on ledger entries when invoices are paid,
  so "Owed to you" and the cash-flow bars are right.
- Turn sync on (cloud icon) on every device you use; the page flags a
  device where it's off.

## Privacy

- Nothing on this page leaves the browser except through the encrypted
  sync (see "Sync" in `docs/tax-expenses.md`). There is no API for
  balances.
- The eye icon (or `H`) hides every amount on this device — bullets,
  not blurred digits, so nothing readable is in the DOM while it's on.
  Remembered per device (`money:v1:hidden`), deliberately not synced.
- `/money` is `noindex`, disallowed in `robots.txt`, and the ledger data
  is only rendered once the gate cookie is present.

## What it can't do

- No bank API. Balances are yours to type; the page shows their age
  instead of pretending to be live.
- Personal spending isn't in the books, so burn is business + health
  only. Personal plans show in the 90-day list, tagged, but not in burn.
- One year at a time for the tax picture (the current year). Older
  years live on `/books`.
