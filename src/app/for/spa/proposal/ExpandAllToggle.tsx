"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Expand/collapse-all control for the Full scope disclosures. Toggles the
// native <details open> on every group inside #scope. State tracks the last
// action for the label; clicking always forces all groups to the next state.
export function ExpandAllToggle() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    document
      .querySelectorAll<HTMLDetailsElement>("#scope details")
      .forEach((d) => {
        d.open = next;
      });
    setOpen(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-muted transition-colors hover:text-ink"
    >
      {open ? "Collapse all" : "Expand all"}
      <ChevronDown
        className={`h-4 w-4 transition-transform duration-200 ${
          open ? "rotate-180" : ""
        }`}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}
