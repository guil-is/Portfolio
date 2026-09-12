# Financial Dashboard: the one-page overview

**guil.is/money** — same gate, password and cookie as `/books`
(`for-expenses-unlocked`). The page to open before a money decision. It
reads what the other pages already keep (books, expenses session,
invoice ledger, subscriptions, sync) and adds one thing of its own: the
balances you type in.

## The app

Three pages share one frame, `src/components/finance/FinanceShell.tsx`:
Overview (`/money`), Books (`/books`, with Tax estimate, Entries, Bank
import, Subscriptions and For the accountant as tabs, also listed under
Books in the sidebar) and Clients (`/for/clients`). Same sidebar, same
header, one sync instance, privacy mode, toast. Whichever password let
you in, the shell opens the other pages' gates for the tab.

## The layout

Built on **shadcn/ui** (Radix primitives via the `radix-ui` package;
components copied into `src/components/ui/`, see the README there): a
left sidebar, white cards on an Apple-grey page, one blue accent,
Geist. Patterns borrowed from the finance apps on Mobbin (Monarch,
Copilot, Origin, Quicken, Wise): net worth as a trend with a change
since last month, a summary strip under the cash flow chart, spending
by category as single-hue bars, recurring items grouped by month, and
"updated x ago" on every balance with a refresh-all action.

## What's on it

- **Quick actions** — Update balances (every account becomes a field,
  Enter hops to the next, Save stamps them all as checked today), Add
  expense (the quick-add box on /books), Import bank export.
- **Free to spend** — every asset balance in EUR, minus what the
  Finanzamt still gets this year. Negative means the tax bill is bigger
  than the cash. Until a balance has been entered it shows a prompt
  instead of a number.
- **Tiles** — Net worth with a ninety-day trend and the change over the
  last thirty days (one snapshot a day, `books:v1:net-worth-history`),
  Tax set-aside with a meter of how much it covers, Monthly burn
  (business expenses + health/KSK/pension, average of the last three
  full months), Runway (free cash ÷ burn; red under 3 months, amber
  under 6).
- **Needs a decision** — overdue or imminent Vorauszahlungen, overdue
  and due-this-week invoices, plans charged again after you cancelled
  them, yearly renewals within 30 days, tax set-aside short of what's
  owed, undecided bank rows, a stale import, stale balances, the
  single-filing warning, sync off. Sorted now → soon → note; each row
  links to where you fix it. Anything below "now" can be snoozed for a
  week (the × on hover; `books:v1:money-snoozed`, so it follows the
  sync); "n snoozed" in the card header brings them back.
- **Cash flow** — 12 months of money in (invoices by the month the money
  landed, VAT stripped, plus manual income rows) vs business money out.
  6M / 12M / YTD; a strip with money in, business out, net and the
  average per month; hover a month for the numbers; **Table** shows the
  same as text.
- **Where the money goes** — business expenses by category over the
  last three full months (the burn window), biggest first, the tail
  folded into "Everything else".
- **Next 90 days** — a next-30-days strip (in, out, net), then Finanzamt
  instalments, invoice due dates and renewals, by month, with a running "cash after all of it". Monthly
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

Page: `src/app/money/page.tsx` (props from `src/app/money/data.ts`) →
`src/components/money/FinancialDashboard.tsx` (layout and interaction
only) over `useDashboard.ts` (every number), `CashflowChart` (inline SVG,
no chart library) and `Privacy`. History and snoozes:
`src/lib/money/history.ts`, `src/lib/money/snooze.ts`. Chart colours
are the `--color-viz-in` / `--color-viz-out` tokens in `globals.css`
(validated as a colour-blind-safe pair on both surfaces); status colours
stay `--color-up/down/warn`.

## Keeping it useful

- Hit "Update balances" whenever you check the bank — weekly is plenty.
  The page nags after a month, and the net worth trend only grows
  from those updates.
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
