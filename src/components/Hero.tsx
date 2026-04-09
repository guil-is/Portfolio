import Image from "next/image";
import { site } from "@/content/site";
import { CtaButton } from "./CtaButton";
import { SocialIconsRow } from "./SocialIconsRow";
import { Placeholder } from "./Placeholder";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[800px] pb-[30px] pt-0">
      <h1 className="intro-rise max-w-[800px] font-display text-[1.75rem] font-bold leading-[1.3] text-ink md:text-[2.2rem] md:leading-[3rem]">
        {site.introHeading}
      </h1>

      <div className="grid grid-cols-1 items-center gap-10 pt-10 md:grid-cols-2 md:pt-12">
        <div>
          {site.hero.portrait ? (
            <Image
              src={site.hero.portrait}
              alt={site.hero.portraitAlt}
              width={1200}
              height={1200}
              sizes="(min-width: 768px) 400px, 100vw"
              priority
              className="aspect-square w-full rounded-[16px] object-cover"
            />
          ) : (
            <Placeholder label="GM" aspect="square" />
          )}
        </div>

        <div className="flex flex-col gap-5">
          {site.hero.bio.map((p, i) => (
            <p key={i} className="text-[0.95rem] leading-[1.6rem] text-ink">
              {p}
            </p>
          ))}
          <p className="text-[0.95rem] font-bold leading-[1.6rem] text-ink">
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
