import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { testimonialExamples } from "@/content/testimonial-examples";

/**
 * Public but unlisted page for Guil to share with people he's asking
 * to write a testimonial. Gives them 15 anonymous starter examples
 * they can pick from, mash together, or use as inspiration. Flagged
 * robots: noindex so it doesn't show up in search.
 */
export const metadata: Metadata = {
  title: "Testimonial examples · Guil Maueler",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function TestimonialExamplesPage() {
  return (
    <>
      <PageHeader maxWidth={960} />
      <main className="page-fade-in mx-auto w-full max-w-[960px] px-6 pb-40 pt-16 md:px-10 md:pt-24">
        <header className="mb-16 flex flex-col gap-5">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            For testimonial sendoffs
          </p>
          <h1 className="font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[3.5rem]">
            A bank of example quotes.
          </h1>
          <p className="max-w-[620px] text-[1rem] leading-[1.75rem] text-muted">
            If you don&apos;t feel like writing from scratch, pick whichever one
            of these fits our work best. Borrow it verbatim, mash two together,
            or use one as the jumping-off point for something in your own
            words. Whatever&apos;s easiest.
          </p>
        </header>

        <div className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
          {testimonialExamples.map((t) => (
            <ExampleCard key={t.quote} angle={t.angle} quote={t.quote} />
          ))}
        </div>
      </main>
    </>
  );
}

function ExampleCard({ angle, quote }: { angle: string; quote: string }) {
  return (
    <article className="flex flex-col gap-5 rounded-[16px] border border-rule p-6 md:p-7">
      <blockquote className="text-[0.95rem] leading-[1.65rem] text-ink">
        <span aria-hidden className="select-none text-muted">
          “
        </span>
        {quote}
        <span aria-hidden className="select-none text-muted">
          ”
        </span>
      </blockquote>
      <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
        {angle}
      </p>
    </article>
  );
}
