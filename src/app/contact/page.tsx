import type { Metadata } from "next";
import { site } from "@/content/site";
import { PageHeader } from "@/components/PageHeader";
import { CtaFooter } from "@/components/CtaFooter";
import { ContactForm } from "@/components/ContactForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: site.contact.metaTitle,
  description: site.contact.description,
};

export default function ContactPage() {
  const { heading, subheading, emailLabel, email } = site.contact;

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PageHeader />
      <main className="px-6 md:px-8">

        <section className="mx-auto w-full max-w-[800px] py-12 md:py-20">
          <h1 className="font-display text-[2rem] leading-tight text-ink md:text-[2.4rem]">
            {heading}
          </h1>
          <p className="mt-6 font-display text-[1.25rem] leading-[1.9rem] text-ink/85">
            {subheading}:{" "}
            <a
              href={`mailto:${email}`}
              className="underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
            >
              {emailLabel}
            </a>
          </p>

          <div className="mt-12">
            <ContactForm />
          </div>
        </section>

        <CtaFooter />
      </main>
    </>
  );
}
