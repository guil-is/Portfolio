import { site } from "@/content/site";
import { CtaButton } from "./CtaButton";
import { SocialIconsRow } from "./SocialIconsRow";
import { CenterFocus } from "./CenterFocus";

export function CtaFooter() {
  return (
    <section className="mx-auto w-full max-w-[800px] py-[100px] text-center">
      <CenterFocus minOpacity={0.4} falloff={0.7}>
        <h3 className="font-display text-[2rem] leading-tight text-ink md:text-[2.4rem]">
          {site.bottomCta.heading}
        </h3>
        <h3 className="mb-10 font-display text-[2rem] italic leading-tight text-ink md:text-[2.4rem]">
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
      </CenterFocus>
    </section>
  );
}
