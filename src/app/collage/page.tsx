import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";
import { collagePortfolio } from "@/content/collage";
import { CollageNav } from "@/components/CollageNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Placeholder } from "@/components/Placeholder";

export const metadata: Metadata = {
  title: site.collage.metaTitle,
  description: site.collage.description,
};

export default function CollagePage() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <main className="min-h-screen bg-bg px-6 md:px-10">
        <CollageNav current="portfolio" />

        <section className="mx-auto w-full max-w-[1200px] py-8 md:py-16">
          <div className="columns-1 gap-4 sm:columns-2 md:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {collagePortfolio.map((art, i) => (
              <figure
                key={`${art.alt}-${i}`}
                className="relative overflow-hidden rounded-[12px] bg-card shadow-[0_4px_40px_#cfc8c433]"
              >
                {art.url ? (
                  <Image
                    src={art.url}
                    alt={art.alt}
                    width={1200}
                    height={1200}
                    sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                    unoptimized
                    className="h-auto w-full object-cover"
                  />
                ) : (
                  <Placeholder label={art.alt} aspect="square" />
                )}
              </figure>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
