"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * A segmented control that looks like TabsList but is a single-select
 * toggle group: for period pickers, year pickers and filters that don't
 * switch a panel. (Tabs claim `aria-controls` on a panel that must
 * exist; a control like this has none.)
 */
type SegmentedProps = Omit<React.ComponentProps<"div">, "value" | "onChange" | "defaultValue" | "dir"> & {
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
};

function Segmented({ className, value, onValueChange, ...props }: SegmentedProps) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      data-slot="segmented"
      value={value}
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
      className={cn("bg-fd-muted text-fd-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]", className)}
      {...props}
    />
  );
}

function SegmentedItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-item"
      className={cn(
        "data-[state=on]:bg-fd-card data-[state=on]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=on]:border-input text-fd-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export { Segmented, SegmentedItem };
