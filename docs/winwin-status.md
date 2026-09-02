# WinWin 2026 — project status (repo mirror)

This is the guil.is repo's half of the shared **WinWin brain**. The brain lives
in Notion ("WinWin 2026 — project brain", under "WinWin Brussels"), where this
repo owns the **Status** and **Money** sections. This file mirrors those two
sections in the repo, generated from `src/content/clients/spa.ts` + the invoice
ledger. When SPA state changes here, update this file, then push the same edits
to the Notion Status/Money sections via the Notion MCP. Production and Decisions
live in Notion, owned by the other two contexts.

Notion brain: https://app.notion.com/p/3ac9754238ea8106b9e9c0bf7b0a0132

_Last reconciled: 2026-09-02._

## Status

- **Client:** Sustainable Public Affairs (SPA), Lara Sibbing. Brussels, Belgium.
  VAT BE0642.953.216.
- **Project:** WinWin 2026 — visual identity, invitation, and event website.
  Summit **3 November 2026** in Brussels (was 29 Oct at kickoff, briefly 9 Nov;
  3 Nov is final).
- **Fee:** 11,800 EUR net, fixed, billed by phase. Invoiced net with VAT reverse
  charge (EU cross-border B2B).
- **Timeline:** kickoff 7 July 2026. Phases 1-3 done by 2 Sep. Phase 4 runs
  September-October against the product list from the 1 Sep call, with
  speaker/programme content landing late by design. Client page now shows
  "Before Nov 3" as the target instead of "Late August".
- **Client page:** guil.is/for/spa — password `winwin`. Tabs: Progress,
  Agreement, and a link to the frozen original Proposal (guil.is/for/spa/proposal).
- **Agreement:** Service Agreement v1-2026-07-02, signed. It incorporates the
  proposal by reference, so the proposal page stays frozen.
- **Phases:** 1 Discovery + explorations — approved. 2 Core identity + invite —
  approved. 3 Full website + assets — **delivered 2 Sep** (kicked off 29 Jul;
  site live, partner logos, VDL photo, doc renderer, AV colour spec). 4 All
  deliverables — **next up**: the 1 Sep product list is the scope trigger;
  quote scope + amount before work starts (likely above the 2,800 estimate).

## Money

| Item | Amount (net) | Status | Invoice |
| --- | --- | --- | --- |
| Deposit (30%) | 1,560 EUR | Paid 2026-07-15 | INV-26015 |
| Phase 1-2 balance | 3,640 EUR | Paid 2026-08-17 | INV-26016 |
| Phase 3 | 3,800 EUR | Invoiced 2026-09-02, due 2026-09-16 | INV-26020 |
| Phase 4 (estimate) | 2,800 EUR | Not yet billed, quote pending | — |
| **Total** | **11,800 EUR** | 5,200 paid, 6,600 outstanding | — |

- Phase 1-2 invoice (INV-26016) = 5,200 Phase 1-2 fee less the 1,560 deposit
  credited. Emailed 27 Jul, due 10 Aug, **paid 17 Aug** (a week late, after
  three pings while SPA was on holiday). Lesson for next time: SPA finance pays
  without confirmation, so watch the account, and expect ~3 weeks from send.
- Phase 3 invoice (INV-26020), 3,800 EUR, issued 2026-09-02 as Phase 3 wraps
  and Phase 4 scoping starts. Service period 29 Jul – 2 Sep. Due 2026-09-16
  (14 days per the SOW). Downloadable from the client page; PDF archived to
  Drive (Invoices 2026) via the new archive sync, same day. Still to do:
  email it to Lara.
- Phase 4 (2,800) is a working estimate. The consolidated product list from the
  1 Sep call is the scope trigger; quote scope + amount before work starts, and
  the total moves with it. Watch scope: pages system + SoMe kit + stickers +
  signage + PPT is likely above 2,800. September Phase 3 leftovers (site pages,
  reminder emails) stay under Phase 3, already billed.

## Pending from the client

- Settle the Phase 3 invoice (3,800 EUR), due 2026-09-16.
- Confirm Phase 4 scope + amount once the quote goes out.

## Where to find things

- **Live state / client page:** `src/content/clients/spa.ts`.
- **Original proposal (frozen):** `src/app/for/spa/proposal/` → guil.is/for/spa/proposal.
- **Invoices:** specs in `src/content/invoices/issued.ts`, ledger in
  `src/content/invoices/ledger.ts`, bill-to in `src/content/invoices/config.ts`.
- **Brief + discovery notes:** `docs/spa-brief-notes.md`.
- **Walkthrough script:** `docs/spa-loom-script.md`.

## How this stays in sync

1. The repo is the source of truth for Status + Money. Update `spa.ts` (and the
   ledger) as the project moves; the client page derives from it automatically.
2. When a phase completes, an invoice goes out, or a payment lands, refresh this
   file, then apply the same edits to the Notion brain's Status/Money sections
   (Notion MCP: fetch, then update_content) and bump "Last reconciled".
3. Edit ONLY the Status and Money sections in Notion. Production and Decisions
   belong to the other two contexts. Note cross-owner facts in your own section
   instead of editing theirs.
