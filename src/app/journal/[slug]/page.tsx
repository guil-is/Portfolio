import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { journalPosts } from "@/content/journal";
import { PageHeader } from "@/components/PageHeader";
import { CtaFooter } from "@/components/CtaFooter";
import { ThemeToggle } from "@/components/ThemeToggle";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return journalPosts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = journalPosts.find((p) => p.slug === slug);
    if (!post) return { title: "Post not found" };
    return {
      title: `${post.title} | ${site.name}`,
      description: post.summary,
    };
  });
}

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = journalPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <PageHeader />
      <main className="px-6 md:px-8">

        <article className="mx-auto w-full max-w-[800px] py-12 md:py-20">
          <header className="mb-10">
            <time className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted">
              {post.date}
            </time>
            <h1 className="mt-3 font-display text-[2.4rem] font-bold leading-tight text-ink md:text-[3rem]">
              {post.title}
            </h1>
            {post.summary ? (
              <p className="mt-4 font-display text-[1.25rem] leading-[1.9rem] text-ink/85">
                {post.summary}
              </p>
            ) : null}
          </header>

          <div
            className="journal-body flex flex-col gap-6 text-[1rem] leading-[1.7rem] text-body"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          <div className="mt-16">
            <Link
              href="/"
              className="font-caption text-[12px] font-medium uppercase tracking-[1.5px] text-muted hover:text-ink"
            >
              ← back to main site
            </Link>
          </div>
        </article>

        <CtaFooter />
      </main>
    </>
  );
}
