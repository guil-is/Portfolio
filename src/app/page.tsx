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
      <main className="px-6 pb-0 pt-0 md:px-8">
        <Hero />
        <ActiveProjects />
        <Expertise />
        <PastWork />
        <CtaFooter />
      </main>
    </>
  );
}
