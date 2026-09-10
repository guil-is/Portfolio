# Editing proposal copy on the page

Proposal pages (`/for/<slug>`, data in `src/content/proposals/<slug>.tsx`)
have an owner-only edit mode. You edit the text in place, hit Save, and the
change is committed to `main`; production redeploys in a minute or two.

## Day to day

1. Open the proposal with `?edit` on the end, e.g.
   `https://guil.is/for/spa-aftermovie?edit`. Enter the client password as
   usual, then the edit passphrase in the small pill bottom-right. The
   browser remembers the passphrase, so after the first time the pill is
   there on every proposal page without `?edit`.
2. Click **Edit page**. Every editable string gets a dashed outline. Click
   into one and type. Enter finishes a field (no line breaks: each string
   is one line in the data file).
3. **Save** commits, **Discard** puts everything back. The pill shows
   "Saved n changes. Live in about two minutes." with a link to the commit.
   Until the deploy lands the page keeps showing your version (it remembers
   the pending edits in this browser).
4. The **×** on the pill hides the editor on this browser. `?edit` brings
   the prompt back.

What is editable: every plain string in the proposal data (titles, blurbs,
bullets, labels, prices, terms, timeline entries). Not editable on the
page: copy written as JSX with inline links (Odyssey's brief), URLs, the
password, icons, dates used as keys. Ask Claude for those.

If Save reports it couldn't place an edit, the string in the source file
does not match the page text exactly (rare: a string built from several
parts, or quoted differently). Paste the change to Claude instead.

## How it works

- `src/lib/proposal-edit.ts` walks the Proposal object into string leaves
  (`collectLeaves`) and rewrites quoted literals in the source
  (`applyEdits`). Duplicated strings (the same line in two quote cards) are
  told apart by occurrence index, counted in source order.
- `src/components/ProposalEditor.tsx` binds those leaves to the visible
  text nodes, wraps them in `contenteditable` spans, and posts
  `{path, old, next, occurrence}` edits.
- `src/app/api/proposal-edit/route.ts` checks the passphrase, fetches the
  file through the GitHub contents API, applies the edits, and commits to
  `main` with the message `<slug>: copy edits from the page (…)`.
- Because edits land on `main` directly, **a Claude session that touches a
  proposal file should `git pull` first**. The literal-replacement design
  means a page edit and a session edit to different strings never conflict.

## One-time setup (Vercel)

Two environment variables on the `portfolio` project, Production scope.

1. **GitHub token.** github.com → your avatar → Settings → Developer
   settings → Personal access tokens → Fine-grained tokens → Generate new
   token. Name it "guil.is page editor", expiration as long as GitHub
   allows, Repository access: *Only select repositories* → `Portfolio`.
   Permissions → Repository permissions → **Contents: Read and write**
   (nothing else). Generate, copy the token.
2. **Vercel.** vercel.com → `portfolio` → Settings → Environment Variables:
   - `GITHUB_CONTENT_TOKEN` = the token from step 1
   - `PROPOSAL_EDIT_SECRET` = a passphrase you choose (this is what you
     type on the page)
   Save with Production ticked, then Deployments → latest → ⋯ → Redeploy
   so the running deployment picks them up.

Optional overrides: `GITHUB_CONTENT_REPO` (default `guil-is/Portfolio`),
`GITHUB_CONTENT_BRANCH` (default `main`).

Without the two variables the API answers 503 and the pill says editing
isn't set up on this deployment. The token never reaches the browser; the
passphrase is compared server-side and is never in the bundle.
