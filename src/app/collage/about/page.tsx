import type { Metadata } from "next";
import { site } from "@/content/site";
import { CollageNav } from "@/components/CollageNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: site.collageAbout.metaTitle,
  description: site.collageAbout.description,
};

export default function CollageAboutPage() {
  const { heading, groups, awards } = site.collageAbout;

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <main className="min-h-screen bg-bg px-6 md:px-10">
        <CollageNav current="about" />

        <section className="mx-auto w-full max-w-[800px] py-12 md:py-20">
          <h1 className="mb-12 font-art text-[2.4rem] font-bold leading-tight text-ink md:text-[3rem]">
            {heading}
          </h1>

          <div className="flex flex-col gap-12">
            {groups.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <h2 className="font-art text-[1.4rem] font-bold uppercase tracking-wide text-ink">
                  {group.title}
                </h2>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li
                      key={`${group.title}-${item.date}`}
                      className="text-[0.95rem] leading-[1.6rem] text-body"
                    >
                      <span className="text-muted">{item.date}</span>{" "}
                      {"href" in item && item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span className="text-ink">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {awards.map((a) => (
              <div key={a.title} className="flex flex-col gap-1">
                <h3 className="font-art text-[1.2rem] font-bold text-ink">
                  {a.title}
                </h3>
                <p className="text-[0.95rem] leading-[1.6rem] text-body">
                  {a.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
