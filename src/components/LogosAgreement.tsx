"use client";

import { AgreementSignature } from "@/components/AgreementSignature";
import type { SignedAgreement } from "@/lib/signed-agreement";
import { logos, CLIENT_ENTITY } from "@/content/clients/logos";
import type { SowSection } from "@/content/clients/types";

/**
 * Standalone Service Agreement page for /for/logos. Renders the signable
 * document in a single column using the same section/typography
 * components and the same `AgreementSignature` flow as the other /for/
 * pages.
 *
 * The Client's legal entity (Logos Collective Association) is baked into
 * the document; it is also passed to the signature flow so it is recorded
 * on the signature, certificate, PDF, and confirmation email.
 */
export function LogosAgreement({
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
  const { sow, subtitle } = logos;

  return (
    <main className="page-fade-in mx-auto w-full max-w-[820px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      <article className="flex flex-col gap-14">
        <header className="flex flex-col gap-5">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {sow.title ?? "Service Agreement"} · Effective {sow.effectiveDate}
          </p>
          <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[3.5rem]">
            {sow.title ?? "Service Agreement"}
          </h1>
          <p className="max-w-[640px] text-[1.05rem] leading-[1.6rem] text-muted">
            {subtitle}
          </p>
          {sow.preamble ? (
            <p className="max-w-[640px] text-[1rem] italic leading-[1.75rem] text-ink">
              {sow.preamble}
            </p>
          ) : null}
        </header>

        {sow.sections.map((s) => (
          <AgreementSection key={s.heading} section={s} />
        ))}

        <SignaturesBlock />

        <section className="mt-2 border-t border-rule-soft pt-10">
          <AgreementSignature
            clientSlug="logos"
            acknowledgments={sow.acknowledgments}
            documentVersion={sow.version}
            initialSignature={initialSignature}
            clientEntity={CLIENT_ENTITY}
          />
        </section>
      </article>
    </main>
  );
}

/** Surfaces the document's signatories (both parties, place, date). */
function SignaturesBlock() {
  const { signatories } = logos.sow;
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
        Signatures
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 border-y border-rule-soft py-4">
        {signatories.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
              {k}
            </dt>
            <dd className="text-[1rem] leading-[1.6rem] text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function AgreementSection({ section }: { section: SowSection }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
        {section.heading}
      </h2>
      <div className="flex flex-col gap-4">
        {section.blocks.map((b, i) => {
          if (b.type === "p") {
            return (
              <p key={i} className="text-[1rem] leading-[1.75rem] text-ink">
                {b.text}
              </p>
            );
          }
          if (b.type === "ul") {
            return (
              <ul key={i} className="flex flex-col gap-2 pl-5">
                {b.items.map((it, j) => (
                  <li
                    key={j}
                    className="list-disc text-[1rem] leading-[1.75rem] text-ink marker:text-muted"
                  >
                    {it}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <dl
              key={i}
              className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 border-y border-rule-soft py-4"
            >
              {b.rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
                    {k}
                  </dt>
                  <dd className="text-[1rem] leading-[1.6rem] text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          );
        })}
      </div>
    </section>
  );
}
