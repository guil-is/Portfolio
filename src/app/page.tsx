import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { About } from "@/components/About";
import { Capabilities } from "@/components/Capabilities";
import { Approach } from "@/components/Approach";
import { Clients } from "@/components/Clients";
import { Testimonials } from "@/components/Testimonials";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <About />
        <Capabilities />
        <Approach />
        <Clients />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
