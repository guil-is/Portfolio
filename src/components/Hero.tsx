import { site } from "@/content/site";
import { CtaButton } from "./CtaButton";
import { SocialIconsRow } from "./SocialIconsRow";
import { Placeholder } from "./Placeholder";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[800px] pt-12 pb-8 md:pt-16 md:pb-[30px]">
      <h1 className="sr-only">{site.introHeading}</h1>

      <div className="grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-2">
        <div>
          <Placeholder label="GM" aspect="square" />
        </div>

        <div className="flex flex-col gap-5">
          {site.hero.bio.map((p, i) => (
            <p
              key={i}
              className="text-[0.9rem] leading-[1.5rem] text-ink text-balance"
            >
              {p}
            </p>
          ))}
          <p className="text-[0.9rem] leading-[1.5rem] font-bold text-ink text-balance">
            {site.hero.bioClosing}
          </p>

          <SocialIconsRow socials={site.heroSocials} className="mt-2" />

          <div className="mt-2">
            <CtaButton
              href={site.hero.cta.href}
              label={site.hero.cta.label}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
