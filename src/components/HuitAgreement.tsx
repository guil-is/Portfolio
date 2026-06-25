"use client";

import { Printer } from "lucide-react";
import { AgreementSignature } from "@/components/AgreementSignature";
import type { SignedAgreement } from "@/lib/signed-agreement";
import { huit } from "@/content/clients/huit";
import type { SowSection } from "@/content/clients/types";

/**
 * Single-page subcontractor agreement for /for/huit. Renders the signable
 * document in one column with the shared section/typography components,
 * Studio Huit (Noa) signs through the standard AgreementSignature flow,
 * and `print-document` makes it save to a clean PDF.
 */
export function HuitAgreement({
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
  const { sow, subtitle, heading } = huit;
  return (
    <main className="print-document page-fade-in mx-auto w-full max-w-[760px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      <article className="flex flex-col gap-14">
        <header className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
              {sow.title ?? "Service Agreement"} · {sow.effectiveDate}
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
            >
              <Printer className="h-3.5 w-3.5" strokeWidth={1.75} />
              Save as PDF
            </button>
          </div>
          <h1 className="intro-rise font-display text-[2.5rem] font-bold leading-[1.05] text-ink md:text-[3.5rem]">
            {heading}
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

        <section className="no-print mt-2 border-t border-rule-soft pt-10">
          <AgreementSignature
            clientSlug="huit"
            acknowledgments={sow.acknowledgments}
            documentVersion={sow.version}
            initialSignature={initialSignature}
          />
        </section>
      </article>
    </main>
  );
}

/** Surfaces the document's signatories (both parties + date). */
function SignaturesBlock() {
  const { signatories } = huit.sow;
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
      <p className="text-[0.9rem] leading-[1.6rem] text-muted">
        Studio Huit signs below.
      </p>
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
