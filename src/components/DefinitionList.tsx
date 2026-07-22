import type { ReactNode } from "react";

/**
 * Two-column label/value list used throughout the signable agreements
 * (Parties, Fees, engagement details, Signatures, and any `kv` block).
 *
 * Responsive by design: on narrow screens the columns stack — label above
 * value — so long labels like "EDIT & POST (3 VIDEOS × EUR 500)" never
 * squeeze the value into an awkward mid-word wrap. From `md` up it renders
 * as the two-column `[auto_1fr]` grid. Shared on purpose: every agreement,
 * current and future, inherits this behavior from one place.
 */
export function DefinitionList({
  rows,
  className = "",
}: {
  rows: Array<[ReactNode, ReactNode]>;
  className?: string;
}) {
  return (
    <dl
      className={`flex flex-col gap-4 border-y border-rule-soft py-4 md:grid md:grid-cols-[auto_1fr] md:gap-x-8 md:gap-y-2 ${className}`}
    >
      {rows.map(([label, value], i) => (
        <div key={i} className="flex flex-col gap-1 md:contents">
          <dt className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
            {label}
          </dt>
          <dd className="text-[1rem] leading-[1.6rem] text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
