import { Hero } from "@/components/Hero";
import { ActiveProjects } from "@/components/ActiveProjects";
import { Expertise } from "@/components/Expertise";
import { PastWork } from "@/components/PastWork";
import { CtaFooter } from "@/components/CtaFooter";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <main className="page-fade-in px-6 pt-16 md:px-8 md:pt-24">
        <Hero />
        <ActiveProjects />
        <Expertise />
        <PastWork />
        <CtaFooter />
      </main>
    </>
  );
}
