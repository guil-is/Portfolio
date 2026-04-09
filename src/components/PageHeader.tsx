import Link from "next/link";
import { site } from "@/content/site";

// Minimal top bar used on secondary pages (/about, /contact, /collage, ...).
// The homepage deliberately has no nav bar (Webflow `.hide` on the navbar).
// On secondary pages we need at least a link back to home, so this renders
// the site name + a light underline row.
export function PageHeader() {
  return (
    <header className="mx-auto w-full max-w-[800px] pt-8 pb-4">
      <nav className="flex items-center justify-between gap-6 border-b border-rule pb-4">
        <Link
          href="/"
          className="font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink transition-opacity hover:opacity-60"
        >
          {site.name}
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
          >
            about
          </Link>
          <Link
            href="/collage"
            className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
          >
            collage
          </Link>
          <Link
            href="/contact"
            className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
          >
            get in touch
          </Link>
        </div>
      </nav>
    </header>
  );
}
