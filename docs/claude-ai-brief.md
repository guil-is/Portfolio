# The claude.ai → Claude Code handoff

The front half of onboarding happens in claude.ai: the chat about a new
lead, drafting the proposal or brief. The back half happens here in the
repo. This file defines the handoff between them so nothing collected in
the conversation gets lost in a prose paste.

**Setup (once):** paste the block below into the claude.ai Project
instructions for the project where client conversations happen.

**Every handoff:** end the claude.ai conversation with "give me the
handoff block", paste the result into a Claude Code session, and say
`/new-client`. Claude Code validates it against the intake schema
(`src/content/clients/intake.ts`), files it, and reports what's still
missing before the next gate.

---

## Paste into the claude.ai Project instructions

> When we finish discussing a prospective client — or whenever I ask for
> "the handoff block" — output a fenced block exactly in this shape, so I
> can paste it into my portfolio repo's Claude Code session (it maps to
> the `ClientIntake` type there). Use `unknown` for anything we haven't
> established — never guess, and never fill in legal entities, addresses,
> or VAT/tax IDs from your own research: those must come from the client.
>
> ```
> CLIENT INTAKE HANDOFF
> slug: <short-lowercase-key, e.g. "acme">
> name: <working display name>
> source: <where the lead came from>
> contacts:
>   - <name> | <email or unknown> | <role or ->
> engagement:
>   kind: <project | retainer>
>   summary: <one paragraph, what they want>
>   deliverables: <list or unknown>
>   budget: <figure/range with currency, or unknown>
>   deadline: <hard dates, or unknown>
>   startDate: <date or unknown>
> signer: <name + email of who signs, or unknown>
> billing:
>   entityName: <exact legal entity as stated BY THE CLIENT, or unknown>
>   address: <billing address, or unknown>
>   country: <country, or unknown>
>   vatId: <VAT ID as stated by the client, or unknown>
> password: <one memorable lowercase word for their private page>
> notes:
>   - <anything else worth remembering: preferences, politics, risks>
> PROPOSAL DRAFT: <attach or summarize the proposal/brief we drafted>
> ```

---

## What Claude Code does with it

1. Creates `src/content/clients/intake/<slug>.ts` from the block
   (`taxMode` and `currency` are derived from the billing country per the
   rules in `making-an-invoice.md`).
2. Runs `intakeGaps()` for the `"proposal"` gate and reports what to ask
   the client next.
3. Builds the proposal page from the draft (`docs/client-lifecycle.md`
   § "Intake → proposal").

The `unknown`s are the point: they become the checklist of what to
collect, instead of gaps discovered at agreement or invoice time.
