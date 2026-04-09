import Link from "next/link";
import { site } from "@/content/site";

type CollageNavProps = {
  current: "portfolio" | "series" | "about";
};

// Collage-section nav — the collage pages in the Webflow export use a
// separate sidebar nav with "Guilherme Maueler" branding and a different
// set of links (portfolio, series, shop, about). We keep that scope here
// and add a small "← main site" link back to the root portfolio.
export function CollageNav({ current }: CollageNavProps) {
  const linkClass = (active: boolean) =>
    `font-art text-[14px] uppercase tracking-[1.5px] transition-colors ${
      active ? "text-ink" : "text-muted hover:text-ink"
    }`;

  return (
    <header className="mx-auto w-full max-w-[1200px] pb-4 pt-8 font-art">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-rule pb-4">
        <Link
          href="/collage"
          className="flex flex-col leading-[0.95] tracking-tight"
        >
          <span className="text-[1.5rem] font-bold text-ink">Guilherme</span>
          <span className="text-[1.5rem] font-bold text-ink">Maueler</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-6">
          <Link href="/collage" className={linkClass(current === "portfolio")}>
            portfolio
          </Link>
          <Link
            href="/collage/series"
            className={linkClass(current === "series")}
          >
            series
          </Link>
          <a
            href={site.collage.shopHref}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass(false)}
          >
            shop
          </a>
          <Link
            href="/collage/about"
            className={linkClass(current === "about")}
          >
            about
          </Link>
          <Link
            href="/"
            className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
          >
            ← main site
          </Link>
        </nav>
      </div>
    </header>
  );
}
