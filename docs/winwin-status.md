# WinWin 2026 — project status (repo mirror)

This is the guil.is repo's half of the shared **WinWin brain**. The brain lives
in Notion ("WinWin 2026 — project brain", under "WinWin Brussels"), where this
repo owns the **Status** and **Money** sections. This file mirrors those two
sections in the repo, generated from `src/content/clients/spa.ts` + the invoice
ledger. When SPA state changes here, update this file, then push the same edits
to the Notion Status/Money sections via the Notion MCP. Production and Decisions
live in Notion, owned by the other two contexts.

Notion brain: https://app.notion.com/p/3ac9754238ea8106b9e9c0bf7b0a0132

_Last reconciled: 2026-08-13._

## Status

- **Client:** Sustainable Public Affairs (SPA), Lara Sibbing. Brussels, Belgium.
  VAT BE0642.953.216.
- **Project:** WinWin 2026 — visual identity, invitation, and event website.
  Summit **3 November 2026** in Brussels (was 29 Oct at kickoff, briefly 9 Nov;
  3 Nov is final).
- **Fee:** 11,800 EUR net, fixed, billed by phase. Invoiced net with VAT reverse
  charge (EU cross-border B2B).
- **Timeline:** kickoff 7 July 2026. Design work wraps late August, but speaker
  and programme content may slip into September (per the 29 Jul Phase 3 call), so
  "late August" is no longer a hard promise for full completion.
- **Client page:** guil.is/for/spa — password `winwin`. Tabs: Progress,
  Agreement, and a link to the frozen original Proposal (guil.is/for/spa/proposal).
- **Agreement:** Service Agreement v1-2026-07-02, signed. It incorporates the
  proposal by reference, so the proposal page stays frozen.
- **Phases:** 1 Discovery + explorations — approved. 2 Core identity + invite —
  approved. 3 Full website + assets — **in progress** (kicked off 29 Jul).
  4 All deliverables — upcoming, scope + amount confirmed before it starts.

## Money

| Item | Amount (net) | Status | Invoice |
| --- | --- | --- | --- |
| Deposit (30%) | 1,560 EUR | Paid 2026-07-15 | INV-26015 |
| Phase 1-2 balance | 3,640 EUR | Invoiced, due 2026-08-10 | INV-26016 |
| Phase 3 | 3,800 EUR | In progress, not yet billed | — |
| Phase 4 (estimate) | 2,800 EUR | Not yet billed | — |
| **Total** | **11,800 EUR** | 1,560 paid, 10,240 outstanding | — |

- Phase 1-2 invoice (INV-26016) = 5,200 Phase 1-2 fee less the 1,560 deposit
  credited. Emailed to Lara on 2026-07-27. Lara forwarded it to SPA finance on
  29 Jul; their finance pays **without** sending confirmation, so watch the
  account rather than waiting for a reply. **10 Aug (due date):** still unpaid.
  Checked in with Lara same day — all good her side, most of SPA on holiday this
  week (only Lara in), she's double-checking with their finance colleague. Expect
  a slower turnaround this week. **12 Aug:** Lara pinged finance again.
  **13 Aug:** still not received. Lara also asked for Brussels printer
  recommendations — print production is SPA's cost per the SOW; we supply
  print-ready files and can liaise on specs.
- Phase 3 kicked off 29 Jul and is not yet billed. Decide whether to invoice now
  or hold to a phase-3 milestone.
- Phase 4 (2,800) is a working estimate. Its scope and amount are confirmed
  together before that phase begins, and the total moves with it.

## Pending from the client

- Settle the Phase 1-2 invoice (3,640 EUR), due 2026-08-10.

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
