import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";

type PageHeaderProps = {
  /**
   * Content rendered on the left side of the nav bar. Defaults to the
   * site name linking home. Project pages pass a breadcrumb element.
   */
  left?: ReactNode;
  /**
   * Max width of the inner nav container and the grey divider line.
   * Defaults to 800px; project pages pass 960px to match the cover
   * image width.
   */
  maxWidth?: number;
};

// Sticky top bar used on secondary pages. Homepage deliberately has no
// nav bar. The "about" link jumps to the homepage expertise section and
// "get in touch" opens the cal.com link — matching the single-page flow.
//
// This component renders as a sibling of <main>, NOT inside it, so its
// 100%-opaque background naturally spans the full viewport width
// without needing negative-margin breakout hacks.
export function PageHeader({ left, maxWidth = 800 }: PageHeaderProps = {}) {
  return (
    <header className="nav-drop-in sticky top-0 z-40 bg-bg">
      <div
        className="mx-auto w-full px-6 md:px-10"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <nav className="flex items-center justify-between gap-6 border-b border-rule pb-4 pt-6">
          <div className="min-w-0 flex-1">
            {left ?? (
              <Link
                href="/"
                className="font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink transition-opacity hover:opacity-60"
              >
                {site.name}
              </Link>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-6">
            <Link
              href="/#about"
              className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
            >
              about
            </Link>
            <a
              href="https://cal.com/guil-is"
              target="_blank"
              rel="noopener noreferrer"
              className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
            >
              get in touch
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
