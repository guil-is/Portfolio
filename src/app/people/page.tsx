import type { Metadata } from "next";
import { site } from "@/content/site";
import { getAllPeople } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PeopleList } from "@/components/PeopleList";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `People | ${site.name}`,
  description:
    "Collaborators I've been lucky to work alongside — designers, engineers, founders, and operators I trust and would happily recommend.",
};

export default async function PeoplePage() {
  const people = await getAllPeople().catch(() => []);

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PageHeader />
      <main className="px-6 md:px-10">
        <section className="mx-auto w-full max-w-[900px] pb-6 pt-12 md:pt-20">
          <h1 className="font-display text-[3rem] font-bold leading-[1.1] text-ink md:text-[4.5rem]">
            People
          </h1>
          <p className="mt-6 max-w-[520px] text-[0.95rem] leading-[1.5] text-muted md:text-[1rem]">
            I&rsquo;ve been lucky to work alongside some incredible people.
            These are collaborators I trust and would happily recommend.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[900px] pb-24">
          <PeopleList people={people} />
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
