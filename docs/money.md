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
header, one sync instance, privacy mode, theme, keyboard shortcuts,
toast. Whichever password let you in, the shell opens the other pages'
gates for the tab.

- **Theme** lives in the sidebar (Light / Dark / Auto). Auto is the
  site's rule (dark before 7 and after 19); Light or Dark sticks.
- **Shortcuts** — `1` `2` `3` switch pages, `H` hides amounts, `U`
  starts the balance update, `E` opens Expecting money, `?` lists them.
  They don't fire inside a field.
- **Sync on a new device** — while the first pull runs the page says
  "Checking the vault"; when a pull brings newer books it shows
  "Restoring your books" and reloads, instead of flashing empty numbers.
- Below `sm` the header keeps one primary action and folds the rest into
  a menu; Expecting money opens as a dialog there.
- Destructive actions (remove an account, forget the passphrase, drop a
  file, forget merchants) ask in the app's own dialog
  (`src/components/finance/Confirm.tsx`), never `window.confirm`.
- A skip link ("Skip to content") is the first tab stop; the cash flow
  chart is one tab stop and the arrow keys read the months.

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

- **Getting started** — a checklist card (enter balances, import an N26
  export, turn on sync) that shows on a fresh device and disappears
  once all three are done. Until balances exist the free-cash figure
  and "cash after all of it" show a dash, not a zero.
- **Quick actions** — Update balances (every account becomes a field,
  Enter hops to the next, Save stamps them all as checked today), Add
  expense (the quick-add box on /books), Import bank export.
- **Expecting money** — money on its way that isn't an invoice: an
  insurance claim, a refund, a deposit coming back, a tax refund, money
  you lent. Kind, from whom, what, amount, filed on, expected by (the
  default is a typical wait for that kind), reference. It counts in
  "Owed to you", sits in the 90-day list with an "expected" badge, and
  nags after three weeks of silence or once the expected date passes.
  Close it from the list: ✓ received, ✕ refused. Stored in
  `books:v1:expected`, so it follows the sync.
- **Free to spend** — every asset balance in EUR, minus what the
  Finanzamt still gets this year. Negative means the tax bill is bigger
  than the cash. Until a balance has been entered it shows a prompt
  instead of a number.
- **Tiles** — Net worth with a ninety-day trend and the change over the
  last thirty days (one snapshot a day, `books:v1:net-worth-history`),
  Tax set-aside with a meter of how much it covers, Monthly burn
  (business expenses + health/KSK/pension, average of the last three
  full months), Runway (free cash ÷ burn against a target you set —
  "goal n mo", default six months, `books:v1:money-prefs`; red under 3
  months, amber under the target).
- **Needs a decision** — overdue or imminent Vorauszahlungen, overdue
  and due-this-week invoices, plans charged again after you cancelled
  them, yearly renewals within 30 days, tax set-aside short of what's
  owed, undecided bank rows, a stale import, stale balances, the
  single-filing warning, sync off. Several overdue Vorauszahlungen are
  one row (the 90-day list carries them one by one). Sorted now → soon
  → note; each row links to where you fix it. Anything below "now" can be snoozed for a
  week (the × on hover; `books:v1:money-snoozed`, so it follows the
  sync); "n snoozed" in the card header brings them back.
- **Cash flow** — 12 months of money in (invoices by the month the money
  landed, VAT stripped, plus manual income rows) vs business money out.
  6M / 12M / YTD; a strip with money in, business out, net and the
  average per month; hover a month for the numbers; **Table** shows the
  same as text. The month in progress is drawn lighter and marked "so
  far" so a half month doesn't read as a bad one.
- **Where the money goes** — business expenses by category over the
  last three full months (the burn window), biggest first, the tail
  folded into "Everything else". Underneath, the bank rows you swiped
  "personal" over the same months, summed — the only place that money
  adds up, since it never enters the books.
- **Next 90 days** — a next-30-days strip (in, out, net), then anything
  already past its date under **Overdue** at the top, then Finanzamt
  instalments, invoice due dates and renewals by month, with a running
  "cash after all of it". Monthly
  plans roll up into one row per month (click to expand); yearly
  renewals, invoices and tax stay as their own rows. Personal plans are
  listed and tagged.
- **Accounts** — balances by hand. Click a figure to type today's
  number (the old one is selected, so just type); the row says how old
  it is and turns amber after 30 days. Add or remove accounts of any
  kind (cash, tax set-aside, savings, investments, crypto, debt). USD
  converts at the rate from the books settings — typed by hand, or the
  ECB reference rate fetched on the Tax estimate tab ("Use the ECB
  rate", via Frankfurter; the request carries no data of yours and
  refreshes once a day while it's on). Net worth at the foot.

## Books and Clients in the same shell

- **Entries** are grouped by month, newest first, each month with its
  in/out totals; the current and previous month start open, older ones
  fold up ("Expand every month" opens them all). A row shows its
  category and VAT as text; the pencil turns it into a small form
  (category, VAT on the receipt, note). N26 verdicts are still set on
  the Bank import tab.
- **Clients** shows owed / overdue / billed this year / active clients,
  a stage badge on every card with what each client was billed this
  year and what's open, and the whole invoice ledger with a status per
  row (paid on, due in, overdue, untracked) filtered Open / this year /
  All. USD converts at the books rate.

## Where the numbers come from

| Figure | Source |
| --- | --- |
| Balances | `books:v1:accounts` in localStorage (`src/lib/money/accounts.ts`) — carried by the encrypted sync and the backup file like every other `books:v1:*` key |
| Tax owed, projection | `yearPicture()` in `src/lib/expenses/estimate.ts` — the same maths as the estimate tab on `/books` |
| Expected money | `src/lib/money/expected.ts`, entered on the page, closed by hand |
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
  It covers every page in the shell: Books (entries, estimate,
  subscriptions, the accountant preview) and Clients too, and figures
  inside sentences ("Logos owes €500") are masked as well
  (`useMoney()` in `src/components/money/Privacy.tsx`: `eur()`,
  `usd()`, `mask()`). Remembered per device (`money:v1:hidden`),
  deliberately not synced.
- `/money` is `noindex`, disallowed in `robots.txt`, and the ledger data
  is only rendered once the gate cookie is present.

## What it can't do

- No bank API. Balances are yours to type; the page shows their age
  instead of pretending to be live.
- Personal spending isn't in the books, so burn is business + health
  only. Personal plans show in the 90-day list, tagged, and the personal
  total sits under "Where the money goes", but neither is in burn.
- One year at a time for the tax picture (the current year). Older
  years live on `/books`.
