---
name: client-sweep
description: Run the weekly client admin sweep — payment radar, stage drift, stale proposals, and missing data across the client registry, ledger, and client pages. Use when the user asks for a client status check, sweep, or what needs chasing.
---

# Client sweep

Run the checks in `docs/client-lifecycle.md` § "The weekly sweep", in
order:

1. **Money**: `npm run invoice -- --status`. For each overdue invoice,
   draft a short, friendly reminder email (don't send it) addressed to
   the client contact from the registry.
2. **Stage drift**: compare every `registry.ts` entry against the ledger
   (`clientSlug`, `paidAt`) and the client page's own payment/phase
   trackers. Fix mechanical drift directly (e.g. stage `delivered` but
   invoice paid → propose closing); flag anything that needs a human
   decision.
3. **Pipeline**: proposals/agreements out with no movement — check
   `proposalVisit` records in Sanity if credentials are available,
   otherwise flag by age.
4. **Data holes**: clients at `accepted`+ without a `billingPreset`;
   intake gaps for each non-closed client's next gate.

End with a compact report: **Needs Guil** (decisions, sends) vs **Fixed**
(what you already corrected in the repo). Commit fixes per the workflow
in CLAUDE.md.
