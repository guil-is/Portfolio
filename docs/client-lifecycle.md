# Client lifecycle

The operating protocol for client admin, end to end: first chat → proposal
→ agreement → invoicing → close-out. Claude runs this; the human has the
conversations and makes the calls. Sibling docs: `making-an-invoice.md`
(money mechanics), `adding-a-project.md` (portfolio promotion).

**One rule above all: the client `slug` is the primary key.** Pick it once
at intake (lowercase, short), and use it everywhere: the intake file, the
`/for/<slug>` URL, `registry.ts`, `signable.ts`, the `billToPresets` key,
`clientSlug` on ledger entries, and the `for-<slug>-unlocked` storageKey.
If those ever disagree, that's a bug — fix it.

## Stages

`stage` on the registry entry (`src/content/clients/registry.ts`) tracks
where each engagement is. Leads without a page aren't in the registry yet —
they live as intake files.

| Stage | Meaning | Exit when |
| --- | --- | --- |
| *(lead)* | Intake file only, no page yet | Proposal page ships |
| `proposal` | Proposal live, awaiting response | Client says yes (or walks) |
| `accepted` | Verbal yes; agreement drafted / out for signature | Signature lands |
| `signed` | Agreement signed, work not started | Kickoff |
| `active` | Work in progress (`paused: true` for retainers on hold) | Final delivery |
| `delivered` | Work delivered, final invoice outstanding | Payment lands |
| `closed` | Paid and offboarded — or a proposal that didn't convert | Terminal |

A client with money outstanding is **not** past — `delivered` keeps them on
the dashboard's Current list until `paidAt` is set in the ledger.

## 1 · Lead → intake file

When a new lead lands (from a chat, a claude.ai brief, an email thread —
claude.ai conversations hand off via the block format in
`docs/claude-ai-brief.md`):

1. Pick the slug.
2. Create `src/content/clients/intake/<slug>.ts` exporting a `ClientIntake`
   (type in `src/content/clients/intake.ts`). Fill in everything the
   conversation has produced; leave the rest unset — the point is to see
   what's missing, not to fake completeness.
3. Report the gaps for the next gate:
   `intakeGaps(intake, "proposal")` — and list them for the human to
   collect in the next client conversation. Same trick before the
   agreement (`"agreement"`) and first invoice (`"invoice"`) gates.

The intake file stays for the life of the engagement and is the record of
collected facts. Downstream files (registry, billing preset, proposal
data) derive from it.

## 2 · Intake → proposal

Gate: `intakeGaps(intake, "proposal")` is empty.

1. Draft the proposal as data: `src/content/proposals/<slug>.tsx`, typed
   `Proposal` (`proposals/types.ts` documents both shapes — retainer pitch
   and project quote). Register it in `proposals/index.ts`. The dynamic
   `/for/[slug]` route then handles the gate, `robots: noindex`, and
   `<VisitTracker>` (first-visit email) automatically.
2. Add the registry entry: stage `proposal`, contacts from intake.
3. Give the human a send-ready blurb: URL + password to paste to the
   client. Never send it anywhere yourself without being asked.
4. First visit triggers an email automatically. If nothing after ~5 days,
   the weekly sweep (below) flags it for a nudge.
5. The page's "Accept this proposal" button (`<AcceptProposal>`, wired
   into the Next-step section automatically) emails Guil when the client
   clicks it — acceptance arrives as an event, not just a chat message.

## 3 · Accepted → agreement

The client said yes — via the proposal's Accept button (you'll get the
"proposal accepted" email) or in chat. Gate:
`intakeGaps(intake, "agreement")` is empty; the usual blocker is the exact
legal entity. Do not publish an agreement with a placeholder parties row.

1. Set stage `accepted`.
2. Create `src/content/clients/<slug>.ts` with the `sow: SignableDocument`
   (versioned `"1.0"`, acknowledgments, tldr/breakdown). Model it on the
   closest existing client: `e2c.ts` (fixed-fee project), `spa.ts`
   (phased project with payment milestones), `justice.ts` (retainer +
   hours log).
3. Register the client in `signable.ts` — `tsc` enforces this before
   `<AgreementSignature>` can reference the slug.
4. Build the page — data only, no new component: a thin
   `src/app/for/<slug>/page.tsx` that composes `ClientPageData` from the
   content file and renders the shared `<ClientPage>` inside
   `<PasswordGate storageKey="for-<slug>-unlocked">`, with
   `robots: { index: false, follow: false }` and `<VisitTracker>`.
   `/for/e2c` is the reference implementation. `ClientPage` covers
   stats, pending actions, phase timeline, payment schedule, and the
   signable agreement; only reach for a bespoke component if a client
   genuinely needs something it can't express (like Justice's hours log).
5. If terms include a deposit: issue that invoice now
   (`docs/making-an-invoice.md`), which requires the `"invoice"` gate —
   so add the `billToPresets` entry (from intake billing data) first.
6. Signature arrives as a `Signed: …` email (Sanity record + PDF). On it:
   set stage `signed`, and file the PDF with the year's records.

## 4 · Signed → active

1. Set stage `active` at kickoff.
2. Keep the page truthful as work moves — this is what makes the client
   page worth its password:
   - phase/milestone bumps (`currentPhase`, milestone `status`),
   - retainers: prepend hours-log periods weekly (CLAUDE.md "Hours log
     updates"),
   - `pendingActions` for things you're waiting on from the client
     (check-offs email automatically via `/api/pending-action`).
3. Invoicing during the engagement follows `making-an-invoice.md`,
   always with `clientSlug` on the ledger entry. To give the client a
   download link on their page, register the full spec in
   `invoices/issued.ts` **with the same numbers/dates as the sent PDF**.

## 5 · Delivered → closed

1. On final delivery: set stage `delivered`, issue the final invoice, and
   note the outstanding number in the registry summary.
2. When payment lands: set `paidAt` in the ledger (and the client page's
   own payment tracker / hours log if it has one) — same day, same
   commit. This is the sync point that drifts most; see Invariants.
3. Then offboard — set stage `closed` and:
   - ask for a testimonial while goodwill is peak (testimonials live in
     Sanity — see `migrate-testimonials.ts` era docs / `/studio`),
   - decide whether the work becomes a portfolio case study
     (`docs/adding-a-project.md` — new projects go in Sanity, not code),
   - update the registry summary to read as a completed engagement.
   The page stays live (signed agreements reference it) unless the client
   asks otherwise.

A proposal that dies goes straight to `closed` with a summary noting it
didn't convert — keep the page, it's reusable material.

## The weekly sweep

Run on request ("client sweep" / `/client-sweep`) or whenever touching
client files. Checks, in order:

1. **Money** — `npm run invoice -- --status`. For each overdue invoice,
   draft (don't send) a friendly reminder for the human to forward.
2. **Stage drift** — every registry stage vs reality: `delivered` with a
   paid ledger entry → should be closing; `active` page whose
   `lastUpdated`/phases are stale → update or ask; ledger `paidAt`
   vs client-page payment trackers disagreeing → reconcile.
3. **Pipeline** — proposals with zero visits after ~5 days (proposalVisit
   records in Sanity), agreements out but unsigned → suggest a nudge.
4. **Data holes** — registry entries missing `billingPreset` that are at
   `accepted` or beyond; intake gaps for the next gate of each
   non-closed client.

Output: a short report — what needs the human, what Claude already fixed.

## Invariants (things that must never drift)

- Registry `storageKey` ⇄ the `storageKey` the page passes to
  `<PasswordGate>` — always `for-<slug>-unlocked`.
- `signable.ts` membership ⇄ pages rendering `<AgreementSignature>`
  (enforced by `tsc`).
- Ledger `paidAt` ⇄ client-page payment status (spa `payments`, justice
  `hoursLog[].invoice.paidAt`). Update both in the same commit.
- Ledger `dueAt`/amounts ⇄ `issued.ts` spec ⇄ the PDF that was emailed.
- `billingPreset` on the registry ⇄ a real key in `billToPresets`.
- Every issued invoice: ledger entry (numbering!) + Drive archive.

## File map

| Concern | File |
| --- | --- |
| Master client record (stages, contacts) | `src/content/clients/registry.ts` |
| Intake schema + gate checks | `src/content/clients/intake.ts` |
| Per-lead intake files | `src/content/clients/intake/<slug>.ts` |
| Proposal data | `src/content/proposals/<slug>.tsx` + `index.ts` |
| Client page data (SOW, phases, hours) | `src/content/clients/<slug>.ts` |
| Signing registry | `src/content/clients/signable.ts` |
| Billing presets | `src/content/invoices/config.ts` |
| Invoice ledger (numbering, radar) | `src/content/invoices/ledger.ts` |
| Client-downloadable invoice specs | `src/content/invoices/issued.ts` |
