"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

type Props = {
  /** Label shown before copying. Defaults to "Share this proposal". */
  label?: string;
  /** Optional URL to copy. Defaults to the current page URL. */
  url?: string;
  className?: string;
};

// Secondary-action button that copies a URL to the clipboard and shows
// a brief confirmation state. Falls back silently if the Clipboard API
// isn't available (old browsers, insecure contexts).
export function ShareButton({
  label = "Share this proposal",
  url,
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const target = url ?? window.location.href;
    try {
      await navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fallback — user can copy from the address bar.
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink transition-colors hover:text-muted ${className}`}
    >
      {copied ? (
        <Check className="h-4 w-4" strokeWidth={2} />
      ) : (
        <Link2 className="h-4 w-4" strokeWidth={1.75} />
      )}
      {copied ? "Link copied" : label}
    </button>
  );
}
