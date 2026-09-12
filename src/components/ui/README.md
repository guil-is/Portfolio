# shadcn/ui components

Copied in from shadcn/ui (new-york style, Tailwind v4 build) for the
Financial Dashboard v2 (`/money/v2`). Three token families are renamed so
they don't collide with the site's own `card`, `muted` and `accent`
tokens: `bg-card` → `bg-fd-card`, `text-muted-foreground` →
`text-fd-muted-foreground`, `bg-accent` → `bg-fd-accent`. Everything else
uses the standard shadcn names (`background`, `foreground`, `primary`,
`secondary`, `border`, `input`, `ring`, `popover`, `destructive`), defined
at the end of `src/app/globals.css`.

To refresh a component from upstream: `npx shadcn@latest add <name> -o`,
then re-apply the three renames.
