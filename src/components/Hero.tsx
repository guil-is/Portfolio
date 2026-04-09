import { site } from "@/content/site";

export function Hero() {
  return (
    <section
      id="top"
      className="w-full px-4 pt-10 pb-8 sm:px-8 sm:pt-16 sm:pb-12"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="max-w-5xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {site.hero}
        </h1>
      </div>
    </section>
  );
}
