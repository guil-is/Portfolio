"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import { CtaButton } from "@/components/CtaButton";

// "Watch the walkthrough" CTA that plays the Loom in a full-screen lightbox,
// so the viewer never leaves the proposal. Rendered through a portal to
// document.body so `position: fixed` is relative to the viewport (the hero's
// intro-rise transform would otherwise trap it in a small containing block).
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
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

      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Proposal walkthrough"
              onClick={() => setOpen(false)}
              className="no-print fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="fixed right-5 top-5 z-10 inline-flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-[1px] text-white/70 transition-colors hover:text-white"
              >
                Close
                <X className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>

              <div className="flex min-h-full items-center justify-center p-4 md:p-10">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative aspect-video w-full max-w-[1200px] overflow-hidden rounded-[12px] bg-black shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
                >
                  <iframe
                    src={LOOM_EMBED}
                    title="WinWin 2026 proposal walkthrough"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
