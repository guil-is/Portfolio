"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Building2, Check, Pencil } from "lucide-react";
import { AgreementSignature } from "@/components/AgreementSignature";
import type { SignedAgreement } from "@/lib/signed-agreement";
import {
  tedxberlin,
  CLIENT_ENTITY_PLACEHOLDER,
} from "@/content/clients/tedxberlin";
import type { SowSection } from "@/content/clients/types";

/**
 * Standalone Service Agreement page for /for/tedxberlin. Renders the
 * signable document in a single column using the same section/typography
 * components and the same `AgreementSignature` flow as the Agreement tab
 * on the other /for/ pages.
 *
 * The Client's legal entity is not hardcoded: the signer enters it in a
 * popup, it is filled into the document (Parties + Signatures), and it is
 * submitted with the signature (recorded on the certificate, PDF, email).
 */
export function TedxBerlinAgreement({
  initialSignature,
}: {
  initialSignature: SignedAgreement | null;
}) {
  const { sow, subtitle } = tedxberlin;
  const signed = !!initialSignature;
  const [entity, setEntity] = useState(initialSignature?.clientEntity ?? "");
  // Prompt for the entity on first open of an unsigned agreement.
  const [popupOpen, setPopupOpen] = useState(!signed);

  const entityDisplay = entity.trim() || "To be entered by the Client";

  return (
    <main className="page-fade-in mx-auto w-full max-w-[820px] px-6 pt-10 pb-40 md:px-10 md:pt-16">
      {popupOpen ? (
        <EntityPopup
          initial={entity}
          onSave={(v) => {
            setEntity(v);
            setPopupOpen(false);
          }}
          onClose={() => setPopupOpen(false)}
        />
      ) : null}

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

        {!signed ? (
          <EntityBanner entity={entity} onEdit={() => setPopupOpen(true)} />
        ) : null}

        {sow.sections.map((s) => (
          <AgreementSection
            key={s.heading}
            section={s}
            entityDisplay={entityDisplay}
          />
        ))}

        <SignaturesBlock entityDisplay={entityDisplay} />

        <section className="mt-2 border-t border-rule-soft pt-10">
          <AgreementSignature
            clientSlug="tedxberlin"
            acknowledgments={sow.acknowledgments}
            documentVersion={sow.version}
            initialSignature={initialSignature}
            clientEntity={entity}
            requireEntity
          />
        </section>
      </article>
    </main>
  );
}

/** Substitute the static entity placeholder with the signer's input. */
function cell(value: string, entityDisplay: string): string {
  return value === CLIENT_ENTITY_PLACEHOLDER ? entityDisplay : value;
}

/**
 * Modal that collects the Client's legal entity name. Built with the same
 * primitives as the rest of the design system; no new component library.
 */
function EntityPopup({
  initial,
  onSave,
  onClose,
}: {
  initial: string;
  onSave: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus the field without scrolling the page underneath toward it.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (v) onSave(v);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-6 pt-[10vh] md:pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Enter your legal entity name"
    >
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-bg/75 backdrop-blur-xl"
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[460px] rounded-[16px] border border-rule bg-bg p-7 shadow-[0_8px_60px_rgba(0,0,0,0.18)] md:p-9"
      >
        <div className="flex items-start gap-4">
          <Building2 className="mt-1 h-7 w-7 shrink-0 text-ink" strokeWidth={1.5} />
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-[1.35rem] font-bold leading-tight text-ink">
              Your legal entity
            </h2>
            <p className="text-[0.95rem] leading-[1.6rem] text-muted">
              Enter the legal entity name that is entering into this agreement
              as the Client. It appears in the agreement and is recorded with
              your signature.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2">
          <label
            htmlFor="entity-name"
            className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted"
          >
            Legal entity name
          </label>
          <input
            id="entity-name"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Example Media GmbH"
            className="w-full border-b border-rule bg-transparent pb-2 text-[1rem] leading-[1.6] text-ink transition-colors placeholder:text-faint focus:border-ink focus:outline-none"
          />
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Save"
            className="cta-pill group inline-flex h-12 items-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-12 w-12 items-center justify-center text-bg">
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap font-caption text-[12px] font-bold uppercase tracking-[1px] opacity-0 transition-all duration-200 group-hover:max-w-[100px] group-hover:pl-1 group-hover:pr-5 group-hover:opacity-100">
              Save
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors hover:text-ink"
          >
            I&rsquo;ll add it later
          </button>
        </div>
      </form>
    </div>
  );
}

/** Inline summary of the captured entity, with an edit affordance. */
function EntityBanner({
  entity,
  onEdit,
}: {
  entity: string;
  onEdit: () => void;
}) {
  const has = !!entity.trim();
  return (
    <button
      type="button"
      onClick={onEdit}
      className="group flex items-center justify-between gap-4 rounded-[12px] border border-rule bg-card/40 px-5 py-4 text-left transition-colors hover:border-ink"
    >
      <span className="flex items-center gap-3">
        <Building2 className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
        <span className="flex flex-col">
          <span className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
            Client legal entity
          </span>
          <span
            className={`text-[0.95rem] leading-[1.4rem] ${
              has ? "text-ink" : "text-muted"
            }`}
          >
            {has ? entity.trim() : "Add your legal entity name to continue"}
          </span>
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5 font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted transition-colors group-hover:text-ink">
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        {has ? "Edit" : "Add"}
      </span>
    </button>
  );
}

/** Surfaces the document's signatories (both parties, place, date). */
function SignaturesBlock({ entityDisplay }: { entityDisplay: string }) {
  const { signatories } = tedxberlin.sow;
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
            <dd className="text-[1rem] leading-[1.6rem] text-ink">
              {cell(v, entityDisplay)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function AgreementSection({
  section,
  entityDisplay,
}: {
  section: SowSection;
  entityDisplay: string;
}) {
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
                  <dd className="text-[1rem] leading-[1.6rem] text-ink">
                    {cell(v, entityDisplay)}
                  </dd>
                </div>
              ))}
            </dl>
          );
        })}
      </div>
    </section>
  );
}
