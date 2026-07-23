import type { ReactNode } from "react";

/**
 * Vertical timeline: each entry is a dot on a continuous rail, with an
 * uppercase eyebrow (date or phase label) above the entry content. The
 * rail is a single absolutely-positioned line running between the first
 * and last dot. Extracted from the Logos agreement so client pages share
 * one timeline treatment.
 *
 * `state` drives the dot: "done" fills it, "active" rings it blue,
 * "upcoming" fades it. Undefined keeps the neutral agreement style.
 */

export type TimelineEntryState = "done" | "active" | "upcoming";

export type TimelineEntry = {
  /** Uppercase caption above the content, e.g. a date or phase label. */
  eyebrow: ReactNode;
  /** Optional pill rendered next to the eyebrow, e.g. a status badge. */
  badge?: ReactNode;
  content: ReactNode;
  state?: TimelineEntryState;
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative mt-1 flex flex-col gap-7 pl-7">
      <span
        aria-hidden
        className="absolute bottom-[7px] left-[5px] top-[7px] w-px bg-rule"
      />
      {entries.map((entry, i) => (
        <li key={i} className="relative flex flex-col gap-1">
          <span
            aria-hidden
            className={[
              "absolute -left-7 top-[2px] h-[11px] w-[11px] rounded-full border-2",
              dotClass(entry.state),
            ].join(" ")}
          />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
              {entry.eyebrow}
            </span>
            {entry.badge ?? null}
          </div>
          {entry.content}
        </li>
      ))}
    </ol>
  );
}

function dotClass(state?: TimelineEntryState): string {
  if (state === "done") return "border-ink bg-ink";
  if (state === "active") return "border-[#3b82f6] bg-bg";
  if (state === "upcoming") return "border-rule bg-bg";
  return "border-ink bg-bg";
}
