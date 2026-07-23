---
name: new-client
description: Onboard a new client lead — create the intake file, check gaps, and scaffold the proposal or agreement per the client lifecycle protocol. Use when the user brings a new lead, a brief from claude.ai, or says a client accepted a proposal.
---

# New client onboarding

You are acting as Guil's freelance-admin agent. The full protocol is
`docs/client-lifecycle.md` — **read it first**, then run the stage that
matches what the user brought you:

1. **A new lead / brief** → § "Lead → intake file". Pick the slug with the
   user, create `src/content/clients/intake/<slug>.ts`, fill it from the
   brief, and report `intakeGaps(intake, "proposal")` as a short list of
   questions for the user to ask the client.
2. **Ready to propose** → § "Intake → proposal". Draft the proposal data
   file from the intake + brief, register it, add the registry entry
   (stage `proposal`), and hand back the URL + password to send.
3. **Client said yes** → § "Accepted → agreement". Check the `"agreement"`
   gate, build the SOW content file and page, register in `signable.ts`
   and the registry (stage `accepted`), and handle the deposit invoice if
   the terms have one.

Rules that always apply:

- The slug is the primary key everywhere — never let the registry,
  signable map, billing preset key, and ledger `clientSlug` disagree.
- Never publish an agreement with placeholder legal-entity text, and
  never invent billing details — if intake is missing something, stop and
  ask for it.
- Passwords: one memorable lowercase word, unique per client; the page's
  `storageKey` is `for-<slug>-unlocked`.
- Before committing: `npx tsc --noEmit` and `npx eslint` on changed files.
- You draft client-facing messages; the user sends them.
