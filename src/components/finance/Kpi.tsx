"use client";

import type { CSSProperties, ReactNode } from "react";
import { Info } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Amount } from "@/components/money/Privacy";

/** Small shared pieces for the finance pages: a KPI card, a mini figure, an info tooltip. */

export type Tone = "up" | "down" | "warn";
const TONE: Record<Tone, string> = { up: "text-fd-up", down: "text-fd-down", warn: "text-fd-warn" };

export const rise = (i: number) => ({ "--i": i } as CSSProperties);

export function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="How this is computed" className="rounded-full text-fd-muted-foreground/70 transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
          <Info className="size-4" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left">{text}</TooltipContent>
    </Tooltip>
  );
}

export function Mini({ label, value, tone, signed }: { label: string; value: number; tone?: "up" | "down"; signed?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">{label}</span>
      <Amount value={value} signed={signed} className={cn("truncate text-base font-semibold", tone === "up" && "text-fd-up", tone === "down" && "text-fd-down")} />
    </div>
  );
}

export function Kpi({ label, value, tip, tone, children, style, className }: { label: string; value: ReactNode; tip?: string; tone?: Tone; children?: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <Card className={cn("fd-rise gap-3 py-5", className)} style={style}>
      <CardHeader className="px-5">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={cn("pt-0.5 text-2xl font-semibold tracking-tight tabular-nums", tone && TONE[tone])}>{value}</CardTitle>
        {tip ? (
          <CardAction>
            <InfoTip text={tip} />
          </CardAction>
        ) : null}
      </CardHeader>
      {children ? <CardContent className="flex flex-col gap-2 px-5 text-xs leading-5 text-fd-muted-foreground">{children}</CardContent> : null}
    </Card>
  );
}

/** A muted strip of figures for use inside a card (where nested cards would be too much). */
export function StatStrip({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-4 rounded-xl bg-fd-muted/60 p-4", className)}>{children}</div>;
}

export function StatTile({
  label,
  value,
  sub,
  tone,
  onClick,
  active,
  title,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) {
  const inner = (
    <>
      <span className="truncate text-[11px] font-medium uppercase tracking-wide text-fd-muted-foreground">{label}</span>
      <span className={cn("text-xl font-semibold tracking-tight tabular-nums", tone && TONE[tone])}>{value}</span>
      {sub ? <span className="text-xs leading-4 text-fd-muted-foreground">{sub}</span> : null}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} title={title} aria-pressed={active} className={cn("-m-2 flex min-w-0 flex-col gap-1 rounded-lg p-2 text-left transition-colors hover:bg-fd-card/70", active && "bg-fd-card shadow-fd")}>
        {inner}
      </button>
    );
  }
  return <div className="flex min-w-0 flex-col gap-1">{inner}</div>;
}
