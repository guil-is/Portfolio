import { site } from "@/content/site";
import { CtaButton } from "./CtaButton";
import { SocialIconsRow } from "./SocialIconsRow";

export function CtaFooter() {
  return (
    <section className="mx-auto w-full max-w-[800px] px-6 pb-24 pt-24 text-center">
      <h3 className="font-display text-[2rem] leading-tight text-ink">
        {site.bottomCta.heading}
      </h3>
      <h3 className="mb-10 font-display text-[2rem] italic leading-tight text-ink">
        {site.bottomCta.sub}
      </h3>

      <div className="flex justify-center">
        <CtaButton
          href={site.bottomCta.cta.href}
          label={site.bottomCta.cta.label}
        />
      </div>

      <div className="mt-16 flex justify-center">
        <SocialIconsRow socials={site.footerSocials} />
      </div>
    </section>
  );
}
