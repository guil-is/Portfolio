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
