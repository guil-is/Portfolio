import { site } from "@/content/site";
import { CtaButton } from "./CtaButton";
import { SocialIconsRow } from "./SocialIconsRow";
import { Placeholder } from "./Placeholder";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[800px] pt-12 pb-8 md:pt-16 md:pb-[30px]">
      <h1 className="max-w-[800px] font-display text-[1.75rem] font-bold leading-[1.3] text-ink md:text-[2.2rem] md:leading-[3rem]">
        {site.introHeading}
      </h1>

      <div className="grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-2">
        <div>
          <Placeholder label="GM" aspect="square" />
        </div>

        <div className="flex flex-col gap-5">
          {site.hero.bio.map((p, i) => (
            <p
              key={i}
              className="text-[0.95rem] leading-[1.6rem] text-ink"
            >
              {p}
            </p>
          ))}
          <p className="text-[0.95rem] leading-[1.6rem] font-bold text-ink">
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
