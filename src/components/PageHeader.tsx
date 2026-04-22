import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { SiteNav } from "./SiteNav";

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

// Sticky top bar used on secondary pages. The homepage has no nav
// bar and shows the burger SiteNav directly as a fixed button. Here
// the burger lives inside the nav row.
//
// Rendered as a sibling of <main>, NOT inside it, so its opaque
// background naturally spans the full viewport width without
// needing negative-margin breakout hacks.
export function PageHeader({ left, maxWidth = 800 }: PageHeaderProps = {}) {
  return (
    <header className="nav-drop-in sticky top-0 z-40 bg-bg px-6 md:px-10">
      <div
        className="mx-auto w-full"
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
          <div className="flex shrink-0 items-center">
            <SiteNav />
          </div>
        </nav>
      </div>
    </header>
  );
}
