"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { CtaButton } from "@/components/CtaButton";

// "Watch the walkthrough" CTA that plays the Loom in a lightbox overlay,
// so the viewer never leaves the proposal page. The iframe only mounts
// while the modal is open (so it autoplays on open, and stops on close).
const LOOM_EMBED =
  "https://www.loom.com/embed/791dee9f58cf41b8aafa9d3e1056166b?autoplay=1";

export function LoomButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <CtaButton
        type="button"
        onClick={() => setOpen(true)}
        label="Watch the walkthrough"
        icon={Play}
      />

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Proposal walkthrough"
          onClick={() => setOpen(false)}
          className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm md:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[960px]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute -top-9 right-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/70 transition-colors hover:text-white"
            >
              Close
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
            <div className="relative aspect-video w-full overflow-hidden rounded-[12px] bg-black shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
              <iframe
                src={LOOM_EMBED}
                title="WinWin 2026 proposal walkthrough"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
