/**
 * Number tile for the books pages. `tone` colours the figure: money in
 * (up), money out (down), things to watch (warn). Default is ink.
 */

export type Tone = "up" | "down" | "warn" | "ink";

export const TONE_TEXT: Record<Tone, string> = {
  up: "text-up",
  down: "text-down",
  warn: "text-warn",
  ink: "text-ink",
};

export function Stat({ label, value, sub, tone = "ink" }: { label: string; value: string; sub: string; tone?: Tone }) {
  return (
    <div className="flex flex-col gap-1 bg-bg px-5 py-5">
      <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">{label}</p>
      <p className={`font-display text-[1.5rem] font-bold leading-tight tabular-nums ${TONE_TEXT[tone]}`}>{value}</p>
      <p className="text-[0.75rem] leading-[1.1rem] text-muted">{sub}</p>
    </div>
  );
}

/** Green above zero, red below. */
export function signTone(n: number): Tone {
  return n < 0 ? "down" : "up";
}
