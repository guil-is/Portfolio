import Image from "next/image";
import { site } from "@/content/site";
import { CtaButton } from "./CtaButton";
import { SocialIconsRow } from "./SocialIconsRow";
import { Placeholder } from "./Placeholder";

type HeroProps = {
  headline?: string;
  bio?: readonly string[] | string[];
  bioClosing?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function Hero({
  headline = site.introHeading,
  bio = site.hero.bio,
  bioClosing = site.hero.bioClosing,
  ctaLabel = site.hero.cta.label,
  ctaHref = site.hero.cta.href,
}: HeroProps) {
  return (
    <section className="mx-auto w-full max-w-[800px] pb-[30px] pt-0">
      <h1 className="intro-rise max-w-[800px] font-display text-[1.75rem] font-bold leading-[1.3] text-ink md:text-[2.2rem] md:leading-[3rem]">
        {headline}
      </h1>

      <div className="grid grid-cols-1 items-stretch gap-10 pt-10 md:grid-cols-2 md:pt-12">
        <div className="relative aspect-square w-full overflow-hidden rounded-[16px] md:aspect-auto md:h-full md:min-h-[400px]">
          {site.hero.portrait ? (
            <Image
              src={site.hero.portrait}
              alt={site.hero.portraitAlt}
              fill
              sizes="(min-width: 768px) 400px, 100vw"
              priority
              className="object-cover"
            />
          ) : (
            <Placeholder label="GM" aspect="fill" />
          )}
        </div>

        <div className="flex flex-col gap-5">
          {bio.map((p, i) => (
            <p key={i} className="text-[0.95rem] leading-[1.6rem] text-ink">
              {p}
            </p>
          ))}
          <p className="text-[0.95rem] font-bold leading-[1.6rem] text-ink">
            {bioClosing}
          </p>

          <SocialIconsRow socials={site.heroSocials} className="mt-2" />

          <div className="mt-2">
            <CtaButton href={ctaHref} label={ctaLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
