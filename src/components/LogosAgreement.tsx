"use client";

import { AgreementSignature } from "@/components/AgreementSignature";
import { DefinitionList } from "@/components/DefinitionList";
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
      <DefinitionList rows={signatories} />
    </section>
  );
}

function AgreementSection({ section }: { section: SowSection }) {
  // The Timeline section renders its date/milestone rows as a vertical
  // timeline on the page; the same rows still print as a plain kv list in
  // the signed PDF, so the record stays complete and deterministic.
  const isTimeline = section.heading === "Timeline";
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
          if (isTimeline) {
            return <Timeline key={i} rows={b.rows} />;
          }
          return <DefinitionList key={i} rows={b.rows} />;
        })}
      </div>
    </section>
  );
}

/**
 * Vertical timeline: each milestone is a dot on a continuous rail, with
 * the date as an eyebrow above the milestone text. The rail is a single
 * absolutely-positioned line running between the first and last dot.
 */
function Timeline({ rows }: { rows: Array<[string, string]> }) {
  return (
    <ol className="relative mt-1 flex flex-col gap-7 pl-7">
      <span
        aria-hidden
        className="absolute bottom-[7px] left-[5px] top-[7px] w-px bg-rule"
      />
      {rows.map(([when, what], i) => (
        <li key={i} className="relative flex flex-col gap-1">
          <span
            aria-hidden
            className="absolute -left-7 top-[2px] h-[11px] w-[11px] rounded-full border-2 border-ink bg-bg"
          />
          <span className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
            {when}
          </span>
          <span className="text-[1rem] leading-[1.6rem] text-ink">{what}</span>
        </li>
      ))}
    </ol>
  );
}
