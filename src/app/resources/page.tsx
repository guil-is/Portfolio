import type { Metadata } from "next";
import { site } from "@/content/site";
import { getAllResources } from "@/lib/queries";
import { isResourceCategory } from "@/lib/resources";
import { PageHeader } from "@/components/PageHeader";
import { ResourceLibrary } from "@/components/ResourceLibrary";

export const revalidate = 60;

// Unlisted: reachable by URL only. Not in the nav, not in the sitemap,
// disallowed in robots.ts, and noindex here. Share the link directly.
export const metadata: Metadata = {
  title: `Resources | ${site.name}`,
  description:
    "A working library of design tools, type, references and rabbit holes.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default async function ResourcesPage() {
  const resources = await getAllResources().catch(() => []);
  const categoryCount = new Set(
    resources.map((r) => (isResourceCategory(r.category) ? r.category : "other")),
  ).size;

  return (
    <>
      <PageHeader />
      <main className="px-6 md:px-10">
        <section className="mx-auto w-full max-w-[900px] pb-6 pt-12 md:pt-20">
          <h1 className="font-display text-[3rem] font-bold leading-[1.1] text-ink md:text-[4.5rem]">
            Resources
          </h1>
          <p className="mt-6 max-w-[520px] text-[0.95rem] leading-[1.5] text-muted md:text-[1rem]">
            Tools, type, references and rabbit holes I keep coming back to.
            A working library that grows as I go, not a top ten.
          </p>
          {resources.length > 0 ? (
            <p className="mt-5 font-caption text-[11px] uppercase tracking-[2px] text-faint">
              {resources.length} {resources.length === 1 ? "resource" : "resources"}
              {" · "}
              {categoryCount} {categoryCount === 1 ? "category" : "categories"}
            </p>
          ) : null}
        </section>

        <section className="mx-auto w-full max-w-[900px] pb-24">
          <ResourceLibrary resources={resources} />
        </section>

        <footer className="pb-12 text-center">
          <p className="font-caption text-[11px] uppercase tracking-[2px] text-muted">
            &copy; Copyright {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </>
  );
}
