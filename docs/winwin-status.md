# WinWin 2026 — project status

Single source of truth for where the WinWin 2026 engagement stands. This is
generated from the repo (`src/content/clients/spa.ts`, the invoice ledger, and
the client page), which is where the live state lives. When something material
changes, refresh this file, then paste it into the claude.ai "freelance designer
OS" project so both memories match. The claude.ai project holds the static
context (brief, proposal, visual direction, discovery); this holds current state.

_Last reconciled: 2026-07-27._

## The engagement

- **Client:** Sustainable Public Affairs (SPA), Lara Sibbing. Brussels, Belgium.
  VAT BE0642.953.216.
- **Project:** WinWin 2026 — visual identity, invitation, and event website for
  the Brussels summit (29 October 2026).
- **Fee:** 11,800 EUR net, fixed, billed by phase. Invoiced net with VAT reverse
  charge (EU cross-border B2B).
- **Timeline:** kickoff 7 July 2026, wrapping late August. Four phases.
- **Client page:** guil.is/for/spa — password `winwin`. Tabs: Progress,
  Agreement, and a link to the frozen original Proposal (guil.is/for/spa/proposal).
- **Agreement:** Service Agreement v1-2026-07-02, signed. It incorporates the
  proposal by reference, so the proposal page stays frozen.

## Phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 (Week 1) | Discovery + explorations | Approved |
| 2 (Week 2) | Core identity + invite (incl. save-the-date) | Approved |
| 3 (Weeks 3-4) | Full website + assets | **In progress** |
| 4 (Weeks 5-6) | All deliverables (extended assets, print, merch) | Upcoming, scope + amount confirmed before it starts |

## Money

| Item | Amount (net) | Status | Invoice |
| --- | --- | --- | --- |
| Deposit (30%) | 1,560 EUR | Paid 2026-07-15 | INV-26015 |
| Phase 1-2 balance | 3,640 EUR | Invoiced, due 2026-08-10 | INV-26016 |
| Phase 3 | 3,800 EUR | Not yet billed | — |
| Phase 4 (estimate) | 2,800 EUR | Not yet billed | — |
| **Total** | **11,800 EUR** | 1,560 paid, 10,240 outstanding | — |

- Phase 1-2 invoice (INV-26016) = 5,200 Phase 1-2 fee less the 1,560 deposit
  credited. Emailed to Lara on 2026-07-27.
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

## How to keep the two memories in sync

1. The repo is the source of truth. Update `spa.ts` (and the ledger) as the
   project moves; the client page derives from it automatically.
2. When a phase completes, an invoice goes out, or a payment lands, refresh this
   file to match.
3. Paste this file into the claude.ai project so its knowledge reflects reality.
   Don't edit project state in claude.ai and expect it to flow back — that
   direction drifts. claude.ai is for thinking and content; the repo is the record.
