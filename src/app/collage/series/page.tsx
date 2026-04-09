import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";
import { collageSeries } from "@/content/collage";
import { CollageNav } from "@/components/CollageNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Placeholder } from "@/components/Placeholder";

export const metadata: Metadata = {
  title: site.collageSeriesMeta.metaTitle,
  description: site.collageSeriesMeta.description,
};

export default function CollageSeriesPage() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <main className="min-h-screen bg-bg px-6 md:px-10">
        <CollageNav current="series" />

        {collageSeries.map((series) => (
          <section
            key={series.title}
            className="mx-auto w-full max-w-[1200px] border-t border-rule py-16 first:border-t-0"
          >
            <header className="mx-auto mb-10 w-full max-w-[800px]">
              <h2 className="mb-4 font-art text-[2rem] font-bold uppercase leading-tight text-ink md:text-[2.6rem]">
                {series.title}
              </h2>
              <p className="font-art text-[1.1rem] leading-[1.7rem] text-body md:text-[1.2rem]">
                {series.description}
              </p>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {series.images.map((img, i) => (
                <figure
                  key={`${series.title}-${i}`}
                  className="overflow-hidden rounded-[12px] bg-card shadow-[0_4px_40px_#cfc8c433]"
                >
                  {img.url ? (
                    <Image
                      src={img.url}
                      alt={img.alt}
                      width={1600}
                      height={1600}
                      sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                      unoptimized
                      className="h-auto w-full object-cover"
                    />
                  ) : (
                    <Placeholder label={img.alt} aspect="square" />
                  )}
                </figure>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
